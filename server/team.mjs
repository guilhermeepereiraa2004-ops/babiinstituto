import {randomUUID} from 'node:crypto';
import {hashPassword} from 'better-auth/crypto';

const team=[
 {login:'fabricia',name:'Fabrícia',email:'fabricia@equipe.babi.invalid'},
 {login:'brisa',name:'Brisa',email:'brisa@equipe.babi.invalid'}
];
const lower=value=>typeof value==='string'?value.trim().toLowerCase():'';

export function emailForAdminLogin(value,ownerEmail){
 const login=lower(value);
 if(login&&login===lower(ownerEmail))return login;
 const plain=login.normalize('NFD').replace(/\p{M}/gu,'');
 return team.find(person=>person.login===plain)?.email;
}

export function adminIdentity(user,ownerEmail){
 const email=lower(user?.email);
 if(!email)return null;
 if(email===lower(ownerEmail))return {owner:true,name:user.name||'Fabrícia Leão'};
 const member=team.find(person=>person.email===email);
 return member?{owner:false,name:member.name}:null;
}

export async function teamAccessList(db){
 const active=await db.all(`SELECT DISTINCT u.email FROM babi_user u JOIN babi_account a ON a."userId"=u.id
  WHERE u.email IN (?,?) AND a."providerId"='credential' AND a.password IS NOT NULL`,team.map(person=>person.email));
 return team.map(({login,name,email})=>({login,name,active:active.some(row=>row.email===email)}));
}

export async function setTeamPassword(db,input,ownerEmail){
 const member=team.find(person=>person.login===input.login);
 if(!member||member.email===lower(ownerEmail))return {status:400,error:'Selecione um acesso da equipe.'};
 if(typeof input.password!=='string'||input.password.length<12||input.password.length>128){
  return {status:400,error:'Escolha uma senha de 12 a 128 caracteres.'};
 }
 if(input.action!=='activate'&&input.action!=='reset')return {status:400,error:'Ação inválida.'};
 const password=await hashPassword(input.password);
 if(input.action==='activate'){
  const id=randomUUID();
  // The user and the credential commit together. Better Auth authenticates
  // them using its own credential provider and password format.
  const result=await db.run(`WITH created AS (
   INSERT INTO babi_user (id,name,email,"emailVerified","createdAt","updatedAt")
   VALUES (?,?,?,false,NOW(),NOW()) ON CONFLICT (email) DO NOTHING RETURNING id
  ) INSERT INTO babi_account (id,"userId","accountId","providerId",password,"createdAt","updatedAt")
   SELECT ?,id,id,'credential',?,NOW(),NOW() FROM created`,[id,member.name,member.email,randomUUID(),password]);
  return result.changes?{status:201}:{status:409,error:'Esse acesso já tem senha. Atualize a página para redefini-la.'};
 }
 const [updated]=await db.batch([
  {sql:`UPDATE babi_account SET password=?,"updatedAt"=NOW()
    WHERE "providerId"='credential' AND "userId"=(SELECT id FROM babi_user WHERE email=?)`,args:[password,member.email]},
  {sql:`DELETE FROM babi_session WHERE "userId"=(SELECT id FROM babi_user WHERE email=?)
    AND EXISTS(SELECT 1 FROM babi_account WHERE "userId"=babi_session."userId" AND "providerId"='credential' AND password=?)`,
   args:[member.email,password]}
 ]);
 return updated.changes?{status:200}:{status:409,error:'Esse acesso ainda precisa da primeira senha.'};
}
