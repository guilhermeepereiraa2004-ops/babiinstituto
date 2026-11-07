// The store now starts the same backend and database as the main Babi system.
process.env.PORT ||= process.env.SHOP_PORT||'4180';
await import('../../server/local.mjs');
