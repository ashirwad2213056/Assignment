# Event Management Application - Quick Start Script
# Run this script to start both backend and frontend servers

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  EVENT MANAGEMENT APPLICATION - QUICK START" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB is running
Write-Host "📊 Checking MongoDB status..." -ForegroundColor Blue
$mongoRunning = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
if ($mongoRunning -and $mongoRunning.Status -eq 'Running') {
    Write-Host "✅ MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  MongoDB is not running" -ForegroundColor Yellow
    Write-Host "   Starting MongoDB..." -ForegroundColor Yellow
    try {
        Start-Service -Name MongoDB -ErrorAction Stop
        Write-Host "✅ MongoDB started successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Could not start MongoDB service" -ForegroundColor Red
        Write-Host "   Please start MongoDB manually:" -ForegroundColor Yellow
        Write-Host "   Option 1: Run 'mongod' in a separate terminal" -ForegroundColor White
        Write-Host "   Option 2: Use MongoDB Atlas (cloud)" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Start Backend Server
Write-Host "🚀 Starting Backend Server..." -ForegroundColor Blue
Write-Host "   Location: http://localhost:5000" -ForegroundColor White
Write-Host ""
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev"
Start-Sleep -Seconds 2

# Start Frontend Server
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Blue
Write-Host "   Location: http://localhost:3000" -ForegroundColor White
Write-Host ""
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev"

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Both servers are starting in separate windows!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📌 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Wait for both servers to start (check the new windows)" -ForegroundColor White
Write-Host "   2. Open your browser to: http://localhost:3000" -ForegroundColor White
Write-Host "   3. You should see the Event Management homepage!" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: Keep both terminal windows open while developing" -ForegroundColor Cyan
Write-Host ""

# Wait for user
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
