@echo off
title Beyond the Shadows - UN SDG 5 Interactive Platform
echo ==========================================================
echo Starting UN SDG 5 Interactive Platform: Beyond the Shadows...
echo Server running at: http://localhost:8080
echo Press Ctrl+C in this window to stop the server.
echo ==========================================================
powershell -ExecutionPolicy Bypass -File "%~dp0serve.ps1" 8080
pause
