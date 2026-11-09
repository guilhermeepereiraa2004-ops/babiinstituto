import {createPool,createPostgresDb} from './postgres.mjs';
import {createAdminAuth,secretMatches} from './auth.mjs';
import {createHash} from 'node:crypto';
import {createSystemHandler} from './system.mjs';
import {createSharedPostgres} from './shop-postgres.mjs';
import {createPushService} from './push.mjs';
import {adminIdentity,emailForAdminLogin,setTeamPassword,teamAccessList} from './team.mjs';
import {waitUntil} from '@vercel/functions';

let pool,db,system,push;const authByOrigin=new Map();
export async function closeCloudConnections(){if(pool)await pool.end();pool=undefined;db=undefined;system=undefined;push=undefined;authByOrigin.clear();}
const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
function allowedOrigins(){return new Set([process.env.BABI_APP_ORIGIN,...[process.env.VERCEL_URL,process.env.VERCEL_BRANCH_URL].filter(Boolean).map(h=>'https://'+h)].filter(Boolean));}
function authFor(origin){
 if(!pool){
  pool=createPool(process.env.DATABASE_URL);
  db=createPostgresDb(pool);
  push=createPushService(db);
  system=createSystemHandler(db,createSharedPostgres(pool),{push,defer:process.env.VERCEL?waitUntil:undefined});
 }
 if(!authByOrigin.has(origin))authByOrigin.set(origin,createAdminAuth(pool,{origin,secret:process.env.AUTH_SECRET,setupKey:process.env.BABI_SETUP_KEY,adminEmail:process.env.ADMIN_EMAIL}));
 return authByOrigin.get(origin);
}
async function readBody(request){
 if(request.headers.get('content-type')?.split(';')[0]!=='application/json')throw Object.assign(Error('Envie os dados no formato correto.'),{status:415});
 const reader=request.body?.getReader();let size=0;const chunks=[];
 if(reader)while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>12288){await reader.cancel();throw Object.assign(Error('Solicitação muito grande.'),{status:413});}chunks.push(value);}
 try{const value=JSON.parse(await new Blob(chunks).text());if(!value||typeof value!=='object'||Array.isArray(value))throw Error();return value;}catch{throw Object.assign(Error('Dados inválidos.'),{status:400});}
}
export async function handleCloudRequest(request){
 try{
  const url=new URL(request.url),path=url.pathname,method=request.method;
  if(!allowedOrigins().has(url.origin))return json({error:'Origem da aplicação não autorizada.'},403);
  if(method!=='GET'&&method!=='HEAD'&&request.headers.get('origin')!==url.origin)return json({error:'Origem da solicitação não autorizada.'},403);
  if(path.startsWith('/api/local-'))return json({error:'Caminho não encontrado.'},404);
  if(path==='/api/internal/push-retry'){
   const authorization=request.headers.get('authorization')||'';
   if(method!=='GET'||!authorization.startsWith('Bearer ')||!secretMatches(authorization.slice(7),process.env.CRON_SECRET))
    return json({error:'Acesso restrito.'},403);
   authFor(url.origin);
   await push.flush();
   return json({ok:true});
  }
  const auth=authFor(url.origin);
  if(path==='/api/setup'&&method==='POST'){
   if(!secretMatches(request.headers.get('x-babi-setup-key'),process.env.BABI_SETUP_KEY))return json({error:'Acesso de configuração inválido.'},403);
   const input=await readBody(request);
   if(String(input.email).trim().toLowerCase()!==process.env.ADMIN_EMAIL.trim().toLowerCase())return json({error:'Use o e-mail autorizado para a administração.'},403);
   const count=await pool.query('SELECT COUNT(*) AS count FROM babi_user');if(Number(count.rows[0].count)!==0)return json({error:'O acesso inicial já foi configurado.'},409);
   const response=await auth.api.signUpEmail({body:{email:input.email,password:input.password,name:'Fabrícia Leão'},headers:request.headers,asResponse:true});
   if(!response.ok)return json({error:'Não foi possível definir o acesso. Use uma senha entre 12 e 128 caracteres.'},400);
   return json({ok:true},201);
  }
  if(path.startsWith('/api/auth/')){
   const allowed={'/api/auth/sign-in/email':'POST','/api/auth/sign-out':'POST','/api/auth/get-session':'GET','/api/auth/reset-password':'POST'};
   if(allowed[path]!==method)return json({error:'Caminho não encontrado.'},404);
   if(method==='POST'){
    const input=await readBody(request);
    if(path.endsWith('/sign-in/email')){
     const email=emailForAdminLogin(input.login??input.email,process.env.ADMIN_EMAIL);
     if(!email)return json({error:'Acesso ou senha inválidos.'},401);
     request=new Request(request.url,{method,headers:request.headers,body:JSON.stringify({email,password:input.password})});
     const response=await auth.handler(request);
     response.headers.set('Cache-Control','no-store');
     return response;
    }
    if(path==='/api/auth/reset-password'){
     if(typeof input.token!=='string'||input.token.length<20||input.token.length>200)return json({error:'Este link de recuperação é inválido ou expirou. Solicite um novo link.'},400);
     if(typeof input.newPassword!=='string'||input.newPassword.length<12||input.newPassword.length>128)return json({error:'Escolha uma senha entre 12 e 128 caracteres.'},400);
    }
    request=new Request(request.url,{method,headers:request.headers,body:JSON.stringify(path==='/api/auth/reset-password'?{token:input.token,newPassword:input.newPassword}:input)});
   }
   const response=await auth.handler(request);response.headers.set('Cache-Control','no-store');
   if(path==='/api/auth/reset-password'){
    const payload=await response.json().catch(()=>({})),headers=new Headers(response.headers);headers.delete('content-length');headers.set('Content-Type','application/json');
    const message=response.status===429?'Muitas tentativas. Aguarde alguns minutos e tente novamente.':payload.code==='INVALID_TOKEN'?'Este link de recuperação é inválido ou expirou. Solicite um novo link.':'Não foi possível definir a nova senha. Tente novamente.';
    return new Response(JSON.stringify(response.ok?{ok:true}:{error:message}),{status:response.status,headers});
   }
   return response;
  }
  const session=await auth.api.getSession({headers:request.headers});
  const identity=adminIdentity(session?.user,process.env.ADMIN_EMAIL);
  const admin=!!identity;
  if(path==='/api/session'&&method==='GET'){
   return json({admin,local:false,authenticated:!!session?.user,owner:!!identity?.owner,displayName:identity?.name});
  }
  if(path==='/api/admin/team'){
   if(!identity?.owner)return json({error:'Somente a conta principal pode gerenciar os acessos.'},403);
   if(method==='GET')return json({members:await teamAccessList(db)});
   if(method!=='POST')return json({error:'Método não permitido.'},405);
   const {status,error}=await setTeamPassword(db,await readBody(request),process.env.ADMIN_EMAIL);
   return json(error?{error}:{ok:true},status);
  }
  const clientKey=createHash('sha256').update(request.headers.get('x-vercel-forwarded-for')||'unknown').digest('hex');
  return await system(request,{admin,authenticated:!!session?.user,local:false,clientKey});
 }catch(error){
  if(error.status&&Number.isInteger(error.status))return json({error:error.message},error.status);
  console.error('Cloud request failed:',error?.name||'Error');return json({error:'Não foi possível concluir agora. Tente novamente.'},500);
 }
}
