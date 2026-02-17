# MongoDB Atlas Connection Test Script
# This script tests your backend API and MongoDB connection

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  MONGODB ATLAS CONNECTION TEST" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Test 1: Server Health Check
Write-Host "📊 Test 1: Server Health Check" -ForegroundColor Blue
Write-Host "URL: http://localhost:5000/api/health" -ForegroundColor Gray
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET
    Write-Host "✅ Server is healthy" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor White
    Write-Host "   Database: $($health.database)" -ForegroundColor White
    Write-Host "   Uptime: $([math]::Round($health.uptime, 2))s" -ForegroundColor White
    
    if ($health.database -eq "connected") {
        Write-Host "✅ MongoDB Atlas is CONNECTED!" -ForegroundColor Green
    } else {
        Write-Host "❌ MongoDB Atlas is NOT connected" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Failed to connect to backend server" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Make sure backend is running on port 5000" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Test 2: Register a Test User
Write-Host "👤 Test 2: Register Test User" -ForegroundColor Blue
Write-Host "URL: http://localhost:5000/api/auth/register" -ForegroundColor Gray

$testEmail = "test_$(Get-Random -Minimum 1000 -Maximum 9999)@example.com"
$body = @{
    name = "Test User"
    email = $testEmail
    password = "password123"
    role = "user"
} | ConvertTo-Json

try {
    $register = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"
    
    Write-Host "✅ User registered successfully!" -ForegroundColor Green
    Write-Host "   Email: $testEmail" -ForegroundColor White
    Write-Host "   Name: $($register.user.name)" -ForegroundColor White
    Write-Host "   Role: $($register.user.role)" -ForegroundColor White
    Write-Host "   Token: $($register.token.Substring(0, 30))..." -ForegroundColor White
    
    $token = $register.token
    
} catch {
    Write-Host "❌ Registration failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    $token = $null
}

Write-Host ""
Write-Host "────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Test 3: Login with Test User
if ($token) {
    Write-Host "🔐 Test 3: Login Test" -ForegroundColor Blue
    Write-Host "URL: http://localhost:5000/api/auth/login" -ForegroundColor Gray
    
    $loginBody = @{
        email = $testEmail
        password = "password123"
    } | ConvertTo-Json
    
    try {
        $login = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
            -Method POST `
            -Body $loginBody `
            -ContentType "application/json"
        
        Write-Host "✅ Login successful!" -ForegroundColor Green
        Write-Host "   User ID: $($login.user.id)" -ForegroundColor White
        Write-Host "   Email: $($login.user.email)" -ForegroundColor White
        Write-Host "   New Token: $($login.token.Substring(0, 30))..." -ForegroundColor White
        
        $token = $login.token
        
    } catch {
        Write-Host "❌ Login failed" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "────────────────────────────────────────────────────────────" -ForegroundColor Gray
    Write-Host ""
}

# Test 4: Get Current User (Protected Route)
if ($token) {
    Write-Host "🔒 Test 4: Protected Route Test" -ForegroundColor Blue
    Write-Host "URL: http://localhost:5000/api/auth/me" -ForegroundColor Gray
    
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $me = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" `
            -Method GET `
            -Headers $headers
        
        Write-Host "✅ Protected route access successful!" -ForegroundColor Green
        Write-Host "   User ID: $($me.user._id)" -ForegroundColor White
        Write-Host "   Name: $($me.user.name)" -ForegroundColor White
        Write-Host "   Email: $($me.user.email)" -ForegroundColor White
        Write-Host "   Role: $($me.user.role)" -ForegroundColor White
        Write-Host "   Active: $($me.user.isActive)" -ForegroundColor White
        
    } catch {
        Write-Host "❌ Protected route access failed" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Summary
Write-Host "📋 TEST SUMMARY" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ = Passed  |  ❌ = Failed" -ForegroundColor Gray
Write-Host ""
Write-Host "Check results above for details." -ForegroundColor White
Write-Host ""
Write-Host "💡 TIP: Check MongoDB Atlas dashboard to see your data:" -ForegroundColor Cyan
Write-Host "   https://cloud.mongodb.com" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
