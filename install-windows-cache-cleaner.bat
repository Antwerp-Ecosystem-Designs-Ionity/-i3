@echo off
:: ====================================================================
:: ƐÏ3 Browser & AI Cache Cleaner - Windows Installer Batch Script
:: IONITY (PTY) LTD | Centurion, South Africa
:: Author: Johan Wilhelm van Antwerp and R1 DS
:: ====================================================================

title ƐÏ3 Browser & AI Cache Cleaner Setup

echo.
echo ====================================================================
echo  Installing ƐÏ3 Browser & AI Cache Cleaner for Windows
echo  IONITY (PTY) LTD - ANYTHING IS POSSIBLE WITH GOD
echo ====================================================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is required to build/run ƐÏ3 Browser.
    echo Please install Node.js (v18+) from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/3] Installing NPM dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install npm dependencies.
    pause
    exit /b 1
)

echo.
echo [2/3] Building Windows Installer and Portable Executable...
call npm run build:win-installer

echo.
echo [3/3] Setting up Windows Desktop Shortcut & Environment...
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\windows-setup.ps1"

echo.
echo ====================================================================
echo  Installation & Setup Complete!
echo  To start ƐÏ3 Browser with AI Cache Cleaner, run: npm start
echo ====================================================================
echo.
pause
