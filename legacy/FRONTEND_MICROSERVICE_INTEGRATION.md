# 📱 Frontend Integration for Front Desk Agent Microservice

## 🎯 Integration Objective
Connect your existing frontend chat widget to the Front Desk Agent microservice to enable intelligent conversation routing to specialized agents.

## 🔌 API Endpoint
```
POST http://localhost:3000/api/agents/front-desk
```

## 📨 Request Format
```javascript
{
  "message": "string",           // User's message
  "context": {
    "sessionId": "string",       // Unique session identifier
    "language": "string"         // Language code (e.g., 'es', 'en')
  }
}
```

## 📥 Response Format
```javascript
{
  "agent": "front-desk",
  "status": "clarification_needed|ready",
  "conversation": {
    "userMessage": "string",
    "agentResponse": "string",
    "objective": "generate_video|schedule_post|analyze_trends|faq_response|generate_report",
    "targetAgent": "video-scriptor|post-scheduler|trend-scanner|faq-responder|analytics-reporter",
    "collectedInfo": {
      // Information collected from conversation
    },
    "missingInfo": ["string"],   // What information is still needed
    "confidence": 0.0-1.0,       // Confidence level in understanding
    "isComplete": true|false     // Whether enough info has been gathered
  }
}
```

## 🔄 Integration Flow

1. **Send User Message**: When user sends a message, POST to `/api/agents/front-desk`
2. **Display Response**: Show `agentResponse` to user in chat interface
3. **Check Status**: 
   - If `status` = "clarification_needed", continue conversation
   - If `status` = "ready", route to `targetAgent`
4. **Maintain Session**: Use the same `sessionId` for all messages in a conversation

## 🛠️ Implementation Example

```javascript
// Frontend service integration
const sessionId = generateUniqueSessionId(); // Create once per conversation

async function sendMessage(userMessage) {
  try {
    const response = await fetch('http://localhost:3000/api/agents/front-desk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        context: {
          sessionId: sessionId,
          language: 'es'
        }
      })
    });
    
    const data = await response.json();
    
    // Display agent response in chat
    displayMessage(data.conversation.agentResponse);
    
    // Check if conversation is complete
    if (data.conversation.isComplete) {
      // Route to target agent
      routeToAgent(data.conversation.targetAgent, data.conversation.collectedInfo);
    }
    
    return data;
  } catch (error) {
    console.error('Error:', error);
    displayMessage('Lo siento, hubo un error. Por favor intenta de nuevo.');
  }
}

function routeToAgent(agentName, collectedInfo) {
  // Implement routing logic to specialized agents
  console.log(`Routing to ${agentName} with info:`, collectedInfo);
  // Example: redirect to agent-specific endpoint or component
}
```

## 🎯 Agent Routing Options

When `isComplete` is true, the Front Desk Agent will specify a `targetAgent`:
- `video-scriptor`: For video creation requests
- `post-scheduler`: For social media post scheduling
- `trend-scanner`: For trend analysis requests
- `faq-responder`: For FAQ responses
- `analytics-reporter`: For analytics report generation

## 📝 Key Integration Points

1. **Session Management**: Maintain the same `sessionId` throughout a conversation
2. **Progressive Information Gathering**: Continue sending messages until `isComplete` is true
3. **Confidence Visualization**: Optionally display `confidence` level to users
4. **Error Handling**: Handle network errors and API failures gracefully
5. **Language Support**: Set appropriate `language` in context

## ✅ Validation Checklist

- [ ] Frontend can POST to `/api/agents/front-desk`
- [ ] Session ID is maintained during conversation
- [ ] Agent responses are displayed in chat
- [ ] Missing information prompts are shown to user
- [ ] Conversation completes when enough info is gathered
- [ ] Routing to target agent works when `isComplete` is true
- [ ] Error handling is implemented for API failures
- [ ] Confidence level is properly handled (0.0-1.0)

This integration enables your frontend to leverage the conversational intelligence of the Front Desk Agent microservice for natural, context-aware routing to specialized agents.