CREATE DATABASE necf_attendance;
 show databases;
 use necf_attendance;
DROP DATABASE necf_attendance;
-- Enums (MySQL uses ENUM type directly)
-- RoleType
-- SessionType
-- AttendanceStatus
-- QRTokenPurpose

-- Roles
CREATE TABLE roles (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    permissions JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    gender VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    profile_picture TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    is_active BOOLEAN DEFAULT TRUE,
    login_attempts INT DEFAULT 0,
    last_login_at DATETIME,
    email_verified_at DATETIME,
    locked_until DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    role_id CHAR(36) NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Cells
CREATE TABLE cells (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    leader_id CHAR(36),
    capacity INT,
    location TEXT,
    meeting_day VARCHAR(20),
    meeting_time VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Members
CREATE TABLE members (
    id CHAR(36) PRIMARY KEY,
    membership_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    gender VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    profile_picture TEXT,
    membership_status VARCHAR(20) DEFAULT 'ACTIVE',
    join_date DATE NOT NULL,
    end_date DATE,
    notes TEXT,
    email_verified_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_id CHAR(36) UNIQUE,
    cell_id CHAR(36),
    created_by_id CHAR(36),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (cell_id) REFERENCES cells(id),
    FOREIGN KEY (created_by_id) REFERENCES users(id)
);

-- Sessions
CREATE TABLE sessions (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    description TEXT,
    session_type ENUM('sunday_service','midweek_service','prayer_meeting','bible_study','event') DEFAULT 'sunday_service',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    location TEXT,
    max_capacity INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Attendance
CREATE TABLE attendance (
    id CHAR(36) PRIMARY KEY,
    status ENUM('present','absent','late','excused') DEFAULT 'present',
    check_in_time DATETIME,
    check_out_time DATETIME,
    checked_in_at DATETIME,
    latitude DOUBLE,
    longitude DOUBLE,
    is_manual_entry BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    member_id CHAR(36) NOT NULL,
    session_id CHAR(36) NOT NULL,
    recorded_by_id CHAR(36),
    UNIQUE KEY uq_member_session (member_id, session_id),
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (session_id) REFERENCES sessions(id),
    FOREIGN KEY (recorded_by_id) REFERENCES users(id)
);

-- QR Tokens
CREATE TABLE qr_tokens (
    id CHAR(36) PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    purpose ENUM('attendance','membership') DEFAULT 'attendance',
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at DATETIME,
    revoked_at DATETIME,
    metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    member_id CHAR(36) NOT NULL,
    created_by_id CHAR(36),
    revoked_by_id CHAR(36),
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (created_by_id) REFERENCES users(id),
    FOREIGN KEY (revoked_by_id) REFERENCES users(id)
);

-- Notifications
CREATE TABLE notifications (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    user_id CHAR(36) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Audit Logs
CREATE TABLE audit_logs (
    id CHAR(36) PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    entity VARCHAR(255) NOT NULL,
    entity_id VARCHAR(255),
    entity_type VARCHAR(255),
    old_values JSON,
    new_values JSON,
    metadata JSON,
    severity VARCHAR(20),
    ip_address VARCHAR(50),
    user_agent VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_id CHAR(36),
    FOREIGN KEY (user_id) REFERENCES users(id)
);