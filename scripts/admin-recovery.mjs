import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createAdminAuth} from '../server/auth.mjs';
import {createPool} from '../server/postgres.mjs';

// Maintenance only. This module is never imported by the HTTP application.
// Return the link to the authorized operator; never write tokens or passwords.
export async function createOwnerRecoveryLink(pool,options){
 const owner=options.adminEmail?.trim().toLowerCase(),origin=new URL(options.origin);
 if(!owner||origin.origin!==options.origin||!(origin.protocol==='https:'||['localhost','127.0.0.1'].includes(origin.hostname)))throw Error('Invalid recovery target');
 const users=await pool.query('SELECT email FROM babi_user');
 if(users.rows.length!==1||users.rows[0].email.toLowerCase()!==owner)throw Error('Configured owner not found');
 let recoveryUrl='';
 const auth=createAdminAuth(pool,{...options,sendResetPassword:async({user,token})=>{
  if(user.email.toLowerCase()!==owner)throw Error('Recovery owner mismatch');
  recoveryUrl=origin.origin+'/admin/#recovery='+encodeURIComponent(token);
 }});
 await auth.api.requestPasswordReset({body:{email:owner,redirectTo:origin.origin+'/admin/'}});
 if(!recoveryUrl)throw Error('Recovery link not issued');
 return {recoveryUrl,expiresInSeconds:900};
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 let pool;
 try{
  if(!process.argv.includes('--production'))throw Error('Explicit production target required');
  const project=JSON.parse(readFileSync('.vercel/project.json','utf8'));
  if(project.projectId!=='prj_zw4UHlBR6UJaS6KXY6PENJELAbg9'||project.orgId!=='team_NseDl6bHKTOowzX904mmIj0U'||process.env.BABI_APP_ORIGIN!=='https://babi-instituto.vercel.app'||!process.env.NEON_PROJECT_ID||process.env.NEON_PROJECT_ID==='gentle-dawn-48537104')throw Error('Unexpected recovery project');
  pool=createPool(process.env.DATABASE_URL_UNPOOLED);
  const link=await createOwnerRecoveryLink(pool,{origin:process.env.BABI_APP_ORIGIN,secret:process.env.AUTH_SECRET,setupKey:process.env.BABI_SETUP_KEY,adminEmail:process.env.ADMIN_EMAIL});
  console.log(JSON.stringify(link));
 }catch(error){console.error('Recovery link was not issued:',error.name);process.exitCode=1;}
 finally{if(pool)await pool.end();}
}
