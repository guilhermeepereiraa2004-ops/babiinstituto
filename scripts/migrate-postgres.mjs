import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {getMigrations} from 'better-auth/db/migration';
import {createPool} from '../server/postgres.mjs';
import {createAdminAuth} from '../server/auth.mjs';
export async function migratePostgres(pool){
 const client=await pool.connect();
 try{
  await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock(19027,4173)');
  await client.query('CREATE TABLE IF NOT EXISTS babi_schema_migrations (name TEXT PRIMARY KEY,checksum TEXT NOT NULL,applied_at TIMESTAMPTZ NOT NULL DEFAULT now())');
  const dir=new URL('../migrations/postgres/',import.meta.url);
  for(const name of readdirSync(dir).filter(n=>/^\d+.*\.sql$/.test(n)).sort()){
   const sql=readFileSync(new URL(name,dir),'utf8'),checksum=createHash('sha256').update(sql).digest('hex');
   const previous=(await client.query('SELECT checksum FROM babi_schema_migrations WHERE name=$1',[name])).rows[0];
   if(previous){if(previous.checksum!==checksum)throw Error('Migration checksum mismatch: '+name);continue;}
   await client.query(sql);await client.query('INSERT INTO babi_schema_migrations(name,checksum) VALUES($1,$2)',[name,checksum]);
  }
  await client.query('COMMIT');
 }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}
if(process.argv[1]&&new URL(import.meta.url).pathname.endsWith(process.argv[1].replaceAll('\\','/').split('/').pop())){
 const pool=createPool(process.env.DATABASE_URL_UNPOOLED||process.env.DATABASE_URL);
 try{
  await migratePostgres(pool);
  const auth=createAdminAuth(pool,{origin:process.env.BABI_APP_ORIGIN,secret:process.env.AUTH_SECRET,setupKey:process.env.BABI_SETUP_KEY,adminEmail:process.env.ADMIN_EMAIL});
  const migrations=await getMigrations(auth.options);await migrations.runMigrations();
  console.log('Postgres: application and authentication migrations applied. No client data inserted.');
 }catch(error){console.error('Postgres migration failed:',error.name,error.code||'');process.exitCode=1;}finally{await pool.end();}
}
