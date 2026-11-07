CREATE TABLE IF NOT EXISTS shop_state (
 id INTEGER PRIMARY KEY CHECK(id=1), payload TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS shop_media (
 id TEXT PRIMARY KEY, mime TEXT NOT NULL, bytes BYTEA NOT NULL
);
CREATE TABLE IF NOT EXISTS shop_orders (
 id TEXT PRIMARY KEY, customer_phone TEXT NOT NULL REFERENCES customers(phone),
 customer_name TEXT NOT NULL, status TEXT NOT NULL, payment TEXT NOT NULL,
 total_cents BIGINT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS shop_orders_customer ON shop_orders(customer_phone,created_at);
CREATE TABLE IF NOT EXISTS shop_finance_links (
 entry_id TEXT PRIMARY KEY REFERENCES finance_entries(id), shop_entry_id TEXT NOT NULL UNIQUE,
 order_id TEXT REFERENCES shop_orders(id), customer_phone TEXT REFERENCES customers(phone)
);
CREATE INDEX IF NOT EXISTS shop_finance_customer ON shop_finance_links(customer_phone);
