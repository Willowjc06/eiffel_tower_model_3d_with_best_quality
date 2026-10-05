@echo off
title Eiffel Tower 3D Interactive Website
echo ==========================================================
echo Starting Eiffel Tower 3D Interactive Experience...
echo ==========================================================
powershell -ExecutionPolicy Bypass -File "%~dp0serve.ps1" 8080
pause
