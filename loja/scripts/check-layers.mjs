import {readFileSync} from 'node:fs';
import {resolve,dirname,relative,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const names=s=>s.split(sep).join('/');
const allowed={
  'dist/shop.js':['dist/shared.js'],
  'dist/admin/admin.js':['dist/shared.js'],
  'dist/shared.js':[],
  'server/actions.mjs':[],
  'server/store.mjs':[],
  'server/api.mjs':['server/actions.mjs'],
  'server/sqlite.mjs':['server/store.mjs'],
  'server/postgres.mjs':['server/store.mjs'],
  'server/local.mjs':['server/sqlite.mjs','server/api.mjs'],
  'api/index.mjs':['server/api.mjs','server/postgres.mjs']
};
export function violations(file,source) {
  const declarations=/^[ \t]*(?:import\s+(?:[\w*{][^;]*?\s+from\s*)?|export\s+(?:\*[^;]*?|\{[^}]*\})\s+from\s*)['"]([^'"\r\n]+)['"]/gm;
  const dynamic=/\bimport\s*\(\s*['"]([^'"\r\n]+)['"]/g;
  const paths=[...source.matchAll(declarations),...source.matchAll(dynamic)].map(m=>m[1]);
  return paths.filter(path=>{
    if(!path.startsWith('.'))return file.startsWith('dist/')||!(path.startsWith('node:')||file==='server/postgres.mjs'&&path==='pg');
    const absolute=resolve(root,dirname(file),path);
    return !allowed[file].includes(names(relative(root,absolute)));
  });
}
export function checkLayers(){
  const bad=Object.keys(allowed).flatMap(file=>violations(file,readFileSync(resolve(root,file),'utf8')).map(imp=>file+' → '+imp));
  if(bad.length)throw Error('Dependências inválidas: '+bad.join(', '));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){checkLayers();console.log('Camadas verificadas.');}
