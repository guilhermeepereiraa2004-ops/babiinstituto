import {initialState} from '../loja/server/store.mjs';
import {bindSql} from './postgres.mjs';
import {projectShopChanges} from './shop-projection.mjs';

export async function initializeSharedShop(pool,{costs={}}={}){
  const client=await pool.connect();
  try{
    await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock(19027,4173)');
    await client.query('INSERT INTO shop_state(id,payload) VALUES(1,$1) ON CONFLICT(id) DO NOTHING',[JSON.stringify(initialState({costs}))]);
    await client.query('COMMIT');
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}
export function createSharedPostgres(pool){
  const load=async client=>{
    const row=(await client.query('SELECT payload FROM shop_state WHERE id=1')).rows[0];
    if(!row)throw Error('Inicialize o catálogo antes de publicar a loja.');
    return JSON.parse(row.payload);
  };
  return {
    load:()=>load(pool),
    async change(fn){
      const client=await pool.connect();
      try{
        await client.query('BEGIN');await client.query("SET LOCAL lock_timeout='5s'");
        await client.query('SELECT pg_advisory_xact_lock(19027,4173)');
        const state=await load(client),before=structuredClone(state),writes=[];
        const result=fn(state,{
          put:({id,mime,bytes})=>writes.push({sql:'INSERT INTO shop_media VALUES(?,?,?)',args:[id,mime,bytes]}),
          remove:id=>writes.push({sql:'DELETE FROM shop_media WHERE id=?',args:[id]})
        });
        for(const {sql,args} of [...writes,...projectShopChanges(before,state)])await client.query(bindSql(sql),args);
        await client.query('UPDATE shop_state SET payload=$1 WHERE id=1',[JSON.stringify(state)]);
        await client.query('COMMIT');return result;
      }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
    },
    media:async id=>(await pool.query('SELECT mime,bytes FROM shop_media WHERE id=$1',[id])).rows[0]
  };
}
