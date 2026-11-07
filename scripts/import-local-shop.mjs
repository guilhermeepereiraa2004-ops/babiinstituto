import {DatabaseSync,backup} from 'node:sqlite';
import {mkdirSync,readFileSync,readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {projectShopChanges} from '../server/shop-projection.mjs';

if(process.argv[2]!=='--confirm-unify')throw Error('Use --confirm-unify para importar o catálogo local ao banco local da Babi.');
const source=new DatabaseSync(new URL('../loja/data/shop.sqlite',import.meta.url),{readOnly:true});
const target=new DatabaseSync(new URL('../data/appointments.sqlite',import.meta.url));
const dir=new URL('../data/backups/',import.meta.url);mkdirSync(dir,{recursive:true});
const backupPath=fileURLToPath(new URL('before-unify-'+Date.now()+'.sqlite',dir));
await backup(target,backupPath);
try{
  target.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000; BEGIN IMMEDIATE;');
  const migrationDir=new URL('../migrations/',import.meta.url);
  for(const file of readdirSync(migrationDir).filter(f=>/^\d+.*\.sql$/.test(f)).sort())target.exec(readFileSync(new URL(file,migrationDir),'utf8'));
  const existing=target.prepare('SELECT payload FROM shop_state WHERE id=1').get();
  if(existing){const s=JSON.parse(existing.payload);if(s.orders.length||s.ledger.length||s.products.some(p=>p.revision!==0))throw Error('O catálogo integrado já foi utilizado; não foi sobrescrito.');}
  const state=JSON.parse(source.prepare('SELECT payload FROM shop_state WHERE id=1').get().payload);
  state.sessions={};state.limits={};
  for(const {sql,args} of projectShopChanges({orders:[],ledger:[]},state))target.prepare(sql).run(...args);
  for(const media of source.prepare('SELECT id,mime,bytes FROM shop_media').all())target.prepare('INSERT INTO shop_media VALUES(?,?,?)').run(media.id,media.mime,media.bytes);
  target.prepare('INSERT INTO shop_state VALUES(1,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload').run(JSON.stringify(state));
  target.exec('COMMIT');console.log('Catálogo local integrado; agenda, financeiro existente e banco de origem preservados. Backup privado criado.');
}catch(error){try{target.exec('ROLLBACK');}catch{}console.error('Importação interrompida:',error.message);process.exitCode=1;}
finally{source.close();target.close();}
