@echo off
:repeat
cls
node --trace-deprecation ./src/client.js
goto repeat