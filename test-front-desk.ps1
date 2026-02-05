# Test script for Front Desk Agent
Write-Host "Testing Front Desk Agent..." -ForegroundColor Green

# Test 1: Video creation request
Write-Host "`nTest 1: Video creation request" -ForegroundColor Yellow
$body = @{
    message = "Quiero un video corto para TikTok sobre mi producto nuevo"
    context = @{
        sessionId = "test-session-1"
        language = "es"
    }
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3007/api/agents/front-desk" -Method POST -ContentType "application/json" -Body $body
Write-Host "Response:" -ForegroundColor Cyan
Write-Host $response.Content

# Test 2: Social media post request
Write-Host "`nTest 2: Social media post request" -ForegroundColor Yellow
$body = @{
    message = "Quiero programar una publicación para Instagram sobre mi nuevo servicio"
    context = @{
        sessionId = "test-session-2"
        language = "es"
    }
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3007/api/agents/front-desk" -Method POST -ContentType "application/json" -Body $body
Write-Host "Response:" -ForegroundColor Cyan
Write-Host $response.Content

# Test 3: Trend analysis request
Write-Host "`nTest 3: Trend analysis request" -ForegroundColor Yellow
$body = @{
    message = "Necesito analizar las tendencias actuales en Twitter"
    context = @{
        sessionId = "test-session-3"
        language = "es"
    }
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3007/api/agents/front-desk" -Method POST -ContentType "application/json" -Body $body
Write-Host "Response:" -ForegroundColor Cyan
Write-Host $response.Content

Write-Host "`nTesting complete!" -ForegroundColor Green