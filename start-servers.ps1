Write-Host "Starting CMS Backend Servers for Testing..." -ForegroundColor Green
Write-Host ""

Write-Host "Starting Server 1 on port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; node start-server.js 5000" -WindowStyle Normal

Write-Host "Starting Server 2 on port 5001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; node start-server.js 5001" -WindowStyle Normal

Write-Host ""
Write-Host "✅ Both servers started!" -ForegroundColor Green
Write-Host ""
Write-Host "📡 Server 1: http://localhost:5000" -ForegroundColor Cyan
Write-Host "📡 Server 2: http://localhost:5001" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 To test with different ports:" -ForegroundColor Magenta
Write-Host "   - Frontend 1: http://localhost:5173 (connect to port 5000)" -ForegroundColor White
Write-Host "   - Frontend 2: http://localhost:5174 (connect to port 5001)" -ForegroundColor White
Write-Host ""
Write-Host "🚀 You can now test user and admin features simultaneously!" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to continue..." 