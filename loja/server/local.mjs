import {createServer} from 'node:http';
import {existsSync,readFileSync,mkdirSync,statSync} from 'node:fs';
import {dirname,extname,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createSqlite} from './sqlite.mjs';
import {bodyLimit,createHandler} from './api.mjs';

if(process.env.VERCEL||process.env.NODE_ENV==='production')throw Error('Use o adaptador de produção da loja.');
if(!process.env.SHOP_DB_PATH)throw Error('Use npm start para o sistema integrado. O adaptador independente exige SHOP_DB_PATH de QA.');
const root=fileURLToPath(new URL('../',import.meta.url));
const dist=resolve(root,'dist');
const port=Number(process.env.SHOP_PORT||4180);
const dbPath=resolve(process.env.SHOP_DB_PATH||resolve(root,'data/shop.sqlite'));
mkdirSync(dirname(dbPath),{recursive:true});
const costPath=resolve(root,'data/catalog-costs.json');
const costs=!process.env.SHOP_DB_PATH&&existsSync(costPath)?JSON.parse(readFileSync(costPath,'utf8')):{};
const store=createSqlite(dbPath,{costs});
const handler=createHandler({store,local:true,clientKey:()=> 'loopback'});
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8'};
createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-Frame-Options','DENY');
  res.setHeader('Referrer-Policy','no-referrer');
  try{
    const host=req.headers.host;
    if(!['localhost:'+port,'127.0.0.1:'+port].includes(host)){res.writeHead(403).end();return;}
    const url=new URL(req.url,'http://'+host);
    if(url.origin!=='http://'+host){res.writeHead(403).end();return;}
    if(url.pathname.startsWith('/api/')){
      const headers=new Headers();
      for(const [k,v] of Object.entries(req.headers))if(v!==undefined)headers.set(k,Array.isArray(v)?v.join(', '):v);
      const init={method:req.method,headers};
      if(!['GET','HEAD'].includes(req.method)){
        if(Number(req.headers['content-length'])>bodyLimit){res.writeHead(413,{'Content-Type':'application/json'}).end('{"error":"Arquivo grande demais."}');return;}
        init.body=req;init.duplex='half';
      }
      const response=await handler(new Request(url,init));
      res.writeHead(response.status,Object.fromEntries(response.headers));
      return res.end(Buffer.from(await response.arrayBuffer()));
    }
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
    if(url.pathname==='/admin'){res.writeHead(302,{Location:'/admin/'}).end();return;}
    const pathname=decodeURIComponent(url.pathname);
    const path=resolve(dist,'.'+pathname+(pathname.endsWith('/')?'index.html':''));
    if(!path.startsWith(dist+sep)||pathname.includes('\\')||!existsSync(path)||!statSync(path).isFile()){res.writeHead(404).end('Página não encontrada.');return;}
    res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Cache-Control':'no-cache'});
    res.end(req.method==='HEAD'?undefined:readFileSync(path));
  }catch(error){console.error('Falha no servidor da loja.',error?.name);res.writeHead(500).end();}
}).listen(port,'127.0.0.1',()=>console.log('Loja Babi: http://localhost:'+port+'/'));
