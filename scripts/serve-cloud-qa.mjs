import {createServer} from 'node:http';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {handleCloudRequest} from '../server/cloud.mjs';
if(process.env.NEON_PROJECT_ID!=='gentle-dawn-48537104'||process.env.VERCEL)throw Error('Only the dedicated QA resource is allowed');
const port=4175,origin='http://localhost:'+port,root=resolve('dist');
process.env.BABI_APP_ORIGIN=origin;process.env.ADMIN_EMAIL='owner-qa@example.invalid';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'};
createServer(async(req,res)=>{
 try{
  if(!['localhost:'+port,'127.0.0.1:'+port].includes(req.headers.host)){res.writeHead(403);return res.end();}
  const url=new URL(req.url,origin);
  if(url.pathname.startsWith('/api/')){
   let size=0;const chunks=[];for await(const c of req){size+=c.length;if(size>12288){res.writeHead(413);return res.end();}chunks.push(c);}
   const headers=new Headers();for(const [key,value]of Object.entries(req.headers))if(typeof value==='string')headers.set(key,value);
   headers.set('x-vercel-forwarded-for',req.socket.remoteAddress);
   const payload=Buffer.concat(chunks),request=new Request(url,{method:req.method,headers,...(payload.length?{body:payload}:{})});
   const response=await handleCloudRequest(request);const output=Object.fromEntries(response.headers);const cookies=response.headers.getSetCookie();if(cookies.length)output['set-cookie']=cookies;
   res.writeHead(response.status,output);return res.end(Buffer.from(await response.arrayBuffer()));
  }
  let path=decodeURIComponent(url.pathname);if(path==='/admin'||path==='/agendar'){res.writeHead(302,{Location:path+'/'});return res.end();}
  if(path.endsWith('/'))path+='index.html';const file=resolve(root,'.'+path);
  if(!file.startsWith(root+'\\')&&!file.startsWith(root+'/')){res.writeHead(403);return res.end();}
  if(!existsSync(file)||!statSync(file).isFile()){res.writeHead(404);return res.end();}
  res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(readFileSync(file));
 }catch(error){console.error('Cloud QA failed:',error.name);res.writeHead(500);res.end('Falha no QA.');}
}).listen(port,'127.0.0.1',()=>console.log('Babi Neon QA: '+origin+'/admin/ (isolated test database)'));
