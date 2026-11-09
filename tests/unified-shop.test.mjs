import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {mkdtempSync,readFileSync,readdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createSharedSqlite} from '../server/shop-store.mjs';
import {createSystemHandler} from '../server/system.mjs';
import {DEFAULT_SETTINGS,clock,addDays} from '../server/core.mjs';
import {createPushService,sendPush} from '../server/push.mjs';
import {generateVAPIDKeys} from 'web-push';
import {randomBytes} from 'node:crypto';
import {applySqliteMigrations} from '../scripts/migrate-sqlite.mjs';

function fixture(t,pushOptions){
  const dir=mkdtempSync(join(tmpdir(),'babi-unified-')),path=join(dir,'qa.sqlite');
  const sqlite=new DatabaseSync(path);sqlite.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;');
  for(const file of readdirSync(new URL('../migrations/',import.meta.url)).filter(f=>/^\d+.*\.sql$/.test(f)).sort())sqlite.exec(readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8'));
  const db={get:async(s,a=[])=>sqlite.prepare(s).get(...a),all:async(s,a=[])=>sqlite.prepare(s).all(...a),run:async(s,a=[])=>sqlite.prepare(s).run(...a),
    batch:async statements=>{sqlite.exec('BEGIN IMMEDIATE');try{const result=statements.map(s=>sqlite.prepare(s.sql).run(...(s.args||[])));sqlite.exec('COMMIT');return result;}catch(error){sqlite.exec('ROLLBACK');throw error;}}};
  const store=createSharedSqlite(path,{initialize:true});
  const tasks=[],push=pushOptions&&createPushService(db,pushOptions);
  const handle=createSystemHandler(db,store,{push,defer:task=>tasks.push(task)}),origin='https://babi.test';
  const settle=async()=>Promise.all(tasks.splice(0));
  t.after(()=>{store.close();sqlite.close();rmSync(dir,{recursive:true,force:true});});
  const call=async(path,{method='GET',body,admin=false,headers={}}={})=>{
    const response=await handle(new Request(origin+path,{method,headers:{origin,...(body?{'content-type':'application/json'}:{}),...headers},...(body?{body:JSON.stringify(body)}:{})}),{admin,authenticated:admin,local:false,clientKey:'qa'});
    return {status:response.status,data:await response.json()};
  };
  const p=store.load().products.find(p=>p.active&&p.priceCents!==null);
  const order=(extra={})=>({name:'Cliente fictícia unificada',phone:'73999999999',consent:true,key:crypto.randomUUID(),items:[{id:p.id,quantity:1,priceCents:p.priceCents}],...extra});
  const finance='/api/admin/finance?from='+clock().date.slice(0,7)+'-01&to='+clock().date;
  return {sqlite,db,store,call,handle,p,order,finance,settle,push};
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

const vapid=()=>({...generateVAPIDKeys(),subject:'https://babi.test'});
const testSubscription=(id='device')=>({
  endpoint:'https://fcm.googleapis.com/fcm/send/'+id,
  keys:{p256dh:generateVAPIDKeys().publicKey,auth:randomBytes(16).toString('base64url')}
});

test('pedidos e agendamentos confirmados disparam um aviso privado por evento mesmo em reenvios',async t=>{
  const delivered=[],subscription=testSubscription();
  const f=fixture(t,{vapid:vapid(),send:async(_,payload)=>{delivered.push(payload);return 201;}});
  const path='/api/admin/notifications';
  const settings=structuredClone(DEFAULT_SETTINGS);
  settings.enabled=true;
  settings.leadMinutes=0;
  settings.weekly.forEach(day=>day.enabled=true);
  await f.call('/api/admin/settings',{method:'PUT',body:settings,admin:true});
  const booking={name:'Cliente fictícia QA',phone:'73999990000',consent:true,
    anamnesis:{chemicalHistory:'no',hairProblems:'no',consent:true},serviceId:settings.services[0].id,
    date:addDays(clock().date,1),time:'09:00',idempotencyKey:crypto.randomUUID()};
  const order=f.order();
  const register=body=>f.call(path,{method:'POST',body,admin:true});
  const enable={action:'enable',subscription};
  assert.equal((await f.call(path)).status,403);
  assert.equal((await f.call(path,{method:'POST',body:enable})).status,403);
  assert.equal((await f.call(path,{method:'POST',admin:true,body:enable,headers:{origin:'https://other.test'}})).status,403);
  assert.equal((await register({...enable,subscription:{...subscription,endpoint:'https://127.0.0.1/fcm/send/test'}})).status,400);
  assert.deepEqual((await register(enable)).data,{here:true});
  assert.equal((await f.call('/api/shop/orders',{method:'POST',body:{...order,consent:false}})).status,400);
  assert.equal((await f.call('/api/bookings',{method:'POST',body:booking})).status,201);
  assert.equal((await f.call('/api/bookings',{method:'POST',body:booking})).status,201);
  const orders=await Promise.all([f.call('/api/shop/orders',{method:'POST',body:order}),f.call('/api/shop/orders',{method:'POST',body:order})]);
  assert.deepEqual(orders.map(result=>result.status),[201,201]);
  await f.settle();
  assert.deepEqual(delivered.map(item=>item.kind).sort(),['booking','order']);
  assert.doesNotMatch(JSON.stringify(delivered),/Cliente fictícia|739999|Corte|[a-f0-9]{8}-[a-f0-9]{4}-/);
  assert.equal((await f.db.get('SELECT count(*) AS total FROM push_outbox')).total,0);
  assert.equal((await register({action:'test',endpoint:subscription.endpoint})).status,200);
  assert.equal((await register({action:'test',endpoint:subscription.endpoint})).status,429);
  const replacement=testSubscription('replacement');
  await register({action:'enable',subscription:replacement});
  const current=(await register({action:'status',endpoint:subscription.endpoint})).data;
  assert.equal(current.here,true);
  assert.equal(current.devices.length,2);
  await register({action:'disable',endpoint:replacement.endpoint});
  const next={...booking,time:'15:00',idempotencyKey:crypto.randomUUID()};
  assert.equal((await f.call('/api/bookings',{method:'POST',body:next})).status,201);
  await f.settle();
  assert.equal(delivered.length,4);
});

test('avisos exigem admin e os dois eventos chegam a até 10 aparelhos',async t=>{
  const deliveries=[];
  const f=fixture(t,{vapid:vapid(),send:async(sub,payload)=>{deliveries.push({endpoint:sub.endpoint,...payload});return 201;}});
  const path='/api/admin/notifications';
  const manage=body=>f.call(path,{method:'POST',body,admin:true});
  const owner=testSubscription('owner-qa');
  const activation={action:'enable',name:'Celular QA',subscription:owner};
  assert.equal((await f.call(path,{method:'POST',body:activation})).status,403);
  assert.equal((await f.call('/api/notifications/invite',{method:'POST',body:activation})).status,404);
  assert.equal((await manage({action:'invite',name:'Pessoa QA'})).status,400);
  assert.equal((await manage(activation)).status,200);
  for(let i=1;i<=8;i++){
    assert.equal((await manage({action:'enable',name:'Aparelho QA '+i,subscription:testSubscription('qa-'+i)})).status,200);
  }
  const competitors=[9,10].map(i=>({action:'enable',name:'Aparelho QA '+i,subscription:testSubscription('qa-'+i)}));
  const results=await Promise.all(competitors.map(manage));
  assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
  const {devices,limit}= (await manage({action:'status'})).data;
  assert.equal(devices.length,10);
  assert.equal(limit,10);
  assert.ok(!JSON.stringify(devices).includes('fcm.googleapis.com'));
  assert.equal((await manage(activation)).status,200);
  assert.equal((await manage({action:'test',endpoint:owner.endpoint})).status,200);
  assert.equal(deliveries.pop().kind,'test');

  const settings=structuredClone(DEFAULT_SETTINGS);
  settings.enabled=true;settings.leadMinutes=0;settings.weekly.forEach(day=>day.enabled=true);
  await f.call('/api/admin/settings',{method:'PUT',body:settings,admin:true});
  const booking={name:'Cliente fictícia QA',phone:'73999990000',consent:true,
    anamnesis:{chemicalHistory:'no',hairProblems:'no',consent:true},serviceId:settings.services[0].id,
    date:addDays(clock().date,1),time:'09:00',idempotencyKey:crypto.randomUUID()};
  assert.equal((await f.call('/api/bookings',{method:'POST',body:booking})).status,201);
  assert.equal((await f.call('/api/shop/orders',{method:'POST',body:f.order()})).status,201);
  await f.settle();
  assert.equal(deliveries.length,20);
  for(const kind of ['booking','order']){
    const recipients=deliveries.filter(delivery=>delivery.kind===kind);
    assert.equal(new Set(recipients.map(delivery=>delivery.endpoint)).size,10);
  }
  assert.equal((await manage({action:'revoke',id:devices[1].id})).status,200);
  assert.equal((await manage({action:'status',endpoint:owner.endpoint})).data.here,true);
  assert.equal((await manage(competitors[results.findIndex(result=>result.status===409)])).status,200);
});

test('migração SQLite preserva aparelho anterior e avisos já enfileirados ao reabrir',()=>{
  const db=new DatabaseSync(':memory:');
  try{
    db.exec('PRAGMA foreign_keys=ON');
    const migrations=new URL('../migrations/',import.meta.url);
    for(const file of readdirSync(migrations).filter(file=>/^000[1-5]-.*\.sql$/.test(file)).sort()){
      db.exec(readFileSync(new URL(file,migrations),'utf8'));
    }
    const legacy=testSubscription('legacy-qa');
    db.prepare('INSERT INTO push_device(id,endpoint,p256dh,auth) VALUES(?,?,?,?)').run('legacy',legacy.endpoint,legacy.keys.p256dh,legacy.keys.auth);
    db.exec("INSERT INTO push_outbox(kind,event_id,device_id,created_at,ready_at) VALUES('order','event','legacy','created','ready')");
    for(let i=0;i<2;i++){
      db.exec('BEGIN');
      applySqliteMigrations(db);
      db.exec('COMMIT');
    }
    assert.equal(db.prepare('SELECT endpoint FROM push_device WHERE id=?').get('legacy').endpoint,legacy.endpoint);
    assert.equal(db.prepare('SELECT device_id FROM push_outbox').get().device_id,'legacy');
    assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(),[]);
  }finally{db.close();}
});

test('migração remove aparelhos de convites e preserva fila e cadastro do admin',()=>{
  const db=new DatabaseSync(':memory:');
  try{
    db.exec('PRAGMA foreign_keys=ON; CREATE TABLE babi_schema_migrations(name TEXT PRIMARY KEY)');
    const dir=new URL('../migrations/',import.meta.url);
    for(const file of readdirSync(dir).filter(file=>/^000[1-6]-.*\.sql$/.test(file)).sort()){
      db.exec(readFileSync(new URL(file,dir),'utf8'));
      db.prepare('INSERT INTO babi_schema_migrations VALUES(?)').run(file);
    }
    db.exec(`INSERT INTO push_invite VALUES('invite','hash','Pessoa QA','2099');
      INSERT INTO push_device(id,slot,endpoint,p256dh,auth,invite_id) VALUES
      ('admin',1,'admin-endpoint','public','private',NULL),('guest',2,'guest-endpoint','public','private','used-invite');
      INSERT INTO push_outbox(kind,event_id,device_id,created_at,ready_at) VALUES
      ('order','event','admin','created','ready'),('order','event','guest','created','ready')`);
    db.exec('BEGIN');
    applySqliteMigrations(db);
    db.exec('COMMIT');
    assert.deepEqual(db.prepare('SELECT id FROM push_device').all().map(row=>row.id),['admin']);
    assert.deepEqual(db.prepare('SELECT device_id FROM push_outbox').all().map(row=>row.device_id),['admin']);
    assert.equal(db.prepare('SELECT COUNT(*) AS total FROM push_invite').get().total,0);
    assert.throws(()=>db.exec("INSERT INTO push_invite VALUES('new','hash','Pessoa QA','2099')"),/invitations are closed/);
    assert.throws(()=>db.exec("UPDATE push_device SET invite_id='new' WHERE id='admin'"),/requires admin access/);
  }finally{db.close();}
});

test('falha transitória mantém o aviso na fila e inscrição expirada é removida',async t=>{
  let result=429;
  const f=fixture(t,{vapid:vapid(),send:async()=>result});
  const subscription=testSubscription();
  await f.call('/api/admin/notifications',{method:'POST',admin:true,body:{action:'enable',subscription}});
  assert.equal((await f.call('/api/shop/orders',{method:'POST',body:f.order()})).status,201);
  await f.settle();
  assert.equal((await f.db.get('SELECT attempts FROM push_outbox')).attempts,1);
  result=410;
  await f.db.run('UPDATE push_outbox SET ready_at=created_at');
  await f.push.flush();
  assert.equal((await f.db.get('SELECT count(*) AS total FROM push_device')).total,0);
  assert.equal((await f.db.get('SELECT count(*) AS total FROM push_outbox')).total,0);
});

test('envio Web Push usa criptografia, VAPID, prazo curto e recusa redirecionamento',async t=>{
  const subscription=testSubscription();
  const fetch=t.mock.method(globalThis,'fetch',async(url,options)=>{
    assert.equal(url,subscription.endpoint);
    assert.equal(options.redirect,'error');
    assert.equal(options.headers['Content-Encoding'],'aes128gcm');
    assert.match(options.headers.Authorization,/^vapid /);
    assert.equal(options.headers.TTL,3600);
    assert.doesNotMatch(options.body.toString('utf8'),/Novo pedido/);
    return new Response(null,{status:201});
  });
  assert.equal(await sendPush(subscription,{title:'Novo pedido',tag:'test'},vapid()),201);
  assert.equal(fetch.mock.callCount(),1);
});
