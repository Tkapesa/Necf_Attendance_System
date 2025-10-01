-- ===================================================
-- NECF Attendance System - Database Functions
-- ===================================================

--1. Function: Get Member Full Name

DELIMITER $$

CREATE FUNCTION fn_member_full_name(p_member_id CHAR(36))
RETURNS VARCHAR(255)
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE full_name VARCHAR(255);
  SELECT CONCAT(first_name, ' ', last_name)
  INTO full_name
  FROM members
  WHERE id = p_member_id;
  RETURN full_name;
END$$

DELIMITER ;

-- 2. Function: Count Attendance by Member
DELIMITER $$

CREATE FUNCTION fn_member_attendance_count(p_member_id CHAR(36))
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE total INT;
  SELECT COUNT(*)
  INTO total
  FROM attendance
  WHERE member_id = p_member_id
    AND status = 'present';
  RETURN total;
END$$

DELIMITER ;

-- 3. Function: Get Session Attendance Count
DELIMITER $$

CREATE FUNCTION fn_session_attendance_count(p_session_id CHAR(36))
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE total INT;
  SELECT COUNT(*)
  INTO total
  FROM attendance
  WHERE session_id = p_session_id
    AND status = 'present';
  RETURN total;
END$$

DELIMITER ;