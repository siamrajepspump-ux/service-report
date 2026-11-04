@echo off
chcp 65001 >nul
title Sync Tickets to GitHub - Siamraj Service Report
echo ===================================================================
echo   SIAMRAJ SERVICE REPORT - SYNC TICKETS TO CLOUD (RENDER)
echo ===================================================================
echo.

cd /d "G:\My Drive\service-report-portal"

set "PYTHON_EXE=C:\Users\Ronnaporn\AppData\Local\Programs\Python\Python314\python.exe"
if not exist "%PYTHON_EXE%" set "PYTHON_EXE=python"

set "GIT_EXE=C:\Users\Ronnaporn\AppData\Local\Programs\Git\cmd\git.exe"
if not exist "%GIT_EXE%" set "GIT_EXE=git"

echo [1/4] Syncing latest CRM tickets from Google Drive...
"%PYTHON_EXE%" "backend\sync_crm_to_cache.py"
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Python sync script returned error code %ERRORLEVEL%
)
echo.

echo [2/4] Checking Git remote configuration...
"%GIT_EXE%" remote set-url origin https://github.com/siamrajepspump-ux/service-report.git
echo.

echo [3/4] Staging updated CRM tickets and files...
"%GIT_EXE%" add data/crm_tickets_cache.csv backend/ frontend/ .gitignore push_to_github.bat

"%GIT_EXE%" diff --cached --quiet
if %ERRORLEVEL% NEQ 0 (
    echo Committing latest ticket updates...
    "%GIT_EXE%" commit -m "chore: sync CRM tickets cache to Cloud [%date% %time%]"
) else (
    echo [INFO] No new changes to commit in tickets cache.
)
echo.

echo [4/4] Pushing to GitHub (Render auto-build starts immediately)...
"%GIT_EXE%" push -u origin main
echo.

if %ERRORLEVEL% EQU 0 (
    echo ===================================================================
    echo   [SUCCESS] Sync and Push to GitHub complete!
    echo   Render Cloud is updating with latest tickets...
    echo ===================================================================
) else (
    echo ===================================================================
    echo   [INFO] Push completed or branch is already up-to-date.
    echo ===================================================================
)
echo.
pause
