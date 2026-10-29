import {spawnSync} from 'node:child_process';
process.exitCode=spawnSync(process.execPath,['--test','tests/postgres.test.mjs'],{env:{...process.env,BABI_PG_TEST:'1'},stdio:'inherit'}).status;
