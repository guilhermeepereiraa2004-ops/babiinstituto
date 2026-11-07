import {createHash,randomBytes,randomUUID} from 'node:crypto';

export class ShopError extends Error {
  constructor(status,message){super(message);this.status=status;}
}
export function check(ok,status,message){if(!ok)throw new ShopError(status,message);}
export const hash=text=>createHash('sha256').update(text).digest('hex');
export const token=()=>randomBytes(24).toString('hex');
const clean=(input,max)=>typeof input==='string'?input.trim().replace(/[\u0000-\u001f\u007f]/g,' ').slice(0,max):'';
const whole=(value,max)=>Number.isSafeInteger(value)&&value>=0&&value<=max;
const money=(value,optional=false)=>{
  if(optional&&value===null)return null;
  check(whole(value,100_000_000),400,'Informe um valor válido.');
  return value;
};
const paymentMethods=['pix','dinheiro','cartao','transferencia','outro','cortesia'];
const openOrder=o=>o.status==='novo'||o.status==='confirmado';
const productFor=(state,id)=>state.products.find(p=>p.id===id);
export const visible=p=>p.active&&p.stock>0&&!!p.photo;
export function publicCatalog(state) {
  return state.products.filter(visible).map(({id,name,category,description,photo,alternatePhoto,priceCents,stock})=>
    ({id,name,category,description,photo,alternatePhoto,priceCents,stock}));
}
export function decodePhoto(value) {
  check(typeof value==='string'&&value.length<=2_800_000,400,'Use uma imagem de até 2 MB.');
  const match=/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(value);
  check(match,400,'Envie uma imagem JPG, PNG ou WebP.');
  const bytes=Buffer.from(match[2],'base64');
  const type=match[1];
  const valid=type==='jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:
    type==='png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):
    bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
  check(valid&&bytes.length<=2_000_000,400,'Imagem inválida ou maior que 2 MB.');
  return {id:randomUUID(),mime:'image/'+type,bytes};
}
const removeUpload=(media,photo)=>{if(photo?.startsWith('/api/media/'))media.remove(photo.split('/').at(-1));};
function revision(target,value){check(target.revision===value,409,'Este registro mudou. Atualize os dados e tente novamente.');}
export function saveProduct(state,media,input,id,upload){
  const old=id?productFor(state,id):null;
  if(id){check(old,404,'Produto não encontrado.');revision(old,input.revision);}
  const name=clean(input.name,160),category=clean(input.category,50),description=clean(input.description,600);
  check(name.length>=2&&category.length>=2,400,'Informe nome e categoria.');
  check(whole(input.stock,100_000),400,'Informe um estoque inteiro a partir de zero.');
  check(typeof input.active==='boolean',400,'Informe a situação do produto.');
  const priceCents=money(input.priceCents,true),costCents=money(input.costCents,true);
  let photo=old?.photo||null;
  if(upload){media.put(upload);removeUpload(media,photo);photo='/api/media/'+upload.id;}
  check(!input.active||photo,400,'Adicione uma foto para colocar o produto no site.');
  const product={id:id||randomUUID(),name,category,description,photo,alternatePhoto:old?.alternatePhoto,
    priceCents,costCents,stock:input.stock,active:input.active,revision:old?old.revision+1:0};
  if(old)Object.assign(old,product);else state.products.push(product);
  return product;
}
export function changeProduct(state,media,id,input){
  const p=productFor(state,id);check(p,404,'Produto não encontrado.');revision(p,input.revision);
  if(input.action==='delete'){
    check(!state.orders.some(o=>openOrder(o)&&o.items.some(i=>i.id===id)),409,'Finalize ou cancele os pedidos em aberto deste produto antes de apagar.');
    removeUpload(media,p.photo);state.products=state.products.filter(item=>item.id!==id);return {deleted:true};
  }
  check(input.action==='activate'||input.action==='deactivate',400,'Ação inválida.');
  check(input.action!=='activate'||p.photo,400,'Adicione uma foto antes de voltar ao site.');
  p.active=input.action==='activate';p.revision++;
  return p;
}
export function placeOrder(state,input,now){
  const name=clean(input.name,100),phone=typeof input.phone==='string'?input.phone.replace(/\D/g,''):'',note=clean(input.note,400);
  check(name.length>=2&&/^(?:55)?[1-9]\d{9,10}$/.test(phone),400,'Informe seu nome e telefone com DDD.');
  check(input.consent===true,400,'Autorize o contato para enviar o pedido.');
  check(typeof input.key==='string'&&/^[0-9a-f-]{36}$/.test(input.key),400,'Identificador de pedido inválido.');
  check(Array.isArray(input.items)&&input.items.length>=1&&input.items.length<=50,400,'Escolha de 1 a 50 produtos.');
  const ids=new Set();
  const items=input.items.map(item=>{
    check(item&&typeof item.id==='string'&&item.id.length<=160&&!ids.has(item.id)&&whole(item.quantity,99)&&item.quantity>0,400,'Confira os itens e quantidades.');
    ids.add(item.id);
    return {id:item.id,quantity:item.quantity,priceCents:money(item.priceCents,true)};
  }).sort((a,b)=>a.id.localeCompare(b.id));
  const signature=hash(JSON.stringify({name,phone,note,items}));
  const prior=state.orders.find(o=>o.key===input.key);
  if(prior){check(prior.signature===signature,409,'Este pedido já foi enviado com outros dados.');return prior;}
  const snapshots=items.map(item=>{
    const p=productFor(state,item.id);
    check(p&&visible(p)&&p.stock>=item.quantity,409,'Um produto esgotou ou saiu do catálogo. Confira sua sacola.');
    check(p.priceCents===item.priceCents,409,'Um valor foi atualizado. Confira sua sacola e tente novamente.');
    return {...item,name:p.name,costCents:p.costCents??null};
  });
  for(const item of snapshots){const p=productFor(state,item.id);p.stock-=item.quantity;p.revision++;}
  const id=randomUUID();
  const totalCents=snapshots.some(i=>i.priceCents===null)?null:snapshots.reduce((sum,i)=>sum+i.priceCents*i.quantity,0);
  const order={id,code:'BABI-'+id.slice(0,8).toUpperCase(),key:input.key,signature,token:token(),name,phone,note,items:snapshots,
    status:'novo',payment:'pendente',totalCents,revision:0,createdAt:now,updatedAt:now};
  state.orders.unshift(order);
  return order;
}
export function orderReceipt(o){
  const {code,token,status,payment,totalCents,createdAt}=o;
  return {code,token,status,payment,totalCents,createdAt,
    items:o.items.map(({name,quantity,priceCents})=>({name,quantity,priceCents}))};
}
export function changeOrder(state,id,input,now){
  const o=state.orders.find(item=>item.id===id);
  check(o,404,'Pedido não encontrado.');revision(o,input.revision);
  const action=input.action;
  if(action==='confirm'){
    check(o.status==='novo',409,'Este pedido já foi revisado.');o.status='confirmado';
  } else if(action==='quote'){
    check(openOrder(o)&&o.payment==='pendente',409,'Este valor não pode mais ser alterado.');
    o.totalCents=money(input.amountCents);
  } else if(action==='receive'){
    check(openOrder(o)&&o.payment==='pendente',409,'Este pedido não pode receber um novo lançamento.');
    const amountCents=money(input.amountCents);
    check(paymentMethods.includes(input.method)&&((amountCents===0)===(input.method==='cortesia')),400,'Informe a forma de pagamento; use cortesia para valor zero.');
    state.ledger.unshift({id:randomUUID(),kind:'entrada',description:'Recebimento '+o.code,amountCents,method:input.method,orderId:o.id,at:now});
    o.totalCents=amountCents;o.payment='recebido';o.status='confirmado';
  } else if(action==='refund'){
    check(openOrder(o)&&o.payment==='recebido',409,'Este pedido não pode ter o recebimento estornado.');
    const original=state.ledger.find(e=>e.orderId===o.id&&e.kind==='entrada');
    check(original,409,'Recebimento não encontrado.');
    const reason=clean(input.reason,160);
    check(reason.length>=3,400,'Informe o motivo do estorno.');
    state.ledger.unshift({id:randomUUID(),kind:'saida',description:'Estorno '+o.code+' · '+reason,amountCents:original.amountCents,method:original.method,orderId:o.id,at:now});
    o.payment='estornado';
  } else if(action==='complete'){
    check(o.status==='confirmado'&&o.payment==='recebido',409,'Registre o recebimento antes de concluir.');o.status='concluido';
  } else if(action==='cancel'){
    check(openOrder(o)&&o.payment!=='recebido',409,'Estorne o recebimento antes de cancelar.');
    o.status='cancelado';
    for(const item of o.items){const p=productFor(state,item.id);if(p){p.stock+=item.quantity;p.revision++;}}
  } else check(false,400,'Ação inválida.');
  o.updatedAt=now;o.revision++;
  return orderReceipt(o);
}
export function addLedgerEntry(state,input,now){
  const description=clean(input.description,160),amountCents=money(input.amountCents);
  check(['entrada','saida'].includes(input.kind)&&description.length>=3&&amountCents>0,400,'Informe o tipo, a descrição e um valor maior que zero.');
  const entry={id:randomUUID(),kind:input.kind,description,amountCents,at:now};
  state.ledger.unshift(entry);return entry;
}
