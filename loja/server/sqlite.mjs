import {DatabaseSync} from 'node:sqlite';
import {initialState} from './store.mjs';

export function createSqlite(path, defaults) {
  const db=new DatabaseSync(path);
  db.exec(`PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS shop_state(id INTEGER PRIMARY KEY CHECK(id=1), payload TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS shop_media(id TEXT PRIMARY KEY, mime TEXT NOT NULL, bytes BLOB NOT NULL);`);
  db.prepare('INSERT OR IGNORE INTO shop_state VALUES(1,?)').run(JSON.stringify(initialState(defaults)));
  const load=()=>JSON.parse(db.prepare('SELECT payload FROM shop_state WHERE id=1').get().payload);
  return {
    load,
    change(fn) {
      db.exec('BEGIN IMMEDIATE');
      try {
        const state=load();
        const result=fn(state,{
          put:({id,mime,bytes})=>db.prepare('INSERT INTO shop_media VALUES(?,?,?)').run(id,mime,bytes),
          remove:id=>db.prepare('DELETE FROM shop_media WHERE id=?').run(id)
        });
        db.prepare('UPDATE shop_state SET payload=? WHERE id=1').run(JSON.stringify(state));
        db.exec('COMMIT');
        return result;
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
    media:id=>db.prepare('SELECT mime,bytes FROM shop_media WHERE id=?').get(id),
    close:()=>db.close()
  };
}
