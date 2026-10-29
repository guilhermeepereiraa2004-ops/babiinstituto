// One-time provisioning helper. Secrets travel to Vercel through stdin, never argv/logs.
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
if(!process.argv.includes('--provision')||!process.env.ADMIN_EMAIL)throw Error('Explicit --provision and private ADMIN_EMAIL are required');
const scope='guilherme-pereiras-projects-5a38e3ba',project='prj_zw4UHlBR6UJaS6KXY6PENJELAbg9';
const linked=JSON.parse(readFileSync('.vercel/project.json','utf8'));
if(linked.projectId!==project||linked.orgId!=='team_NseDl6bHKTOowzX904mmIj0U')throw Error('Wrong Vercel project');
const path='.vercel/cloud-secrets.json';
const secrets=existsSync(path)?JSON.parse(readFileSync(path,'utf8')):{production:{AUTH_SECRET:randomBytes(48).toString('base64url'),BABI_SETUP_KEY:randomBytes(32).toString('base64url')},qa:{AUTH_SECRET:randomBytes(48).toString('base64url'),BABI_SETUP_KEY:randomBytes(32).toString('base64url')}};
writeFileSync(path,JSON.stringify(secrets),{mode:0o600});
const cli=join(process.env.APPDATA,'npm/node_modules/vercel/dist/vc.js');
for(const environment of ['production','preview','development']){
 const values={...(environment==='production'?secrets.production:secrets.qa),ADMIN_EMAIL:process.env.ADMIN_EMAIL,...(environment==='production'?{BABI_APP_ORIGIN:'https://babi-instituto.vercel.app'}:environment==='development'?{BABI_APP_ORIGIN:'http://localhost:4175'}:{})};
 for(const [key,value]of Object.entries(values)){
  const args=['env','add',key,environment,'--yes','--force','--scope',scope];
  if(environment!=='development'&&['AUTH_SECRET','BABI_SETUP_KEY'].includes(key))args.push('--sensitive');
  const result=spawnSync(process.execPath,[cli,...args],{input:value,encoding:'utf8',windowsHide:true});
  if(result.status!==0)throw Error('Unable to set '+key+' in '+environment+'; inspect Vercel configuration.');
  console.log(environment+': '+key+' configured');
 }
}
