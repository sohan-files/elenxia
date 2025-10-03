# PillPall Database Documentation

## Database Setup

The application uses **SQLite** as the database, with a Node.js + Express backend.

### Database Location
```
backend/node/pillpall.db
```

### Database Schema

#### Users Table
Stores user account information.

```sql
CREATE TABLE users (
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
```

#### Medicines Table
Stores medication information for each user.

```sql
CREATE TABLE medicines (
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
```

#### Medicine Schedules Table
Stores medication schedules (when to take each medicine).

```sql
CREATE TABLE medicine_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medicine_id INTEGER NOT NULL,
    time_of_day TEXT NOT NULL,
    days_of_week TEXT DEFAULT '[]',
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
);
```

#### Medicine Intakes Table
Tracks when medications were taken or missed.

```sql
CREATE TABLE medicine_intakes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medicine_id INTEGER NOT NULL,
    scheduled_time DATETIME NOT NULL,
    actual_time DATETIME,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
);
```

#### Notifications Table
Stores user notifications for reminders and alerts.

```sql
CREATE TABLE notifications (
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
```

#### Caregivers Table
Stores caregiver contacts for each user.

```sql
CREATE TABLE caregivers (
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
```

## Starting the Application

### Option 1: Start Backend and Frontend Together
```bash
./start.sh
```

### Option 2: Start Separately

**Backend:**
```bash
cd backend/node
npm install
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

All endpoints are prefixed with `/api`

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/user` - Get current user (requires auth)

### Medicines
- `GET /api/medicines` - List all medicines for current user
- `POST /api/medicines` - Add new medicine
- `PUT /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Delete medicine

### Medicine Intakes
- `GET /api/intakes` - List all intakes
- `POST /api/intakes` - Record medicine intake
- `PUT /api/intakes/:id` - Update intake status

### Caregivers
- `GET /api/caregivers` - List all caregivers
- `POST /api/caregivers` - Add new caregiver
- `PUT /api/caregivers/:id` - Update caregiver
- `DELETE /api/caregivers/:id` - Delete caregiver

### Notifications
- `GET /api/notifications` - List notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id` - Update notification status

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:8000/api
JWT_SECRET=your-secret-key-change-in-production
PORT=8000
```

## Database Backup

To backup the SQLite database:

```bash
cp backend/node/pillpall.db backend/node/pillpall.db.backup
```

## Database Inspection

You can inspect the database using any SQLite client or the command line:

```bash
sqlite3 backend/node/pillpall.db
```

Common SQLite commands:
- `.tables` - List all tables
- `.schema` - Show database schema
- `SELECT * FROM users;` - Query data
