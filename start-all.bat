@echo off
echo ========================================
echo   FleetFlow - Starting All Services
echo ========================================
echo.

REM Kill any existing processes
echo Stopping existing processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
timeout /t 2 >nul

echo.
echo Starting Backend Server...
start "FleetFlow Backend" cmd /k "cd /d  "%~dp0backend" && npm start"
timeout /t 3 >nul

echo Starting AI Microservice...
start "FleetFlow AI Service" cmd /k "cd /d "%~dp0ai-service" && python app.py"
timeout /t 2 >nul

echo Starting Frontend...
start "FleetFlow Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ========================================
echo   All services are starting...
echo ========================================
echo.
echo   Backend:  http://localhost:5000
echo   AI Service: http://localhost:5001
echo   Frontend:   http://localhost:5173
echo.
echo   Login: manager@fleetflow.com
echo   Password: password123
echo.
echo ========================================
timeout /t 5 >nul
start http://localhost:5173
