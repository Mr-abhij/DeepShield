@echo off
echo Starting SynthGuard Backend...
echo.

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Start uvicorn server
echo Starting server on http://localhost:8000
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

pause
