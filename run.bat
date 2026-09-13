@echo off
setlocal enabledelayedexpansion
title MealVoice Platform Launcher

echo ===================================================
echo     MealVoice Food Delivery Platform Launcher   
echo ===================================================
echo.

:: Ensure working directory is the script's folder
cd /d "%~dp0"

:: 1. Check Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please download and install Node.js from https://nodejs.org/
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo [1/4] Checking Node.js environment...
call node -v
call npm -v
echo.

:: Clear potential port locks (Port 5000 & 3000) from previous runs
echo [INFO] Cleaning up any previous running server processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: 2. Check & Install Backend Dependencies
echo [2/4] Setting up Backend...
cd /d "%~dp0backend"

if not exist "node_modules" (
    echo [INFO] node_modules not found in backend. Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install backend dependencies!
        pause
        exit /b 1
    )
) else (
    echo [INFO] Backend dependencies verified.
)

if not exist ".env" (
    echo [INFO] Creating backend .env file...
    (
        echo PORT=5000
        echo DATABASE_URL="file:./dev.db"
        echo JWT_SECRET="mealvoice_super_secret_jwt_key_2026"
        echo NODE_ENV="development"
    ) > .env
)

set SEED_NEEDED=0
if not exist "prisma\dev.db" (
    set SEED_NEEDED=1
)

echo [INFO] Generating Prisma Client and Syncing Database...
call npx prisma db push --skip-generate
call npx prisma generate
if %errorlevel% neq 0 (
    echo [WARNING] Prisma generate encountered an issue. Retrying...
    ping 127.0.0.1 -n 2 >nul
    call npx prisma generate
)

if "!SEED_NEEDED!"=="1" (
    echo [INFO] Seeding initial database records...
    call npm run seed
)

cd /d "%~dp0"
echo.

:: 3. Check & Install Frontend Dependencies
echo [3/4] Setting up Frontend...
cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo [INFO] node_modules not found in frontend. Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install frontend dependencies!
        pause
        exit /b 1
    )
) else (
    echo [INFO] Frontend dependencies verified.
)

cd /d "%~dp0"
echo.

:: 4. Launch Servers and Open Localhost
echo [4/4] Launching Servers...
echo Launching Backend API on http://localhost:5000 ...
start "MealVoice - Backend API" /D "%~dp0backend" cmd /k npm run dev

echo Launching Frontend App on http://localhost:3000 ...
start "MealVoice - Frontend App" /D "%~dp0frontend" cmd /k npm run dev

echo.
echo ===================================================
echo  Services started successfully!
echo  Opening http://localhost:3000 in your browser...
echo ===================================================
echo.

ping 127.0.0.1 -n 4 >nul
start http://localhost:3000

exit /b 0
