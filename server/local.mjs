import {createServer} from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,existsSync,mkdirSync,statSync,readdirSync} from 'node:fs';
import {resolve,extname,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes,timingSafeEqual} from 'node:crypto';
import {handleApi} from './core.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
if(process.env.VERCEL||process.env.NODE_ENV==='production')throw Error('Local development login cannot run in production. Use the cloud adapter.');
const dataPath=process.env.BABI_DB_PATH||resolve(root,'data/appointments.sqlite');
mkdirSync(dirname(dataPath),{recursive:true});
const sqlite=new DatabaseSync(dataPath);sqlite.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');
// Migrations are additive and idempotent; an interrupted startup rolls back all changes.
sqlite.exec('BEGIN IMMEDIATE');
try {
 for(const file of readdirSync(resolve(root,'migrations')).filter(f=>/^\d+.*\.sql$/.test(f)).sort())sqlite.exec(readFileSync(resolve(root,'migrations',file),'utf8'));
 sqlite.exec('COMMIT');
} catch(error) { sqlite.exec('ROLLBACK'); throw error; }
export const localDb={
 get:async(sql,args=[])=>sqlite.prepare(sql).get(...args),
 all:async(sql,args=[])=>sqlite.prepare(sql).all(...args),
 run:async(sql,args=[])=>sqlite.prepare(sql).run(...args),
 batch:async statements=>{sqlite.exec('BEGIN IMMEDIATE');try{const rows=statements.map(s=>sqlite.prepare(s.sql).run(...(s.args||[])));sqlite.exec('COMMIT');return rows;}catch(error){sqlite.exec('ROLLBACK');throw error;}}
};
const localSession=randomBytes(32).toString('hex');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png'};
const port=Number(process.env.PORT||4173);
const cookieName='babi_local_'+port;
function validSession(cookie=''){const value=cookie.split(';').map(p=>p.trim()).find(p=>p.startsWith(cookieName+'='))?.slice(cookieName.length+1)||'';return value.length===localSession.length&&timingSafeEqual(Buffer.from(value),Buffer.from(localSession));}
const server=createServer(async(req,res)=>{
 try{
  const host=req.headers.host||'';if(!/^(localhost|127\.0\.0\.1):\d+$/.test(host)){res.writeHead(403);return res.end('Host inválido');}
  const url=new URL(req.url,`http://${host}`);const headers=new Headers();for(const [key,value]of Object.entries(req.headers))if(typeof value==='string'&&!key.startsWith('oai-'))headers.set(key,value);
  let payload; if(req.method!=='GET'&&req.method!=='HEAD'){const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>12288){res.writeHead(413);return res.end('Solicitação muito grande');}chunks.push(chunk);}payload=Buffer.concat(chunks);}
  if(url.pathname==='/api/local-login'&&req.method==='POST'){
   if(headers.get('origin')!==url.origin){res.writeHead(403);return res.end();}
   res.writeHead(200,{'Content-Type':'application/json','Set-Cookie':`${cookieName}=${localSession}; Path=/; HttpOnly; SameSite=Strict`,'Cache-Control':'no-store'});return res.end('{"ok":true}');
  }
  if(url.pathname==='/api/local-logout'&&req.method==='POST'){
   if(headers.get('origin')!==url.origin){res.writeHead(403);return res.end();}
   res.writeHead(200,{'Content-Type':'application/json','Set-Cookie':`${cookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`,'Cache-Control':'no-store'});return res.end('{"ok":true}');
  }
  if(url.pathname.startsWith('/api/')){
   const request=new Request(url,{method:req.method,headers,...(payload?.length?{body:payload}: {})});
   const response=await handleApi(request,localDb,{admin:validSession(req.headers.cookie),authenticated:validSession(req.headers.cookie),local:true,clientKey:req.socket.remoteAddress});
   res.writeHead(response.status,Object.fromEntries(response.headers));return res.end(Buffer.from(await response.arrayBuffer()));
  }
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}
  let pathname=decodeURIComponent(url.pathname);if(pathname==='/admin'||pathname==='/agendar'){res.writeHead(302,{Location:pathname+'/'});return res.end();}
  if(pathname.endsWith('/'))pathname+='index.html';const path=resolve(root,'dist','.'+pathname);
  const publicRoot=resolve(root,'dist');if(!path.startsWith(publicRoot+'\\')&&!path.startsWith(publicRoot+'/')){res.writeHead(403);return res.end();}
  if(path.includes('/server/')||path.includes('\\server\\')||/[\\/]\./.test(pathname)){res.writeHead(404);return res.end();}
  if(!existsSync(path)||!statSync(path).isFile()){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});return res.end('Página não encontrada.');}
  res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache','Referrer-Policy':'same-origin'});res.end(req.method==='HEAD'?undefined:readFileSync(path));
 }catch(error){console.error('Local request failed:',error.name);res.writeHead(500);res.end('Não foi possível concluir a solicitação.');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Babi: http://localhost:${port}/ | Admin: http://localhost:${port}/admin/ | Cliente: http://localhost:${port}/agendar/`));
