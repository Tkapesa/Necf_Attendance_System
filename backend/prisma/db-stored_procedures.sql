-- ===================================================
-- NECF Attendance System - Database Stored Procedure
-- ===================================================


-- 2. Stored Procedure: QR Check-in (Upsert Attendance)

DELIMITER $$

CREATE PROCEDURE sp_qr_checkin(
  IN p_member_id CHAR(36),
  IN p_session_id CHAR(36),
  IN p_lat FLOAT,
  IN p_long FLOAT
)
BEGIN
  INSERT INTO attendance (id, member_id, session_id, status, check_in_time, latitude, longitude, created_at, updated_at)
  VALUES (UUID(), p_member_id, p_session_id, 'present', CURRENT_TIMESTAMP, p_lat, p_long, NOW(), NOW())
  ON DUPLICATE KEY UPDATE
    status = 'present',
    check_in_time = CURRENT_TIMESTAMP,
    latitude = p_lat,
    longitude = p_long,
    updated_at = NOW();
END$$

DELIMITER ;



-- 3. Stored Procedure: Cleanup old QR tokens

DELIMITER $$

CREATE PROCEDURE sp_cleanup_old_tokens()
BEGIN
  DELETE FROM qr_tokens
  WHERE expires_at < NOW() - INTERVAL 30 DAY;
END$$

DELIMITER ;