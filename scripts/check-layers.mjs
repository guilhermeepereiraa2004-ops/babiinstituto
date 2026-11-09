import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
export function validateLayer(source,allowed=[]) {
  if (/(?:\brequire\s*\(|\bprocess\s*\.|\b__dirname\b|\bimport\s*\()/.test(source)) return false;
  const imports=[...source.matchAll(/\bimport\s+(?:[^;]*?\s+from\s+)?['"]([^'"]+)['"]/g)].map(match=>match[1]);
  return imports.every(specifier=>allowed.includes(specifier));
}
export function checkLayers() {
  if (!validateLayer("document.querySelector('button').addEventListener('click', () => {});")) throw Error('Fixture permitida rejeitada.');
  if (validateLayer("import fs from 'node:fs';")) throw Error('Violação de camada não detectada.');
  if (!validateLayer(readFileSync(new URL('../dist/app.js', import.meta.url),'utf8'))) throw Error('A UI depende de módulos ou código de servidor.');
  if (!validateLayer("import {api} from '/booking/shared.js';",['/booking/shared.js'])) throw Error('Import permitido da UI foi rejeitado.');
  const allowedImports={
    'dist/admin/admin.js':['/booking/shared.js','/loja/admin/admin.js','/admin/notifications.js'],
    'dist/admin/notifications.js':['/booking/shared.js'],
    'dist/admin/push-worker.js':[],
    'dist/agendar/booking.js':['/booking/shared.js']
  };
  for(const [path,allowed] of Object.entries(allowedImports))if(!validateLayer(readFileSync(new URL('../'+path,import.meta.url),'utf8'),allowed))throw Error('Dependência proibida na UI: '+path);
  for(const path of ['dist/booking/shared.js','server/core.mjs'])if(!validateLayer(readFileSync(new URL('../'+path,import.meta.url),'utf8')))throw Error('Dependência proibida no núcleo: '+path);
  return true;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try { checkLayers(); console.log('Camadas: OK; fixtures permitida e proibida verificadas.'); }
  catch (error) { console.error(error.message); process.exitCode=1; }
}
