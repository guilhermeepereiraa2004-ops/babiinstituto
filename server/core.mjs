export const DEFAULT_SETTINGS = {
  enabled: false, timezone: 'America/Bahia', leadMinutes: 60, advanceDays: 60,
  services: [
    {id:'mechas',name:'Mechas & loiros',description:'Luz, nuances e uma cor com a sua identidade.',duration:180,priceCents:null,active:true},
    {id:'cor',name:'Cor & visagismo',description:'Um novo olhar para a cor que valoriza você.',duration:120,priceCents:null,active:true},
    {id:'corte',name:'Cortes & cachos',description:'Movimento e liberdade para sua textura.',duration:60,priceCents:null,active:true},
    {id:'terapia',name:'Terapia capilar',description:'Um momento dedicado ao cuidado dos fios.',duration:60,priceCents:null,active:true}
  ],
  weekly: [0,1,2,3,4,5,6].map(day=>({day,enabled:day>0&&day<6,open:'09:00',close:'18:00',lunch:null}))
};
const STATUSES = new Set(['confirmed','completed','cancelled']);
class ApiError extends Error { constructor(status,message){super(message);this.status=status;} }
function assert(condition,status,message){if(!condition)throw new ApiError(status,message);}
export function minutes(time){assert(/^\d{2}:\d{2}$/.test(time),400,'Horário inválido.');const [h,m]=time.split(':').map(Number);assert(h<24&&m<60,400,'Horário inválido.');return h*60+m;}
export function timeLabel(value){return `${String(Math.floor(value/60)).padStart(2,'0')}:${String(value%60).padStart(2,'0')}`;}
export function validDate(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const d=new Date(value+'T12:00:00Z');return !isNaN(d)&&d.toISOString().slice(0,10)===value;}
export function clock(now=new Date()) {const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Bahia',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now).map(p=>[p.type,p.value]));return {date:`${parts.year}-${parts.month}-${parts.day}`,minute:Number(parts.hour)*60+Number(parts.minute)};}
export function addDays(date,days){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);}
function uid(){return crypto.randomUUID();}
function token(){return Array.from(crypto.getRandomValues(new Uint8Array(24)),v=>v.toString(16).padStart(2,'0')).join('');}
function clean(value,max){return typeof value==='string'?value.trim().replace(/[\u0000-\u001f<>]/g,'').slice(0,max):'';}
function json(data,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
async function body(request){assert(request.headers.get('content-type')?.includes('application/json'),415,'Envie os dados no formato correto.');assert(request.headers.get('origin')===new URL(request.url).origin,403,'Origem da solicitação não autorizada.');const reader=request.body?.getReader();let size=0;const chunks=[];if(reader){while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>12288){await reader.cancel();throw new ApiError(413,'Solicitação muito grande.');}chunks.push(value);}}try{const value=JSON.parse(new TextDecoder().decode(await new Blob(chunks).arrayBuffer()));assert(value&&typeof value==='object'&&!Array.isArray(value),400,'Dados inválidos.');return value;}catch{throw new ApiError(400,'Não foi possível ler os dados.');}}
export async function readSettings(db){const row=await db.get('SELECT value FROM settings WHERE id=1');return row?JSON.parse(row.value):structuredClone(DEFAULT_SETTINGS);}
function validateSettings(input){assert(input&&typeof input.enabled==='boolean',400,'Configuração inválida.');assert(Number.isInteger(input.leadMinutes)&&input.leadMinutes>=0&&input.leadMinutes<=2880,400,'Antecedência inválida.');assert(Number.isInteger(input.advanceDays)&&input.advanceDays>=1&&input.advanceDays<=180,400,'Limite de dias inválido.');assert(Array.isArray(input.services)&&input.services.length>=1&&input.services.length<=12,400,'Cadastre de 1 a 12 serviços.');const ids=new Set();const services=input.services.map(s=>{assert(typeof s.id==='string'&&/^[a-z0-9-]{1,40}$/.test(s.id)&&!ids.has(s.id),400,'Identificador de serviço inválido.');ids.add(s.id);assert(Number.isInteger(s.duration)&&s.duration>=15&&s.duration<=480&&s.duration%15===0,400,'A duração deve ser de 15 a 480 minutos, em intervalos de 15.');const name=clean(s.name,70);assert(name.length>=3,400,'Informe o nome de cada serviço.');return {id:s.id,name,description:clean(s.description,180),duration:s.duration,priceCents:s.priceCents==null?null:validateMoney(s.priceCents,true),active:!!s.active};});assert(Array.isArray(input.weekly)&&input.weekly.length===7,400,'Configure os sete dias da semana.');const weekly=input.weekly.map((day,index)=>{assert(day.day===index,400,'Dias da semana inválidos.');const open=minutes(day.open),close=minutes(day.close);assert(open%15===0&&close%15===0&&open<close,400,'A abertura deve ser anterior ao fechamento, em intervalos de 15 minutos.');let lunch=null;if(day.lunch!=null){assert(typeof day.lunch==='object'&&!Array.isArray(day.lunch)&&typeof day.lunch.start==='string'&&typeof day.lunch.end==='string',400,'Informe o início e o fim do almoço.');const start=minutes(day.lunch.start),end=minutes(day.lunch.end);assert(start%15===0&&end%15===0&&start<end&&start>=open&&end<=close,400,'O almoço deve começar antes de terminar, dentro do expediente e em intervalos de 15 minutos.');lunch={start:day.lunch.start,end:day.lunch.end};}return {day:index,enabled:!!day.enabled,open:day.open,close:day.close,lunch};});if(input.enabled)assert(services.some(s=>s.active)&&weekly.some(d=>d.enabled),400,'Ative pelo menos um serviço e um dia de atendimento.');return {enabled:input.enabled,timezone:'America/Bahia',leadMinutes:input.leadMinutes,advanceDays:input.advanceDays,services,weekly};}
function serviceFor(settings,id){const service=settings.services.find(s=>s.id===id&&s.active);assert(service,400,'Escolha um serviço disponível.');return service;}
export async function availableSlots(db,settings,date,serviceId,now=new Date(),ignoreId=''){
  assert(validDate(date),400,'Data inválida.');const service=serviceFor(settings,serviceId),today=clock(now);const maxDate=addDays(today.date,settings.advanceDays);
  if(!settings.enabled)return {slots:[],reason:'A agenda ainda não está aberta.'};
  if(date<today.date||date>maxDate)return {slots:[],reason:'Escolha uma data dentro do período disponível.'};
  const weekday=new Date(date+'T12:00:00Z').getUTCDay(),day=settings.weekly[weekday];
  if(!day.enabled)return {slots:[],reason:'Não há atendimento neste dia.'};
  const busy=await db.all('SELECT minute FROM booking_slots WHERE date=? AND booking_id<>?',[date,ignoreId]);
  const occupied=new Set(busy.map(row=>row.minute));const blocks=await db.all('SELECT start_minute,end_minute FROM schedule_blocks WHERE date=?',[date]);
  if(day.lunch)blocks.push({start_minute:minutes(day.lunch.start),end_minute:minutes(day.lunch.end)});
  const slots=[];const earliest=now.getTime()+settings.leadMinutes*60000;
  for(let start=minutes(day.open);start+service.duration<=minutes(day.close);start+=30){
    if(new Date(`${date}T${timeLabel(start)}:00-03:00`).getTime()<earliest)continue;
    if(blocks.some(b=>start<b.end_minute&&start+service.duration>b.start_minute))continue;
    let free=true;for(let m=start;m<start+service.duration;m+=15){if(occupied.has(m)){free=false;break;}}
    if(free)slots.push(timeLabel(start));
  }
  return {slots,reason:slots.length?'':'Os horários deste dia já foram preenchidos. Tente outra data.'};
}
async function rateLimit(db,key,now){const bucket=Math.floor(now.getTime()/600000);const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key)))).map(v=>v.toString(16).padStart(2,'0')).join('');const id=`${hash}:${bucket}`;await db.batch([{sql:'DELETE FROM rate_limits WHERE expires<?',args:[now.getTime()]},{sql:'INSERT INTO rate_limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=rate_limits.count+1',args:[id,now.getTime()+600000]}]);const row=await db.get('SELECT count FROM rate_limits WHERE key=?',[id]);assert(row.count<=10,429,'Muitas tentativas. Aguarde alguns minutos para tentar novamente.');}
async function publicBooking(db,row){
 let paymentStatus=row.status==='cancelled'?'not_applicable':'pending';
 if(row.status==='completed'){
  const entry=await db.get('SELECT kind,status,amount_cents FROM finance_entries WHERE booking_id=?',[row.id]);
  paymentStatus=entry?.kind==='income'&&entry.status==='posted'&&Number.isSafeInteger(entry.amount_cents)&&entry.amount_cents>=0?(entry.amount_cents===0?'courtesy':'received'):'unrecorded';
 }
 return {paymentStatus,code:`BABI-${row.id.slice(0,8).toUpperCase()}`,name:row.customer_name.split(' ')[0],service:row.service_name,date:row.date,time:timeLabel(row.start_minute),duration:row.duration,status:row.status,token:row.token};}
function validateAnamnesis(input){
  assert(input&&typeof input==='object'&&input.consent===true,400,'Autorize o uso da anamnese para preparar seu atendimento.');
  const choices=new Set(['no','yes','unsure','private']);
  assert(choices.has(input.chemicalHistory)&&choices.has(input.allergies),400,'Responda às perguntas sobre química e reações a produtos.');
  for(const key of ['chemicalDetails','allergyDetails','hairCare'])assert(input[key]===undefined||(typeof input[key]==='string'&&input[key].length<=500),400,'Use até 500 caracteres em cada observação da anamnese.');
  return {chemicalHistory:input.chemicalHistory,chemicalDetails:input.chemicalHistory==='yes'?clean(input.chemicalDetails,500):'',allergies:input.allergies,allergyDetails:input.allergies==='yes'?clean(input.allergyDetails,500):'',hairCare:clean(input.hairCare,500)};
}
const PAYMENT_METHODS=new Set(['pix','cash','credit','debit','transfer','other']);
function validateMoney(value,allowZero=false){assert(Number.isSafeInteger(value)&&value>=(allowZero?0:1)&&value<=100000000,400,allowZero?'Informe um valor válido em centavos (zero para cortesia).':'Informe um valor maior que zero, com até duas casas decimais.');return value;}
function validatePayment(value){assert(PAYMENT_METHODS.has(value),400,'Escolha a forma de pagamento.');return value;}
const FINANCE_COLUMNS='id,booking_id,kind,category,description,amount_cents,date,payment_method,status,void_reason,revision,created_at,updated_at';
function validateFinance(input,now,linked=false){
  assert(input&&['income','expense'].includes(input.kind),400,'Escolha entrada ou saída.');
  assert(validDate(input.date)&&input.date<=clock(now).date,400,'Informe uma data válida, até hoje, para o lançamento.');
  const description=clean(input.description,180),category=clean(input.category,60);
  assert(description.length>=3&&category.length>=2,400,'Informe a descrição e a categoria do lançamento.');
  return {kind:input.kind,category,description,amount_cents:validateMoney(input.amountCents,linked),date:input.date,payment_method:validatePayment(input.paymentMethod)};
}
async function listFinance(db,url,now){
  const from=url.searchParams.get('from')||clock(now).date.slice(0,7)+'-01',to=url.searchParams.get('to')||clock(now).date;
  assert(validDate(from)&&validDate(to)&&from<=to&&to<=addDays(from,366),400,'Selecione um período de até 366 dias.');
  const offset=Number(url.searchParams.get('offset')||0),limit=50;assert(Number.isSafeInteger(offset)&&offset>=0&&offset<=1000000,400,'Página inválida.');
  const summary=await db.get(`SELECT COALESCE(SUM(CASE WHEN status='posted' AND kind='income' THEN amount_cents ELSE 0 END),0) AS "incomeCents",COALESCE(SUM(CASE WHEN status='posted' AND kind='expense' THEN amount_cents ELSE 0 END),0) AS "expenseCents",SUM(CASE WHEN status='posted' AND amount_cents IS NULL THEN 1 ELSE 0 END) AS unpriced,COUNT(*) AS total FROM finance_entries WHERE date BETWEEN ? AND ?`,[from,to]);
  return {from,to,offset,limit,summary:{...summary,unpriced:summary.unpriced||0,balanceCents:summary.incomeCents-summary.expenseCents},entries:await db.all(`SELECT ${FINANCE_COLUMNS} FROM finance_entries WHERE date BETWEEN ? AND ? ORDER BY date DESC,created_at DESC,id LIMIT ? OFFSET ?`,[from,to,limit,offset])};
}
async function createFinanceEntry(db,input,now){
  const value=validateFinance(input,now);assert(typeof input.idempotencyKey==='string'&&/^[a-zA-Z0-9-]{20,60}$/.test(input.idempotencyKey),400,'Reabra o formulário e tente novamente.');
  async function previous(){const old=await db.get('SELECT * FROM finance_entries WHERE idempotency_key=?',[input.idempotencyKey]);if(!old)return null;assert(!old.booking_id&&Object.entries(value).every(([key,v])=>old[key]===v),409,'Este envio já foi utilizado com outros dados.');return await db.get(`SELECT ${FINANCE_COLUMNS} FROM finance_entries WHERE id=?`,[old.id]);}
  const old=await previous();if(old)return old;
  const id=uid(),stamp=now.toISOString(),operation=uid();
  try{await db.batch([
    {sql:'INSERT INTO finance_entries(id,idempotency_key,kind,category,description,amount_cents,date,payment_method,operation_key,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)',args:[id,input.idempotencyKey,value.kind,value.category,value.description,value.amount_cents,value.date,value.payment_method,operation,stamp,stamp]},
    {sql:'INSERT INTO finance_audit(id,entry_id,action,previous_value,new_value,created_at) VALUES(?,?,?,NULL,?,?)',args:[uid(),id,'created',JSON.stringify(value),stamp]}
  ]);}catch(error){if(/UNIQUE/i.test(error.message)){const raced=await previous();if(raced)return raced;}throw error;}
  return await db.get(`SELECT ${FINANCE_COLUMNS} FROM finance_entries WHERE id=?`,[id]);
}
async function updateFinanceEntry(db,id,input,now){
  const row=await db.get('SELECT * FROM finance_entries WHERE id=?',[id]);assert(row,404,'Lançamento não encontrado.');assert(input.revision===row.revision,409,'Este lançamento mudou. Atualize o financeiro.');assert(row.status==='posted',409,'Um lançamento anulado não pode ser alterado.');
  const operation=uid(),stamp=now.toISOString(),voiding=input.action==='void';let value;
  if(voiding){assert(!row.booking_id,409,'Uma entrada de serviço concluído não pode ser anulada aqui. Registre uma saída para devoluções.');const reason=clean(input.reason,180);assert(reason.length>=3,400,'Informe o motivo da anulação.');value={...row,status:'void',void_reason:reason};}
  else{assert(input.action==='edit',400,'Ação financeira inválida.');value={...row,...validateFinance(input,now,!!row.booking_id)};if(row.booking_id)assert(value.kind==='income'&&value.description===row.description&&value.category===row.category,400,'Mantenha a origem e a descrição do serviço concluído.');}
  const auditValue={...value,revision:row.revision+1,updated_at:stamp,operation_key:operation};
  const result=await db.batch([
    {sql:'UPDATE finance_entries SET kind=?,category=?,description=?,amount_cents=?,date=?,payment_method=?,status=?,void_reason=?,updated_at=?,revision=revision+1,operation_key=? WHERE id=? AND revision=? AND status=\'posted\'',args:[value.kind,value.category,value.description,value.amount_cents,value.date,value.payment_method,value.status,value.void_reason,stamp,operation,id,input.revision]},
    {sql:'INSERT INTO finance_audit(id,entry_id,action,previous_value,new_value,created_at) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM finance_entries WHERE id=? AND operation_key=?)',args:[uid(),id,voiding?'voided':'edited',JSON.stringify(row),JSON.stringify(auditValue),stamp,id,operation]}
  ]);assert(result[0].changes>0,409,'Este lançamento mudou. Atualize o financeiro.');return await db.get(`SELECT ${FINANCE_COLUMNS} FROM finance_entries WHERE id=?`,[id]);
}
export async function createBooking(db,input,context){
  const settings=await readSettings(db);assert(settings.enabled,409,'A agenda ainda não está aberta.');const name=clean(input.name,100),phone=String(input.phone||'').replace(/\D/g,'');
  assert(name.length>=3&&phone.length>=10&&phone.length<=13,400,'Informe seu nome e um telefone válido com DDD.');assert(input.consent===true,400,'Confirme o uso dos dados para seu agendamento.');
  const anamnesis=JSON.stringify(validateAnamnesis(input.anamnesis));
  assert(typeof input.idempotencyKey==='string'&&/^[a-zA-Z0-9-]{20,60}$/.test(input.idempotencyKey),400,'Recarregue a página e tente novamente.');
  const old=await db.get('SELECT * FROM bookings WHERE idempotency_key=?',[input.idempotencyKey]);
  if(old){const intake=await db.get('SELECT answers FROM booking_anamnesis WHERE booking_id=?',[old.id]);assert(old.customer_name===name&&old.phone===phone&&old.notes===clean(input.notes,500)&&old.service_id===input.serviceId&&old.date===input.date&&timeLabel(old.start_minute)===input.time&&intake?.answers===anamnesis,409,'Essa solicitação já foi utilizada. Recarregue a página.');return publicBooking(db,old);}
  const now=context.now||new Date();await rateLimit(db,context.clientKey||'unknown',now);
  const service=serviceFor(settings,input.serviceId);const availability=await availableSlots(db,settings,input.date,input.serviceId,now);assert(availability.slots.includes(input.time),409,'Esse horário não está mais disponível. Escolha outro.');
  const id=uid(),secret=token(),minute=minutes(input.time),stamp=now.toISOString();
  const record={id,token:secret,idempotency_key:input.idempotencyKey,customer_name:name,phone,notes:clean(input.notes,500),service_id:service.id,service_name:service.name,duration:service.duration,date:input.date,start_minute:minute,status:'confirmed',created_at:stamp,updated_at:stamp,revision:0,operation_key:uid()};
  const statements=[{sql:'INSERT INTO bookings(id,token,idempotency_key,customer_name,phone,notes,service_id,service_name,duration,date,start_minute,status,created_at,updated_at,revision,operation_key) SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,? WHERE NOT EXISTS(SELECT 1 FROM schedule_blocks WHERE date=? AND start_minute<? AND end_minute>?) AND EXISTS(SELECT 1 FROM settings WHERE id=1 AND value=?)',args:[...Object.values(record),input.date,minute+service.duration,minute,JSON.stringify(settings)]}];
  for(let m=minute;m<minute+service.duration;m+=15)statements.push({sql:'INSERT INTO booking_slots(date,minute,booking_id) SELECT ?,?,? WHERE EXISTS(SELECT 1 FROM bookings WHERE id=?)',args:[input.date,m,id,id]});
  statements.push({sql:'INSERT INTO booking_anamnesis(booking_id,answers,consented_at,version) SELECT ?,?,?,1 WHERE EXISTS(SELECT 1 FROM bookings WHERE id=?)',args:[id,anamnesis,stamp,id]});
  try{const result=await db.batch(statements);assert(result[0].changes>0,409,'A disponibilidade da agenda mudou. Consulte os horários novamente.');}catch(error){if(/UNIQUE/i.test(error.message))throw new ApiError(409,'Esse horário acabou de ser reservado. Escolha outro.');throw error;}
  return publicBooking(db,record);
}
export async function updateBooking(db,id,input,now=new Date()){
  const row=await db.get('SELECT * FROM bookings WHERE id=?',[id]);assert(row,404,'Agendamento não encontrado.');assert(input.revision===row.revision,409,'Esse agendamento mudou. Atualize a agenda.');
  const operation=uid(),status=input.status||row.status;assert(STATUSES.has(status),400,'Status inválido.');
  assert(!(row.status==='cancelled'&&status!=='cancelled'),409,'Um cancelamento não pode ser reaberto. Crie uma nova reserva.');
  assert(!(row.status==='completed'&&status!=='completed'),409,'Um serviço concluído já foi recebido no financeiro e não pode ser reaberto.');
  const completing=status==='completed'&&row.status!=='completed';
  if(completing){validateMoney(input.amountCents,true);validatePayment(input.paymentMethod);}
  const date=input.date||row.date,time=input.time||timeLabel(row.start_minute);const moving=date!==row.date||time!==timeLabel(row.start_minute);
  assert(!moving||row.status==='confirmed',409,'Somente agendamentos confirmados podem ser reagendados.');
  let movingSettings;
  if(moving){const settings=await readSettings(db);movingSettings=JSON.stringify(settings);const snapshot={...settings,services:settings.services.map(s=>s.id===row.service_id?{...s,duration:row.duration}:s)};const available=await availableSlots(db,snapshot,date,row.service_id,now,id);assert(available.slots.includes(time),409,'O novo horário não está disponível.');}
  const start=minutes(time);const guard=moving?' AND NOT EXISTS(SELECT 1 FROM schedule_blocks WHERE date=? AND start_minute<? AND end_minute>?) AND EXISTS(SELECT 1 FROM settings WHERE id=1 AND value=?)':'';
  const statements=[{sql:'UPDATE bookings SET status=?,date=?,start_minute=?,updated_at=?,revision=revision+1,operation_key=? WHERE id=? AND revision=?'+guard,args:[status,date,start,now.toISOString(),operation,id,input.revision,...(moving?[date,start+row.duration,start,movingSettings]:[])]}];
  if(status==='cancelled'||moving)statements.push({sql:'DELETE FROM booking_slots WHERE booking_id=? AND EXISTS(SELECT 1 FROM bookings WHERE id=? AND operation_key=?)',args:[id,id,operation]});
  if(moving&&status!=='cancelled')for(let m=start;m<start+row.duration;m+=15)statements.push({sql:'INSERT INTO booking_slots(date,minute,booking_id) SELECT ?,?,? WHERE EXISTS(SELECT 1 FROM bookings WHERE id=? AND operation_key=?)',args:[date,m,id,id,operation]});
  if(completing){
    assert(!moving,400,'Reagende antes de concluir o atendimento.');
    const entryId=uid(),stamp=now.toISOString();
    statements.push({sql:"INSERT INTO finance_entries(id,booking_id,idempotency_key,kind,category,description,amount_cents,date,payment_method,operation_key,created_at,updated_at) SELECT ?,?,?,'income','Serviços',?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM bookings WHERE id=? AND operation_key=?)",args:[entryId,id,'service:'+id,row.service_name+' · '+row.customer_name,input.amountCents,clock(now).date,input.paymentMethod,operation,stamp,stamp,id,operation]});
    statements.push({sql:'INSERT INTO finance_audit(id,entry_id,action,previous_value,new_value,created_at) SELECT ?,?,?,NULL,?,? WHERE EXISTS(SELECT 1 FROM finance_entries WHERE id=? AND operation_key=?)',args:[uid(),entryId,'service_completed',JSON.stringify({bookingId:id,amountCents:input.amountCents,paymentMethod:input.paymentMethod}),stamp,entryId,operation]});
  }
  let result;try{result=await db.batch(statements);}catch(error){if(/UNIQUE/i.test(error.message))throw new ApiError(409,'O novo horário acabou de ser ocupado.');throw error;}
  assert(result[0].changes>0,409,'O agendamento mudou. Atualize a agenda.');return await db.get('SELECT id,customer_name,phone,notes,service_id,service_name,duration,date,start_minute,status,created_at,revision FROM bookings WHERE id=?',[id]);
}
export async function handleApi(request,db,context={}){
  try{
    const url=new URL(request.url),path=url.pathname,method=request.method,now=context.now||new Date();
    if(path==='/api/session'&&method==='GET')return json({admin:!!context.admin,local:!!context.local,authenticated:!!context.authenticated});
    if(path==='/api/config'&&method==='GET'){const settings=await readSettings(db),today=clock(now).date;return json({enabled:settings.enabled,timezone:settings.timezone,services:settings.services.filter(s=>s.active).map(s=>({id:s.id,name:s.name,description:s.description,duration:s.duration,priceCents:s.priceCents??null,active:s.active})),today,maxDate:addDays(today,settings.advanceDays)});}
    if(path==='/api/availability'&&method==='GET')return json(await availableSlots(db,await readSettings(db),url.searchParams.get('date'),url.searchParams.get('service'),now));
    if(path==='/api/bookings'&&method==='POST')return json(await createBooking(db,await body(request),{...context,now}),201);
    if(/^\/api\/receipt\/[a-f0-9]{48}$/.test(path)&&method==='GET'){const row=await db.get('SELECT * FROM bookings WHERE token=?',[path.split('/').pop()]);assert(row,404,'Reserva não encontrada.');return json(await publicBooking(db,row));}
    if(path.startsWith('/api/admin/')){
      assert(context.admin,403,'Entre com a conta proprietária para acessar a administração.');
      if(path==='/api/admin/finance'){
        if(method==='GET')return json(await listFinance(db,url,now));
        if(method==='POST')return json(await createFinanceEntry(db,await body(request),now),201);
      }
      if(/^\/api\/admin\/finance\/[a-f0-9-]{36}$/.test(path)&&method==='PATCH')return json(await updateFinanceEntry(db,path.split('/').pop(),await body(request),now));
      if(/^\/api\/admin\/bookings\/[a-f0-9-]{36}\/anamnesis$/.test(path)&&method==='GET'){
        const id=path.split('/')[4];assert(await db.get('SELECT id FROM bookings WHERE id=?',[id]),404,'Agendamento não encontrado.');
        const intake=await db.get('SELECT answers,consented_at,version FROM booking_anamnesis WHERE booking_id=?',[id]);
        return json({anamnesis:intake?{...JSON.parse(intake.answers),consentedAt:intake.consented_at,version:intake.version}:null});
      }
      if(path==='/api/admin/settings'){
        if(method==='GET')return json(await readSettings(db));
        if(method==='PUT'){const settings=validateSettings(await body(request));await db.run('INSERT INTO settings(id,value) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value',[JSON.stringify(settings)]);return json(settings);}
      }
      if(path==='/api/admin/bookings'&&method==='GET'){
        const from=url.searchParams.get('from')||addDays(clock(now).date,-30),to=url.searchParams.get('to')||addDays(clock(now).date,90);assert(validDate(from)&&validDate(to)&&from<=to&&to<=addDays(from,366),400,'Período inválido.');
        return json({bookings:await db.all('SELECT id,customer_name,phone,notes,service_id,service_name,duration,date,start_minute,status,created_at,revision,EXISTS(SELECT 1 FROM booking_anamnesis WHERE booking_id=bookings.id) AS has_anamnesis FROM bookings WHERE date BETWEEN ? AND ? ORDER BY date,start_minute LIMIT 500',[from,to]),today:clock(now).date});
      }
      if(path==='/api/admin/availability'&&method==='GET'){const row=await db.get('SELECT * FROM bookings WHERE id=?',[url.searchParams.get('booking')]);assert(row,404,'Agendamento não encontrado.');const settings=await readSettings(db);const snapshot={...settings,services:settings.services.map(s=>s.id===row.service_id?{...s,duration:row.duration}:s)};return json(await availableSlots(db,snapshot,url.searchParams.get('date'),row.service_id,now,row.id));}
      if(/^\/api\/admin\/bookings\/[a-f0-9-]{36}$/.test(path)&&method==='PATCH')return json(await updateBooking(db,path.split('/').pop(),await body(request),now));
      if(path==='/api/admin/blocks'){
        if(method==='GET')return json({blocks:await db.all('SELECT * FROM schedule_blocks WHERE date>=? ORDER BY date,start_minute',[clock(now).date])});
        if(method==='POST'){const input=await body(request);assert(validDate(input.date)&&input.date>=clock(now).date,400,'Escolha uma data atual ou futura.');const start=input.allDay?0:minutes(input.start),end=input.allDay?1440:minutes(input.end);assert(start<end&&start%15===0&&end%15===0,400,'Intervalo inválido.');const id=uid();const result=await db.run('INSERT INTO schedule_blocks(id,date,start_minute,end_minute,note) SELECT ?,?,?,?,? WHERE NOT EXISTS(SELECT 1 FROM bookings WHERE date=? AND status<>? AND start_minute<? AND start_minute+duration>?)',[id,input.date,start,end,clean(input.note,150),input.date,'cancelled',end,start]);assert(result.changes>0,409,'Há um atendimento nesse intervalo. Reagende ou cancele antes de bloquear.');return json({id},201);}
      }
      if(/^\/api\/admin\/blocks\/[a-f0-9-]{36}$/.test(path)&&method==='DELETE'){await body(request);await db.run('DELETE FROM schedule_blocks WHERE id=?',[path.split('/').pop()]);return json({ok:true});}
    }
    throw new ApiError(404,'Caminho não encontrado.');
  }catch(error){if(error instanceof ApiError)return json({error:error.message},error.status);console.error('Booking operation failed:',error?.name||'Error');return json({error:'Não foi possível concluir agora. Tente novamente.'},500);}
}
