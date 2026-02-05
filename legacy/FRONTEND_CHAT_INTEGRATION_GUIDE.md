# 📱 Frontend Chat Integration Guide - Front Desk Agent

## 🎯 Integration Overview
This guide explains how to integrate the Front Desk Agent with your existing frontend chat widget. The Front Desk Agent works as an intelligent conversation layer that progressively gathers user requirements before routing to specialized agents.

## 🔄 System Flow

1. **User sends message** → Existing `/chat` endpoint
2. **Chat controller analyzes** → Determines if Front Desk assistance is needed
3. **If needed** → Routes to Front Desk Agent microservice
4. **Front Desk Agent** → Engages in conversation, gathers info, builds confidence
5. **When complete** → Returns routing information to specialized agent
6. **Chat controller** → Routes to appropriate specialized agent

## 🔌 API Integration Points

### Primary Chat Endpoint (Existing)
```
POST http://localhost:3000/chat
```

### Front Desk Agent Endpoint (New)
```
POST http://localhost:3000/api/agents/front-desk
```

## 📨 Request/Response Formats

### Chat Request (Your Existing Format)
```javascript
{
  "message": "Quiero un video para TikTok",
  "context": {
    "sessionId": "session_12345",
    "language": "es",
    // ... other existing context fields
  }
}
```

### Front Desk Agent Request (Used Internally)
```javascript
{
  "message": "Quiero un video para TikTok",
  "context": {
    "sessionId": "session_12345",
    "language": "es"
  }
}
```

### Front Desk Agent Response
```javascript
{
  "agent": "front-desk",
  "status": "clarification_needed", // or "ready"
  "conversation": {
    "userMessage": "Quiero un video para TikTok",
    "agentResponse": "¿Qué duración prefieres para el video?",
    "objective": "generate_video",
    "targetAgent": "video-scriptor",
    "collectedInfo": {
      "platform": "tiktok"
    },
    "missingInfo": ["duración", "tema"],
    "confidence": 0.6,
    "isComplete": false
  }
}
```

When complete:
```javascript
{
  "agent": "front-desk",
  "status": "ready",
  "conversation": {
    "userMessage": "Sí, un video de 30 segundos sobre productos ecológicos",
    "agentResponse": "¡Perfecto! 🎬 Crearé un video de 30 segundos para tiktok sobre \"productos ecológicos\". ¿Es correcto?",
    "objective": "generate_video",
    "targetAgent": "video-scriptor",
    "collectedInfo": {
      "platform": "tiktok",
      "duration": "30s",
      "topic": "productos ecológicos"
    },
    "missingInfo": [],
    "confidence": 0.95,
    "isComplete": true
  }
}
```

## 🛠️ Frontend Implementation

### 1. Continue Using Your Existing Chat Endpoint
Your frontend should continue sending messages to the existing `/chat` endpoint:

```javascript
// Your existing chat implementation
async function sendMessage(userMessage) {
  try {
    const response = await fetch('http://localhost:3000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        context: {
          sessionId: currentSessionId,
          language: 'es'
          // ... your existing context
        }
      })
    });
    
    const data = await response.json();
    
    // Display response in chat
    displayMessage(data.reply);
    
    // Check if Front Desk data is present
    if (data.frontDeskData) {
      // Handle Front Desk conversation
      handleFrontDeskConversation(data.frontDeskData);
    }
    
    return data;
  } catch (error) {
    console.error('Error:', error);
    displayMessage('Error processing your request');
  }
}
```

### 2. Handle Front Desk Conversations
When the response contains `frontDeskData`, it means the Front Desk Agent is engaged:

```javascript
function handleFrontDeskConversation(frontDeskData) {
  // Show confidence level (optional)
  if (frontDeskData.conversation.confidence) {
    displayConfidence(frontDeskData.conversation.confidence);
  }
  
  // Check if conversation is complete
  if (frontDeskData.conversation.isComplete) {
    showCompletionMessage(frontDeskData.conversation.targetAgent);
  }
  
  // The chat controller will automatically route to the target agent
  // when the conversation is complete
}
```

### 3. Display Confidence (Optional)
```javascript
function displayConfidence(confidence) {
  const confidenceBar = document.getElementById('confidence-bar');
  confidenceBar.style.width = `${confidence * 100}%`;
  confidenceBar.textContent = `Confianza: ${(confidence * 100).toFixed(0)}%`;
}
```

## 🎯 Conversation Flow Examples

### Example 1: Video Creation Request
```
User: Quiero un video para TikTok
Agent: ¿Qué duración prefieres para el video?
User: Un video corto
Agent: ¿Sobre qué tema quieres el video?
User: Sobre mi producto nuevo
Agent: ¡Perfecto! 🎬 Crearé un video de 30 segundos para tiktok sobre "mi producto nuevo". ¿Es correcto?
User: Sí
System: Routing to video-scriptor agent...
```

### Example 2: Social Media Post Request
```
User: Quiero programar una publicación
Agent: ¿En qué plataforma quieres publicar? (Instagram, Facebook, Twitter, etc.)
User: Instagram
Agent: ¿Sobre qué quieres que sea la publicación?
User: Sobre nuestra nueva oferta
Agent: Perfecto ✅ Programaré una publicación en instagram sobre "nuestra nueva oferta". ¿Es correcto?
User: Sí
System: Routing to post-scheduler agent...
```

## 📝 Key Integration Points

1. **No Changes Needed**: Your existing frontend chat implementation requires no changes
2. **Automatic Routing**: The chat controller automatically determines when to use the Front Desk Agent
3. **Progressive Information Gathering**: The Front Desk Agent handles the conversation flow
4. **Completion Detection**: When `isComplete` is true, the system automatically routes to the target agent
5. **Session Continuity**: The same session ID is used throughout the conversation

## ✅ Validation Checklist

- [ ] Existing chat widget continues to work with `/chat` endpoint
- [ ] Conversational requests are automatically routed to Front Desk Agent
- [ ] Front Desk Agent engages in natural conversation to gather information
- [ ] Confidence levels are provided (0.0-1.0)
- [ ] Missing information prompts are shown to user
- [ ] Conversation completes when enough info is gathered
- [ ] System automatically routes to target agent when complete
- [ ] Session continuity is maintained throughout conversation
- [ ] Error handling works for both chat and Front Desk Agent

## 🚀 Specialized Agent Routing

When the Front Desk conversation is complete, the system automatically routes to one of these specialized agents:

- **video-scriptor**: Video creation requests
- **post-scheduler**: Social media post scheduling
- **trend-scanner**: Trend analysis requests
- **faq-responder**: FAQ response generation
- **analytics-reporter**: Analytics report creation

Your frontend doesn't need to handle this routing - it's done automatically by the backend system.

## 📊 Response Handling

The chat endpoint will return different responses based on the conversation state:

### During Front Desk Conversation
```javascript
{
  "reply": "¿Qué duración prefieres para el video?",
  "sessionId": "session_12345",
  "status": "requires_confirmation",
  "message": "Front desk assistance provided. Awaiting user confirmation.",
  "frontDeskData": {
    // Full Front Desk conversation data
  }
}
```

### When Complete and Routing
```javascript
{
  "reply": "I'm creating a comprehensive campaign strategy for you...",
  "sessionId": "session_12345",
  "status": "processing",
  "message": "Response sent via WebSocket. Check real-time updates.",
  // No frontDeskData when routing to specialized agent
}
```

This integration provides a seamless conversational experience that progressively gathers user requirements before routing to the appropriate specialized agent, all without requiring changes to your existing frontend implementation.