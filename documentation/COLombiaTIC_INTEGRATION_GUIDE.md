# ColombiaTIC AI Agent Integration Guide

## Overview

This guide provides detailed instructions for integrating the ColombiaTIC AI Agent service with the existing MisyBot meta-agent platform. The integration enables omnichannel AI capabilities for Colombian businesses through Facebook, WhatsApp, and Google Ads channels.

## Architecture

The ColombiaTIC integration consists of several key components:

1. **ColombiaTIC Agent Service** - Manages AI agent creation and configuration
2. **Webhook Service** - Processes incoming events from social media platforms
3. **IA Orchestrator Service** - Connects to the MisyBot AI processing system
4. **ColombiaTIC Orchestrator** - Coordinates all services and provides unified interface

## API Endpoints

### ColombiaTIC Agent Endpoints

#### Create New Agent
```
POST /api/colombiatic/agent/create
```

**Request Body:**
```json
{
  "siteUrl": "https://example.com",
  "industry": "technology",
  "language": "es",
  "tone": "professional",
  "connectChannels": ["facebook", "whatsapp", "google-ads"]
}
```

**Response:**
```json
{
  "success": true,
  "agent": {
    "id": "agent_1234567890_abcde",
    "config": {
      "siteUrl": "https://example.com",
      "industry": "technology",
      "language": "es",
      "tone": "professional",
      "connectChannels": ["facebook", "whatsapp", "google-ads"]
    },
    "clientId": "client_1234567890_abc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "status": "active"
  },
  "chatWidgetScript": "<script src=\"https://cdn.colombiatic.ai/widget.js\" data-client=\"client_1234567890_abc\" async></script>"
}
```

#### Get Agent Configuration
```
GET /api/colombiatic/agent/{id}
```

#### Update Agent Configuration
```
PUT /api/colombiatic/agent/{id}
```

#### Configure Webhooks
```
POST /api/colombiatic/agent/{id}/webhooks
```

#### Get Webhook Configuration
```
GET /api/colombiatic/agent/{id}/webhooks
```

### Webhook Endpoints

#### Facebook Webhook
```
GET /api/meta/facebook/webhook  (Verification)
POST /api/meta/facebook/webhook  (Event Processing)
```

#### WhatsApp Webhook
```
POST /api/meta/whatsapp/webhook
```

#### Google Ads Webhook
```
POST /api/google/ads/webhook
```

### IA Orchestrator Endpoints

#### Process Message
```
POST /api/ia-orchestrator/process-message
```

**Request Body:**
```json
{
  "message": "Hello, how can you help me?",
  "sessionId": "session_1234567890",
  "channelId": "facebook_12345",
  "channelType": "facebook"
}
```

#### Get Chat History
```
GET /api/ia-orchestrator/chat-history/{sessionId}
```

#### Clear Chat History
```
POST /api/ia-orchestrator/clear-history/{sessionId}
```

#### Get Analytics
```
GET /api/ia-orchestrator/analytics/{sessionId}
```

#### Send Feedback
```
POST /api/ia-orchestrator/feedback
```

### ColombiaTIC Orchestrator Endpoints

#### Process Webhook Event
```
POST /api/colombiatic-orchestrator/webhook/{channel}?eventType=message&agentId=agent_123
```

#### Get Webhook Events
```
GET /api/colombiatic-orchestrator/webhooks/events?limit=50
GET /api/colombiatic-orchestrator/webhooks/events/channel/{channel}?limit=50
```

#### Get Channel Messages
```
GET /api/colombiatic-orchestrator/messages?limit=50
GET /api/colombiatic-orchestrator/messages/channel/{channel}?limit=50
GET /api/colombiatic-orchestrator/messages/agent/{agentId}?limit=50
```

## Implementation Steps

### 1. Backend Integration

1. **Install Dependencies**
   ```bash
   cd backend-refactor
   npm install --legacy-peer-deps
   ```

2. **Configure Environment Variables**
   Add the following to your `.env.local` file:
   ```env
   # ColombiaTIC Configuration
   MISYBOT_ORCHESTRATOR_URL=https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net
   MISYBOT_ORCHESTRATOR_API_KEY=your_api_key_here
   MISYBOT_ORCHESTRATOR_CLIENT_ID=your_client_id_here
   ```

3. **Start the Service**
   ```bash
   npm run start:dev
   ```

### 2. Frontend Integration

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Use the ColombiaTIC Agent Service**
   ```javascript
   import ColombiaTICAgentService from './services/colombiaticAgentService';

   // Create a new agent
   const agent = await ColombiaTICAgentService.createAgent({
     siteUrl: 'https://example.com',
     industry: 'technology',
     language: 'es',
     tone: 'professional',
     connectChannels: ['facebook', 'whatsapp', 'google-ads']
   });

   // Process a message
   const response = await ColombiaTICAgentService.processMessage(
     'Hello, how can you help me?',
     'session_1234567890',
     'web-widget',
     'web'
   );
   ```

3. **Use the Chat Widget**
   ```jsx
   import ColombiaTICChatWidget from './components/ColombiaTICChatWidget';
   import './components/ColombiaTICChatWidget.css';

   function App() {
     return (
       <div className="App">
         {/* Your app content */}
         <ColombiaTICChatWidget clientId="your_client_id_here" />
       </div>
     );
   }
   ```

### 3. Webhook Configuration

1. **Facebook Webhook Setup**
   - Go to Facebook Developer Portal
   - Create a new webhook subscription
   - Set callback URL to: `https://your-domain.com/api/meta/facebook/webhook`
   - Set verify token to match your agent's configuration

2. **WhatsApp Webhook Setup**
   - Configure in your WhatsApp Business API settings
   - Set webhook URL to: `https://your-domain.com/api/meta/whatsapp/webhook`

3. **Google Ads Webhook Setup**
   - Configure in Google Ads API settings
   - Set webhook URL to: `https://your-domain.com/api/google/ads/webhook`

## Universal Chat Widget

The universal chat widget can be embedded on any website using the generated script:

```html
<script src="https://cdn.colombiatic.ai/widget.js" data-client="CLIENT_ID" async></script>
```

Replace `CLIENT_ID` with the actual client ID from your agent configuration.

## Security Considerations

1. **API Authentication**
   - All API calls use `withCredentials: true`
   - Webhook endpoints validate verification tokens
   - Client IDs are securely generated and managed

2. **Data Protection**
   - Chat history is stored securely
   - Personal data is handled according to privacy regulations
   - All communications use HTTPS in production

## Testing

### Unit Tests
Run unit tests for the new services:
```bash
npm run test
```

### Integration Tests
Run integration tests:
```bash
npm run test:e2e
```

### Manual Testing
1. Start the backend service
2. Start the frontend application
3. Create a new ColombiaTIC agent
4. Test webhook processing with sample payloads
5. Test chat widget functionality

## Troubleshooting

### Common Issues

1. **Webhook Verification Fails**
   - Check that the verify token matches between your service and the platform
   - Ensure the callback URL is accessible from the internet

2. **Agent Creation Fails**
   - Verify all required parameters are provided
   - Check environment variables are correctly configured

3. **Message Processing Fails**
   - Check connection to the IA Orchestrator
   - Verify API keys and client IDs are correct

### Logs
Check application logs for detailed error information:
```bash
# Backend logs
npm run start:dev
```

## Support

For issues with the ColombiaTIC integration, contact the development team or refer to the API documentation at:
`http://localhost:3007/api-docs`