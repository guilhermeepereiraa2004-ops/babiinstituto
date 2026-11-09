// Vercel does not upload Git metadata. Keep the full acceptance gate local and
// run syntax plus behavior checks again in the deployment build.
import {readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {syncShop} from './sync-shop.mjs';
syncShop();
const files=['dist/app.js','dist/admin/admin.js','dist/admin/notifications.js','dist/admin/push-worker.js','dist/agendar/booking.js','dist/booking/shared.js','server/core.mjs','server/postgres.mjs','server/auth.mjs','server/cloud.mjs','server/push.mjs','server/system.mjs','server/shop-projection.mjs','server/shop-store.mjs','server/shop-postgres.mjs','api/index.mjs'];
for(const path of files)if(spawnSync(process.execPath,['--check',path],{stdio:'inherit'}).status!==0)process.exit(1);
const tests=readdirSync('tests').filter(f=>f.endsWith('.test.mjs')).map(f=>'tests/'+f);
const rootTests=spawnSync(process.execPath,['--test',...tests],{stdio:'inherit'}).status;
const shopTests=spawnSync(process.execPath,['loja/scripts/gate.mjs'],{stdio:'inherit'}).status;
process.exitCode=rootTests||shopTests;
