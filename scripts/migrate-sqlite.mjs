import {readFileSync,readdirSync} from 'node:fs';

// Run inside the caller's transaction. The ledger also makes schema rebuilds
// safe on restart, while older databases can reapply the initial migrations.
export function applySqliteMigrations(db){
 const dir=new URL('../migrations/',import.meta.url);
 db.exec('CREATE TABLE IF NOT EXISTS babi_schema_migrations (name TEXT PRIMARY KEY)');
 const applied=db.prepare('SELECT 1 FROM babi_schema_migrations WHERE name=?');
 const mark=db.prepare('INSERT INTO babi_schema_migrations(name) VALUES(?)');
 for(const file of readdirSync(dir).filter(name=>/^\d+.*\.sql$/.test(name)).sort()){
  if(applied.get(file))continue;
  db.exec(readFileSync(new URL(file,dir),'utf8'));
  mark.run(file);
 }
}
