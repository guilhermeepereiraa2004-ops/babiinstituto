import {existsSync,readFileSync} from 'node:fs';
import {createPool} from '../server/postgres.mjs';
import {initializeSharedShop} from '../server/shop-postgres.mjs';

if(process.argv[2]!=='--confirm-shared-database')throw Error('Use --confirm-shared-database no banco Babi autorizado, depois da migração 0004.');
const pool=createPool(process.env.DATABASE_URL_UNPOOLED||process.env.DATABASE_URL);
const path=new URL('../loja/data/catalog-costs.json',import.meta.url);
const costs=existsSync(path)?JSON.parse(readFileSync(path,'utf8')):{};
try{await initializeSharedShop(pool,{costs});console.log('Catálogo aprovado inicializado no banco compartilhado. Registros existentes preservados.');}
catch(error){console.error('Inicialização da loja falhou:',error.code||error.name);process.exitCode=1;}
finally{await pool.end();}
