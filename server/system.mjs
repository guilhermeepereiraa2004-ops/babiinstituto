import {handleApi} from './core.mjs';
import {createHandler} from '../loja/server/api.mjs';

export function createSystemHandler(db,store,{push,defer}={}){
  const shop=createHandler({store,externalAuth:true,assetBase:'/loja',apiBase:'/api/shop',
    clientKey:request=>request.headers.get('x-vercel-forwarded-for')||'local'});
  return async(request,context={})=>{
    const url=new URL(request.url);
    const path=url.pathname;
    if(path==='/api/admin/notifications' && push)return push.handle(request,context);
    if(path==='/api/notifications/invite' && push)return push.handleInvite(request);
    let response;
    if(url.pathname.startsWith('/api/shop/')){
      url.pathname='/api/'+url.pathname.slice('/api/shop/'.length);
      response=await shop(new Request(url,request),context);
    }else{
      response=await handleApi(request,db,context);
    }
    if(push?.enabled && response.status===201 && request.method==='POST'
      && (path==='/api/bookings'||path==='/api/shop/orders')){
      const delivery=push.flush().catch(error=>console.error('Babi push dispatch failed:',error.name));
      defer?.(delivery);
    }
    return response;
  };
}
