# Test script for improved Front Desk Agent conversation flow
Write-Host "Testing Improved Front Desk Agent conversation flow..." -ForegroundColor Green

# Test session ID
$sessionId = "improved-test-$(Get-Date -Format 'yyyyMMddHHmmss')"

# Step 1: Initial request
Write-Host "`nStep 1: Initial request - 'quiero hacer un video'" -ForegroundColor Yellow
$body = @{
    message = "quiero hacer un video"
    context = @{
        sessionId = $sessionId
        language = "es"
    }
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3007/api/agents/front-desk" -Method POST -ContentType "application/json" -Body $body
$responseData = $response.Content | ConvertFrom-Json
Write-Host "Agent Response: $($responseData.conversation.agentResponse)" -ForegroundColor Cyan
Write-Host "Missing Info: $($responseData.conversation.missingInfo -join ', ')" -ForegroundColor Gray

# Step 2: Provide platform
Write-Host "`nStep 2: Provide platform - 'instagram'" -ForegroundColor Yellow
$body = @{
    message = "instagram"
    context = @{
        sessionId = $sessionId
        language = "es"
    }
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3007/api/agents/front-desk" -Method POST -ContentType "application/json" -Body $body
$responseData = $response.Content | ConvertFrom-Json
Write-Host "Agent Response: $($responseData.conversation.agentResponse)" -ForegroundColor Cyan
Write-Host "Missing Info: $($responseData.conversation.missingInfo -join ', ')" -ForegroundColor Gray

# Step 3: Provide topic
Write-Host "`nStep 3: Provide topic - 'gatos con forma humana'" -ForegroundColor Yellow
$body = @{
    message = "gatos con forma humana"
    context = @{
        sessionId = $sessionId
        language = "es"
    }
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3007/api/agents/front-desk" -Method POST -ContentType "application/json" -Body $body
$responseData = $response.Content | ConvertFrom-Json
Write-Host "Agent Response: $($responseData.conversation.agentResponse)" -ForegroundColor Cyan
Write-Host "Missing Info: $($responseData.conversation.missingInfo -join ', ')" -ForegroundColor Gray

# Step 4: Provide duration
Write-Host "`nStep 4: Provide duration - '30 segundos'" -ForegroundColor Yellow
$body = @{
    message = "30 segundos"
    context = @{
        sessionId = $sessionId
        language = "es"
    }
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3007/api/agents/front-desk" -Method POST -ContentType "application/json" -Body $body
$responseData = $response.Content | ConvertFrom-Json
Write-Host "Agent Response: $($responseData.conversation.agentResponse)" -ForegroundColor Cyan
Write-Host "Status: $($responseData.status)" -ForegroundColor Gray
Write-Host "Target Agent: $($responseData.conversation.targetAgent)" -ForegroundColor Gray

if ($responseData.status -eq "ready") {
    Write-Host "`n✅ Conversation completed successfully!" -ForegroundColor Green
    Write-Host "🎉 The Front Desk Agent is now properly tracking conversation flow!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Conversation did not complete as expected" -ForegroundColor Red
}

Write-Host "`nTesting complete!" -ForegroundColor Green