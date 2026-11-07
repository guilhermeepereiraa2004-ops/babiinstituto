import {existsSync,readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {checkLayers} from './check-layers.mjs';
import {seedCatalog} from '../server/store.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const run=(...args)=>spawnSync(process.execPath,args,{cwd:root,stdio:'inherit'}).status===0;
const files=['server','dist','api','scripts','tests'].flatMap(folder=>readdirSync(resolve(root,folder),{recursive:true}).filter(p=>/\.[m]?js$/.test(p)).map(p=>resolve(root,folder,p)));
let layers=true;
try{checkLayers();}catch(error){console.error(error.message);layers=false;}
const source=layers&&files.every(p=>run('--check',p));
const active=seedCatalog.filter(p=>p.active);
const images=seedCatalog.flatMap(p=>[p.photo,p.alternatePhoto].filter(Boolean));
const page=readFileSync(resolve(root,'dist/index.html'),'utf8');
const catalog=seedCatalog.length===46&&new Set(seedCatalog.map(p=>p.id)).size===46&&active.length===39&&active.filter(p=>p.priceCents!==null).length===32&&
  active.every(p=>p.stock===1&&p.photo)&&new Set(images).size===40&&images.every(path=>path.startsWith('/assets/produtos/')&&existsSync(resolve(root,'dist','.'+path)))&&
  seedCatalog.every(p=>!Object.hasOwn(p,'costCents'))&&page.includes('family=Poppins')&&page.includes('wa.me/5573981701666');
const behavior=run('--test',resolve(root,'tests/shop.test.mjs'),resolve(root,'tests/layers.test.mjs'));
const checks={source,catalog,behavior};
const criteria=JSON.parse(readFileSync(resolve(root,'docs/acceptance.json'),'utf8'));
const floor=Array.from({length:7},(_,i)=>'L0'+(i+1));
if(!floor.every(id=>criteria.some(c=>c.id===id))||new Set(criteria.map(c=>c.id)).size!==criteria.length)throw Error('Catálogo de aceitação incompleto.');
const rows=criteria.map(c=>`| ${c.id} | ${c.item} | ${checks[c.check]?'OK':'FALHOU'} |`);
const count=criteria.filter(c=>checks[c.check]).length;
writeFileSync(resolve(root,'docs/checklist-paridade.md'),['# Checklist da Loja Babi','','Gerado por npm run check. Evidência visual: docs/qa.md.','',`Critérios automáticos: ${count}/${criteria.length}.`,'','| ID | Critério | Resultado |','|---|---|---|',...rows,''].join('\n'));
console.log(`Gate Loja Babi: ${count}/${criteria.length}`);
if(count!==criteria.length)process.exitCode=1;
