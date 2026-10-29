@echo off
setlocal enabledelayedexpansion
title MealVoice Platform Launcher

:: Window styling (Cyan text on Black)
color 0B

echo =======================================================
echo        MealVoice Food Delivery Platform Launcher         
echo =======================================================
echo.

:: 0. Ensure working directory is the script folder
cd /d "%~dp0"

:: 1. Check Node.js and NPM environment
echo [1/5] Checking Node.js and NPM environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not found in system PATH!
    echo Please install Node.js v18 or higher from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Locate npm command executable
set "NPM_CMD=npm.cmd"
where npm.cmd >nul 2>nul
if %errorlevel% neq 0 (
    set "NPM_CMD=npm"
)

for /f "tokens=*" %%v in ('node -v 2^>nul') do set NODE_VER=%%v
for /f "tokens=*" %%v in ('!NPM_CMD! -v 2^>nul') do set NPM_VER=%%v
echo [OK] Node.js Version : %NODE_VER%
echo [OK] NPM Version     : %NPM_VER%
echo.

:: 2. Terminate existing processes on target ports (5000 and 3000)
echo [2/5] Cleaning port conflicts on ports 5000 and 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000 " 2^>nul') do (
    if not "%%a"=="" if not "%%a"=="0" taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 " 2^>nul') do (
    if not "%%a"=="" if not "%%a"=="0" taskkill /F /PID %%a >nul 2>&1
)
echo [OK] Ports 5000 and 3000 ready.
echo.

:: 3. Setup Backend Service & Database
echo [3/5] Setting up Backend Service and Database...
if not exist "%~dp0backend" (
    echo [ERROR] Backend folder not found at "%~dp0backend"!
    pause
    exit /b 1
)
cd /d "%~dp0backend"

if not exist "node_modules" (
    echo [INFO] Installing backend dependencies...
    call !NPM_CMD! install
    if %errorlevel% neq 0 (
        echo [ERROR] Backend npm install failed!
        pause
        exit /b 1
    )
    echo [OK] Backend dependencies installed.
) else (
    echo [OK] Backend dependencies verified.
)

if not exist ".env" (
    echo [INFO] Creating default backend .env file...
    (
        echo PORT=5000
        echo DATABASE_URL="file:./dev.db"
        echo JWT_SECRET="mealvoice_super_secret_jwt_key_2026"
        echo NODE_ENV="development"
    ) > .env
    echo [OK] Backend .env file configured.
)

set SEED_NEEDED=0
if not exist "prisma\dev.db" (
    set SEED_NEEDED=1
)
if "%1"=="--seed" (
    set SEED_NEEDED=1
)

echo [INFO] Syncing Prisma database schema...
if exist "node_modules\.bin\prisma.cmd" (
    call "node_modules\.bin\prisma.cmd" db push --skip-generate >nul 2>&1
    call "node_modules\.bin\prisma.cmd" generate >nul 2>&1
) else (
    call !NPM_CMD! run prisma:db:push -- --skip-generate >nul 2>&1
    call !NPM_CMD! run prisma:generate >nul 2>&1
)
echo [OK] Prisma Client ready.

if "!SEED_NEEDED!"=="1" (
    echo [INFO] Seeding database with initial platform data...
    call !NPM_CMD! run seed
    echo [OK] Database seeded.
)

cd /d "%~dp0"
echo.

:: 4. Setup Frontend Service
echo [4/5] Setting up Frontend Service...
if not exist "%~dp0frontend" (
    echo [ERROR] Frontend folder not found at "%~dp0frontend"!
    pause
    exit /b 1
)
cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo [INFO] Installing frontend dependencies...
    call !NPM_CMD! install
    if %errorlevel% neq 0 (
        echo [ERROR] Frontend npm install failed!
        pause
        exit /b 1
    )
    echo [OK] Frontend dependencies installed.
) else (
    echo [OK] Frontend dependencies verified.
)

cd /d "%~dp0"
echo.

:: 5. Launch Backend and Frontend Servers
echo [5/5] Launching MealVoice Services...
echo - Starting Backend API on http://localhost:5000 ...
start "MealVoice - Backend API" /D "%~dp0backend" cmd /k !NPM_CMD! run dev

echo - Starting Frontend App on http://localhost:3000 ...
start "MealVoice - Frontend App" /D "%~dp0frontend" cmd /k !NPM_CMD! run dev

echo.
echo =======================================================
echo   🚀 MealVoice Food Delivery Platform is Live!
echo =======================================================
echo   Customer Web Portal  : http://localhost:3000
echo   Easy Voice Order     : http://localhost:3000/easy-order
echo   Call Agent Console   : http://localhost:3000/agent
echo   Kitchen Admin (KDS)  : http://localhost:3000/restaurant
echo   Delivery Rider App   : http://localhost:3000/rider
echo   Operations Command   : http://localhost:3000/admin
echo   Backend REST API     : http://localhost:5000/api
echo   Health Check Endpoint: http://localhost:5000/api/health
echo =======================================================
echo.
echo Launching web browser...
ping 127.0.0.1 -n 4 >nul
start http://localhost:3000

echo.
echo [INFO] Servers are actively running in separate windows.
echo [INFO] Press any key in this window to stop all servers and exit...
pause >nul

echo.
echo [INFO] Shutting down MealVoice services...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000 " 2^>nul') do (
    if not "%%a"=="" if not "%%a"=="0" taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 " 2^>nul') do (
    if not "%%a"=="" if not "%%a"=="0" taskkill /F /PID %%a >nul 2>&1
)
echo [OK] All MealVoice servers stopped cleanly.
ping 127.0.0.1 -n 2 >nul
exit /b 0
