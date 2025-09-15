@echo off
echo Starting AUB Thesis Dashboard Server...
echo.

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python not found! Please install Python 3.6 or later.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

:: Kill any existing Python servers
taskkill /F /IM python.exe >nul 2>&1

:: Start the server
echo Launching server at http://localhost:9090/dashboard/
echo.
echo NOTE: If you see 'Directory listing denied' message, please add /dashboard/ to the URL.
echo.

start "" http://localhost:9090/dashboard/

:: Run the server
python enhanced_server.py

pause