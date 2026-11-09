import {createHash, ECDH, randomUUID} from 'node:crypto';
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
 const device = () => db.get('SELECT * FROM push_device WHERE slot=1');
 const delivered = status => status>=200 && status<300;
 const gone = status => status===404 || status===410;
 const retryable = status => status===0 || status===408 || status===429 || status>=500;

 async function sendSafely(target, payload) {
  try { return await send(subscription(target),payload,vapid); }
  catch { return 0; }
 }

 async function handle(request, {admin}={}) {
  if (!admin) return response({error:'Acesso restrito ao painel.'},403);
  if (request.method==='GET') return response({publicKey:vapid?.publicKey??null});
  if (request.method!=='POST') return response({error:'Método não permitido.'},405);
  try {
   const input = await body(request);
   if (!vapid) return response({error:'As notificações estão indisponíveis neste ambiente.'},503);
   if (input.action==='enable') {
    const value = input.subscription;
    if (!validSubscription(value)) return response({error:'Use um navegador compatível para ativar os avisos.'},400);
    const id = hash(value.endpoint);
    await db.batch([
     {sql:'DELETE FROM push_device WHERE id<>?',args:[id]},
     {sql:`INSERT INTO push_device(id,endpoint,p256dh,auth) VALUES(?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET p256dh=excluded.p256dh,auth=excluded.auth`,args:[id,value.endpoint,value.keys.p256dh,value.keys.auth]}
    ]);
    return response({active:true,here:true});
   }
   if (input.action==='disable') {
    await db.run('DELETE FROM push_device WHERE slot=1');
    return response({active:false,here:false});
   }
   const current = await device();
   const here = !!current && validEndpoint(input.endpoint) && current.id===hash(input.endpoint);
   if (input.action==='status') return response({active:!!current,here});
   if (input.action!=='test') return response({error:'Ação inválida.'},400);
   if (!here) return response({error:'Ative as notificações neste aparelho primeiro.'},409);
   const test = await db.run('UPDATE push_device SET tested_at=? WHERE id=? AND (tested_at IS NULL OR tested_at<=?)',
    [dateAt(0),current.id,dateAt(-20000)]);
   if (!test.changes) return response({error:'Aguarde 20 segundos para testar novamente.'},429);
   const status = await sendSafely(current,notification('test',randomUUID()));
   if (delivered(status)) return response({ok:true});
   if (gone(status)) {
    await db.run('DELETE FROM push_device WHERE id=?',[current.id]);
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
    SELECT kind,event_id,device_id FROM push_outbox WHERE ready_at<=? ORDER BY ready_at LIMIT 12)`,
    args:[claim,dateAt(60000),dateAt(0)]}
  ]);
  const pending = await db.all(`SELECT o.*,d.endpoint,d.p256dh,d.auth FROM push_outbox o
   JOIN push_device d ON d.id=o.device_id WHERE o.claim_token=?`,[claim]);
  await Promise.all(pending.map(async row => {
   const payload = notification(row.kind,row.event_id);
   let status = await sendSafely(row,payload);
   if (retryable(status) && status!==429) {
    await delay(700);
    status = await sendSafely(row,payload);
   }
   if (gone(status)) {
    await db.run('DELETE FROM push_device WHERE id=?',[row.device_id]);
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

 return {enabled:!!vapid,handle,flush};
}
