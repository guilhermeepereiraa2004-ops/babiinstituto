import {existsSync,readFileSync} from 'node:fs';
import {initializeShop,shopPool} from '../server/postgres.mjs';

if(process.argv[2]!=='--confirm-shop-database'||!process.env.SHOP_DATABASE_URL)throw Error('Use a URL exclusiva da loja e passe --confirm-shop-database.');
const costsPath=new URL('../data/catalog-costs.json',import.meta.url);
const costs=existsSync(costsPath)?JSON.parse(readFileSync(costsPath,'utf8')):{};
const pool=shopPool(process.env.SHOP_DATABASE_URL);
try{await initializeShop(pool,{costs});console.log('Estrutura e catálogo inicial da loja verificados.');}
catch(error){console.error('Falha na configuração da loja:',error?.code||error?.name);process.exitCode=1;}
finally{await pool.end();}
