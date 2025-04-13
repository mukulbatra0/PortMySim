@echo off
echo Testing JWT token generation and verification...

REM Set environment variables
set JWT_SECRET=portmysim_secure_jwt_secret_key_2023
set JWT_EXPIRE=30d

echo Using JWT_SECRET: %JWT_SECRET%
echo Using JWT_EXPIRE: %JWT_EXPIRE%

cd backend
node --experimental-json-modules ..\test-jwt.js

echo.
echo Test complete. 