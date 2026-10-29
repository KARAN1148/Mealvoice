@echo off
setlocal enabledelayedexpansion
title MealVoice Platform Launcher

:: Window styling
color 0B

echo =======================================================
echo        MealVoice Food Delivery Platform Launcher         
echo =======================================================
echo.

:: 0. Ensure working directory is the script's root folder
cd /d "%~dp0"

:: 1. Check Node.js and NPM environment
echo [1/4] Checking Node.js and NPM environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not found in system PATH!
    echo Please install Node.js v18 or higher from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Locate npm executable (npm.cmd or npm)
set "NPM_CMD=npm.cmd"
where npm.cmd >nul 2>nul
if %errorlevel% neq 0 (
    where npm >nul 2>nul
    if %errorlevel% neq 0 (
        echo [ERROR] NPM was not found in system PATH!
        echo Please ensure NPM is properly installed with Node.js.
        echo.
        pause
        exit /b 1
    ) else (
        set "NPM_CMD=npm"
    )
)

for /f "tokens=*" %%v in ('node -v 2^>nul') do set NODE_VER=%%v
for /f "tokens=*" %%v in ('!NPM_CMD! -v 2^>nul') do set NPM_VER=%%v
echo [OK] Node.js Version : %NODE_VER%
echo [OK] NPM Version     : %NPM_VER%
echo.

:: 2. Terminate existing processes on target ports (5000 and 3000)
echo [INFO] Checking ports 5000 and 3000 for previous instances...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":5000[ ]" 2^>nul') do (
    if not "%%a"=="" if not "%%a"=="0" taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":3000[ ]" 2^>nul') do (
    if not "%%a"=="" if not "%%a"=="0" taskkill /F /PID %%a >nul 2>&1
)
echo [OK] Target ports 5000 and 3000 ready.
echo.

:: 3. Setup Backend Service
echo [2/4] Setting up Backend Service...
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
        echo [ERROR] Backend npm install failed! Please check your network or npm setup.
        pause
        exit /b 1
    )
    echo [OK] Backend dependencies installed successfully.
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
    echo [OK] Backend .env file created.
)

set SEED_NEEDED=0
if not exist "prisma\dev.db" (
    set SEED_NEEDED=1
)

echo [INFO] Syncing database schema and Prisma client...
call !NPM_CMD! run prisma:db:push -- --skip-generate >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Retrying db push directly via npx...
    call npx.cmd prisma db push --skip-generate
)

call !NPM_CMD! run prisma:generate >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Retrying prisma generate...
    timeout /t 2 >nul
    call npx.cmd prisma generate
)

if "!SEED_NEEDED!"=="1" (
    echo [INFO] Seeding database with initial platform data...
    call !NPM_CMD! run seed
    if %errorlevel% neq 0 (
        echo [WARNING] Database seeding completed with warnings.
    ) else (
        echo [OK] Database seeded successfully.
    )
)

cd /d "%~dp0"
echo.

:: 4. Setup Frontend Service
echo [3/4] Setting up Frontend Service...
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
        echo [ERROR] Frontend npm install failed! Please check your network or npm setup.
        pause
        exit /b 1
    )
    echo [OK] Frontend dependencies installed successfully.
) else (
    echo [OK] Frontend dependencies verified.
)

cd /d "%~dp0"
echo.

:: 5. Launch Backend and Frontend Servers
echo [4/4] Starting Development Servers...
echo Starting Backend API on http://localhost:5000 ...
start "MealVoice - Backend API" /D "%~dp0backend" cmd /k !NPM_CMD! run dev

echo Starting Frontend App on http://localhost:3000 ...
start "MealVoice - Frontend App" /D "%~dp0frontend" cmd /k !NPM_CMD! run dev

echo.
echo =======================================================
echo   🚀 MealVoice Food Delivery Platform is Live!
echo   - Frontend App  : http://localhost:3000
echo   - Backend API   : http://localhost:5000
echo   - Health Check  : http://localhost:5000/api/health
echo =======================================================
echo.
echo Launching default browser in 5 seconds...
timeout /t 5 /nobreak >nul 2>&1
start http://localhost:3000

echo.
echo [INFO] Services are actively running in separate windows.
echo [INFO] Press any key in this window to stop all servers and exit...
pause >nul

echo.
echo [INFO] Shutting down MealVoice services...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":5000[ ]" 2^>nul') do (
    if not "%%a"=="" if not "%%a"=="0" taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":3000[ ]" 2^>nul') do (
    if not "%%a"=="" if not "%%a"=="0" taskkill /F /PID %%a >nul 2>&1
)
echo [OK] All MealVoice servers stopped cleanly.
timeout /t 2 >nul
exit /b 0
