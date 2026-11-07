import test from 'node:test';
import assert from 'node:assert/strict';
import {violations} from '../scripts/check-layers.mjs';
test('camada pública pode compartilhar apresentação, mas não importar servidor',()=>{
  assert.deepEqual(violations('dist/shop.js',"import {api} from './shared.js'"),[]);
  assert.deepEqual(violations('dist/shop.js',"import {createSqlite} from '../server/sqlite.mjs'"),['../server/sqlite.mjs']);
});
