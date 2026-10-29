import pg from 'pg';
import {attachDatabasePool} from '@vercel/functions';

// The core uses SQLite-style bound parameters. Only SQL written in this repository
// reaches this translator; quoted strings and identifiers are left intact.
export function bindSql(sql){
 let index=0;return sql.replace(/'(?:''|[^'])*'|"(?:""|[^"])*"|\?/g,part=>part==='?'?'$'+(++index):part);
}
function safeInteger(value){const n=Number(value);if(!Number.isSafeInteger(n))throw Error('Unsafe database integer');return n;}
export function createPool(connectionString){
 if(!connectionString)throw Error('DATABASE_URL is required');
 const url=new URL(connectionString);url.searchParams.set('sslmode','verify-full');
 const pool=new pg.Pool({connectionString:url.href,max:5,idleTimeoutMillis:5000,connectionTimeoutMillis:10000,
  application_name:'babi-instituto',types:{getTypeParser:(oid,format)=>oid===20?safeInteger:pg.types.getTypeParser(oid,format)}});
 pool.on('error',()=>console.error('Postgres pool connection failed'));
 if(process.env.VERCEL)attachDatabasePool(pool);
 return pool;
}
export function createPostgresDb(pool){
 async function batch(statements){
  const client=await pool.connect();
  try{
   await client.query('BEGIN');await client.query("SET LOCAL lock_timeout='5s'");
   // All application writers take this transaction lock. This preserves SQLite's
   // single-writer semantics, including booking vs block/settings guards.
   await client.query('SELECT pg_advisory_xact_lock(19027, 4173)');
   const results=[];for(const s of statements){const r=await client.query(bindSql(s.sql),s.args||[]);results.push({changes:r.rowCount});}
   await client.query('COMMIT');return results;
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
 }
 return {
  get:async(sql,args=[]) => (await pool.query(bindSql(sql),args)).rows[0],
  all:async(sql,args=[]) => (await pool.query(bindSql(sql),args)).rows,
  run:async(sql,args=[]) => (await batch([{sql,args}]))[0],batch
 };
}
