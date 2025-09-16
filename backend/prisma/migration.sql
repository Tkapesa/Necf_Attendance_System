-- =====================================================
-- NECF Church Attendance System - Database Migration
-- PostgreSQL 14+ Compatible
-- Version: 1.0.0
-- Date: September 15, 2025
-- Description: Complete schema creation for church attendance management
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate secure random tokens
CREATE OR REPLACE FUNCTION generate_secure_token(length INTEGER DEFAULT 32)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(length), 'hex');
END;
$$ language 'plpgsql';

-- =====================================================
-- CUSTOM TYPES AND ENUMS
-- =====================================================

-- User roles enumeration
CREATE TYPE user_role AS ENUM (
    'SUPER_ADMIN',
    'ADMIN', 
    'PASTOR',
    'ELDER',
    'LEADER',
    'MEMBER',
    'VISITOR'
);

-- User status enumeration
CREATE TYPE user_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED',
    'PENDING_VERIFICATION'
);

-- Membership status enumeration
CREATE TYPE membership_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'TRANSFERRED',
    'DECEASED'
);

-- Session type enumeration
CREATE TYPE session_type AS ENUM (
    'SUNDAY_SERVICE',
    'MIDWEEK_SERVICE',
    'PRAYER_MEETING',
    'BIBLE_STUDY',
    'YOUTH_SERVICE',
    'CONFERENCE',
    'WORKSHOP',
    'SPECIAL_EVENT',
    'CELL_MEETING',
    'TEAM_MEETING',
    'OTHER'
);

-- Attendance status enumeration
CREATE TYPE attendance_status AS ENUM (
    'PRESENT',
    'ABSENT',
    'LATE',
    'EXCUSED',
    'PARTIAL'
);

-- Audit action enumeration
CREATE TYPE audit_action AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE',
    'LOGIN',
    'LOGOUT',
    'PASSWORD_CHANGE',
    'ROLE_CHANGE',
    'CHECK_IN',
    'CHECK_OUT'
);

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Roles table - System roles and permissions
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name user_role NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table - All system users (members, leaders, admins)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender CHAR(1) CHECK (gender IN ('M', 'F', 'O')),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',
    profile_picture_url TEXT,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    status user_status DEFAULT 'PENDING_VERIFICATION',
    email_verified_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP WITH TIME ZONE,
    verification_token VARCHAR(255),
    verification_expires_at TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}',
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~* '^\+?[1-9]\d{1,14}$')
);

-- Cells table - Small group cells within the church
CREATE TABLE cells (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    location VARCHAR(200),
    meeting_day VARCHAR(20), -- e.g., 'Sunday', 'Wednesday'
    meeting_time TIME,
    leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
    co_leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
    capacity INTEGER CHECK (capacity > 0),
    is_active BOOLEAN DEFAULT true,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    meeting_address TEXT,
    zone VARCHAR(100), -- Geographical zone or district
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT different_leaders CHECK (leader_id != co_leader_id)
);

-- Teams table - Ministry teams and departments
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    department VARCHAR(100), -- e.g., 'Music', 'Children', 'Youth', 'Admin'
    description TEXT,
    leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
    parent_team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    meeting_schedule VARCHAR(200), -- Flexible text for meeting schedule
    responsibilities TEXT,
    requirements TEXT, -- Skills or requirements to join
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Members table - Church membership details and relationships
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    membership_id VARCHAR(50) UNIQUE, -- External membership number
    membership_status membership_status DEFAULT 'ACTIVE',
    join_date DATE NOT NULL,
    baptism_date DATE,
    confirmation_date DATE,
    transfer_from_church VARCHAR(200),
    transfer_to_church VARCHAR(200),
    cell_id INTEGER REFERENCES cells(id) ON DELETE SET NULL,
    marital_status VARCHAR(20) CHECK (marital_status IN ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED')),
    spouse_id UUID REFERENCES members(id) ON DELETE SET NULL,
    children_ids UUID[], -- Array of member IDs for children
    occupation VARCHAR(150),
    employer VARCHAR(200),
    education_level VARCHAR(50),
    skills TEXT[], -- Array of skills/talents
    interests TEXT[], -- Array of interests
    ministry_preferences TEXT[], -- Array of preferred ministries
    volunteer_availability JSONB DEFAULT '{}', -- Available days/times for volunteering
    communication_preferences JSONB DEFAULT '{"email": true, "sms": false, "phone": false}',
    pastoral_notes TEXT, -- Confidential pastoral care notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_join_date CHECK (join_date <= CURRENT_DATE),
    CONSTRAINT valid_baptism_date CHECK (baptism_date IS NULL OR baptism_date >= join_date),
    CONSTRAINT different_spouse CHECK (id != spouse_id)
);

-- Member-Team relationships (many-to-many)
CREATE TABLE member_teams (
    id SERIAL PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    role_in_team VARCHAR(100) DEFAULT 'MEMBER', -- e.g., 'MEMBER', 'COORDINATOR', 'ASSISTANT'
    joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
    left_at DATE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(member_id, team_id),
    CONSTRAINT valid_membership_period CHECK (left_at IS NULL OR left_at >= joined_at)
);

-- QR Tokens table - Unique QR codes for member check-ins
CREATE TABLE qr_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL UNIQUE REFERENCES members(id) ON DELETE CASCADE,
    token UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE, -- NULL for non-expiring tokens
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    device_info JSONB DEFAULT '{}', -- Information about device that generated/used token
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_expiry CHECK (expires_at IS NULL OR expires_at > created_at)
);

-- Sessions table - Church services, meetings, and events
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    session_type session_type NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    location VARCHAR(200),
    capacity INTEGER CHECK (capacity > 0),
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern JSONB DEFAULT '{}', -- Stores recurrence rules
    leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
    cell_id INTEGER REFERENCES cells(id) ON DELETE SET NULL, -- For cell meetings
    team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL, -- For team meetings
    requires_registration BOOLEAN DEFAULT false,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    is_public BOOLEAN DEFAULT true,
    tags TEXT[], -- Array of tags for categorization
    materials_needed TEXT,
    special_instructions TEXT,
    is_cancelled BOOLEAN DEFAULT false,
    cancellation_reason TEXT,
    check_in_enabled BOOLEAN DEFAULT true,
    check_in_start_time TIMESTAMP WITH TIME ZONE,
    check_in_end_time TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_session_times CHECK (end_time IS NULL OR end_time > start_time),
    CONSTRAINT valid_registration_deadline CHECK (registration_deadline IS NULL OR registration_deadline <= start_time),
    CONSTRAINT valid_check_in_times CHECK (
        (check_in_start_time IS NULL AND check_in_end_time IS NULL) OR
        (check_in_start_time IS NOT NULL AND check_in_end_time IS NOT NULL AND check_in_end_time > check_in_start_time)
    )
);

-- Session registrations (many-to-many with additional data)
CREATE TABLE session_registrations (
    id SERIAL PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    registration_status VARCHAR(20) DEFAULT 'CONFIRMED' CHECK (registration_status IN ('CONFIRMED', 'WAITLIST', 'CANCELLED')),
    notes TEXT,
    registered_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Who registered them (self or admin)
    
    -- Constraints
    UNIQUE(session_id, member_id)
);

-- Attendance table - Records of member attendance at sessions
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    status attendance_status DEFAULT 'PRESENT',
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    check_in_method VARCHAR(20) DEFAULT 'MANUAL' CHECK (check_in_method IN ('QR_CODE', 'MANUAL', 'MOBILE_APP', 'KIOSK', 'BULK')),
    check_in_location VARCHAR(100),
    device_info JSONB DEFAULT '{}',
    notes TEXT,
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Who recorded the attendance
    is_late BOOLEAN DEFAULT false,
    late_minutes INTEGER DEFAULT 0 CHECK (late_minutes >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(member_id, session_id), -- One attendance record per member per session
    CONSTRAINT valid_check_times CHECK (check_out_time IS NULL OR check_out_time >= check_in_time),
    CONSTRAINT late_consistency CHECK (
        (is_late = false AND late_minutes = 0) OR 
        (is_late = true AND late_minutes > 0)
    )
);

-- Audit logs table - Comprehensive audit trail
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action audit_action NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- Table name or entity type
    entity_id VARCHAR(100), -- ID of the affected entity
    old_values JSONB,
    new_values JSONB,
    metadata JSONB DEFAULT '{}', -- Additional context (IP, user agent, etc.)
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100), -- Application session ID
    api_endpoint VARCHAR(200), -- API endpoint if applicable
    request_id VARCHAR(100), -- Request tracking ID
    severity VARCHAR(10) DEFAULT 'INFO' CHECK (severity IN ('DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_last_login ON users(last_login_at);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_name ON users(first_name, last_name);

-- Members table indexes
CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_membership_id ON members(membership_id);
CREATE INDEX idx_members_status ON members(membership_status);
CREATE INDEX idx_members_cell_id ON members(cell_id);
CREATE INDEX idx_members_join_date ON members(join_date);
CREATE INDEX idx_members_spouse_id ON members(spouse_id);

-- Cells table indexes
CREATE INDEX idx_cells_leader_id ON cells(leader_id);
CREATE INDEX idx_cells_co_leader_id ON cells(co_leader_id);
CREATE INDEX idx_cells_is_active ON cells(is_active);
CREATE INDEX idx_cells_zone ON cells(zone);

-- Teams table indexes
CREATE INDEX idx_teams_leader_id ON teams(leader_id);
CREATE INDEX idx_teams_parent_team_id ON teams(parent_team_id);
CREATE INDEX idx_teams_department ON teams(department);
CREATE INDEX idx_teams_is_active ON teams(is_active);

-- Member-teams relationship indexes
CREATE INDEX idx_member_teams_member_id ON member_teams(member_id);
CREATE INDEX idx_member_teams_team_id ON member_teams(team_id);
CREATE INDEX idx_member_teams_is_active ON member_teams(is_active);
CREATE INDEX idx_member_teams_joined_at ON member_teams(joined_at);

-- QR tokens table indexes
CREATE INDEX idx_qr_tokens_member_id ON qr_tokens(member_id);
CREATE INDEX idx_qr_tokens_token ON qr_tokens(token);
CREATE INDEX idx_qr_tokens_is_active ON qr_tokens(is_active);
CREATE INDEX idx_qr_tokens_expires_at ON qr_tokens(expires_at);

-- Sessions table indexes
CREATE INDEX idx_sessions_start_time ON sessions(start_time);
CREATE INDEX idx_sessions_end_time ON sessions(end_time);
CREATE INDEX idx_sessions_session_type ON sessions(session_type);
CREATE INDEX idx_sessions_leader_id ON sessions(leader_id);
CREATE INDEX idx_sessions_cell_id ON sessions(cell_id);
CREATE INDEX idx_sessions_team_id ON sessions(team_id);
CREATE INDEX idx_sessions_created_by ON sessions(created_by);
CREATE INDEX idx_sessions_is_cancelled ON sessions(is_cancelled);
CREATE INDEX idx_sessions_check_in_enabled ON sessions(check_in_enabled);

-- Session registrations indexes
CREATE INDEX idx_session_registrations_session_id ON session_registrations(session_id);
CREATE INDEX idx_session_registrations_member_id ON session_registrations(member_id);
CREATE INDEX idx_session_registrations_status ON session_registrations(registration_status);
CREATE INDEX idx_session_registrations_registered_at ON session_registrations(registered_at);

-- Attendance table indexes
CREATE INDEX idx_attendance_member_id ON attendance(member_id);
CREATE INDEX idx_attendance_session_id ON attendance(session_id);
CREATE INDEX idx_attendance_status ON attendance(status);
CREATE INDEX idx_attendance_check_in_time ON attendance(check_in_time);
CREATE INDEX idx_attendance_check_in_method ON attendance(check_in_method);
CREATE INDEX idx_attendance_recorded_by ON attendance(recorded_by);
CREATE INDEX idx_attendance_created_at ON attendance(created_at);
CREATE INDEX idx_attendance_is_late ON attendance(is_late);

-- Audit logs table indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_ip_address ON audit_logs(ip_address);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);

-- Composite indexes for common queries
CREATE INDEX idx_attendance_member_session_time ON attendance(member_id, session_id, check_in_time);
CREATE INDEX idx_sessions_type_start_time ON sessions(session_type, start_time);
CREATE INDEX idx_members_status_join_date ON members(membership_status, join_date);
CREATE INDEX idx_users_role_status ON users(role_id, status);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- =====================================================

-- Create triggers for updated_at columns
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cells_updated_at BEFORE UPDATE ON cells
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_member_teams_updated_at BEFORE UPDATE ON member_teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qr_tokens_updated_at BEFORE UPDATE ON qr_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECURITY POLICIES (Row Level Security)
-- =====================================================

-- Enable Row Level Security on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- INITIAL DATA SEEDING
-- =====================================================

-- Insert default roles
INSERT INTO roles (name, display_name, description, permissions) VALUES
('SUPER_ADMIN', 'Super Administrator', 'Full system access with all permissions', '{"all": true}'),
('ADMIN', 'Administrator', 'Church administrative staff with broad access', '{"users": "crud", "members": "crud", "sessions": "crud", "attendance": "crud", "reports": "read"}'),
('PASTOR', 'Pastor', 'Senior church leadership with oversight capabilities', '{"members": "read", "sessions": "crud", "attendance": "read", "reports": "read", "analytics": "read"}'),
('ELDER', 'Elder', 'Church elder with leadership responsibilities', '{"members": "read", "sessions": "read", "attendance": "read", "reports": "read"}'),
('LEADER', 'Leader', 'Ministry or cell leader with departmental access', '{"members": "read_assigned", "sessions": "crud_assigned", "attendance": "crud_assigned", "reports": "read_assigned"}'),
('MEMBER', 'Member', 'Regular church member with self-service access', '{"profile": "crud_own", "attendance": "read_own", "sessions": "read"}'),
('VISITOR', 'Visitor', 'First-time or irregular attendee with limited access', '{"profile": "crud_own", "sessions": "read_public"}');

-- Create default admin user (password should be changed immediately)
-- Password: 'admin123' (hashed with bcrypt, cost 12)
INSERT INTO users (
    email, password_hash, first_name, last_name, role_id, status, email_verified_at
) VALUES (
    'admin@necf.org',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeQ4.reNSditVWKn2',
    'System',
    'Administrator',
    (SELECT id FROM roles WHERE name = 'SUPER_ADMIN'),
    'ACTIVE',
    CURRENT_TIMESTAMP
);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for active members with user details
CREATE VIEW active_members_view AS
SELECT 
    m.id,
    m.membership_id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone,
    m.join_date,
    m.membership_status,
    c.name as cell_name,
    u.created_at,
    u.updated_at
FROM members m
JOIN users u ON m.user_id = u.id
LEFT JOIN cells c ON m.cell_id = c.id
WHERE m.membership_status = 'ACTIVE' 
AND u.status = 'ACTIVE';

-- View for upcoming sessions with leader details
CREATE VIEW upcoming_sessions_view AS
SELECT 
    s.id,
    s.title,
    s.session_type,
    s.start_time,
    s.end_time,
    s.location,
    s.capacity,
    u.first_name || ' ' || u.last_name as leader_name,
    c.name as cell_name,
    t.name as team_name,
    s.requires_registration,
    s.check_in_enabled,
    s.created_at
FROM sessions s
LEFT JOIN users u ON s.leader_id = u.id
LEFT JOIN cells c ON s.cell_id = c.id
LEFT JOIN teams t ON s.team_id = t.id
WHERE s.start_time > CURRENT_TIMESTAMP
AND s.is_cancelled = false
ORDER BY s.start_time;

-- View for attendance statistics
CREATE VIEW attendance_stats_view AS
SELECT 
    s.id as session_id,
    s.title as session_title,
    s.start_time,
    COUNT(a.id) as total_attendance,
    COUNT(CASE WHEN a.status = 'PRESENT' THEN 1 END) as present_count,
    COUNT(CASE WHEN a.status = 'LATE' THEN 1 END) as late_count,
    COUNT(CASE WHEN a.status = 'ABSENT' THEN 1 END) as absent_count,
    ROUND(
        (COUNT(CASE WHEN a.status = 'PRESENT' THEN 1 END) * 100.0) / 
        NULLIF(COUNT(a.id), 0), 2
    ) as attendance_percentage
FROM sessions s
LEFT JOIN attendance a ON s.id = a.session_id
GROUP BY s.id, s.title, s.start_time
ORDER BY s.start_time DESC;

-- =====================================================
-- STORED PROCEDURES AND FUNCTIONS
-- =====================================================

-- Function to generate QR token for a member
CREATE OR REPLACE FUNCTION generate_qr_token_for_member(member_uuid UUID)
RETURNS UUID AS $$
DECLARE
    new_token UUID;
BEGIN
    -- Deactivate existing tokens
    UPDATE qr_tokens SET is_active = false WHERE member_id = member_uuid;
    
    -- Generate new token
    new_token := uuid_generate_v4();
    
    -- Insert new token
    INSERT INTO qr_tokens (member_id, token, is_active)
    VALUES (member_uuid, new_token, true);
    
    RETURN new_token;
END;
$$ LANGUAGE plpgsql;

-- Function to record attendance via QR code
CREATE OR REPLACE FUNCTION record_qr_attendance(
    qr_token_uuid UUID,
    session_uuid UUID,
    check_in_location_param VARCHAR(100) DEFAULT NULL,
    device_info_param JSONB DEFAULT '{}'
)
RETURNS TABLE(success BOOLEAN, message TEXT, attendance_id INTEGER) AS $$
DECLARE
    member_uuid UUID;
    attendance_record_id INTEGER;
    session_start_time TIMESTAMP WITH TIME ZONE;
    current_time TIMESTAMP WITH TIME ZONE := CURRENT_TIMESTAMP;
    is_late_flag BOOLEAN := false;
    late_mins INTEGER := 0;
BEGIN
    -- Validate QR token and get member ID
    SELECT qt.member_id INTO member_uuid
    FROM qr_tokens qt
    WHERE qt.token = qr_token_uuid 
    AND qt.is_active = true
    AND (qt.expires_at IS NULL OR qt.expires_at > current_time);
    
    IF member_uuid IS NULL THEN
        RETURN QUERY SELECT false, 'Invalid or expired QR token', NULL::INTEGER;
        RETURN;
    END IF;
    
    -- Check if attendance already recorded
    SELECT id INTO attendance_record_id
    FROM attendance
    WHERE member_id = member_uuid AND session_id = session_uuid;
    
    IF attendance_record_id IS NOT NULL THEN
        RETURN QUERY SELECT false, 'Attendance already recorded for this session', attendance_record_id;
        RETURN;
    END IF;
    
    -- Get session start time and check if late
    SELECT start_time INTO session_start_time
    FROM sessions
    WHERE id = session_uuid;
    
    IF session_start_time IS NULL THEN
        RETURN QUERY SELECT false, 'Session not found', NULL::INTEGER;
        RETURN;
    END IF;
    
    -- Calculate if late
    IF current_time > session_start_time THEN
        is_late_flag := true;
        late_mins := EXTRACT(EPOCH FROM (current_time - session_start_time)) / 60;
    END IF;
    
    -- Record attendance
    INSERT INTO attendance (
        member_id, session_id, status, check_in_time, check_in_method,
        check_in_location, device_info, is_late, late_minutes
    ) VALUES (
        member_uuid, session_uuid, 'PRESENT', current_time, 'QR_CODE',
        check_in_location_param, device_info_param, is_late_flag, late_mins
    ) RETURNING id INTO attendance_record_id;
    
    -- Update QR token usage
    UPDATE qr_tokens 
    SET usage_count = usage_count + 1, last_used_at = current_time
    WHERE token = qr_token_uuid;
    
    RETURN QUERY SELECT true, 'Attendance recorded successfully', attendance_record_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get member attendance summary
CREATE OR REPLACE FUNCTION get_member_attendance_summary(
    member_uuid UUID,
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
)
RETURNS TABLE(
    total_sessions BIGINT,
    attended_sessions BIGINT,
    late_sessions BIGINT,
    attendance_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(s.id) as total_sessions,
        COUNT(a.id) as attended_sessions,
        COUNT(CASE WHEN a.is_late THEN 1 END) as late_sessions,
        ROUND(
            (COUNT(a.id) * 100.0) / NULLIF(COUNT(s.id), 0), 2
        ) as attendance_rate
    FROM sessions s
    LEFT JOIN attendance a ON s.id = a.session_id AND a.member_id = member_uuid
    WHERE s.start_time BETWEEN 
        COALESCE(start_date, CURRENT_DATE - INTERVAL '1 year') AND 
        COALESCE(end_date, CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CLEANUP AND MAINTENANCE FUNCTIONS
-- =====================================================

-- Function to clean up old audit logs (keep last 2 years)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs 
    WHERE created_at < CURRENT_DATE - INTERVAL '2 years';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to deactivate expired QR tokens
CREATE OR REPLACE FUNCTION deactivate_expired_qr_tokens()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE qr_tokens 
    SET is_active = false 
    WHERE expires_at IS NOT NULL 
    AND expires_at < CURRENT_TIMESTAMP 
    AND is_active = true;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MIGRATION COMPLETION
-- =====================================================

-- Log migration completion
INSERT INTO audit_logs (
    action, entity_type, entity_id, description, severity
) VALUES (
    'CREATE', 'DATABASE', 'initial_migration', 
    'Initial database schema created successfully', 'INFO'
);

-- Migration completed successfully
SELECT 'Database migration completed successfully!' as result;
