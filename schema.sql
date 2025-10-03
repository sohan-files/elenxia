-- PillPall Database Schema
-- SQLite Database for Medication Management Application

-- Users Table
-- Stores user account information with authentication details
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    first_name TEXT DEFAULT '',
    last_name TEXT DEFAULT '',
    phone_number TEXT,
    sms_enabled INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Medicines Table
-- Stores medication information for each user
CREATE TABLE IF NOT EXISTS medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    med_type TEXT NOT NULL,
    remaining_count INTEGER DEFAULT 0,
    refill_threshold INTEGER DEFAULT 5,
    instructions TEXT,
    side_effects TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Medicine Schedules Table
-- Stores medication schedules (when to take each medicine)
CREATE TABLE IF NOT EXISTS medicine_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medicine_id INTEGER NOT NULL,
    time_of_day TEXT NOT NULL,
    days_of_week TEXT DEFAULT '[]',
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
);

-- Medicine Intakes Table
-- Tracks when medications were taken or missed
CREATE TABLE IF NOT EXISTS medicine_intakes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medicine_id INTEGER NOT NULL,
    scheduled_time DATETIME NOT NULL,
    actual_time DATETIME,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
);

-- Notifications Table
-- Stores user notifications for reminders and alerts
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    medicine_id TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'system',
    status TEXT DEFAULT 'pending',
    scheduled_for DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Caregivers Table
-- Stores caregiver contacts for each user
CREATE TABLE IF NOT EXISTS caregivers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    relationship TEXT,
    phone_number TEXT,
    email TEXT,
    notifications_enabled INTEGER DEFAULT 1,
    emergency_contact INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_medicines_user ON medicines(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_medicine ON medicine_schedules(medicine_id);
CREATE INDEX IF NOT EXISTS idx_intakes_medicine ON medicine_intakes(medicine_id);
CREATE INDEX IF NOT EXISTS idx_intakes_scheduled ON medicine_intakes(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_caregivers_user ON caregivers(user_id);
