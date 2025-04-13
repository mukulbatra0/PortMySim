@echo off
echo Testing login API with environment variables set...

REM Set environment variables
set JWT_SECRET=portmysim_secure_jwt_secret_key_2023
set JWT_EXPIRE=30d
set NODE_ENV=development

echo Using JWT_SECRET: %JWT_SECRET%
echo Using JWT_EXPIRE: %JWT_EXPIRE%
echo Using NODE_ENV: %NODE_ENV%

REM Test with curl
echo.
echo Testing login API with curl...
curl -X POST -H "Content-Type: application/json" -d "{\"email\":\"demo@example.com\",\"password\":\"Password123\"}" http://localhost:5000/api/auth/login

echo.
echo Done. 