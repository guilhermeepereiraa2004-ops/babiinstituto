import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {parseEnv} from 'node:util';
import {createPool} from '../server/postgres.mjs';
import {migratePostgres} from './migrate-postgres.mjs';
import {initializeSharedShop} from '../server/shop-postgres.mjs';

assert.equal(process.argv[2],'--confirm-babi-production');
assert.equal(process.env.BABI_APP_ORIGIN,'https://babi-instituto.vercel.app');
const project=JSON.parse(readFileSync(new URL('../.vercel/project.json',import.meta.url),'utf8'));
assert.equal(project.projectId,'prj_zw4UHlBR6UJaS6KXY6PENJELAbg9');assert.equal(project.orgId,'team_NseDl6bHKTOowzX904mmIj0U');
const connection=process.env.DATABASE_URL_UNPOOLED;assert.ok(connection,'Use a conexão direta já vinculada ao projeto principal.');
const endpoint=new URL(connection);assert.ok(!endpoint.hostname.includes('-pooler'),'A migração exige conexão direta.');
const qa=parseEnv(readFileSync(new URL('../.env.local',import.meta.url),'utf8'));
assert.notEqual(endpoint.hostname,new URL(qa.DATABASE_URL_UNPOOLED).hostname,'Produção e QA precisam ser recursos diferentes.');
const pool=createPool(connection),client=await pool.connect();let locked=false;
const tables={bookings:'id',booking_slots:'date,minute',booking_anamnesis:'booking_id',settings:'id',schedule_blocks:'id',finance_entries:'id',finance_audit:'id',customers:'phone'};
const snapshot=async()=>{
  const rows={};for(const [table,order] of Object.entries(tables))rows[table]=(await client.query('SELECT * FROM '+table+' ORDER BY '+order)).rows;
  return rows;
};
const digest=data=>createHash('sha256').update(JSON.stringify(data)).digest('hex');
try{
  // Keep all business writers outside this short maintenance section. The same
  // connection can re-enter the transaction lock used by the migration helpers.
  await client.query('SELECT pg_advisory_lock(19027,4173)');locked=true;
  const before=await snapshot(),backup=new URL('../.vercel/unified-before-'+Date.now()+'.json',import.meta.url);
  writeFileSync(backup,JSON.stringify(before));
  const scoped={connect:async()=>({query:client.query.bind(client),release(){}})};
  await migratePostgres(scoped);
  const path=new URL('../loja/data/catalog-costs.json',import.meta.url);
  const costs=existsSync(path)?JSON.parse(readFileSync(path,'utf8')):{};
  await initializeSharedShop(scoped,{costs});
  assert.equal(digest(await snapshot()),digest(before),'Registros de agenda, clientes e financeiro precisam permanecer idênticos.');
  const shop=JSON.parse((await client.query('SELECT payload FROM shop_state WHERE id=1')).rows[0].payload);
  assert.equal(shop.orders.length,0);assert.equal(shop.ledger.length,0);assert.equal(shop.products.length,46);
  console.log(JSON.stringify({project:'babi-instituto',migration:'0004-shop.sql',existingBusinessDataUnchanged:true,privateBackup:true,products:46,shopOrders:0}));
}finally{
  if(locked)await client.query('SELECT pg_advisory_unlock(19027,4173)');client.release();await pool.end();
}
