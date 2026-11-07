import {DatabaseSync} from 'node:sqlite';
import {initialState} from '../loja/server/store.mjs';
import {projectShopChanges} from './shop-projection.mjs';

export function createSharedSqlite(path,{initialize=false,costs={}}={}){
  const db=new DatabaseSync(path);db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
  if(initialize)db.prepare('INSERT OR IGNORE INTO shop_state(id,payload) VALUES(1,?)').run(JSON.stringify(initialState({costs})));
  const load=()=>{
    const row=db.prepare('SELECT payload FROM shop_state WHERE id=1').get();
    if(!row)throw Error('Inicialize o catálogo antes de publicar a loja.');
    return JSON.parse(row.payload);
  };
  return {
    load,
    change(fn){
      db.exec('BEGIN IMMEDIATE');
      try{
        const state=load(),before=structuredClone(state);
        const result=fn(state,{
          put:({id,mime,bytes})=>db.prepare('INSERT INTO shop_media VALUES(?,?,?)').run(id,mime,bytes),
          remove:id=>db.prepare('DELETE FROM shop_media WHERE id=?').run(id)
        });
        for(const {sql,args} of projectShopChanges(before,state))db.prepare(sql).run(...args);
        db.prepare('UPDATE shop_state SET payload=? WHERE id=1').run(JSON.stringify(state));
        db.exec('COMMIT');return result;
      }catch(error){db.exec('ROLLBACK');throw error;}
    },
    media:id=>db.prepare('SELECT mime,bytes FROM shop_media WHERE id=?').get(id),
    close:()=>db.close()
  };
}
