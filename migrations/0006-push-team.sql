CREATE TABLE push_device_next (
 id TEXT PRIMARY KEY, slot INTEGER NOT NULL DEFAULT 1 UNIQUE CHECK(slot BETWEEN 1 AND 10),
 endpoint TEXT NOT NULL, p256dh TEXT NOT NULL, auth TEXT NOT NULL, tested_at TEXT,
 name TEXT NOT NULL DEFAULT 'Aparelho já cadastrado', invite_id TEXT UNIQUE
);
CREATE TABLE push_outbox_next (
 kind TEXT NOT NULL CHECK(kind IN ('booking','order')), event_id TEXT NOT NULL,
 device_id TEXT NOT NULL REFERENCES push_device_next(id) ON DELETE CASCADE,
 created_at TEXT NOT NULL, ready_at TEXT NOT NULL, claim_token TEXT,
 attempts INTEGER NOT NULL DEFAULT 0,
 PRIMARY KEY(kind,event_id,device_id)
);
INSERT INTO push_device_next(id,slot,endpoint,p256dh,auth,tested_at)
 SELECT id,slot,endpoint,p256dh,auth,tested_at FROM push_device;
INSERT INTO push_outbox_next SELECT * FROM push_outbox;
DROP TRIGGER queue_booking_push;
DROP TRIGGER queue_order_push;
DROP TABLE push_outbox;
DROP TABLE push_device;
ALTER TABLE push_device_next RENAME TO push_device;
ALTER TABLE push_outbox_next RENAME TO push_outbox;
CREATE INDEX push_outbox_ready ON push_outbox(ready_at);

CREATE TRIGGER queue_booking_push AFTER INSERT ON bookings
BEGIN
 INSERT INTO push_outbox(kind,event_id,device_id,created_at,ready_at)
 SELECT 'booking',NEW.id,id,NEW.created_at,NEW.created_at FROM push_device;
END;
CREATE TRIGGER queue_order_push AFTER INSERT ON shop_orders
BEGIN
 INSERT INTO push_outbox(kind,event_id,device_id,created_at,ready_at)
 SELECT 'order',NEW.id,id,NEW.created_at,NEW.created_at FROM push_device;
END;

CREATE TABLE push_invite (
 id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE,
 name TEXT NOT NULL, expires_at TEXT NOT NULL
);
