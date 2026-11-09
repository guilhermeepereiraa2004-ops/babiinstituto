import {createHash, ECDH, randomBytes, randomUUID} from 'node:crypto';
import {setTimeout as delay} from 'node:timers/promises';
import {generateRequestDetails} from 'web-push';
import {body} from './core.mjs';

const types = {
 booking: {title:'Novo agendamento', body:'Uma cliente marcou um horário. Veja na agenda.'},
 order: {title:'Novo pedido na Loja Babi', body:'Abra o painel para acompanhar o pedido.'},
 test: {title:'Teste do Babi Instituto', body:'Este aparelho está pronto para receber avisos.'}
};
const response = (data, status=200) => Response.json(data, {status, headers:{'Cache-Control':'no-store'}});
const hash = value => createHash('sha256').update(value).digest('hex');
const notification = (kind, id) => ({...types[kind], kind, tag:`babi-${kind}-${hash(id).slice(0,24)}`});
const dateAt = offset => new Date(Date.now()+offset).toISOString();
const DEVICE_LIMIT=10;
const inviteCode=value=>typeof value==='string' && /^[A-Za-z0-9_-]{24}$/.test(value);
const deviceName=value=>typeof value==='string' && !/[\x00-\x1f\x7f]/.test(value) ? value.trim().slice(0,60) : '';

function validEndpoint(endpoint) {
 if (typeof endpoint!=='string' || endpoint.length>2048) return false;
 try {
  const url = new URL(endpoint);
  const host = url.hostname;
  const provider = (host==='fcm.googleapis.com' && /^\/fcm\/send\/.+/.test(url.pathname))
   || (host==='updates.push.services.mozilla.com' && /^\/wpush\/v\d+\/.+/.test(url.pathname))
   || host.endsWith('.push.apple.com') || host==='push.apple.com'
   || host.endsWith('.notify.windows.com');
  return provider && url.protocol==='https:' && !url.port && !url.username && !url.password
   && !url.hash && url.pathname!=='/' && url.href===endpoint;
 } catch {
  return false;
 }
}

function decode(value, size) {
 if (typeof value!=='string' || !/^[A-Za-z0-9_-]+$/.test(value) || value.length>90) return null;
 const bytes = Buffer.from(value, 'base64url');
 return bytes.length===size && bytes.toString('base64url')===value ? bytes : null;
}

function validSubscription(value) {
 if (!validEndpoint(value?.endpoint) || !decode(value.keys?.auth,16)) return false;
 const key = decode(value.keys?.p256dh,65);
 try {
  return key?.[0]===4 && !!ECDH.convertKey(key,'prime256v1');
 } catch {
  return false;
 }
}

export function pushConfig(env=process.env) {
 const {BABI_PUSH_PUBLIC_KEY:publicKey, BABI_PUSH_PRIVATE_KEY:privateKey} = env;
 if (!decode(publicKey,65) || !decode(privateKey,32)) return null;
 return {publicKey,privateKey,subject:'https://babi-instituto.vercel.app'};
}

export async function sendPush(subscription, payload, vapidDetails) {
 if (!validSubscription(subscription)) return 400;
 const request = generateRequestDetails(subscription,JSON.stringify(payload),{
  vapidDetails,TTL:3600,urgency:'high',topic:hash(payload.tag).slice(0,32)
 });
 const result = await fetch(request.endpoint,{
  method:request.method,headers:request.headers,body:request.body,
  redirect:'error',signal:AbortSignal.timeout(4500)
 });
 await result.body?.cancel();
 return result.status;
}

export function createPushService(db, {vapid=pushConfig(),send=sendPush}={}) {
 const subscription = device => ({endpoint:device.endpoint,keys:{p256dh:device.p256dh,auth:device.auth}});
 const device = id => db.get('SELECT * FROM push_device WHERE id=?',[id]);
 const delivered = status => status>=200 && status<300;
 const gone = status => status===404 || status===410;
 const retryable = status => status===0 || status===408 || status===429 || status>=500;

 async function sendSafely(target, payload) {
  try { return await send(subscription(target),{...payload,guest:!!target.invite_id},vapid); }
  catch { return 0; }
 }

 async function findDevice(input,guest){
  if(!guest)return validEndpoint(input.endpoint)?device(hash(input.endpoint)):null;
  const value=input.subscription;
  if(!validSubscription(value))return null;
  return db.get('SELECT * FROM push_device WHERE id=? AND invite_id IS NOT NULL AND p256dh=? AND auth=?',
   [hash(value.endpoint),value.keys.p256dh,value.keys.auth]);
 }

 async function invite(input){
  const name=deviceName(input.name);
  if(!name)return response({error:'Informe um nome para identificar o aparelho.'},400);
  const code=randomBytes(18).toString('base64url');
  const result=await db.batch([
   {sql:'DELETE FROM push_invite WHERE expires_at<=?',args:[dateAt(0)]},
   {sql:`INSERT INTO push_invite(id,token_hash,name,expires_at)
    SELECT ?,?,?,? WHERE (SELECT COUNT(*) FROM push_invite)<?`,
    args:[randomUUID(),hash(code),name,dateAt(86400000),DEVICE_LIMIT]}
  ]);
  return result[1].changes?response({code},201):response({error:'Há 10 convites pendentes. Cancele um deles antes de criar outro.'},409);
 }

 async function enable(input,guest){
  const value=input.subscription;
  if(!validSubscription(value))return response({error:'Use um navegador compatível para ativar os avisos.'},400);
  const id=hash(value.endpoint);
  const active=await findDevice({...input,endpoint:value.endpoint},guest);
  if(active){
   if(!guest&&!active.invite_id){
    await db.run('UPDATE push_device SET p256dh=?,auth=? WHERE id=?',[value.keys.p256dh,value.keys.auth,id]);
   }
   return response({here:true});
  }
  if(guest&&!inviteCode(input.code))return response({error:'Informe um código de convite válido.'},400);
  const token=guest?hash(input.code):null;
  const args=[id,value.endpoint,value.keys.p256dh,value.keys.auth];
  const fields=guest?'i.name,i.id':'?,NULL';
  const join=guest?'JOIN push_invite i ON i.token_hash=? AND i.expires_at>?':'';
  args.push(...(guest?[token,dateAt(0)]:[deviceName(input.name)||'Aparelho do painel']));
  const statements=[{sql:`WITH slots(slot) AS (VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10)),
   available AS (SELECT slot FROM slots WHERE slot NOT IN (SELECT slot FROM push_device) ORDER BY slot LIMIT 1)
   INSERT INTO push_device(id,slot,endpoint,p256dh,auth,name,invite_id)
   SELECT ?,available.slot,?,?,?,${fields} FROM available ${join} WHERE TRUE
   ON CONFLICT(id) DO NOTHING`,args}];
  if(guest)statements.push({
   sql:`DELETE FROM push_invite WHERE token_hash=? AND EXISTS(
    SELECT 1 FROM push_device WHERE id=? AND invite_id=push_invite.id)`,
   args:[token,id]
  });
  const [result]=await db.batch(statements);
  if(result.changes || await findDevice({...input,endpoint:value.endpoint},guest))return response({here:true});
  if(guest&&!await db.get('SELECT id FROM push_invite WHERE token_hash=? AND expires_at>?',[token,dateAt(0)])){
   return response({error:'Este convite expirou, já foi usado ou foi cancelado.'},410);
  }
  if(await device(id))return response({error:'Este navegador já está cadastrado. Peça ao painel para remover o cadastro anterior.'},409);
  return response({error:'Os 10 aparelhos já estão ativos. Peça para liberar uma vaga.'},409);
 }

 async function removeExpiredDevice(target){
  await db.run('DELETE FROM push_device WHERE id=? AND p256dh=? AND auth=?',[target.device_id??target.id,target.p256dh,target.auth]);
 }

 async function handle(request, {admin}={},guest=false) {
  if (!guest&&!admin) return response({error:'Acesso restrito ao painel.'},403);
  if (request.method==='GET') return response({publicKey:vapid?.publicKey??null});
  if (request.method!=='POST') return response({error:'Método não permitido.'},405);
  try {
   const input = await body(request);
   if (!vapid) return response({error:'As notificações estão indisponíveis neste ambiente.'},503);
   if(input.action==='enable')return await enable(input,guest);
   if(!guest&&input.action==='invite')return await invite(input);
   if(!guest&&input.action==='revoke'){
    await db.run('DELETE FROM push_device WHERE id=?',[String(input.id??'')]);
    return response({ok:true});
   }
   if(!guest&&input.action==='cancel-invite'){
    await db.run('DELETE FROM push_invite WHERE id=?',[String(input.id??'')]);
    return response({ok:true});
   }
   const current=await findDevice(input,guest);
   if(input.action==='status'){
    if(guest)return response({here:!!current});
    const devices=await db.all('SELECT id,name,CASE WHEN invite_id IS NULL THEN 0 ELSE 1 END AS guest FROM push_device ORDER BY slot');
    const invites=await db.all('SELECT id,name FROM push_invite WHERE expires_at>? ORDER BY expires_at',[dateAt(0)]);
    return response({active:!!devices.length,here:!!current,currentId:current?.id,devices,invites,limit:DEVICE_LIMIT});
   }
   if(input.action==='disable'){
    if(!current)return response({error:'Abra esta tela no aparelho cadastrado ou remova-o pela lista do painel.'},409);
    await db.run('DELETE FROM push_device WHERE id=? AND p256dh=? AND auth=?',[current.id,current.p256dh,current.auth]);
    return response({here:false});
   }
   if (input.action!=='test') return response({error:'Ação inválida.'},400);
   if (!current) return response({error:'Ative as notificações neste aparelho primeiro.'},409);
   const test = await db.run('UPDATE push_device SET tested_at=? WHERE id=? AND (tested_at IS NULL OR tested_at<=?)',
    [dateAt(0),current.id,dateAt(-20000)]);
   if (!test.changes) return response({error:'Aguarde 20 segundos para testar novamente.'},429);
   const status = await sendSafely(current,notification('test',randomUUID()));
   if (delivered(status)) return response({ok:true});
   if (gone(status)) {
    await removeExpiredDevice(current);
    return response({error:'A autorização deste aparelho expirou. Ative as notificações novamente.'},410);
   }
   console.error('Babi push test rejected:',status);
   return response({error:'Não foi possível encaminhar o teste agora. Tente novamente.'},502);
  } catch (error) {
   if (error.status) return response({error:error.message},error.status);
   console.error('Babi push settings failed:',error.name);
   return response({error:'Não foi possível atualizar as notificações.'},500);
  }
 }

 async function flush() {
  if (!vapid || !await db.get('SELECT 1 FROM push_outbox LIMIT 1')) return;
  const claim = randomUUID();
  const cutoff = dateAt(-36*60*60*1000);
  await db.batch([
   {sql:'DELETE FROM push_outbox WHERE created_at<?',args:[cutoff]},
   {sql:`UPDATE push_outbox SET claim_token=?,ready_at=? WHERE (kind,event_id,device_id) IN (
    SELECT kind,event_id,device_id FROM push_outbox WHERE ready_at<=? ORDER BY created_at DESC,ready_at LIMIT 30)`,
    args:[claim,dateAt(60000),dateAt(0)]}
  ]);
  const pending = await db.all(`SELECT o.*,d.endpoint,d.p256dh,d.auth,d.invite_id FROM push_outbox o
   JOIN push_device d ON d.id=o.device_id WHERE o.claim_token=?`,[claim]);
  await Promise.all(pending.map(async row => {
   const payload = notification(row.kind,row.event_id);
   let status = await sendSafely(row,payload);
   if (retryable(status) && status!==429) {
    await delay(700);
    status = await sendSafely(row,payload);
   }
   if (gone(status)) {
    await removeExpiredDevice(row);
    return;
   }
   const key = [row.kind,row.event_id,row.device_id,claim];
   if (delivered(status) || !retryable(status) || row.attempts>=4) {
    await db.run('DELETE FROM push_outbox WHERE kind=? AND event_id=? AND device_id=? AND claim_token=?',key);
    if (!delivered(status)) console.error('Babi push delivery rejected:',row.kind,status);
   } else {
    const retryAt = dateAt(30000*2**row.attempts);
    await db.run(`UPDATE push_outbox SET attempts=attempts+1,ready_at=?,claim_token=NULL
     WHERE kind=? AND event_id=? AND device_id=? AND claim_token=?`,[retryAt,...key]);
   }
  }));
 }

 return {enabled:!!vapid,handle,handleInvite:request=>handle(request,{},true),flush};
}
