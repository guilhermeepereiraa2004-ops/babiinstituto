CREATE TABLE push_device (
 id TEXT PRIMARY KEY, slot INTEGER NOT NULL DEFAULT 1 UNIQUE CHECK(slot=1),
 endpoint TEXT NOT NULL, p256dh TEXT NOT NULL, auth TEXT NOT NULL, tested_at TEXT
);
CREATE TABLE push_outbox (
 kind TEXT NOT NULL CHECK(kind IN ('booking','order')), event_id TEXT NOT NULL,
 device_id TEXT NOT NULL REFERENCES push_device(id) ON DELETE CASCADE,
 created_at TEXT NOT NULL, ready_at TEXT NOT NULL, claim_token TEXT,
 attempts INTEGER NOT NULL DEFAULT 0,
 PRIMARY KEY(kind,event_id,device_id)
);
CREATE INDEX push_outbox_ready ON push_outbox(ready_at);
CREATE FUNCTION babi_queue_push() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 INSERT INTO push_outbox(kind,event_id,device_id,created_at,ready_at)
 SELECT TG_ARGV[0],NEW.id,id,NEW.created_at,NEW.created_at FROM push_device;
 RETURN NEW;
END;
$$;
CREATE TRIGGER queue_booking_push AFTER INSERT ON bookings
FOR EACH ROW EXECUTE FUNCTION babi_queue_push('booking');
CREATE TRIGGER queue_order_push AFTER INSERT ON shop_orders
FOR EACH ROW EXECUTE FUNCTION babi_queue_push('order');
