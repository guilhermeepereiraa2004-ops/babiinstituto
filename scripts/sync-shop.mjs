import {cpSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

export function syncShop(){
  const source=new URL('../loja/dist/',import.meta.url),target=new URL('../dist/loja/',import.meta.url);
  mkdirSync(target,{recursive:true});cpSync(source,target,{recursive:true});
  const html=readFileSync(new URL('index.html',source),'utf8')
    .replaceAll('href="/assets/','href="/loja/assets/').replaceAll('href="/styles.css"','href="/loja/styles.css"')
    .replaceAll('src="/shop.js"','src="/loja/shop.js"').replaceAll('href="/"','href="/loja/"')
    .replace('href="https://babi-instituto.vercel.app/"','href="/"');
  writeFileSync(new URL('index.html',target),html);
  writeFileSync(new URL('admin/index.html',target),'<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/admin/#products"><title>Painel Babi</title><a href="/admin/#products">Abrir o painel integrado da Babi</a></html>');
}
if(process.argv[1]===fileURLToPath(import.meta.url)){syncShop();console.log('Vitrine integrada preparada em dist/loja/.');}
