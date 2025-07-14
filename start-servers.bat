@echo off
echo Starting CMS Backend Servers for Testing...
echo.

echo Starting Server 1 on port 5000...
start "Server 5000" cmd /k "cd backend && node start-server.js 5000"

echo Starting Server 2 on port 5001...
start "Server 5001" cmd /k "cd backend && node start-server.js 5001"

echo.
echo ✅ Both servers started!
echo.
echo 📡 Server 1: http://localhost:5000
echo 📡 Server 2: http://localhost:5001
echo.
echo 💡 To test with different ports:
echo    - Frontend 1: http://localhost:5173 (connect to port 5000)
echo    - Frontend 2: http://localhost:5174 (connect to port 5001)
echo.
echo 🚀 You can now test user and admin features simultaneously!
pause 