# Misy Agent System Report

## Overview
The Misy Agent System is a comprehensive AI orchestration platform that consists of multiple specialized agents, each designed to handle specific tasks in content creation, campaign management, and social media operations. All agents follow a consistent pattern with standardized endpoints, payloads, and response formats.

## Agent System Architecture

### Core Components
1. **Front Desk Agent** - Entry point for all user interactions, routes requests to appropriate specialized agents
2. **AI Decision Engine** - Determines which agent should handle each request based on intent analysis
3. **State Management** - Maintains session context and conversation history
4. **WebSocket Gateway** - Provides real-time communication between frontend and backend
5. **Specialized Agents** - Handle specific tasks (content editing, video scripting, trend analysis, etc.)

## Agent Directory Structure
Each agent follows a consistent structure:
```
agent-name/
├── agent-name.module.ts
├── agent-name-v2.module.ts
├── controllers/
│   ├── agent-name.controller.ts
│   └── agent-name-v2.controller.ts
├── services/
│   ├── agent-name.service.ts
│   └── agent-name-v2.service.ts
├── dto/
│   └── create-agent-name.dto.ts
└── entities/
    └── agent-name.entity.ts
```

## Detailed Agent Information

### 1. Front Desk V2 Agent
**Purpose**: Entry point for all user interactions, routes requests to appropriate specialized agents

**Endpoint**: `POST /v2/agents/front-desk`

**Payload**:
```json
{
  "message": "string",
  "context": {
    "sessionId": "string",
    "language": "string (optional, defaults to 'en')"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "response": "Generated response message",
    "routingDecision": "video-scriptor",
    "contextSummary": "User inquiry about single_post services...",
    "nextSteps": [
      "Routing to video-scriptor agent",
      "Preparing context for specialist",
      "Awaiting specialist response"
    ],
    "emotion": "neutral",
    "urgency": 5,
    "complexity": 1
  },
  "metrics": {
    "requestsProcessed": 1,
    "successRate": 100,
    "avgResponseTime": 1234,
    "errors": 0,
    "lastActive": "2025-11-21T08:17:30.123Z"
  }
}
```

**WebSocket Events**:
- `agent_processing` - When processing starts
- `agent_response` - When processing completes

### 2. Content Editor V2 Agent
**Purpose**: Edits and optimizes content for specific platforms

**Endpoint**: `POST /api/v2/agent/content-editor/execute`

**Payload**:
```json
{
  "content": {},
  "targetPlatforms": ["string"],
  "sessionId": "string",
  "userId": "string (optional)",
  "context": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "edit": {},
    "editId": "string",
    "editedContent": {},
    "platformOptimizations": [{}],
    "qualityScore": 85
  },
  "metrics": {}
}
```

### 3. FAQ Responder V2 Agent
**Purpose**: Generates comprehensive FAQ responses based on topics

**Endpoint**: `POST /v2/agents/faq-responder`

**Payload**:
```json
{
  "question": "string",
  "sessionId": "string",
  "userId": "string (optional)",
  "topic": "string (optional)",
  "audience": "string (optional)",
  "detailLevel": "string (optional)",
  "format": "string (optional)",
  "context": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "faq": {},
    "questions": [
      {
        "question": "string",
        "answer": "string",
        "confidence": 0.95,
        "category": "string"
      }
    ],
    "topic": "string",
    "audience": "string",
    "format": "string"
  },
  "metrics": {}
}
```

### 4. Video Scriptor V2 Agent
**Purpose**: Generates platform-adapted scripts based on emotion and campaign objectives

**Endpoint**: `POST /v2/agents/video-scriptor`

**Payload**:
```json
{
  "sessionId": "string",
  "emotion": "string",
  "platform": "string",
  "format": "string",
  "objective": "string",
  "product": {
    "name": "string",
    "features": ["string"]
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "creation": {},
    "script": "string",
    "narrative": "string",
    "suggestions": {},
    "visualStyle": {},
    "compressedScript": "string"
  },
  "metrics": {}
}
```

### 5. Post Scheduler V2 Agent
**Purpose**: Schedules social media posts

**Endpoint**: `POST /api/v2/agent/post-scheduler/execute`

**Payload**:
```json
{
  "content": "string",
  "scheduledAt": "2025-12-31T23:59:59Z",
  "sessionId": "string (optional)",
  "userId": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "data": {},
  "metrics": {}
}
```

### 6. Analytics Reporter V2 Agent
**Purpose**: Generates analytics reports

**Endpoint**: `POST /api/v2/agent/analytics-reporter/execute`

**Payload**:
```json
{
  "metric": "string (optional)",
  "period": "daily|weekly|monthly (optional)",
  "sessionId": "string (optional)",
  "userId": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "data": {},
  "metrics": {}
}
```

### 7. Trend Scanner V2 Agent
**Purpose**: Analyzes social media trends for specific topics

**Endpoint**: `POST /v2/agents/trend-scanner`

**Payload**:
```json
{
  "topic": "string",
  "sessionId": "string",
  "userId": "string (optional)",
  "platform": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "analysis": {},
    "trends": [
      {
        "keyword": "string",
        "volume": 100,
        "growth": 10,
        "relatedTerms": ["string"]
      }
    ],
    "insights": "string",
    "recommendations": ["string"]
  },
  "metrics": {}
}
```

### 8. Creative Synthesizer V2 Agent
**Purpose**: Creates creative content based on intentions and emotions

**Endpoint**: `POST /api/v2/agent/creative-synthesizer/execute`

**Payload**:
```json
{
  "intention": "string",
  "emotion": "string",
  "entities": {},
  "sessionId": "string",
  "userId": "string (optional)",
  "context": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "data": {},
  "metrics": {}
}
```

### 9. Chat V2 Agent
**Purpose**: Handles conversational interactions

**Endpoint**: `POST /api/v2/agent/chat/execute`

**Payload**:
```json
{
  "message": "string",
  "context": {
    "sessionId": "string",
    "nombre": "string (optional)",
    "negocio": "string (optional)",
    "objetivo": "string (optional)",
    "canales": ["string"] (optional),
    "experiencia": "string (optional)",
    "ubicacion": "string (optional)",
    "historial": ["string"] (optional),
    "preferencias": {
      "contenido": ["string"] (optional),
      "tono": "string (optional)",
      "frecuencia": "string (optional)",
      "language": "string (optional)"
    },
    "timestamp": "string (optional)",
    "language": "string (optional)"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {},
  "metrics": {}
}
```

### 10. Campaign V2 Agent
**Purpose**: Manages marketing campaigns

**Endpoint**: `POST /api/v2/agent/campaign/execute`

**Payload**:
```json
{
  "name": "string",
  "objective": "string",
  "targetChannels": ["string"] (optional),
  "duration": 30 (optional),
  "contentTypes": ["string"] (optional),
  "tone": "string (optional)",
  "budget": 1000 (optional),
  "startDate": "2025-12-31T00:00:00Z (optional)",
  "sessionId": "string",
  "userId": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "data": {},
  "metrics": {}
}
```

## Agent Coordination and Workflow

### AI Decision Engine
The AI Decision Engine analyzes user requests and determines which agent should handle them:

1. **Intent Recognition**: Analyzes message content to determine the user's intent
2. **Agent Selection**: Matches intent with the most appropriate agent based on capabilities
3. **Resource Planning**: Determines required resources and estimated processing time
4. **Routing**: Routes the request to the selected agent with context information

### Agent Capabilities Mapping
- **Trend Scanner**: trend_analysis, market_research, competitor_analysis
- **Video Scriptor**: video_scripts, story_creation, content_writing
- **FAQ Responder**: customer_service, quick_responses, information
- **Post Scheduler**: scheduling, calendar_management, timing_optimization
- **Analytics Reporter**: performance_analysis, reporting, metrics

### Intent to Task Type Mapping
- **campaign**: Campaign management
- **single_post**: Single post creation
- **media_generation**: Media content generation
- **analysis**: Data analysis and reporting
- **planning**: Strategic planning and scheduling

## Common Patterns and Standards

### Response Format
All agents return a standardized response format:
```json
{
  "success": boolean,
  "data": object,
  "metrics": object,
  "error": string (only when success is false)
}
```

### Error Handling
All agents handle errors gracefully and return appropriate HTTP status codes:
- 200: Success
- 400: Invalid input data
- 404: Resource not found
- 500: Internal server error

### Authentication
Most agents do not require authentication tokens for basic functionality, but some may require session context.

### WebSocket Integration
Many agents support real-time updates through WebSocket connections:
- `agent_processing`: Indicates when processing starts
- `agent_response`: Provides the final response when processing completes

## Integration Guidelines

### Frontend Integration
1. Send POST requests to the appropriate agent endpoint
2. Include session context in all requests
3. Establish WebSocket connection for real-time updates
4. Handle both HTTP responses and WebSocket events

### Backend Integration
1. Ensure all required services are running (PostgreSQL, Redis, MongoDB)
2. Configure environment variables correctly
3. Use consistent DTOs and entities across agents
4. Implement proper error handling and logging

## Best Practices

1. **Session Management**: Always include sessionId in requests for proper context tracking
2. **Error Handling**: Implement comprehensive error handling for both network and API errors
3. **Real-time Updates**: Use WebSocket connections for real-time user experience
4. **Payload Validation**: Validate payloads before sending to agents
5. **Resource Management**: Be aware of processing times and resource requirements for complex tasks