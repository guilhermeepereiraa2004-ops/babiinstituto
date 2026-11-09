CREATE TABLE IF NOT EXISTS push_device (
 id TEXT PRIMARY KEY, slot INTEGER NOT NULL DEFAULT 1 UNIQUE CHECK(slot=1),
 endpoint TEXT NOT NULL, p256dh TEXT NOT NULL, auth TEXT NOT NULL, tested_at TEXT
);
CREATE TABLE IF NOT EXISTS push_outbox (
 kind TEXT NOT NULL CHECK(kind IN ('booking','order')), event_id TEXT NOT NULL,
 device_id TEXT NOT NULL REFERENCES push_device(id) ON DELETE CASCADE,
 created_at TEXT NOT NULL, ready_at TEXT NOT NULL, claim_token TEXT,
 attempts INTEGER NOT NULL DEFAULT 0,
 PRIMARY KEY(kind,event_id,device_id)
);
CREATE INDEX IF NOT EXISTS push_outbox_ready ON push_outbox(ready_at);
CREATE TRIGGER IF NOT EXISTS queue_booking_push AFTER INSERT ON bookings
BEGIN
 INSERT INTO push_outbox(kind,event_id,device_id,created_at,ready_at)
 SELECT 'booking',NEW.id,id,NEW.created_at,NEW.created_at FROM push_device;
END;
CREATE TRIGGER IF NOT EXISTS queue_order_push AFTER INSERT ON shop_orders
BEGIN
 INSERT INTO push_outbox(kind,event_id,device_id,created_at,ready_at)
 SELECT 'order',NEW.id,id,NEW.created_at,NEW.created_at FROM push_device;
END;
