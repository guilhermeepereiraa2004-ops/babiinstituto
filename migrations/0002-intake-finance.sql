CREATE TABLE IF NOT EXISTS booking_anamnesis (
 booking_id TEXT PRIMARY KEY REFERENCES bookings(id),
 answers TEXT NOT NULL, consented_at TEXT NOT NULL, version INTEGER NOT NULL CHECK(version=1)
);

CREATE TABLE IF NOT EXISTS finance_entries (
 id TEXT PRIMARY KEY, booking_id TEXT UNIQUE REFERENCES bookings(id),
 idempotency_key TEXT NOT NULL UNIQUE,
 kind TEXT NOT NULL CHECK(kind IN ('income','expense')),
 category TEXT NOT NULL, description TEXT NOT NULL,
 amount_cents INTEGER CHECK(amount_cents IS NULL OR (typeof(amount_cents)='integer' AND amount_cents BETWEEN 0 AND 100000000)),
 date TEXT NOT NULL, payment_method TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'posted' CHECK(status IN ('posted','void')),
 void_reason TEXT NOT NULL DEFAULT '', revision INTEGER NOT NULL DEFAULT 0,
 operation_key TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
 CHECK(booking_id IS NULL OR kind='income'),
 CHECK(amount_cents IS NOT NULL OR booking_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS finance_date ON finance_entries(date,created_at);
CREATE TABLE IF NOT EXISTS finance_audit (
 id TEXT PRIMARY KEY, entry_id TEXT NOT NULL REFERENCES finance_entries(id),
 action TEXT NOT NULL, previous_value TEXT, new_value TEXT NOT NULL, created_at TEXT NOT NULL
);

-- Existing completed services stay visible without inventing prices or payments.
INSERT OR IGNORE INTO finance_entries
 (id,booking_id,idempotency_key,kind,category,description,amount_cents,date,payment_method,operation_key,created_at,updated_at)
 SELECT id,id,'service:'||id,'income','Serviços',service_name||' · '||customer_name,NULL,
 date(updated_at,'-3 hours'),'unrecorded','legacy:'||id,created_at,updated_at
 FROM bookings WHERE status='completed';
