# Front Desk Agent Test Script
# Usage: .\test-front-desk-agent.ps1 "Your message here" [session-id]

param(
    [Parameter(Mandatory=$true)]
    [string]$Message,
    
    [Parameter(Mandatory=$false)]
    [string]$SessionId = "test-session-$(Get-Date -Format 'yyyyMMddHHmmss')",
    
    [Parameter(Mandatory=$false)]
    [string]$Language = "es"
)

Write-Host "Testing Front Desk Agent..." -ForegroundColor Green
Write-Host "Message: $Message" -ForegroundColor Yellow
Write-Host "Session ID: $SessionId" -ForegroundColor Yellow

try {
    $body = @{
        message = $Message
        context = @{
            sessionId = $SessionId
            language = $Language
        }
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://localhost:3007/api/agents/front-desk" -Method POST -ContentType "application/json" -Body $body
    $responseData = $response.Content | ConvertFrom-Json
    
    Write-Host "`nResponse:" -ForegroundColor Cyan
    Write-Host "Agent: $($responseData.agent)" -ForegroundColor White
    Write-Host "Status: $($responseData.status)" -ForegroundColor White
    Write-Host "Agent Response: $($responseData.conversation.agentResponse)" -ForegroundColor White
    Write-Host "Objective: $($responseData.conversation.objective)" -ForegroundColor White
    Write-Host "Target Agent: $($responseData.conversation.targetAgent)" -ForegroundColor White
    Write-Host "Confidence: $($responseData.conversation.confidence)" -ForegroundColor White
    Write-Host "Is Complete: $($responseData.conversation.isComplete)" -ForegroundColor White
    
    if ($responseData.conversation.collectedInfo.Count -gt 0) {
        Write-Host "Collected Info:" -ForegroundColor White
        $responseData.conversation.collectedInfo.PSObject.Properties | ForEach-Object {
            Write-Host "  $($_.Name): $($_.Value)" -ForegroundColor Gray
        }
    }
    
    if ($responseData.conversation.missingInfo.Count -gt 0) {
        Write-Host "Missing Info: $($responseData.conversation.missingInfo -join ', ')" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}