# NeuroRetail — Start both servers
# Run from the project root: .\start.ps1

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== NeuroRetail Startup ===" -ForegroundColor Cyan
Write-Host ""

# 1) Start backend in a new window
Write-Host "Starting Flask backend on http://localhost:5000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; python app.py"

# Give the backend 3 seconds to initialize
Start-Sleep -Seconds 3

# 2) Start frontend in a new window
Write-Host "Starting Vite frontend on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

Write-Host ""
Write-Host "Both servers are starting in separate windows." -ForegroundColor Green
Write-Host "Open http://localhost:5173 in your browser." -ForegroundColor Green
Write-Host ""
Write-Host "Admin credentials:" -ForegroundColor Cyan
Write-Host "  Username: admin    Password: 263674" -ForegroundColor White
Write-Host "  Username: dharanesh    Password: Admin@2024!" -ForegroundColor White

