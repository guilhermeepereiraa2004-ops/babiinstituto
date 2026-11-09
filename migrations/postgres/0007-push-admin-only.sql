DELETE FROM push_device WHERE invite_id IS NOT NULL;
DELETE FROM push_invite;

-- Block enrollment by an older deployment while keeping its reads compatible.
ALTER TABLE push_device ADD CONSTRAINT push_device_admin_only CHECK(invite_id IS NULL);
ALTER TABLE push_invite ADD CONSTRAINT push_invite_closed CHECK(false);
