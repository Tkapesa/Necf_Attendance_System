-- ===================================================
-- NECF Attendance System - Views
-- ===================================================

-- ---------------------------------------------------
-- Attendance statistics per session
-- ---------------------------------------------------
drop view if exists attendance_stats;
CREATE OR REPLACE VIEW attendance_stats AS
SELECT
  s.id AS session_id,
  s.title,
  COUNT(a.id) AS total_checked_in,
  SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS present_count,
  SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) AS absent_count,
  SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) AS late_count
FROM sessions s
LEFT JOIN attendance a ON s.id = a.session_id
GROUP BY s.id, s.title;


-- ---------------------------------------------------
-- Active members list
-- ---------------------------------------------------
 CREATE OR REPLACE VIEW active_members AS
SELECT
  m.id,
  m.first_name,
  m.last_name,
  m.email,
  m.membership_status,
  m.join_date
FROM members m
WHERE m.membership_status = 'ACTIVE';