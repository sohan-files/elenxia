# PillPall

PillPall is a full-stack application designed to help users manage their medication schedules and improve adherence. It features a React frontend and a Node.js backend with SQLite database.

## Features

- **Medication Management:** Add, edit, and delete medications from your schedule
- **Schedule Tracking:** Set up medication schedules with specific times and days
- **Intake Tracking:** Record when medications are taken, missed, or skipped
- **Compliance Dashboard:** Track your medication adherence over time
- **Caregiver Panel:** Add and manage caregiver contacts
- **Notifications:** Receive reminders for medications
- **OCR Scanner:** Scan prescription labels to quickly add medications

## Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, shadcn-ui
- **Backend:** Node.js, Express
- **Database:** SQLite
- **Authentication:** JWT

## Getting Started

### Prerequisites

- Node.js (v18 or later)

### Quick Start

The easiest way to run the application:

```bash
./start.sh
```

This will start both the backend API server and the frontend development server.

### Manual Setup

#### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend/node
npm install

# Install frontend dependencies
cd ../../frontend
npm install
```

#### 2. Start Backend Server

```bash
cd backend/node
npm start
```

The backend API will run on `http://localhost:8000`

#### 3. Start Frontend Server

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Database

The application uses SQLite for data persistence. The database file is automatically created at:

```
backend/node/pillpall.db
```

See [DATABASE.md](DATABASE.md) for detailed schema documentation and API endpoints.

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:8000/api
JWT_SECRET=your-secret-key-change-in-production
PORT=8000
```

## API Documentation

All API endpoints are documented in [DATABASE.md](DATABASE.md).

Base URL: `http://localhost:8000/api`

### Available Endpoints:

- **Authentication:** `/auth/register`, `/auth/login`, `/auth/user`
- **Medicines:** `/medicines` (GET, POST, PUT, DELETE)
- **Intakes:** `/intakes` (GET, POST, PUT)
- **Caregivers:** `/caregivers` (GET, POST, PUT, DELETE)
- **Notifications:** `/notifications` (GET, POST, PUT)

## Building for Production

```bash
npm run build
```

The built files will be in `frontend/dist/`

## Project Structure

```
PillPall/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/          # Utilities and API client
│   │   └── pages/        # Page components
│   └── package.json
├── backend/
│   └── node/             # Node.js + Express backend
│       ├── src/
│       │   ├── server.js    # Main server file
│       │   ├── database.js  # SQLite database setup
│       │   ├── auth.js      # Authentication logic
│       │   └── api.js       # API routes
│       └── package.json
├── DATABASE.md           # Database documentation
└── start.sh             # Startup script

```

## License

MIT
