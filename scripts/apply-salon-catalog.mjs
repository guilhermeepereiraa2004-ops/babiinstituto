import {DEFAULT_SETTINGS, salonServices, validateSettings} from '../server/core.mjs';

// Explicit operation for existing databases. Only the settings row is written.
export async function applySalonCatalog(db, {backup = async () => {}, dryRun = false} = {}) {
  const row = await db.get('SELECT value FROM settings WHERE id=1');
  const settings = row ? JSON.parse(row.value) : DEFAULT_SETTINGS;
  const services = salonServices();
  const ids = new Set(services.map(service => service.id));
  const next = {...settings, services:[...services, ...settings.services.filter(service => !ids.has(service.id)).map(service => ({...service, active:false}))]};
  validateSettings(next);
  const value = JSON.stringify(next);
  if (!dryRun && row?.value !== value) {
    await backup(row?.value ?? null);
    const result = row
      ? await db.run('UPDATE settings SET value=? WHERE id=1 AND value=?', [value, row.value])
      : await db.run('INSERT INTO settings(id,value) VALUES(1,?) ON CONFLICT(id) DO NOTHING', [value]);
    if (result.changes !== 1 || (await db.get('SELECT value FROM settings WHERE id=1'))?.value !== value) {
      throw new Error('As configurações mudaram em paralelo; confira o catálogo antes de tentar novamente.');
    }
  }
  return {enabled:next.enabled, active:services.length, archived:next.services.length-services.length};
}
