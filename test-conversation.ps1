# Test script for Front Desk Agent conversation flow
Write-Host "Testing Front Desk Agent conversation flow..." -ForegroundColor Green

# Start a conversation with incomplete information
Write-Host "`nStep 1: Incomplete request" -ForegroundColor Yellow
$body = @{
    message = "Quiero un video"
    context = @{
        sessionId = "conversation-test-1"
        language = "es"
    }
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3007/api/agents/front-desk" -Method POST -ContentType "application/json" -Body $body
$responseData = $response.Content | ConvertFrom-Json
Write-Host "Response:" -ForegroundColor Cyan
Write-Host $response.Content

# Check if the agent needs more information
if ($responseData.status -eq "clarification_needed") {
    Write-Host "`nStep 2: Providing platform information" -ForegroundColor Yellow
    $body = @{
        message = "Para TikTok"
        context = @{
            sessionId = "conversation-test-1"
            language = "es"
        }
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://localhost:3007/api/agents/front-desk" -Method POST -ContentType "application/json" -Body $body
    $responseData = $response.Content | ConvertFrom-Json
    Write-Host "Response:" -ForegroundColor Cyan
    Write-Host $response.Content

    # Check if the agent needs more information
    if ($responseData.status -eq "clarification_needed") {
        Write-Host "`nStep 3: Providing topic information" -ForegroundColor Yellow
        $body = @{
            message = "Sobre mi producto ecológico"
            context = @{
                sessionId = "conversation-test-1"
                language = "es"
            }
        } | ConvertTo-Json

        $response = Invoke-WebRequest -Uri "http://localhost:3007/api/agents/front-desk" -Method POST -ContentType "application/json" -Body $body
        $responseData = $response.Content | ConvertFrom-Json
        Write-Host "Response:" -ForegroundColor Cyan
        Write-Host $response.Content

        # Check if the agent needs more information
        if ($responseData.status -eq "clarification_needed") {
            Write-Host "`nStep 4: Providing duration information" -ForegroundColor Yellow
            $body = @{
                message = "Un video corto"
                context = @{
                    sessionId = "conversation-test-1"
                    language = "es"
                }
            } | ConvertTo-Json

            $response = Invoke-WebRequest -Uri "http://localhost:3007/api/agents/front-desk" -Method POST -ContentType "application/json" -Body $body
            $responseData = $response.Content | ConvertFrom-Json
            Write-Host "Response:" -ForegroundColor Cyan
            Write-Host $response.Content

            if ($responseData.status -eq "ready") {
                Write-Host "`nConversation completed successfully!" -ForegroundColor Green
                Write-Host "Target Agent: $($responseData.conversation.targetAgent)" -ForegroundColor Green
            }
        } elseif ($responseData.status -eq "ready") {
            Write-Host "`nConversation completed successfully!" -ForegroundColor Green
            Write-Host "Target Agent: $($responseData.conversation.targetAgent)" -ForegroundColor Green
        }
    } elseif ($responseData.status -eq "ready") {
        Write-Host "`nConversation completed successfully!" -ForegroundColor Green
        Write-Host "Target Agent: $($responseData.conversation.targetAgent)" -ForegroundColor Green
    }
} elseif ($responseData.status -eq "ready") {
    Write-Host "`nConversation completed successfully!" -ForegroundColor Green
    Write-Host "Target Agent: $($responseData.conversation.targetAgent)" -ForegroundColor Green
}

Write-Host "`nTesting complete!" -ForegroundColor Green