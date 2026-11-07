import {createHandler} from '../server/api.mjs';
import {createPostgres,shopPool} from '../server/postgres.mjs';

let handler;
export default {fetch(request){
  if(!handler){
    try{
      const {SHOP_DATABASE_URL,SHOP_ORIGIN,SHOP_ADMIN_HASH,SHOP_ADMIN_EMAIL}=process.env;
      if(!SHOP_DATABASE_URL||!SHOP_ORIGIN||!SHOP_ADMIN_HASH||!SHOP_ADMIN_EMAIL)throw Error('Configuração ausente');
      handler=createHandler({store:createPostgres(shopPool(SHOP_DATABASE_URL)),origin:SHOP_ORIGIN,passwordHash:SHOP_ADMIN_HASH,adminEmail:SHOP_ADMIN_EMAIL,
        clientKey:req=>req.headers.get('x-vercel-forwarded-for')||req.headers.get('x-real-ip')||'unknown'});
    }catch{return Response.json({error:'A loja ainda não está configurada.'},{status:503,headers:{'Cache-Control':'no-store'}});}
  }
  return handler(request);
}};
