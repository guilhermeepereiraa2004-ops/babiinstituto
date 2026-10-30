import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {getMigrations} from 'better-auth/db/migration';
import {createPool,createPostgresDb,bindSql} from '../server/postgres.mjs';
import {createAdminAuth,secretMatches} from '../server/auth.mjs';
import {migratePostgres} from '../scripts/migrate-postgres.mjs';
import {handleCloudRequest,closeCloudConnections} from '../server/cloud.mjs';
import {handleApi,DEFAULT_SETTINGS,clock,addDays} from '../server/core.mjs';
import {createOwnerRecoveryLink} from '../scripts/admin-recovery.mjs';

test('Postgres binding preserves quoted SQL and binds parameters',()=>{
 assert.equal(bindSql("SELECT '?' AS literal, \"?\" FROM bookings WHERE id=? AND date=?"),"SELECT '?' AS literal, \"?\" FROM bookings WHERE id=$1 AND date=$2");
});
test('setup keys reject missing, wrong and multibyte values safely',()=>{
 const key='a'.repeat(43);assert(secretMatches(key,key));assert(!secretMatches('á'.repeat(43),key));assert(!secretMatches(undefined,key));assert(!secretMatches('b'.repeat(43),key));
});

test('real Neon Postgres: authentication, booking and finance', {skip:process.env.BABI_PG_TEST!=='1',timeout:120000},async t=>{
 // Never run against the production resource. Test tables live in a disposable,
 // randomly named schema inside the dedicated babi-instituto-qa project.
 assert.equal(process.env.NEON_PROJECT_ID,'gentle-dawn-48537104','Use the dedicated Babi QA Neon environment');
 const admin=createPool(process.env.DATABASE_URL_UNPOOLED),schema='babi_test_'+crypto.randomUUID().replaceAll('-','');
 const connection=new URL(process.env.DATABASE_URL_UNPOOLED);connection.searchParams.set('options','-c search_path='+schema);
 let pool,created=false;
 try{
  await admin.query(`CREATE SCHEMA ${schema}`);created=true;pool=createPool(connection.href);
  await migratePostgres(pool);await migratePostgres(pool);
  const db=createPostgresDb(pool),origin='https://babi.test',email='owner-qa@example.invalid',password=randomBytes(24).toString('base64url'),setupKey=randomBytes(32).toString('base64url'),secret=randomBytes(48).toString('base64url');
  Object.assign(process.env,{DATABASE_URL:connection.href,BABI_APP_ORIGIN:origin,ADMIN_EMAIL:email,BABI_SETUP_KEY:setupKey,AUTH_SECRET:secret});
  const auth=createAdminAuth(pool,{origin,adminEmail:email,setupKey,secret});
  await (await getMigrations(auth.options)).runMigrations();
  let cookie='';
  const call=async(path,{method='GET',data,headers={},withCookie=true}={})=>{
   const request=new Request(origin+path,{method,headers:{origin,'x-vercel-forwarded-for':'192.0.2.30',...(data?{'content-type':'application/json'}:{}),...(withCookie&&cookie?{cookie}:{}),...headers},...(data?{body:JSON.stringify(data)}:{})});
   const response=await handleCloudRequest(request);return {status:response.status,data:await response.json(),headers:response.headers};
  };
  await t.test('cloud denies local login, forged identity, origins and public registration',async()=>{
   assert.equal((await call('/api/local-login',{method:'POST',data:{}})).status,404);
   assert.equal((await call('/api/admin/finance',{headers:{'oai-user-email':email}})).status,403);
   assert.equal((await call('/api/auth/sign-up/email',{method:'POST',data:{email,password,name:'QA'}})).status,404);
   assert.equal((await call('/api/setup',{method:'POST',data:{email,password},headers:{'x-babi-setup-key':'wrong'}})).status,403);
   assert.equal((await call('/api/setup',{method:'POST',data:{email:'other@example.invalid',password},headers:{'x-babi-setup-key':setupKey}})).status,403);
   assert.equal((await call('/api/setup',{method:'POST',data:{email,password},headers:{origin:'https://wrong.test','x-babi-setup-key':setupKey}})).status,403);
   assert.equal((await call('/api/config')).data.enabled,false);
  });
  await t.test('owner setup runs once; persistent secure login protects private routes',async()=>{
   assert.equal((await call('/api/setup',{method:'POST',data:{email,password},headers:{'x-babi-setup-key':setupKey}})).status,201);
   assert.equal((await call('/api/setup',{method:'POST',data:{email,password},headers:{'x-babi-setup-key':setupKey}})).status,409);
   assert.equal((await call('/api/auth/sign-in/email',{method:'POST',data:{email,password:'incorrect password'}})).status,401);
   const login=await call('/api/auth/sign-in/email',{method:'POST',data:{email,password}});assert.equal(login.status,200);
   const cookies=login.headers.getSetCookie();assert(cookies.some(c=>c.includes('HttpOnly')&&c.includes('Secure')));
   cookie=cookies.map(c=>c.split(';')[0]).join('; ');assert(cookie);
   assert.equal((await call('/api/session')).data.admin,true);
   assert.equal((await call('/api/admin/settings')).status,200);
  });
  const today=clock().date,date=addDays(today,1),settings=structuredClone(DEFAULT_SETTINGS);settings.enabled=true;settings.leadMinutes=0;settings.weekly.forEach(d=>d.enabled=true);settings.services.forEach(s=>s.duration=60);
  const intake={chemicalHistory:'yes',chemicalDetails:'Private QA intake',allergies:'no',hairCare:'QA care',consent:true};
  const booking=(time='09:00')=>({name:'Cliente QA Postgres',phone:'71999990000',consent:true,anamnesis:intake,serviceId:'corte',date,time,idempotencyKey:crypto.randomUUID()});
  let booked,id;
  await t.test('recurring lunch persists and protects availability and booking in Postgres',async()=>{
   const weekday=new Date(date+'T12:00:00Z').getUTCDay();
   settings.weekly[weekday].lunch={start:'12:00',end:'13:00'};
   assert.equal((await call('/api/admin/settings',{method:'PUT',data:settings})).status,200);
   assert.deepEqual((await call('/api/admin/settings')).data.weekly[weekday].lunch,{start:'12:00',end:'13:00'});
   const slots=(await call(`/api/availability?date=${date}&service=corte`,{withCookie:false})).data.slots;
   assert(slots.includes('11:00'));assert(slots.includes('13:00'));assert(!slots.includes('11:30'));assert(!slots.includes('12:00'));
   assert.equal((await call('/api/bookings',{method:'POST',data:booking('11:30'),withCookie:false})).status,409);
   settings.weekly[weekday].lunch=null;
   assert.equal((await call('/api/admin/settings',{method:'PUT',data:settings})).status,200);
   assert((await call(`/api/availability?date=${date}&service=corte`,{withCookie:false})).data.slots.includes('12:00'));
  });
  await t.test('concurrent reservations occupy unique slots; intake and receipts remain private',async()=>{
   assert.equal((await call('/api/admin/settings',{method:'PUT',data:settings})).status,200);
   const results=await Promise.all([call('/api/bookings',{method:'POST',data:booking()}),call('/api/bookings',{method:'POST',data:booking()})]);
   assert.deepEqual(results.map(r=>r.status).sort(),[201,409]);booked=results.find(r=>r.status===201).data;
   const listed=await call(`/api/admin/bookings?from=${date}&to=${date}`);id=listed.data.bookings[0].id;
   assert(!JSON.stringify(listed.data).includes('Private QA intake'));
   assert.equal((await call('/api/admin/bookings/'+id+'/anamnesis',{withCookie:false})).status,403);
   assert.equal((await call('/api/admin/bookings/'+id+'/anamnesis')).data.anamnesis.chemicalDetails,intake.chemicalDetails);
   const receipt=await call('/api/receipt/'+booked.token);assert.equal(receipt.status,200);assert.equal(booked.paymentStatus,'pending');assert.equal(receipt.data.paymentStatus,'pending');assert(!JSON.stringify(receipt.data).includes('Private QA intake'));
   assert.equal((await db.get('SELECT COUNT(*) AS n FROM booking_slots')).n,4);
  });
  await t.test('catalog prices are public without exposing financial records or creating income',async()=>{
   settings.services.find(s=>s.id==='corte').priceCents=15050;
   assert.equal((await call('/api/admin/settings',{method:'PUT',data:settings})).status,200);
   assert.equal((await call('/api/admin/settings')).data.services.find(s=>s.id==='corte').priceCents,15050);
   const catalog=(await call('/api/config',{withCookie:false})).data;
   assert.equal(catalog.services.find(s=>s.id==='corte').priceCents,15050);
   assert.deepEqual(Object.keys(catalog.services[0]).sort(),['active','description','duration','id','name','priceCents']);
   assert.equal((await db.get('SELECT COUNT(*) AS n FROM finance_entries')).n,0);
  });
  await t.test('completion is atomic and unique; finance totals use integer cents',async()=>{
   const price=(await call('/api/admin/settings')).data.services.find(s=>s.id==='corte').priceCents;
   const complete={revision:0,status:'completed',amountCents:price,paymentMethod:'pix'};
   const results=await Promise.all([call('/api/admin/bookings/'+id,{method:'PATCH',data:complete}),call('/api/admin/bookings/'+id,{method:'PATCH',data:complete})]);
   assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);assert.equal((await db.get('SELECT COUNT(*) AS n FROM finance_entries WHERE booking_id=?',[id])).n,1);
   assert.equal((await call('/api/admin/finance',{method:'POST',data:{kind:'expense',category:'Produtos',description:'Material QA',amountCents:3525,date:today,paymentMethod:'pix',idempotencyKey:crypto.randomUUID()}})).status,201);
   const finance=await call(`/api/admin/finance?from=${today}&to=${today}`);assert.equal(finance.data.summary.incomeCents,15050);assert.equal(finance.data.summary.expenseCents,3525);assert.equal(finance.data.summary.balanceCents,11525);
   const receipt=await call('/api/receipt/'+booked.token,{withCookie:false});assert.equal(receipt.data.paymentStatus,'received');assert(!Object.hasOwn(receipt.data,'amountCents'));assert(!Object.hasOwn(receipt.data,'paymentMethod'));
  });
  await t.test('failed transaction rolls back all writes and a late block prevents booking',async()=>{
   const realBatch=db.batch;db.batch=async statements=>realBatch(statements.some(s=>s.sql.startsWith('INSERT INTO booking_anamnesis'))?[...statements,{sql:'INSERT INTO booking_anamnesis(booking_id,answers,consented_at,version) VALUES(?,?,?,1)',args:['missing','{}','now']}]:statements);
   const invoke=async data=>handleApi(new Request(origin+'/api/bookings',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(data)}),db,{clientKey:crypto.randomUUID()});
   assert.equal((await invoke(booking('11:00'))).status,500);assert.equal((await db.get('SELECT COUNT(*) AS n FROM bookings')).n,1);
   db.batch=async statements=>{if(statements.some(s=>s.sql.startsWith('INSERT INTO bookings')))await db.run('INSERT INTO schedule_blocks(id,date,start_minute,end_minute,note) VALUES(?,?,?,?,?)',[crypto.randomUUID(),date,660,720,'Late QA block']);return realBatch(statements);};
   assert.equal((await invoke(booking('11:00'))).status,409);assert.equal((await db.get('SELECT COUNT(*) AS n FROM bookings')).n,1);db.batch=realBatch;
  });
  await t.test('recovery issuance stays private; invalid credentials and origins do not reset access',async()=>{
   const body={token:'x'.repeat(24),newPassword:randomBytes(24).toString('base64url')};
   assert.equal((await call('/api/auth/request-password-reset',{method:'POST',data:{email},withCookie:false})).status,404);
   assert.equal((await call('/api/auth/reset-password',{method:'POST',data:body,headers:{origin:'https://wrong.test'},withCookie:false})).status,403);
   assert.equal((await call('/api/auth/reset-password',{method:'POST',data:{...body,token:''},withCookie:false})).status,400);
   assert.equal((await call('/api/auth/reset-password',{method:'POST',data:{...body,newPassword:'short'},withCookie:false})).status,400);
   assert.equal((await call('/api/auth/reset-password',{method:'POST',data:body,withCookie:false})).status,400);
   await assert.rejects(createOwnerRecoveryLink(pool,{origin,secret,setupKey,adminEmail:'other@example.invalid'}));
   assert.equal((await call('/api/session')).data.admin,true);
  });
  await t.test('recovery expires, is consumed once atomically and revokes all previous sessions',async()=>{
   const options={origin,secret,setupKey,adminEmail:email};
   const expired=await createOwnerRecoveryLink(pool,options);
   const oldToken=new URLSearchParams(new URL(expired.recoveryUrl).hash.slice(1)).get('recovery');
   const verification=await pool.query('SELECT "expiresAt" FROM babi_verification WHERE identifier=$1',['reset-password:'+oldToken]);
   assert.equal(expired.expiresInSeconds,900);
   assert(verification.rows[0].expiresAt.getTime()>Date.now()+840000);
   await pool.query('UPDATE babi_verification SET "expiresAt"=$1 WHERE identifier=$2',[new Date(0),'reset-password:'+oldToken]);
   const nextPassword=randomBytes(24).toString('base64url');
   assert.equal((await call('/api/auth/reset-password',{method:'POST',data:{token:oldToken,newPassword:nextPassword},withCookie:false})).status,400);
   const secondLogin=await call('/api/auth/sign-in/email',{method:'POST',data:{email,password}});
   assert.equal(secondLogin.status,200);
   const secondCookie=secondLogin.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
   const fresh=await createOwnerRecoveryLink(pool,options);
   const resetToken=new URLSearchParams(new URL(fresh.recoveryUrl).hash.slice(1)).get('recovery');
   const resetBody={token:resetToken,newPassword:nextPassword};
   const changed=await Promise.all([0,1].map(()=>call('/api/auth/reset-password',{method:'POST',data:resetBody,headers:{'x-vercel-forwarded-for':'192.0.2.43'},withCookie:false})));
   assert.deepEqual(changed.map(r=>r.status).sort(),[200,400]);assert.deepEqual(changed.find(r=>r.status===200).data,{ok:true});
   assert.equal((await call('/api/auth/reset-password',{method:'POST',data:resetBody,headers:{'x-vercel-forwarded-for':'192.0.2.44'},withCookie:false})).status,400);
   assert.equal((await call('/api/session')).data.admin,false);
   assert.equal((await call('/api/admin/settings',{withCookie:false,headers:{cookie:secondCookie}})).status,403);
   assert.equal((await call('/api/auth/sign-in/email',{method:'POST',data:{email,password}})).status,401);
   const login=await call('/api/auth/sign-in/email',{method:'POST',data:{email,password:nextPassword}});assert.equal(login.status,200);
   cookie=login.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
   assert.equal((await call('/api/session')).data.admin,true);
  });
  await t.test('reset attempts are persistently rate limited',async()=>{
   const input={method:'POST',data:{token:'z'.repeat(24),newPassword:randomBytes(24).toString('base64url')},headers:{'x-vercel-forwarded-for':'192.0.2.55'},withCookie:false};
   for(let i=0;i<5;i++)assert.equal((await call('/api/auth/reset-password',input)).status,400);
   assert.equal((await call('/api/auth/reset-password',input)).status,429);
  });
  await t.test('logout revokes the session in Postgres',async()=>{
   assert.equal((await call('/api/auth/sign-out',{method:'POST',data:{}})).status,200);
   assert.equal((await call('/api/session')).data.admin,false);assert.equal((await call('/api/admin/settings')).status,403);
  });
 }finally{
  await closeCloudConnections();if(pool)await pool.end();
  if(created)await admin.query(`DROP SCHEMA ${schema} CASCADE`);await admin.end();
 }
});
