import {handleApi} from './core.mjs';
import {createHandler} from '../loja/server/api.mjs';

export function createSystemHandler(db,store){
  const shop=createHandler({store,externalAuth:true,assetBase:'/loja',apiBase:'/api/shop',
    clientKey:request=>request.headers.get('x-vercel-forwarded-for')||'local'});
  return async(request,context={})=>{
    const url=new URL(request.url);
    if(url.pathname.startsWith('/api/shop/')){
      url.pathname='/api/'+url.pathname.slice('/api/shop/'.length);
      return shop(new Request(url,request),context);
    }
    return handleApi(request,db,context);
  };
}
