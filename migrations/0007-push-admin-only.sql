DELETE FROM push_device WHERE invite_id IS NOT NULL;
DELETE FROM push_invite;

CREATE TRIGGER push_device_admin_only_insert BEFORE INSERT ON push_device
WHEN NEW.invite_id IS NOT NULL
BEGIN
 SELECT RAISE(ABORT, 'Push enrollment requires admin access');
END;
CREATE TRIGGER push_device_admin_only_update BEFORE UPDATE OF invite_id ON push_device
WHEN NEW.invite_id IS NOT NULL
BEGIN
 SELECT RAISE(ABORT, 'Push enrollment requires admin access');
END;
CREATE TRIGGER push_invite_closed BEFORE INSERT ON push_invite
BEGIN
 SELECT RAISE(ABORT, 'Push invitations are closed');
END;
