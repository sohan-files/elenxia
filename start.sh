#!/bin/bash

echo "Starting PillPall Application..."
echo ""
echo "✓ SQLite database location: backend/node/pillpall.db"
echo "✓ Backend API: http://localhost:8000"
echo "✓ Frontend: http://localhost:5173"
echo ""

cd "$(dirname "$0")/backend/node"
npm start &
BACKEND_PID=$!

cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT

wait
