import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {mkdtempSync,readFileSync,readdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createSharedSqlite} from '../server/shop-store.mjs';
import {createSystemHandler} from '../server/system.mjs';
import {DEFAULT_SETTINGS,clock,addDays} from '../server/core.mjs';

function fixture(t){
  const dir=mkdtempSync(join(tmpdir(),'babi-unified-')),path=join(dir,'qa.sqlite');
  const sqlite=new DatabaseSync(path);sqlite.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;');
  for(const file of readdirSync(new URL('../migrations/',import.meta.url)).filter(f=>/^\d+.*\.sql$/.test(f)).sort())sqlite.exec(readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8'));
  const db={get:async(s,a=[])=>sqlite.prepare(s).get(...a),all:async(s,a=[])=>sqlite.prepare(s).all(...a),run:async(s,a=[])=>sqlite.prepare(s).run(...a),
    batch:async statements=>{sqlite.exec('BEGIN IMMEDIATE');try{const result=statements.map(s=>sqlite.prepare(s.sql).run(...(s.args||[])));sqlite.exec('COMMIT');return result;}catch(error){sqlite.exec('ROLLBACK');throw error;}}};
  const store=createSharedSqlite(path,{initialize:true}),handle=createSystemHandler(db,store),origin='https://babi.test';
  t.after(()=>{store.close();sqlite.close();rmSync(dir,{recursive:true,force:true});});
  const call=async(path,{method='GET',body,admin=false,headers={}}={})=>{
    const response=await handle(new Request(origin+path,{method,headers:{origin,...(body?{'content-type':'application/json'}:{}),...headers},...(body?{body:JSON.stringify(body)}:{})}),{admin,authenticated:admin,local:false,clientKey:'qa'});
    return {status:response.status,data:await response.json()};
  };
  const p=store.load().products.find(p=>p.active&&p.priceCents!==null);
  const order=(extra={})=>({name:'Cliente fictícia unificada',phone:'73999999999',consent:true,key:crypto.randomUUID(),items:[{id:p.id,quantity:1,priceCents:p.priceCents}],...extra});
  const finance='/api/admin/finance?from='+clock().date.slice(0,7)+'-01&to='+clock().date;
  return {sqlite,db,store,call,handle,p,order,finance};
}

test('loja usa somente a sessão da Babi e mantém catálogo e mídia públicos sem custos',async t=>{
  const f=fixture(t);
  assert.equal((await f.call('/api/shop/admin/data')).status,401);
  assert.equal((await f.call('/api/shop/admin/data',{headers:{'oai-user-email':'owner@example.test',cookie:'babi_shop_session='+'a'.repeat(48)}})).status,401);
  assert.equal((await f.call('/api/shop/admin/session',{method:'POST',body:{},admin:true})).status,405);
  assert.equal((await f.call('/api/shop/admin/session',{admin:true})).data.unified,true);
  const catalog=await f.call('/api/shop/catalog');assert.equal(catalog.status,200);assert.equal(catalog.data.length,39);
  assert.ok(catalog.data.every(p=>p.photo.startsWith('/loja/assets/')&&!Object.hasOwn(p,'costCents')));
  assert.equal((await f.call('/api/shop/admin/ledger',{method:'POST',body:{kind:'entrada',description:'Teste',amountCents:100},admin:true})).status,409);
});

test('pedido e atendimento usam um cadastro; aniversário e recebimentos somados são preservados',async t=>{
  const f=fixture(t),settings=structuredClone(DEFAULT_SETTINGS);settings.enabled=true;settings.leadMinutes=0;settings.weekly.forEach(d=>d.enabled=true);
  await f.call('/api/admin/settings',{method:'PUT',body:settings,admin:true});
  const booking=await f.call('/api/bookings',{method:'POST',body:{name:'Cliente fictícia unificada',phone:'73999999999',birthday:{day:18,month:10},consent:true,
    anamnesis:{chemicalHistory:'no',hairProblems:'no',consent:true},serviceId:settings.services[0].id,date:addDays(clock().date,1),time:'09:00',idempotencyKey:crypto.randomUUID()}});
  assert.equal(booking.status,201);
  const row=await f.db.get('SELECT id,revision FROM bookings WHERE token=?',[booking.data.token]);
  assert.equal((await f.call('/api/admin/bookings/'+row.id,{method:'PATCH',admin:true,body:{status:'completed',revision:row.revision,amountCents:12300,paymentMethod:'pix'}})).status,200);
  const created=await f.call('/api/shop/orders',{method:'POST',body:f.order()});assert.equal(created.status,201);
  const o=f.store.load().orders[0];
  assert.equal((await f.call('/api/shop/admin/orders/'+o.id,{method:'PATCH',admin:true,body:{action:'receive',revision:0,amountCents:5000,method:'pix'}})).status,200);
  const customers=await f.call('/api/admin/customers',{admin:true});assert.equal(customers.data.total,1);
  const c=customers.data.customers[0];assert.equal(c.phone,'5573999999999');assert.equal(c.birth_day,18);assert.equal(c.birth_month,10);
  assert.equal(c.bookingCount,1);assert.equal(c.orderCount,1);assert.equal(c.spentCents,17300);
  const all=await f.call(f.finance,{admin:true});assert.equal(all.data.summary.incomeCents,17300);
  assert.equal((await f.call(f.finance+'&source=shop',{admin:true})).data.summary.incomeCents,5000);
  assert.equal((await f.call(f.finance+'&source=services',{admin:true})).data.summary.incomeCents,12300);
  assert.equal((await f.call(f.finance+'&source=manual',{admin:true})).data.summary.total,0);
});

test('recebimento e estorno entram uma vez no caixa comum; ajustes diretos são bloqueados',async t=>{
  const f=fixture(t);await f.call('/api/shop/orders',{method:'POST',body:f.order()});const o=f.store.load().orders[0];
  const action=(action,revision,extra={})=>f.call('/api/shop/admin/orders/'+o.id,{method:'PATCH',admin:true,body:{action,revision,...extra}});
  assert.equal((await action('receive',0,{amountCents:12000,method:'dinheiro'})).status,200);
  assert.equal((await action('receive',0,{amountCents:12000,method:'dinheiro'})).status,409);
  const income=(await f.call(f.finance,{admin:true})).data.entries[0];assert.equal(income.shop_order_id,o.id);assert.ok(income.shop_entry_id);
  assert.equal((await f.call('/api/admin/finance/'+income.id,{method:'PATCH',admin:true,body:{action:'void',revision:income.revision,reason:'Tentativa fictícia'}})).status,409);
  assert.equal((await action('refund',1,{reason:'Estorno fictício'})).status,200);
  assert.equal((await action('refund',2,{reason:'Repetição fictícia'})).status,409);
  assert.equal((await action('cancel',2)).status,200);
  const finance=(await f.call(f.finance,{admin:true})).data;
  assert.equal(finance.summary.incomeCents,12000);assert.equal(finance.summary.expenseCents,12000);assert.equal(finance.summary.balanceCents,0);
  assert.equal(finance.entries.length,2);assert.equal(f.store.load().products.find(p=>p.id===f.p.id).stock,1);
  assert.equal((await f.db.get('SELECT COUNT(*) AS total FROM finance_audit')).total,2);
  assert.equal((await f.call('/api/admin/customers',{admin:true})).data.customers[0].spentCents,0);
});

test('falha na projeção desfaz produto, mídia, recebimento e estado na mesma transação',async t=>{
  const f=fixture(t);await f.call('/api/shop/orders',{method:'POST',body:f.order()});const o=f.store.load().orders[0];
  await f.call('/api/shop/admin/orders/'+o.id,{method:'PATCH',admin:true,body:{action:'receive',revision:0,amountCents:100,method:'pix'}});
  const before=f.store.load(),entry=before.ledger[0],mediaId=crypto.randomUUID();
  assert.throws(()=>f.store.change((s,media)=>{
    media.put({id:mediaId,mime:'image/jpeg',bytes:Buffer.from([255,216,255])});s.products[0].stock=55;
    s.ledger.push({...entry,id:crypto.randomUUID(),amountCents:100000001});
  }));
  assert.deepEqual(f.store.load(),before);assert.equal(f.store.media(mediaId),undefined);
  assert.equal((await f.call(f.finance,{admin:true})).data.entries.length,1);
});

test('última unidade concorrente e reenvio mantêm somente um pedido e um cliente no banco comum',async t=>{
  const f=fixture(t),input=f.order();
  const results=await Promise.all([f.call('/api/shop/orders',{method:'POST',body:input}),f.call('/api/shop/orders',{method:'POST',body:f.order({name:'Outra cliente fictícia'})})]);
  assert.deepEqual(results.map(r=>r.status).sort(),[201,409]);
  assert.equal((await f.call('/api/shop/orders',{method:'POST',body:input})).status,201);
  assert.equal((await f.db.get('SELECT COUNT(*) AS total FROM shop_orders')).total,1);
  assert.equal((await f.db.get('SELECT COUNT(*) AS total FROM customers')).total,1);
  assert.equal((await f.call(f.finance,{admin:true})).data.entries.length,0);
});

test('upload do painel integrado volta como mídia da mesma API e respeita a sessão comum',async t=>{
  const f=fixture(t),image='data:image/jpeg;base64,'+readFileSync(new URL('../loja/dist'+f.p.photo,import.meta.url)).toString('base64');
  const r=await f.call('/api/shop/admin/products',{method:'POST',admin:true,body:{name:'Produto fictício integrado',category:'Kits',description:'Teste',priceCents:1234,costCents:400,stock:1,active:true,image}});
  assert.equal(r.status,200);assert.match(r.data.photo,/^\/api\/shop\/media\//);
  const media=await f.handle(new Request('https://babi.test'+r.data.photo));assert.equal(media.status,200);assert.equal(media.headers.get('content-type'),'image/jpeg');
  assert.ok((await media.arrayBuffer()).byteLength>100);
  const product=(await f.call('/api/shop/catalog')).data.find(p=>p.id===r.data.id);assert.equal(product.photo,r.data.photo);assert.ok(!('costCents' in product));
});
