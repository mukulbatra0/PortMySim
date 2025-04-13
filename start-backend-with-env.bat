@echo off
echo Setting environment variables and starting PortMySim backend server...

REM Set environment variables
set JWT_SECRET=portmysim_secure_jwt_secret_key_2023
set JWT_EXPIRE=30d
set NODE_ENV=development
set DISABLE_EMAIL_SENDING=true

echo Using JWT_SECRET: %JWT_SECRET%
echo Using JWT_EXPIRE: %JWT_EXPIRE%
echo NODE_ENV: %NODE_ENV%

cd backend
node --trace-warnings server.js 