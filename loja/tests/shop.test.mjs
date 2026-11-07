import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,scryptSync} from 'node:crypto';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHandler} from '../server/api.mjs';
import {createSqlite} from '../server/sqlite.mjs';
import {seedCatalog} from '../server/store.mjs';

const origin='http://localhost:4180';
const one=seedCatalog.find(p=>p.active&&p.priceCents!==null);
const noPrice=seedCatalog.find(p=>p.active&&p.priceCents===null);
const jpg='data:image/jpeg;base64,'+readFileSync(new URL('../dist'+one.photo,import.meta.url)).toString('base64');
function fixture(t,{path=':memory:',local=true}={}){
  const store=createSqlite(path,{costs:{[one.id]:4242}});
  t.after(()=>store.close());
  const host=local?origin:'https://loja.example.test';
  const password='senha-de-teste-2026';
  const salt='12345678901234567890123456789012';
  const adminEmail='dona@example.test';
  const handler=createHandler({store,local,origin:host,adminEmail,passwordHash:local?'':salt+':'+scryptSync(password,Buffer.from(salt,'hex'),64).toString('hex')});
  let cookie='';
  const req=async(path,{method='GET',body,auth=true,from=host}={})=>handler(new Request(host+path,{method,headers:{
    origin:from,'content-type':'application/json',...(auth&&cookie?{cookie}:{})
  },body:body===undefined?undefined:JSON.stringify(body)}));
  const signIn=async()=>{
    const r=await req('/api/admin/session',{method:'POST',body:{email:adminEmail,password}});
    assert.equal(r.status,200);
    cookie=r.headers.get('set-cookie').split(';')[0];
    return r;
  };
  const data=async()=>{const r=await req('/api/admin/data');assert.equal(r.status,200);return r.json();};
  const order=(p=one,extra={})=>({name:'Cliente fictício',phone:'73999999999',consent:true,items:[{id:p.id,quantity:1,priceCents:p.priceCents}],key:randomUUID(),...extra});
  return {req,signIn,data,order,store};
}

test('catálogo inicial traz estoque aprovado, preço de venda e nunca expõe custo ou produto sem foto',async t=>{
  const f=fixture(t);
  const products=await (await f.req('/api/catalog')).json();
  assert.equal(products.length,39);
  assert.equal(products.filter(p=>p.priceCents!==null).length,32);
  assert.ok(products.every(p=>p.stock===1&&p.photo&&!Object.hasOwn(p,'costCents')));
  assert.equal((await f.req('/api/admin/data')).status,401);
  await f.signIn();
  const {products:admin}=await f.data();
  assert.equal(admin.length,46);
  assert.equal(admin.find(p=>p.id===one.id).costCents,4242);
});

test('duas clientes disputando a última unidade geram um só pedido; reenvio não baixa novamente',async t=>{
  const f=fixture(t);
  const a=f.order(),b=f.order(),send=body=>f.req('/api/orders',{method:'POST',body});
  const replies=await Promise.all([send(a),send(b)]);
  assert.deepEqual(replies.map(r=>r.status).sort(),[201,409]);
  const winner=replies[0].status===201?0:1;
  const receipt=await replies[winner].json();
  assert.equal((await (await send(winner===0?a:b)).json()).code,receipt.code);
  assert.equal((await (await f.req('/api/catalog')).json()).some(p=>p.id===one.id),false);
  assert.equal(receipt.payment,'pendente');
  assert.deepEqual(Object.keys(receipt.items[0]).sort(),['name','priceCents','quantity']);
  assert.ok(!JSON.stringify(receipt).includes('73999999999'));
  await f.signIn();const data=await f.data();
  assert.equal(data.orders.length,1);
  assert.equal(data.ledger.length,0);
  assert.equal(data.products.find(p=>p.id===one.id).stock,0);
});

test('pedido com valor a combinar, lançamento único, estorno e devolução de estoque',async t=>{
  const f=fixture(t);
  const created=await f.req('/api/orders',{method:'POST',body:f.order(noPrice)});
  assert.equal(created.status,201);
  const receipt=await created.json();assert.equal(receipt.totalCents,null);
  await f.signIn();const o=(await f.data()).orders[0];
  const act=(action,revision,fields={})=>f.req('/api/admin/orders/'+o.id,{method:'PATCH',body:{action,revision,...fields}});
  assert.equal((await act('receive',0,{amountCents:8000,method:'pix'})).status,200);
  assert.equal((await act('receive',0,{amountCents:8000,method:'pix'})).status,409);
  assert.equal((await act('cancel',1)).status,409);
  assert.equal((await act('refund',1,{reason:'Estorno fictício'})).status,200);
  assert.equal((await act('cancel',2)).status,200);
  assert.equal((await act('cancel',3)).status,409);
  const admin=await f.data();
  assert.equal(admin.products.find(p=>p.id===noPrice.id).stock,1);
  assert.deepEqual(admin.ledger.map(x=>[x.kind,x.amountCents]),[['saida',8000],['entrada',8000]]);
  const updated=await (await f.req('/api/orders/'+receipt.token,{auth:false})).json();
  assert.equal(updated.status,'cancelado');
  assert.equal(updated.payment,'estornado');
});

test('novo produto com upload, alteração, inativação, retorno e exclusão',async t=>{
  const f=fixture(t);await f.signIn();
  const payload={name:'Produto fictício',category:'Kits',stock:1,priceCents:13330,costCents:1000,active:true,image:jpg};
  const created=await f.req('/api/admin/products',{method:'POST',body:payload});
  assert.equal(created.status,200);
  const p=await created.json();
  assert.equal((await f.req(p.photo)).headers.get('content-type'),'image/jpeg');
  const list=()=>f.req('/api/catalog').then(r=>r.json()).then(rows=>rows.find(x=>x.id===p.id));
  const path='/api/admin/products/'+p.id;
  const edit=await f.req(path,{method:'PUT',body:{...payload,name:'Produto editado',priceCents:8800,revision:0}});
  assert.equal(edit.status,200);
  assert.equal((await list()).name,'Produto editado');
  assert.equal((await list()).priceCents,8800);
  assert.equal((await f.req(p.photo)).status,404);
  assert.equal((await f.req(path,{method:'PATCH',body:{action:'deactivate',revision:1}})).status,200);
  assert.equal(await list(),undefined);
  assert.equal((await f.req(path,{method:'PATCH',body:{action:'activate',revision:2}})).status,200);
  assert.ok(await list());
  assert.equal((await f.req(path,{method:'PATCH',body:{action:'delete',revision:3}})).status,200);
  assert.equal(await list(),undefined);
});

test('revisão protege estoque editado após venda e exclusão preserva pedidos em aberto',async t=>{
  const f=fixture(t);await f.signIn();
  const p=(await f.data()).products.find(p=>p.id===one.id);
  assert.equal((await f.req('/api/orders',{method:'POST',body:f.order()})).status,201);
  const path='/api/admin/products/'+p.id;
  assert.equal((await f.req(path,{method:'PUT',body:{...p,name:'Edição antiga'}})).status,409);
  assert.equal((await f.req(path,{method:'PATCH',body:{action:'delete',revision:p.revision+1}})).status,409);
  assert.equal((await f.data()).products.find(p=>p.id===one.id).stock,0);
});

test('sessão de produção exige senha e origem, gera cookie seguro e é revogada na saída',async t=>{
  const f=fixture(t,{local:false});
  assert.equal((await f.req('/api/admin/session',{method:'POST',body:{password:'senha-ficticia-errada'}})).status,401);
  assert.equal((await f.req('/api/admin/session',{method:'POST',body:{email:'outra@example.test',password:'senha-de-teste-2026'}})).status,401);
  assert.equal((await f.req('/api/admin/session',{method:'POST',from:'https://outro.example.test',body:{}})).status,403);
  const auth=await f.signIn();
  assert.match(auth.headers.get('set-cookie'),/HttpOnly; SameSite=Strict;.*Secure/);
  assert.ok((await f.data()).products.length);
  assert.equal((await f.req('/api/admin/session',{method:'DELETE'})).status,200);
  assert.equal((await f.req('/api/admin/data')).status,401);
});

test('SQLite preserva estoque e pedidos ao reiniciar',async t=>{
  const folder=mkdtempSync(join(tmpdir(),'babi-shop-'));
  const path=join(folder,'shop.sqlite');
  try{
    const store=createSqlite(path);
    const handle=createHandler({store,local:true});
    const response=await handle(new Request(origin+'/api/orders',{method:'POST',headers:{origin,'Content-Type':'application/json'},
      body:JSON.stringify({name:'Cliente fictício',phone:'73999999999',consent:true,items:[{id:one.id,quantity:1,priceCents:one.priceCents}],key:randomUUID()})}));
    store.close();
    assert.equal(response.status,201);
    const reopened=createSqlite(path);
    try{assert.equal(reopened.load().products.find(p=>p.id===one.id).stock,0);assert.equal(reopened.load().orders.length,1);}
    finally{reopened.close();}
  }finally{rmSync(folder,{recursive:true,force:true});}
});

test('checkout rejeita dados inválidos sem reservar estoque ou criar pedidos',async t=>{
  const f=fixture(t);
  const cases=[{name:'A'},{phone:'123'},{consent:false},{key:'inválida'},{items:[]},
    {items:[{id:one.id,quantity:0,priceCents:one.priceCents}]},
    {items:[{id:one.id,quantity:1.5,priceCents:one.priceCents}]},
    {items:[{id:one.id,quantity:1,priceCents:one.priceCents},{id:one.id,quantity:1,priceCents:one.priceCents}]}];
  for(const invalid of cases)assert.equal((await f.req('/api/orders',{method:'POST',body:f.order(one,invalid)})).status,400,JSON.stringify(invalid));
  for(const items of [[{id:one.id,quantity:2,priceCents:one.priceCents}],
    [{id:one.id,quantity:1,priceCents:one.priceCents+1}],
    [{id:'produto-inexistente',quantity:1,priceCents:100}]]){
    assert.equal((await f.req('/api/orders',{method:'POST',body:f.order(one,{items})})).status,409);
  }
  await f.signIn();const data=await f.data();
  assert.equal(data.orders.length,0);assert.equal(data.ledger.length,0);
  assert.ok(data.products.every(p=>p.stock===1));
});

test('pedido com vários itens é atômico e reenvio com dados diferentes é recusado',async t=>{
  const f=fixture(t),other=seedCatalog.find(p=>p.active&&p.id!==one.id&&p.priceCents!==null);
  const invalid=f.order(one,{items:[{id:one.id,quantity:1,priceCents:one.priceCents},{id:other.id,quantity:2,priceCents:other.priceCents}]});
  assert.equal((await f.req('/api/orders',{method:'POST',body:invalid})).status,409);
  const order=f.order(one,{items:[{id:one.id,quantity:1,priceCents:one.priceCents},{id:other.id,quantity:1,priceCents:other.priceCents}]});
  const response=await f.req('/api/orders',{method:'POST',body:order});assert.equal(response.status,201);
  assert.equal((await response.json()).totalCents,one.priceCents+other.priceCents);
  assert.equal((await f.req('/api/orders',{method:'POST',body:{...order,name:'Outro nome fictício'}})).status,409);
  await f.signIn();const data=await f.data();assert.equal(data.orders.length,1);
  assert.equal(data.products.find(p=>p.id===one.id).stock,0);
  assert.equal(data.products.find(p=>p.id===other.id).stock,0);
});

test('acompanhamento exige token e nunca revela contato, custo ou credenciais',async t=>{
  const f=fixture(t);
  const r=await f.req('/api/orders',{method:'POST',body:f.order(one,{note:'Observação privada fictícia'})});
  const created=await r.json();
  const receipt=await (await f.req('/api/orders/'+created.token,{auth:false})).json();
  assert.deepEqual(Object.keys(receipt).sort(),['code','createdAt','items','payment','status','token','totalCents']);
  assert.equal(receipt.payment,'pendente');
  assert.equal((await f.req('/api/orders/'+'0'.repeat(48))).status,404);
  assert.equal((await f.req('/api/orders/'+created.code)).status,404);
  assert.ok(!JSON.stringify(receipt).includes('Observação privada fictícia'));
  assert.ok(!JSON.stringify(receipt).includes('costCents'));
  for(const [path,method,body] of [['/api/admin/data','GET'],['/api/admin/products','POST',{}],
    ['/api/admin/products/'+one.id,'PUT',{}],['/api/admin/products/'+one.id,'PATCH',{}],
    ['/api/admin/orders/'+randomUUID(),'PATCH',{}],['/api/admin/ledger','POST',{}]]){
    assert.equal((await f.req(path,{method,body,auth:false})).status,401);
  }
});

test('confirmar, combinar total, receber e concluir preserva histórico e impede novos lançamentos',async t=>{
  const f=fixture(t);await f.req('/api/orders',{method:'POST',body:f.order()});await f.signIn();
  const o=(await f.data()).orders[0],path='/api/admin/orders/'+o.id;
  const act=(action,revision,extra={})=>f.req(path,{method:'PATCH',body:{action,revision,...extra}});
  assert.equal((await act('complete',0)).status,409);
  assert.equal((await act('confirm',0)).status,200);
  assert.equal((await act('confirm',1)).status,409);
  assert.equal((await act('quote',1,{amountCents:12345})).status,200);
  assert.equal((await act('receive',2,{amountCents:12345,method:'pix'})).status,200);
  assert.equal((await act('quote',3,{amountCents:100})).status,409);
  assert.equal((await act('cancel',3)).status,409);
  assert.equal((await act('complete',3)).status,200);
  for(const action of ['receive','refund','cancel','complete','confirm','quote']){
    assert.equal((await act(action,4,{amountCents:100,method:'pix',reason:'Teste fictício'})).status,409,action);
  }
  let data=await f.data();assert.equal(data.ledger.length,1);assert.equal(data.ledger[0].amountCents,12345);
  const p=data.products.find(p=>p.id===one.id);
  assert.equal((await f.req('/api/admin/products/'+p.id,{method:'PATCH',body:{action:'delete',revision:p.revision}})).status,200);
  data=await f.data();assert.equal(data.orders[0].items[0].name,one.name);assert.equal(data.orders[0].status,'concluido');
});

test('estorno exige motivo e cancelamento devolve cada unidade uma única vez',async t=>{
  const f=fixture(t);const receipt=await (await f.req('/api/orders',{method:'POST',body:f.order()})).json();await f.signIn();
  const o=(await f.data()).orders[0],path='/api/admin/orders/'+o.id;
  const act=(action,revision,extra={})=>f.req(path,{method:'PATCH',body:{action,revision,...extra}});
  assert.equal((await act('receive',0,{amountCents:6000,method:'dinheiro'})).status,200);
  assert.equal((await act('refund',1,{reason:'a'})).status,400);
  assert.equal((await act('refund',1,{reason:'Cancelamento fictício'})).status,200);
  assert.equal((await act('refund',2,{reason:'Repetido fictício'})).status,409);
  assert.equal((await act('cancel',2)).status,200);
  assert.equal((await act('cancel',3)).status,409);
  const data=await f.data();assert.equal(data.products.find(p=>p.id===one.id).stock,1);
  assert.equal(data.ledger.reduce((sum,x)=>sum+(x.kind==='entrada'?1:-1)*x.amountCents,0),0);
  const tracking=await (await f.req('/api/orders/'+receipt.token)).json();
  assert.equal(tracking.status,'cancelado');assert.equal(tracking.payment,'estornado');
});

test('recebimento aceita seis meios e só permite valor zero como cortesia',async t=>{
  const f=fixture(t);await f.signIn();
  const selected=seedCatalog.filter(p=>p.active&&p.priceCents!==null).slice(0,6);
  for(const [index,method] of ['pix','dinheiro','cartao','transferencia','outro','cortesia'].entries()){
    await f.req('/api/orders',{method:'POST',body:f.order(selected[index])});
    const o=(await f.data()).orders[0],path='/api/admin/orders/'+o.id;
    const receive=(amountCents,payment)=>f.req(path,{method:'PATCH',body:{action:'receive',revision:0,amountCents,method:payment}});
    assert.equal((await receive(0,'pix')).status,400);
    assert.equal((await receive(100,'cortesia')).status,400);
    assert.equal((await receive(100,'inexistente')).status,400);
    assert.equal((await receive(method==='cortesia'?0:100,method)).status,200);
  }
  assert.equal((await f.data()).ledger.length,6);
});

test('produto inativo, sem foto ou esgotado não vende e validações não alteram o cadastro',async t=>{
  const f=fixture(t);await f.signIn();
  const p=(await f.data()).products.find(p=>p.id===one.id),path='/api/admin/products/'+p.id;
  for(const invalid of [{stock:-1},{stock:1.5},{priceCents:-1},{costCents:1.1},{active:'sim'},{name:''}]){
    assert.equal((await f.req(path,{method:'PUT',body:{...p,...invalid}})).status,400);
  }
  assert.equal((await f.data()).products.find(x=>x.id===p.id).revision,0);
  assert.equal((await f.req(path,{method:'PUT',body:{...p,stock:0}})).status,200);
  assert.equal((await f.req('/api/orders',{method:'POST',body:f.order()})).status,409);
  const draft={name:'Rascunho fictício',category:'Kits',description:'',stock:1,priceCents:null,costCents:null,active:false};
  const d=await (await f.req('/api/admin/products',{method:'POST',body:draft})).json();
  assert.equal((await f.req('/api/admin/products/'+d.id,{method:'PATCH',body:{action:'activate',revision:0}})).status,400);
  assert.equal((await f.req('/api/admin/products',{method:'POST',body:{...draft,active:true}})).status,400);
  assert.equal((await f.req('/api/admin/products',{method:'POST',body:{...draft,image:'data:image/svg+xml;base64,PHN2Zz4='}})).status,400);
});

test('foto enviada é servida em GET/HEAD e substituição e exclusão removem somente uploads antigos',async t=>{
  const f=fixture(t);await f.signIn();
  const payload={name:'Foto fictícia',category:'Kits',stock:1,priceCents:1234,costCents:100,active:true,image:jpg};
  const p=await (await f.req('/api/admin/products',{method:'POST',body:payload})).json();
  assert.equal((await f.req(p.photo,{method:'HEAD'})).headers.get('content-type'),'image/jpeg');
  assert.equal((await (await f.req(p.photo,{method:'HEAD'})).arrayBuffer()).byteLength,0);
  const updated=await (await f.req('/api/admin/products/'+p.id,{method:'PUT',body:{...payload,revision:0}})).json();
  assert.notEqual(updated.photo,p.photo);assert.equal((await f.req(p.photo)).status,404);
  assert.equal((await f.req(updated.photo)).status,200);
  assert.equal((await f.req('/api/admin/products/'+p.id,{method:'PATCH',body:{action:'delete',revision:1}})).status,200);
  assert.equal((await f.req(updated.photo)).status,404);
});

test('caixa valida entradas e saídas, mantém total exato e não cria pedidos',async t=>{
  const f=fixture(t);await f.signIn();
  for(const invalid of [{kind:'outro',description:'Teste',amountCents:100},{kind:'entrada',description:'a',amountCents:100},
    {kind:'saida',description:'Teste',amountCents:0},{kind:'entrada',description:'Teste',amountCents:-100},
    {kind:'entrada',description:'Teste',amountCents:1.5}]){
    assert.equal((await f.req('/api/admin/ledger',{method:'POST',body:invalid})).status,400);
  }
  for(const [kind,amountCents] of [['entrada',1099],['saida',205]]){
    assert.equal((await f.req('/api/admin/ledger',{method:'POST',body:{kind,amountCents,description:'Lançamento fictício'}})).status,201);
  }
  const data=await f.data();assert.equal(data.orders.length,0);assert.equal(data.ledger.length,2);
  assert.equal(data.ledger.reduce((sum,x)=>sum+(x.kind==='entrada'?1:-1)*x.amountCents,0),894);
});

test('origem, corpo JSON, tamanho e rota inválidos são recusados',async t=>{
  const f=fixture(t),handle=createHandler({store:f.store,local:true});
  const request=(raw,headers={})=>handle(new Request(origin+'/api/orders',{method:'POST',headers:{origin,'content-type':'application/json',...headers},body:raw}));
  assert.equal((await request('{}',{origin:'https://outro.example.test'})).status,403);
  assert.equal((await request('{}',{'content-type':'text/plain'})).status,415);
  for(const raw of ['{','null','[]','"texto"'])assert.equal((await request(raw)).status,400);
  assert.equal((await request(JSON.stringify({note:'a'.repeat(21000)}))).status,413);
  assert.equal((await f.req('/api/inexistente')).status,404);
});

test('sessão expirada perde acesso e tokens guardados no banco são somente hashes',async t=>{
  const f=fixture(t,{local:false});await f.signIn();
  const state=f.store.load();assert.equal(Object.keys(state.sessions).length,1);
  assert.match(Object.keys(state.sessions)[0],/^[a-f0-9]{64}$/);
  f.store.change(s=>{for(const id of Object.keys(s.sessions))s.sessions[id]=Date.now()-1;});
  assert.equal((await f.req('/api/admin/data')).status,401);
  assert.equal((await (await f.req('/api/admin/session')).json()).authenticated,false);
});

test('tentativas excessivas de login e checkout são limitadas',async t=>{
  const f=fixture(t,{local:false});
  for(let i=0;i<8;i++)assert.equal((await f.req('/api/admin/session',{method:'POST',body:{email:'ficticia@example.test',password:'curta'}})).status,401);
  assert.equal((await f.req('/api/admin/session',{method:'POST',body:{email:'ficticia@example.test',password:'curta'}})).status,429);
  for(let i=0;i<20;i++)assert.equal((await f.req('/api/orders',{method:'POST',body:{}})).status,400);
  assert.equal((await f.req('/api/orders',{method:'POST',body:{}})).status,429);
});
