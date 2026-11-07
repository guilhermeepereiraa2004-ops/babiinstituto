import pg from 'pg';
import {initialState} from './store.mjs';

export function shopPool(connection) {
  const url=new URL(connection);
  url.searchParams.set('sslmode','verify-full');
  const pool=new pg.Pool({connectionString:url.href,max:3,idleTimeoutMillis:5000,connectionTimeoutMillis:10000});
  pool.on('error',()=>console.error('Conexão da loja indisponível.'));
  return pool;
}

export async function initializeShop(pool, defaults) {
  const client=await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`CREATE SCHEMA IF NOT EXISTS babi_shop;
      CREATE TABLE IF NOT EXISTS babi_shop.state(id integer PRIMARY KEY CHECK(id=1), payload jsonb NOT NULL);
      CREATE TABLE IF NOT EXISTS babi_shop.media(id text PRIMARY KEY,mime text NOT NULL,bytes bytea NOT NULL)`);
    await client.query('INSERT INTO babi_shop.state VALUES (1,$1) ON CONFLICT (id) DO NOTHING',[JSON.stringify(initialState(defaults))]);
    await client.query('COMMIT');
  } catch(error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}

export function createPostgres(pool) {
  const row=async(client,lock='')=>{
    const result=await client.query('SELECT payload FROM babi_shop.state WHERE id=1'+lock);
    if(!result.rows[0])throw Error('Banco da loja não inicializado');
    return result.rows[0].payload;
  };
  return {
    load:()=>row(pool),
    async change(fn) {
      const client=await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query("SET LOCAL lock_timeout='5s'");
        const state=await row(client,' FOR UPDATE');
        const writes=[];
        const result=fn(state,{
          put:({id,mime,bytes})=>writes.push(['INSERT INTO babi_shop.media VALUES ($1,$2,$3)',[id,mime,bytes]]),
          remove:id=>writes.push(['DELETE FROM babi_shop.media WHERE id=$1',[id]])
        });
        for(const [sql,args] of writes)await client.query(sql,args);
        await client.query('UPDATE babi_shop.state SET payload=$1 WHERE id=1',[JSON.stringify(state)]);
        await client.query('COMMIT');
        return result;
      }catch(error){
        await client.query('ROLLBACK');
        throw error;
      }finally{client.release();}
    },
    async media(id) {return (await pool.query('SELECT mime,bytes FROM babi_shop.media WHERE id=$1',[id])).rows[0];}
  };
}
