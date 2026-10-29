@echo off
chcp 65001 >nul
title Siamraj Service Report
echo ===================================================================
echo   SIAMRAJ SERVICE REPORT - STARTING
echo ===================================================================
cd /d "%~dp0"
python run_portal.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] An error occurred while starting the portal.
    echo.
    pause
)
