ALTER TABLE push_device DROP CONSTRAINT push_device_slot_check;
ALTER TABLE push_device
 ADD CONSTRAINT push_device_slot_check CHECK(slot BETWEEN 1 AND 10),
 ADD COLUMN name TEXT NOT NULL DEFAULT 'Aparelho já cadastrado',
 ADD COLUMN invite_id TEXT UNIQUE;

CREATE TABLE push_invite (
 id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE,
 name TEXT NOT NULL, expires_at TEXT NOT NULL
);
