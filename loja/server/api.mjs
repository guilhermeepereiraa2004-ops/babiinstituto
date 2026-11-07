import {scrypt,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {ShopError,addLedgerEntry,changeOrder,changeProduct,check,decodePhoto,hash,orderReceipt,placeOrder,publicCatalog,saveProduct,token} from './actions.mjs';

const derive=promisify(scrypt);
const lifetime=8*60*60*1000;
const sid='babi_shop_session';
const json=(data,status=200,headers={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
export const bodyLimit=2_850_000;
async function body(req,limit=20_000){
  check(req.headers.get('content-type')?.split(';')[0]==='application/json',415,'Formato de envio inválido.');
  const reader=req.body?.getReader();
  check(reader,400,'Envie os dados solicitados.');
  const chunks=[];let size=0;
  while(true){
    const {done,value}=await reader.read();if(done)break;
    size+=value.length;if(size>limit){await reader.cancel();throw new ShopError(413,'Arquivo ou envio grande demais.');}
    chunks.push(value);
  }
  let data;
  try{data=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new ShopError(400,'Envio inválido.');}
  check(data&&typeof data==='object'&&!Array.isArray(data),400,'Envio inválido.');
  return data;
}
function adminData(state){
  return {products:state.products,orders:state.orders.map(({signature,key,token,...o})=>o),ledger:state.ledger};
}
export function createHandler({store,local=false,origin,passwordHash='',adminEmail='',clientKey=()=>'',externalAuth=false,assetBase='',apiBase='/api'}){
  const owner=adminEmail.trim().toLowerCase();
  if(!externalAuth&&!local&&(!/^https:\/\/[^/]+$/.test(origin||'')||!/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(passwordHash)||!/^\S+@\S+\.\S+$/.test(owner)))throw Error('Configure origem HTTPS e acesso administrativo da loja.');
  const publicPhoto=path=>path?.startsWith('/assets/')?assetBase+path:path?.startsWith('/api/media/')?apiBase+path.slice(4):path;
  const productOutput=p=>({...p,photo:publicPhoto(p.photo),alternatePhoto:publicPhoto(p.alternatePhoto)});
  const cookie=(value,max)=>sid+'='+value+'; Path=/; HttpOnly; SameSite=Strict; Max-Age='+max+(local?'':'; Secure');
  async function rate(kind,request,now,max,window){
    const key=hash(kind+'|'+clientKey(request));
    const allowed=await store.change(state=>{
      for(const [k,v] of Object.entries(state.limits))if(v.until<=now)delete state.limits[k];
      const entry=state.limits[key]??={until:now+window,count:0};
      if(entry.count>=max)return false;
      entry.count++;return true;
    });
    check(allowed,429,'Muitas tentativas. Aguarde alguns minutos.');
  }
  return async function handle(request,context={}){
    try{
      const url=new URL(request.url),path=url.pathname,method=request.method,now=Date.now(),date=new Date(now).toISOString();
      const write=!['GET','HEAD'].includes(method);
      if(write)check(request.headers.get('origin')===(origin||url.origin),403,'Origem inválida.');
      if(method==='GET'&&path==='/api/catalog')return json(publicCatalog(await store.load()).map(productOutput));
      const mediaId=/^\/api\/media\/([a-f0-9-]{36})$/.exec(path)?.[1];
      if(mediaId&&(method==='GET'||method==='HEAD')){
        const photo=await store.media(mediaId);check(photo,404,'Foto não encontrada.');
        return new Response(method==='HEAD'?null:photo.bytes,{headers:{'Content-Type':photo.mime,'X-Content-Type-Options':'nosniff','Cache-Control':'no-store'}});
      }
      if(method==='POST'&&path==='/api/orders'){
        const data=await body(request);
        await rate('order',request,now,20,10*60_000);
        return json(orderReceipt(await store.change(state=>placeOrder(state,data,date))),201);
      }
      const tracking=/^\/api\/orders\/([a-f0-9]{48})$/.exec(path)?.[1];
      if(method==='GET'&&tracking){
        const o=(await store.load()).orders.find(o=>o.token===tracking);check(o,404,'Pedido não encontrado.');
        return json(orderReceipt(o));
      }
      if(!path.startsWith('/api/admin/'))return json({error:'Rota não encontrada.'},404);
      const supplied=request.headers.get('cookie')?.match(/(?:^|; )babi_shop_session=([a-f0-9]{48})(?:;|$)/)?.[1];
      const sessionId=supplied?hash(supplied):null;
      const loggedIn=externalAuth?context.admin===true:!!(sessionId&&(await store.load()).sessions[sessionId]>now);
      if(path==='/api/admin/session'&&method==='GET')return json({authenticated:loggedIn,local:externalAuth?!!context.local:local,...(externalAuth?{unified:true}:{})});
      if(externalAuth&&path==='/api/admin/session')return json({error:'Use o acesso administrativo da Babi.'},405);
      if(path==='/api/admin/session'&&method==='POST'){
        const data=await body(request,2048);
        if(!local){
          await rate('login',request,now,8,15*60_000);
          check(typeof data.password==='string'&&data.password.length>=12&&data.password.length<=160,401,'Senha incorreta.');
          const [salt,digest]=passwordHash.split(':');
          const candidate=await derive(data.password,Buffer.from(salt,'hex'),64);
          check(timingSafeEqual(candidate,Buffer.from(digest,'hex'))&&typeof data.email==='string'&&data.email.trim().toLowerCase()===owner,401,'E-mail ou senha incorretos.');
        }
        const session=token();
        await store.change(state=>{
          for(const [k,v] of Object.entries(state.sessions))if(v<=now)delete state.sessions[k];
          if(sessionId)delete state.sessions[sessionId];
          state.sessions[hash(session)]=now+lifetime;
        });
        return json({authenticated:true},200,{'Set-Cookie':cookie(session,lifetime/1000)});
      }
      check(loggedIn,401,'Entre no painel para continuar.');
      if(path==='/api/admin/session'&&method==='DELETE'){
        await store.change(state=>{delete state.sessions[sessionId];});
        return json({authenticated:false},200,{'Set-Cookie':cookie('',0)});
      }
      if(path==='/api/admin/data'&&method==='GET'){
        const data=adminData(await store.load());data.products=data.products.map(productOutput);return json(data);
      }
      const productId=/^\/api\/admin\/products\/([a-z0-9-]{1,160})$/.exec(path)?.[1];
      if((path==='/api/admin/products'&&method==='POST')||(productId&&method==='PUT')){
        const input=await body(request,bodyLimit),upload=input.image?decodePhoto(input.image):null;
        return json(productOutput(await store.change((state,media)=>saveProduct(state,media,input,productId,upload))));
      }
      if(productId&&method==='PATCH'){
        const input=await body(request);
        return json(await store.change((state,media)=>changeProduct(state,media,productId,input)));
      }
      const orderId=/^\/api\/admin\/orders\/([a-f0-9-]{36})$/.exec(path)?.[1];
      if(orderId&&method==='PATCH'){
        const input=await body(request);
        return json(await store.change(state=>changeOrder(state,orderId,input,date)));
      }
      if(path==='/api/admin/ledger'&&method==='POST'){
        check(!externalAuth,409,'Registre entradas e saídas no financeiro integrado da Babi.');
        const input=await body(request);
        return json(await store.change(state=>addLedgerEntry(state,input,date)),201);
      }
      return json({error:'Rota não encontrada.'},404);
    }catch(error){
      if(error instanceof ShopError)return json({error:error.message},error.status);
      console.error('A operação da loja falhou.',error?.code||error?.name);
      return json({error:'Não foi possível concluir. Tente novamente.'},500);
    }
  };
}
