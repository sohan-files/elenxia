# PillPall

PillPall is a full-stack application designed to help users manage their medication schedules and improve adherence. It features a React frontend, a Django backend, and a Node.js service for sending SMS reminders.

## Features

-   **Medication Management:** Add, edit, and delete medications from your schedule.
-   **Compliance Dashboard:** Track your medication adherence over time.
-   **Automated SMS Reminders:** Receive SMS notifications to remind you to take your medication (requires Twilio configuration).
-   **Caregiver Panel:** (Future feature) Allow caregivers to monitor and manage medication schedules.

## Tech Stack

-   **Frontend:** React, Vite, TypeScript, Tailwind CSS, shadcn-ui
-   **Backend:** Django, Django REST Framework
-   **SMS Service:** Node.js, Express, Twilio
-   **Database:** SQLite (default)

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [Python](https://www.python.org/) (v3.10 or later)
-   `pip` and `venv` for Python package management

### 1. Frontend Setup

The frontend is a React application built with Vite.

```sh
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### 2. Backend Setup

The backend is a Django application.

```sh
# Navigate to the Django project directory
cd backend/django

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# Run the Django development server
python manage.py runserver
```

The Django API will be available at `http://localhost:8000`.

### 3. SMS Notification Server (Optional)

The application can send SMS reminders using a Node.js server and the Twilio service. This part is optional. If you do not run this server, the rest of the application will still work, but no SMS messages will be sent.

```sh
# Navigate to the Node.js server directory
cd backend/node

# Install dependencies
npm install
```

#### Configuration

To send SMS messages, you need a Twilio account.

1.  Create a `.env` file in the `backend/node` directory.
2.  Add your Twilio credentials to the `.env` file in the following format:

    ```
    TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    TWILIO_AUTH_TOKEN=your_auth_token
    TWILIO_FROM=+15551234567
    ```

    -   `TWILIO_ACCOUNT_SID`: Your Twilio Account SID.
    -   `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token.
    -   `TWILIO_FROM`: Your Twilio phone number.

#### Running the SMS Server

```sh
# Start the server
npm run start
```

The SMS server will run on port `8787`. If you do not provide the `.env` file, the server will still run but will print a warning and will not send any messages.

## Running the Full Application

To run the complete application, you will need to have three terminals open:

1.  **Terminal 1 (Frontend):** `cd frontend && npm run dev`
2.  **Terminal 2 (Backend):** `cd backend/django && python manage.py runserver`
3.  **Terminal 3 (SMS Server):** `cd backend/node && npm run start`

## License

MIT
