@echo off
echo Testing login API with Node.js...
node test-api.js
echo.
echo Testing login API with curl...
curl -X POST -H "Content-Type: application/json" -d "{\"email\":\"demo@example.com\",\"password\":\"Password123\"}" http://localhost:5000/api/auth/login
echo.
echo Done. 