CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY CHECK(id=1), value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS bookings (
 id TEXT PRIMARY KEY, token TEXT NOT NULL UNIQUE, idempotency_key TEXT NOT NULL UNIQUE,
 customer_name TEXT NOT NULL, phone TEXT NOT NULL, notes TEXT NOT NULL DEFAULT '',
 service_id TEXT NOT NULL, service_name TEXT NOT NULL, duration INTEGER NOT NULL,
 date TEXT NOT NULL, start_minute INTEGER NOT NULL, status TEXT NOT NULL CHECK(status IN ('confirmed','completed','cancelled')),
 created_at TEXT NOT NULL, updated_at TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0, operation_key TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS bookings_date ON bookings(date,start_minute);
CREATE TABLE IF NOT EXISTS booking_slots (
 date TEXT NOT NULL, minute INTEGER NOT NULL, booking_id TEXT NOT NULL REFERENCES bookings(id),
 PRIMARY KEY(date,minute)
);
CREATE INDEX IF NOT EXISTS slots_booking ON booking_slots(booking_id);
CREATE TABLE IF NOT EXISTS schedule_blocks (
 id TEXT PRIMARY KEY, date TEXT NOT NULL, start_minute INTEGER NOT NULL, end_minute INTEGER NOT NULL, note TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS blocks_date ON schedule_blocks(date);
CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires BIGINT NOT NULL);
