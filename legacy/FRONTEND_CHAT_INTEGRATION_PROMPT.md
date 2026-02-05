# 🌐 Frontend Chat Integration Prompt for Meta-Agent System

## Overview
This document provides detailed instructions for frontend developers to properly integrate the chat widget with the meta-agent backend system. The integration enables real-time communication between users and specialized AI agents through a conversational interface.

## 🏗️ System Architecture

### Backend Endpoints
The frontend will communicate with the following backend endpoints:

1. **Front Desk Agent** (Main chat endpoint)
   - URL: `POST /api/agents/front-desk`
   - Purpose: Process user messages and route to appropriate specialized agents

2. **Conversation History**
   - URL: `GET /api/agents/front-desk/session/:sessionId`
   - Purpose: Retrieve conversation history for a specific session

3. **Agent Status Dashboard**
   - URL: `GET /api/agents/front-desk/status`
   - Purpose: Get real-time status of all specialized agents

4. **WebSocket Connection** (Optional for real-time updates)
   - URL: `ws://localhost:3007`
   - Purpose: Real-time message updates and agent status notifications

## 📡 API Integration

### 1. Sending Messages to Front Desk Agent

#### Request Format
```javascript
const sendMessage = async (message, sessionId) => {
  try {
    const response = await fetch('/api/agents/front-desk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        context: {
          sessionId: sessionId,
          language: 'es' // or 'en' for English
        }
      })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};
```

#### Response Format
```json
{
  "agent": "front-desk",
  "status": "ready", // or "clarification_needed"
  "conversation": {
    "userMessage": "Quiero un video corto para TikTok sobre mi producto nuevo",
    "agentResponse": "¡Entendido! 🎬 Crearé un video de 30s para tiktok sobre \"mi producto nuevo\". ¿Es correcto?",
    "objective": "generate_video",
    "targetAgent": "video-scriptor", // Empty if clarification needed
    "collectedInfo": {
      "topic": "mi producto nuevo",
      "duration": "30s",
      "platform": "tiktok"
    },
    "missingInfo": [], // Empty array if all info collected
    "confidence": 0.9,
    "isComplete": true // false if more info needed
  }
}
```

### 2. Handling Conversation Flow

#### Complete Implementation Example
```javascript
class ChatIntegration {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.conversationHistory = [];
  }

  generateSessionId() {
    return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  async sendMessage(userMessage) {
    try {
      // Show loading indicator
      this.showLoadingIndicator(true);

      const response = await fetch('/api/agents/front-desk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: {
            sessionId: this.sessionId,
            language: 'es'
          }
        })
      });

      const data = await response.json();
      
      // Hide loading indicator
      this.showLoadingIndicator(false);
      
      // Add to conversation history
      this.conversationHistory.push({
        userMessage: userMessage,
        agentResponse: data.conversation.agentResponse,
        timestamp: new Date()
      });
      
      // Update UI with agent response
      this.displayMessage(data.conversation.agentResponse, 'agent');
      
      // Handle routing to specialized agents
      if (data.status === 'ready' && data.conversation.targetAgent) {
        this.handleAgentRouting(data.conversation.targetAgent, data.conversation.collectedInfo);
      }
      
      return data;
    } catch (error) {
      this.showLoadingIndicator(false);
      console.error('Error sending message:', error);
      this.displayMessage('Lo siento, tuve un problema al procesar tu mensaje. ¿Podrías intentarlo de nuevo?', 'agent');
      throw error;
    }
  }

  handleAgentRouting(targetAgent, collectedInfo) {
    // Show specialized agent processing message
    const routingMessages = {
      'video-scriptor': '🚀 Estoy creando tu video con el Video Scriptor...',
      'post-scheduler': '📅 Estoy programando tu publicación con el Post Scheduler...',
      'trend-scanner': '🔍 Estoy analizando tendencias con el Trend Scanner...',
      'faq-responder': '❓ Estoy buscando respuestas con el FAQ Responder...',
      'analytics-reporter': '📊 Estoy generando tu reporte con el Analytics Reporter...'
    };
    
    const message = routingMessages[targetAgent] || '🔄 Estoy procesando tu solicitud...';
    this.displayMessage(message, 'system');
    
    // Optional: Poll for agent status or use WebSocket for updates
    this.pollAgentStatus(targetAgent);
  }

  async pollAgentStatus(agentName) {
    // Poll the status endpoint to show progress
    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await fetch('/api/agents/front-desk/status');
        const statusData = await statusResponse.json();
        
        const agent = statusData.agents.find(a => a.name === agentName);
        if (agent && agent.activeTasks === 0) {
          // Agent finished processing
          clearInterval(pollInterval);
          this.displayMessage('✅ ¡Listo! Tu solicitud ha sido procesada.', 'system');
        }
      } catch (error) {
        console.error('Error polling agent status:', error);
        clearInterval(pollInterval);
      }
    }, 5000); // Poll every 5 seconds
  }

  async loadConversationHistory() {
    try {
      const response = await fetch(`/api/agents/front-desk/session/${this.sessionId}`);
      const history = await response.json();
      
      // Display conversation history
      history.forEach(conversation => {
        this.displayMessage(conversation.userMessage, 'user');
        this.displayMessage(conversation.agentResponse, 'agent');
      });
      
      this.conversationHistory = history;
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  }

  displayMessage(message, sender) {
    // Implementation depends on your UI framework
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    messageElement.textContent = message;
    
    document.getElementById('chat-container').appendChild(messageElement);
    
    // Scroll to bottom
    const chatContainer = document.getElementById('chat-container');
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  showLoadingIndicator(show) {
    const loader = document.getElementById('loading-indicator');
    if (loader) {
      loader.style.display = show ? 'block' : 'none';
    }
  }
}
```

### 3. WebSocket Integration (Optional)

#### Real-time Updates
```javascript
class WebSocketIntegration {
  constructor() {
    this.ws = null;
    this.connect();
  }

  connect() {
    try {
      this.ws = new WebSocket('ws://localhost:3007');
      
      this.ws.onopen = () => {
        console.log('Connected to WebSocket server');
      };
      
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleWebSocketMessage(data);
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket connection closed. Reconnecting in 5 seconds...');
        setTimeout(() => this.connect(), 5000);
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  }

  handleWebSocketMessage(data) {
    switch (data.type) {
      case 'agent_status_update':
        this.updateAgentStatus(data.payload);
        break;
      case 'message_response':
        this.displayRealTimeMessage(data.payload);
        break;
      case 'processing_update':
        this.updateProcessingStatus(data.payload);
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }

  updateAgentStatus(statusData) {
    // Update agent status indicators in UI
    const agentElement = document.getElementById(`agent-${statusData.agentName}`);
    if (agentElement) {
      agentElement.className = `agent-status ${statusData.status}`;
      agentElement.textContent = `${statusData.agentName}: ${statusData.status}`;
    }
  }

  displayRealTimeMessage(messageData) {
    // Display real-time messages from agents
    this.displayMessage(messageData.content, messageData.sender);
  }

  updateProcessingStatus(statusData) {
    // Update processing status indicators
    const statusElement = document.getElementById('processing-status');
    if (statusElement) {
      statusElement.textContent = statusData.message;
      statusElement.className = `processing-status ${statusData.level}`;
    }
  }
}
```

## 🎨 UI/UX Guidelines

### 1. Chat Interface Components

#### Message Bubbles
```css
.message {
  padding: 12px 16px;
  margin: 8px 0;
  border-radius: 18px;
  max-width: 80%;
  word-wrap: break-word;
}

.message.user {
  background-color: #007bff;
  color: white;
  margin-left: auto;
  border-bottom-right-radius: 4px;
}

.message.agent {
  background-color: #f1f1f1;
  color: #333;
  margin-right: auto;
  border-bottom-left-radius: 4px;
}

.message.system {
  background-color: #e9ecef;
  color: #6c757d;
  font-style: italic;
  text-align: center;
  margin: 12px auto;
  max-width: 60%;
  border-radius: 12px;
}
```

### 2. Agent Status Indicators
```html
<div class="agent-status-container">
  <div id="agent-video-scriptor" class="agent-status operational">video-scriptor: operational</div>
  <div id="agent-post-scheduler" class="agent-status operational">post-scheduler: operational</div>
  <div id="agent-trend-scanner" class="agent-status operational">trend-scanner: operational</div>
</div>
```

### 3. Processing Status
```html
<div id="processing-status" class="processing-status idle">
  Esperando tu mensaje...
</div>
```

## 🧪 Testing Guidelines

### 1. Basic Message Flow
```javascript
// Test sending a simple message
const chat = new ChatIntegration();
chat.sendMessage("Quiero crear un video para Instagram");

// Expected response should contain:
// - agent: "front-desk"
// - status: "clarification_needed" (initial)
// - conversation with agentResponse asking for more details
```

### 2. Complete Request Flow
```javascript
// Test a complete request flow
const chat = new ChatIntegration();
await chat.sendMessage("Quiero un video corto para TikTok sobre gatos");
await chat.sendMessage("TikTok"); // Platform
await chat.sendMessage("gatos con forma humana"); // Topic
await chat.sendMessage("30 segundos"); // Duration

// Expected final response should contain:
// - status: "ready"
// - targetAgent: "video-scriptor"
// - isComplete: true
```

### 3. Error Handling
```javascript
// Test error handling
const chat = new ChatIntegration();
try {
  await chat.sendMessage(""); // Empty message
} catch (error) {
  // Should display error message to user
}
```

## 🔧 Troubleshooting

### Common Issues and Solutions

1. **CORS Errors**
   - Ensure backend has proper CORS configuration
   - Check that frontend and backend are on compatible origins

2. **WebSocket Connection Failures**
   - Verify WebSocket server is running
   - Check firewall settings
   - Ensure correct WebSocket URL

3. **Authentication Issues**
   - Implement proper session management
   - Handle JWT tokens if required

4. **Message Delivery Failures**
   - Implement retry logic with exponential backoff
   - Add proper error messages for users

### Debugging Tools

#### Browser Console Logging
```javascript
// Enable detailed logging
const DEBUG = true;

const log = (...args) => {
  if (DEBUG) {
    console.log('[Chat Integration]', ...args);
  }
};

log('Sending message:', message);
log('Received response:', data);
```

#### Network Monitoring
- Use browser dev tools Network tab to monitor API requests
- Check request/response headers and payloads
- Monitor for failed requests

## 📱 Mobile Considerations

### Responsive Design
```css
@media (max-width: 768px) {
  .message {
    max-width: 90%;
  }
  
  .agent-status-container {
    flex-direction: column;
  }
  
  #chat-input {
    padding: 12px;
  }
}
```

### Touch Optimization
- Ensure adequate touch targets for buttons
- Implement swipe gestures for chat navigation
- Optimize keyboard handling for mobile devices

## 🔒 Security Considerations

### 1. Input Validation
```javascript
function sanitizeInput(input) {
  // Remove potentially harmful characters
  return input.replace(/[<>]/g, '');
}

const sanitizedMessage = sanitizeInput(userMessage);
```

### 2. Rate Limiting
- Implement client-side rate limiting to prevent abuse
- Handle backend rate limit responses gracefully

### 3. Secure Communication
- Use HTTPS in production
- Validate SSL certificates
- Implement proper authentication

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Test all API endpoints
- [ ] Verify WebSocket connections
- [ ] Check responsive design on all devices
- [ ] Validate security measures
- [ ] Confirm error handling

### Post-deployment
- [ ] Monitor API performance
- [ ] Track user engagement metrics
- [ ] Collect user feedback
- [ ] Monitor for errors in production

## 📞 Support

For integration issues, contact:
- Backend Team: backend@example.com
- Frontend Team: frontend@example.com
- DevOps Team: devops@example.com

Documentation last updated: September 24, 2025