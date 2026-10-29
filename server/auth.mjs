import {betterAuth} from 'better-auth';
import {APIError} from 'better-auth/api';
import {timingSafeEqual} from 'node:crypto';

export function secretMatches(value,expected){
 if(typeof value!=='string'||typeof expected!=='string'||expected.length<32)return false;
 const actual=Buffer.from(value),wanted=Buffer.from(expected);return actual.length===wanted.length&&timingSafeEqual(actual,wanted);
}
export function createAdminAuth(pool,{origin,secret,setupKey,adminEmail,sendResetPassword}){
 if(!secret||secret.length<32||!setupKey||setupKey.length<32||!adminEmail)throw Error('Admin authentication configuration missing');
 const owner=adminEmail.trim().toLowerCase();
 return betterAuth({
  appName:'Babi Instituto de Beleza',baseURL:origin,basePath:'/api/auth',secret,database:pool,
  trustedOrigins:[origin],
  emailAndPassword:{enabled:true,minPasswordLength:12,maxPasswordLength:128,autoSignIn:false,resetPasswordTokenExpiresIn:900,revokeSessionsOnPasswordReset:true,...(sendResetPassword?{sendResetPassword}:{})},
  user:{modelName:'babi_user'},session:{modelName:'babi_session',expiresIn:28800,updateAge:1800},
  account:{modelName:'babi_account'},verification:{modelName:'babi_verification'},
  rateLimit:{enabled:true,storage:'database',modelName:'babi_auth_rate_limit',window:60,max:30,
   customRules:{'/sign-in/email':{window:300,max:5},'/reset-password':{window:300,max:5}}},
  advanced:{useSecureCookies:origin.startsWith('https:'),ipAddress:{ipAddressHeaders:['x-vercel-forwarded-for']}},
  databaseHooks:{user:{create:{before:async(user,context)=>{
   if(user.email?.trim().toLowerCase()!==owner||!secretMatches(context?.headers?.get('x-babi-setup-key'),setupKey))throw new APIError('FORBIDDEN',{message:'Cadastro administrativo fechado.'});
   const count=await pool.query('SELECT COUNT(*) AS count FROM babi_user');
   if(Number(count.rows[0].count)!==0)throw new APIError('FORBIDDEN',{message:'O acesso inicial já foi configurado.'});
   return {data:{...user,email:owner}};
  }},update:{before:async(user)=>{
   if(user.email&&user.email.trim().toLowerCase()!==owner)throw new APIError('FORBIDDEN',{message:'A conta proprietária não pode ser alterada por este fluxo.'});
  }}}},
  logger:{level:'error',log:()=>console.error('Admin authentication operation failed')}
 });
}
