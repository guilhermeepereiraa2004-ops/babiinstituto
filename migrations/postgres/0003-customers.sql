CREATE TABLE IF NOT EXISTS customers (
 phone TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 birth_day INTEGER,
 birth_month INTEGER,
 updated_at TEXT NOT NULL,
 CHECK((birth_day IS NULL AND birth_month IS NULL) OR
       (birth_day IS NOT NULL AND birth_month IS NOT NULL AND birth_month BETWEEN 1 AND 12 AND
        birth_day BETWEEN 1 AND CASE birth_month WHEN 2 THEN 29 WHEN 4 THEN 30 WHEN 6 THEN 30 WHEN 9 THEN 30 WHEN 11 THEN 30 ELSE 31 END))
);
CREATE INDEX IF NOT EXISTS customers_birthday ON customers(birth_month,birth_day,phone);
CREATE INDEX IF NOT EXISTS bookings_customer_phone ON bookings ((CASE WHEN length(phone) IN (10,11) THEN '55'||phone ELSE phone END));

-- Recover customers from existing reservations, without guessing a birthday.
INSERT INTO customers(phone,name,updated_at)
SELECT phone_key,customer_name,created_at
FROM (
 SELECT CASE WHEN length(phone) IN (10,11) THEN '55'||phone ELSE phone END AS phone_key,
        customer_name,created_at,
        ROW_NUMBER() OVER (
          PARTITION BY CASE WHEN length(phone) IN (10,11) THEN '55'||phone ELSE phone END
          ORDER BY created_at DESC,id DESC
        ) AS position
 FROM bookings
) AS history
WHERE position=1
ON CONFLICT(phone) DO NOTHING;

-- A previous deployment can still receive reservations while this migration
-- is installed. Capture those clients too, without touching existing profiles.
CREATE FUNCTION register_customer_from_booking() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 INSERT INTO customers(phone,name,updated_at)
 VALUES (CASE WHEN length(NEW.phone) IN (10,11) THEN '55'||NEW.phone ELSE NEW.phone END,NEW.customer_name,NEW.created_at)
 ON CONFLICT(phone) DO NOTHING;
 RETURN NEW;
END;
$$;
CREATE TRIGGER bookings_register_customer AFTER INSERT ON bookings
FOR EACH ROW EXECUTE FUNCTION register_customer_from_booking();
