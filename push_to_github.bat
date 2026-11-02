@echo off
title Push to GitHub - Siamraj Service Report
echo ===================================================================
echo   SIAMRAJ SERVICE REPORT - SYNC AND PUSH TO GITHUB (RENDER CLOUD)
echo ===================================================================
echo.
cd /d "G:\My Drive\service-report-portal"

echo [1/4] Syncing latest CRM tickets from Google Drive to local cache...
python "backend\sync_crm_to_cache.py"
echo.

echo [2/4] Checking Git remote configuration...
"C:\Users\Ronnaporn\AppData\Local\Programs\Git\cmd\git.exe" remote set-url origin https://github.com/siamrajepspump-ux/service-report.git

echo [3/4] Adding updated CRM cache, backend and frontend files...
"C:\Users\Ronnaporn\AppData\Local\Programs\Git\cmd\git.exe" add data/crm_tickets_cache.csv backend/ frontend/ push_to_github.bat

"C:\Users\Ronnaporn\AppData\Local\Programs\Git\cmd\git.exe" commit -m "chore: sync CRM tickets cache to Cloud [%date% %time%]"

echo [4/4] Pushing to GitHub (Auto-deploys to Render Cloud)...
"C:\Users\Ronnaporn\AppData\Local\Programs\Git\cmd\git.exe" push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ===================================================================
    echo   [SUCCESS] Updated to GitHub and Render Cloud successfully!
    echo ===================================================================
) else (
    echo ===================================================================
    echo   [INFO] Push completed or already up to date.
    echo ===================================================================
)
echo.
pause
