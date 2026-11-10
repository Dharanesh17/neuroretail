# NeuroRetail Production / Local Runner Script
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Starting NeuroRetail AI Retail Platform    " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$pythonExe = "C:\Users\Dharanesh H\AppData\Local\Programs\Python\Python312\python.exe"
if (-not (Test-Path $pythonExe)) {
    $pythonExe = "python"
}

# 1. Start Backend Server
Write-Host "`n[1/2] Launching Backend Server on port 5000..." -ForegroundColor Green
Start-Process -FilePath $pythonExe -ArgumentList "app.py" -WorkingDirectory "$PSScriptRoot\backend"

Start-Sleep -Seconds 3

# 2. Start Frontend
Write-Host "[2/2] Launching Frontend Server..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run dev" -WorkingDirectory "$PSScriptRoot\frontend"

Write-Host "`nPlatform running successfully!" -ForegroundColor Green
Write-Host "Backend API:  http://localhost:5000" -ForegroundColor Yellow
Write-Host "Frontend App: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Default Admins: admin / 263674  or  dharanesh / Admin@2024!`n" -ForegroundColor Yellow

