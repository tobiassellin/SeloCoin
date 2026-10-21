@echo off
chcp 65001 >nul
title SeloCoin Live Server & Delningslank
echo ===================================================
echo   Startar SeloCoin ($SELO) Webbserver...
echo ===================================================
start /B node "%~dp0server.js"
echo.
echo Skapar publik HTTPS-lank som du kan skicka till din kompis...
echo (Kopiera https://....lhr.life-lanken som dyker upp nedan!)
echo.
ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -R 80:localhost:8080 nokey@localhost.run
pause

