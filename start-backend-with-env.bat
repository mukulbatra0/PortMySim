@echo off
echo Starting PortMySim backend server with environment variables...

REM Note: Most environment variables are now configured in backend/.env
REM Only setting critical ones here for immediate use

REM Set environment variables
set NODE_ENV=development

echo NODE_ENV: %NODE_ENV%
echo Note: Other environment variables loaded from backend/.env file

cd backend
node --trace-warnings server.js 