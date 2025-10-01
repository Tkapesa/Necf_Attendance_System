-- ===================================================
-- NECF Attendance System - Database Functions & Triggers (MySQL)
-- ===================================================

-- 1. Triggers to auto-update updatedAt on all main tables

DELIMITER $$

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
  SET NEW.updated_At = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER roles_set_updated_at
BEFORE UPDATE ON roles
FOR EACH ROW
BEGIN
  SET NEW.updated_At = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER members_set_updated_at
BEFORE UPDATE ON members
FOR EACH ROW
BEGIN
  SET NEW.updated_At = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER cells_set_updated_at
BEFORE UPDATE ON cells
FOR EACH ROW
BEGIN
  SET NEW.updated_At = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER sessions_set_updated_at
BEFORE UPDATE ON sessions
FOR EACH ROW
BEGIN
  SET NEW.updated_At = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER attendance_set_updated_at
BEFORE UPDATE ON attendance
FOR EACH ROW
BEGIN
  SET NEW.updated_At = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER qr_tokens_set_updated_at
BEFORE UPDATE ON qr_tokens
FOR EACH ROW
BEGIN
  SET NEW.updated_At = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER notifications_set_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW
BEGIN
  SET NEW.updated_At = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER audit_logs_set_updated_at
BEFORE UPDATE ON audit_logs
FOR EACH ROW
BEGIN
  SET NEW.updated_At = CURRENT_TIMESTAMP;
END$$

DELIMITER ;