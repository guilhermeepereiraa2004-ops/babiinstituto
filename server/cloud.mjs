import {handleApi} from './core.mjs';
import {createPool,createPostgresDb} from './postgres.mjs';
import {createAdminAuth,secretMatches} from './auth.mjs';
import {createHash} from 'node:crypto';

let pool,db;const authByOrigin=new Map();
export async function closeCloudConnections(){if(pool)await pool.end();pool=undefined;db=undefined;authByOrigin.clear();}
const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
function allowedOrigins(){return new Set([process.env.BABI_APP_ORIGIN,...[process.env.VERCEL_URL,process.env.VERCEL_BRANCH_URL].filter(Boolean).map(h=>'https://'+h)].filter(Boolean));}
function authFor(origin){
 if(!pool){pool=createPool(process.env.DATABASE_URL);db=createPostgresDb(pool);}
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
   const allowed={'/api/auth/sign-in/email':'POST','/api/auth/sign-out':'POST','/api/auth/get-session':'GET'};
   if(allowed[path]!==method)return json({error:'Caminho não encontrado.'},404);
   if(method==='POST'){
    const input=await readBody(request);
    // Login only accepts the configured owner. No public sign-up, email changes,
    // password-reset or account-linking endpoints are exposed.
    if(path.endsWith('/sign-in/email')&&String(input.email).trim().toLowerCase()!==process.env.ADMIN_EMAIL.trim().toLowerCase())return json({error:'E-mail ou senha inválidos.'},401);
    request=new Request(request.url,{method,headers:request.headers,body:JSON.stringify(input)});
   }
   const response=await auth.handler(request);response.headers.set('Cache-Control','no-store');return response;
  }
  const session=await auth.api.getSession({headers:request.headers});
  const admin=session?.user?.email?.toLowerCase()===process.env.ADMIN_EMAIL.trim().toLowerCase();
  const clientKey=createHash('sha256').update(request.headers.get('x-vercel-forwarded-for')||'unknown').digest('hex');
  return await handleApi(request,db,{admin,authenticated:!!session?.user,local:false,clientKey});
 }catch(error){
  if(error.status&&Number.isInteger(error.status))return json({error:error.message},error.status);
  console.error('Cloud request failed:',error?.name||'Error');return json({error:'Não foi possível concluir agora. Tente novamente.'},500);
 }
}
