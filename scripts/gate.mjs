import {readFileSync,existsSync,writeFileSync,readdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {checkLayers} from './check-layers.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(resolve(root,'dist/index.html'),'utf8');
const css=readFileSync(resolve(root,'dist/styles.css'),'utf8');
const js=readFileSync(resolve(root,'dist/app.js'),'utf8');
const core=readFileSync(resolve(root,'server/core.mjs'),'utf8');
const schema=readFileSync(resolve(root,'migrations/0001-bookings.sql'),'utf8');
const extensionSchema=readFileSync(resolve(root,'migrations/0002-intake-finance.sql'),'utf8');
const client=readFileSync(resolve(root,'dist/agendar/booking.js'),'utf8');
const admin=readFileSync(resolve(root,'dist/admin/admin.js'),'utf8');
const catalog=JSON.parse(readFileSync(resolve(root,'docs/acceptance.json'),'utf8'));
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
const urls=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match=>match[1]);
const assets=urls.filter(url=>!url.startsWith('#')&&!/^https?:/.test(url));
const checks={
  document:html.includes('lang="pt-BR"')&&/<title>[^<]+<\/title>/.test(html)&&html.includes('name="description"')&&[...html.matchAll(/<h1\b/g)].length===1,
  design:html.includes('family=Poppins')&&css.includes('@media(max-width:700px)')&&css.includes('prefers-reduced-motion'),
  assets:assets.every(asset=>existsSync(resolve(root,'dist',asset.replace(/^\//,''))))&&[...html.matchAll(/<img\b[^>]*>/g)].every(match=>/\balt="/.test(match[0])),
  anchors:urls.filter(url=>url.startsWith('#')).every(url=>ids.includes(url.slice(1)))&&ids.length===new Set(ids).size,
  contact:html.includes('https://www.instagram.com/babi_institutodebeleza/')&&[...html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)].every(match=>match[0].includes('noopener noreferrer'))&&!html.includes('api.whatsapp.com'),
  syntax:['dist/app.js','dist/booking/shared.js','dist/admin/admin.js','dist/agendar/booking.js','server/core.mjs','server/local.mjs','server/postgres.mjs','server/auth.mjs','server/cloud.mjs','api/index.mjs'].every(path=>spawnSync(process.execPath,['--check',resolve(root,path)],{encoding:'utf8'}).status===0)&&checkLayers(),
  portfolio:html.includes('aria-labelledby="lightbox-title"')&&html.includes('aria-live="polite"')&&[...html.matchAll(/data-filter="/g)].length===4&&js.includes('dialog.showModal()')&&js.includes('card.hidden = !visible'),
  sections:['servicos','sobre','portfolio','contato'].every(id=>ids.includes(id))&&html.includes('class="faq-list reveal"')&&html.includes('class="ritual-grid"'),
  admin:admin.includes('renderSettings()')&&admin.includes('renderAgenda()')&&admin.includes('mutateBooking(')&&core.includes('assert(context.admin,403'),
  customer:client.includes('submitBooking(')&&client.includes('renderReceipt(')&&client.includes('renderCalendar()')&&html.includes('href="/agendar/"'),
  persistence:schema.includes('PRIMARY KEY(date, minute)')&&schema.includes('idempotency_key TEXT NOT NULL UNIQUE')&&readFileSync(resolve(root,'.gitignore'),'utf8').includes('data/'),
  intake:client.includes('renderAnamnesis(')&&client.includes('anamnesisConsent')&&core.includes('validateAnamnesis(')&&core.includes('consentedAt')&&extensionSchema.includes('booking_anamnesis'),
  finance:admin.includes('renderFinance()')&&admin.includes('openFinanceEntry(')&&core.includes('balanceCents')&&extensionSchema.includes('finance_audit'),
  completion:core.includes('if(completing)')&&core.includes("'service:'+id")&&admin.includes('Concluir e registrar entrada')&&extensionSchema.includes('booking_id TEXT UNIQUE'),
  migration:readFileSync(resolve(root,'server/local.mjs'),'utf8').includes('readdirSync')&&extensionSchema.includes('FROM bookings WHERE status=\'completed\'')&&extensionSchema.includes('NULL'),
  cloud:existsSync(resolve(root,'migrations/postgres/0001-bookings.sql'))&&readFileSync(resolve(root,'server/postgres.mjs'),'utf8').includes('pg_advisory_xact_lock'),
  authentication:readFileSync(resolve(root,'server/cloud.mjs'),'utf8').includes('secretMatches')&&readFileSync(resolve(root,'server/auth.mjs'),'utf8').includes('databaseHooks')&&!admin.includes('signin-with-chatgpt'),
  hosting:JSON.parse(readFileSync(resolve(root,'vercel.json'),'utf8')).outputDirectory==='dist'&&JSON.parse(readFileSync(resolve(root,'vercel.json'),'utf8')).regions.includes('gru1'),
  runtime:spawnSync(process.execPath,['--test',...readdirSync(resolve(root,'tests')).filter(f=>f.endsWith('.test.mjs')).map(f=>resolve(root,'tests',f))],{stdio:'inherit'}).status===0
};
if(catalog.length<19||new Set(catalog.map(item=>item.id)).size!==catalog.length||Array.from({length:19},(_,i)=>'A'+String(i+1).padStart(2,'0')).some(id=>!catalog.some(item=>item.id===id)))throw Error('O catálogo mínimo de dezenove critérios não pode ser reduzido.');
const results=catalog.map(item=>({...item,passed:checks[item.check]===true}));
const passed=results.filter(item=>item.passed).length;
const report=['# Checklist de aceitação','', 'Gerado por `node scripts/gate.mjs`. Fonte: `docs/acceptance.json`.', '', `Total: ${results.length} | Concluídos: ${passed} | Progresso dos critérios do gate: ${(passed/results.length*100).toFixed(0)}%`, '', '| ID | Critério | Status | Evidência |','| --- | --- | --- | --- |',...results.map(item=>`| ${item.id} | ${item.criterion} | ${item.passed?'OK':'FALHOU'} | check ${item.check} |`),'','A inspeção visual e os testes interativos são registrados em `docs/qa.md`. O percentual mede os critérios deste gate, sem representar autenticação para produção ou publicação.',''].join('\n');
writeFileSync(resolve(root,'docs/checklist-paridade.md'),report);
results.forEach(item=>console.log(`${item.passed?'OK':'FALHOU'} ${item.id}: ${item.criterion}`));
console.log(`Gate: ${passed}/${results.length}`);
if(passed!==results.length)process.exitCode=1;
