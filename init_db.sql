-- PillPall Database Schema
-- SQLite database for medication management

-- Users table (extends Django's auth_user)
CREATE TABLE IF NOT EXISTS api_user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    password VARCHAR(128) NOT NULL,
    last_login DATETIME,
    is_superuser BOOLEAN NOT NULL DEFAULT 0,
    username VARCHAR(150) NOT NULL UNIQUE,
    first_name VARCHAR(150) NOT NULL DEFAULT '',
    last_name VARCHAR(150) NOT NULL DEFAULT '',
    email VARCHAR(254) NOT NULL DEFAULT '',
    is_staff BOOLEAN NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    date_joined DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sms_enabled BOOLEAN NOT NULL DEFAULT 0,
    phone_number VARCHAR(15)
);

-- Medicines table
CREATE TABLE IF NOT EXISTS api_medicine (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    med_type VARCHAR(50) NOT NULL,
    remaining_count INTEGER NOT NULL DEFAULT 0,
    refill_threshold INTEGER NOT NULL DEFAULT 5,
    instructions TEXT,
    side_effects TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES api_user (id) ON DELETE CASCADE
);

-- Medicine Schedules table
CREATE TABLE IF NOT EXISTS api_medicineschedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medicine_id INTEGER NOT NULL,
    time_of_day VARCHAR(5) NOT NULL,
    days_of_week TEXT NOT NULL DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT 1,
    FOREIGN KEY (medicine_id) REFERENCES api_medicine (id) ON DELETE CASCADE
);

-- Medicine Intakes table
CREATE TABLE IF NOT EXISTS api_medicineintake (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medicine_id INTEGER NOT NULL,
    scheduled_time DATETIME NOT NULL,
    actual_time DATETIME,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES api_medicine (id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS api_notification (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    medicine_id VARCHAR(50),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'system',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    scheduled_for DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES api_user (id) ON DELETE CASCADE
);

-- Caregivers table
CREATE TABLE IF NOT EXISTS api_caregiver (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name VARCHAR(200) NOT NULL,
    relationship VARCHAR(100),
    phone_number VARCHAR(50),
    email VARCHAR(254),
    notifications_enabled BOOLEAN NOT NULL DEFAULT 1,
    emergency_contact BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES api_user (id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_medicine_user ON api_medicine(user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_medicine ON api_medicineschedule(medicine_id);
CREATE INDEX IF NOT EXISTS idx_intake_medicine ON api_medicineintake(medicine_id);
CREATE INDEX IF NOT EXISTS idx_intake_scheduled ON api_medicineintake(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_notification_user ON api_notification(user_id);
CREATE INDEX IF NOT EXISTS idx_caregiver_user ON api_caregiver(user_id);
