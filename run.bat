@echo off
setlocal

REM Start Django backend on all interfaces
start "PillPall Backend" cmd /k "backend\django\.venv\Scripts\python backend\django\manage.py runserver 0.0.0.0:8000"

REM Start Frontend
start "PillPall Frontend" cmd /k "cd frontend && npm run dev"

REM Show your local IP for phone access
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do set IP=%%a
echo Open http://%IP:~1%:8000 for backend and http://%IP:~1%:8080 for frontend on your phone.

endlocal