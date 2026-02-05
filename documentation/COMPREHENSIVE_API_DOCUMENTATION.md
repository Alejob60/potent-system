# 📘 Comprehensive API Documentation for Misybot Agents

## Overview
This document provides comprehensive API documentation for all agents in the Misybot system. Each agent is responsible for a specific function in the content creation, scheduling, and analysis workflow.

## 🏢 System Architecture

The Misybot system consists of several specialized agents orchestrated by a central Admin Orchestrator:

1. **Front Desk Agent** - Intelligent receptionist that processes initial user requests
2. **Admin Orchestrator** - Coordinates multiple agents for complex tasks
3. **Video Scriptor** - Generates video content for social media
4. **Post Scheduler** - Schedules social media posts
5. **Trend Scanner** - Analyzes social media trends
6. **FAQ Responder** - Generates FAQ responses
7. **Analytics Reporter** - Creates analytics reports

## 🚪 API Endpoints

### 1. Front Desk Agent
**Base URL**: `/api/agents/front-desk`

#### Process User Message
```
POST /
```
**Description**: Analyze user message and route to appropriate agent

**Request Body**:
```json
{
  "message": "string",
  "context": {
    "sessionId": "string",
    "language": "string"
  }
}
```

**Response**:
```json
{
  "agent": "front-desk",
  "status": "string",
  "conversation": {
    "userMessage": "string",
    "agentResponse": "string",
    "objective": "string",
    "targetAgent": "string",
    "collectedInfo": {},
    "missingInfo": ["string"],
    "confidence": 0.9
  }
}
```

#### Get Agent Status
```
GET /status
```
**Description**: Retrieve status information and metrics for all specialized agents

**Response**:
```json
{
  "timestamp": "2025-09-25T10:00:00Z",
  "agents": [
    {
      "name": "string",
      "status": "string",
      "activeTasks": 0,
      "completedTasks": 0,
      "failedTasks": 0,
      "avgResponseTime": 0,
      "uptime": 0
    }
  ],
  "system": {
    "totalConversations": 0,
    "activeConversations": 0,
    "avgConversationLength": 0
  }
}
```

#### Get All Conversations
```
GET /
```
**Description**: Retrieve all front desk conversations

#### Get Conversation by ID
```
GET /:id
```
**Description**: Retrieve a specific conversation by its ID

#### Get Conversations by Session
```
GET /session/:sessionId
```
**Description**: Retrieve all conversations for a specific session

### 2. Admin Orchestrator
**Base URL**: `/api/admin/orchestrate`

#### Orchestrate Agents
```
POST /
```
**Description**: Coordinate multiple AI agents to perform complex tasks

**Request Body**:
```json
{
  "sessionId": "string",
  "task": "string",
  "context": {
    "businessInfo": {
      "name": "string",
      "location": "string"
    },
    "targetChannels": ["string"],
    "currentObjective": "string",
    "preferences": {
      "contentTypes": ["string"],
      "tone": "string",
      "frequency": "string"
    }
  },
  "agents": ["string"]
}
```

**Response**:
Array of agent results

### 3. Video Scriptor
**Base URL**: `/api/agents/video-scriptor`

#### Create Video Content
```
POST /
```
**Description**: Generate video content based on provided parameters

**Request Body**:
```json
{
  "sessionId": "string",
  "platform": "string",
  "topic": "string",
  "duration": "string",
  "extras": ["string"],
  "tone": "string",
  "targetAudience": "string"
}
```

**Response**:
```json
{
  "id": "string",
  "sessionId": "string",
  "status": "string",
  "result": {
    "videoUrl": "string",
    "thumbnailUrl": "string",
    "duration": "string"
  },
  "createdAt": "2025-09-25T10:00:00Z"
}
```

#### Get All Video Creations
```
GET /
```
**Description**: Retrieve all video content created by this agent

#### Get Video Creation by ID
```
GET /:id
```
**Description**: Retrieve details of a specific video creation

### 4. Post Scheduler
**Base URL**: `/api/agents/post-scheduler`

#### Schedule Social Media Post
```
POST /
```
**Description**: Create and schedule a social media post

**Request Body**:
```json
{
  "sessionId": "string",
  "platform": "string",
  "content": "string",
  "scheduledTime": "2025-09-25T10:00:00Z",
  "mediaUrl": "string",
  "targeting": {
    "audience": "string",
    "location": "string"
  }
}
```

**Response**:
```json
{
  "id": "string",
  "sessionId": "string",
  "status": "string",
  "result": {
    "postId": "string",
    "scheduledTime": "2025-09-25T10:00:00Z",
    "platform": "string"
  },
  "createdAt": "2025-09-25T10:00:00Z"
}
```

#### Get All Scheduled Posts
```
GET /
```
**Description**: Retrieve all scheduled posts

#### Get Scheduled Post by ID
```
GET /:id
```
**Description**: Retrieve details of a specific scheduled post

### 5. Trend Scanner
**Base URL**: `/api/agents/trend-scanner`

#### Analyze Social Media Trends
```
POST /
```
**Description**: Analyze current trends on social media platforms

**Request Body**:
```json
{
  "sessionId": "string",
  "platform": "string",
  "topic": "string",
  "dateRange": "string",
  "detailLevel": "string",
  "region": "string"
}
```

**Response**:
```json
{
  "id": "string",
  "sessionId": "string",
  "status": "string",
  "result": {
    "trends": [
      {
        "keyword": "string",
        "volume": 0,
        "growth": 0,
        "relatedTerms": ["string"]
      }
    ],
    "insights": "string",
    "recommendations": ["string"]
  },
  "createdAt": "2025-09-25T10:00:00Z"
}
```

#### Get All Trend Analyses
```
GET /
```
**Description**: Retrieve all trend analyses

#### Get Trend Analysis by ID
```
GET /:id
```
**Description**: Retrieve details of a specific trend analysis

### 6. FAQ Responder
**Base URL**: `/api/agents/faq-responder`

#### Generate FAQ Responses
```
POST /
```
**Description**: Create comprehensive FAQ responses

**Request Body**:
```json
{
  "sessionId": "string",
  "topic": "string",
  "question": "string",
  "audience": "string",
  "detailLevel": "string",
  "format": "string"
}
```

**Response**:
```json
{
  "id": "string",
  "sessionId": "string",
  "status": "string",
  "result": {
    "questions": [
      {
        "question": "string",
        "answer": "string",
        "category": "string",
        "confidence": 0
      }
    ],
    "summary": "string"
  },
  "createdAt": "2025-09-25T10:00:00Z"
}
```

#### Get All FAQ Responses
```
GET /
```
**Description**: Retrieve all FAQ responses

#### Get FAQ Response by ID
```
GET /:id
```
**Description**: Retrieve details of a specific FAQ response

### 7. Analytics Reporter
**Base URL**: `/api/agents/analytics-reporter`

#### Generate Analytics Reports
```
POST /
```
**Description**: Create comprehensive analytics reports

**Request Body**:
```json
{
  "sessionId": "string",
  "reportType": "string",
  "timePeriod": "string",
  "metrics": ["string"],
  "format": "string",
  "platform": "string"
}
```

**Response**:
```json
{
  "id": "string",
  "sessionId": "string",
  "status": "string",
  "result": {
    "reportUrl": "string",
    "metrics": {
      "engagementRate": 0,
      "reach": 0,
      "impressions": 0
    },
    "insights": ["string"],
    "recommendations": ["string"]
  },
  "createdAt": "2025-09-25T10:00:00Z"
}
```

#### Get All Analytics Reports
```
GET /
```
**Description**: Retrieve all analytics reports

#### Get Analytics Report by ID
```
GET /:id
```
**Description**: Retrieve details of a specific analytics report

## 📊 Agent Capabilities Matrix

| Agent | Primary Function | Input Parameters | Output |
|-------|------------------|------------------|--------|
| Front Desk | Initial request processing | User message, context | Routed request, conversation state |
| Video Scriptor | Video content generation | Platform, topic, duration, extras | Video file, thumbnail |
| Post Scheduler | Social media post scheduling | Platform, content, scheduled time | Scheduled post confirmation |
| Trend Scanner | Trend analysis | Platform, topic, date range | Trend data, insights |
| FAQ Responder | FAQ generation | Topic, question, audience | FAQ list, answers |
| Analytics Reporter | Report generation | Report type, time period, metrics | Analytics report, insights |

## 🔧 Error Handling

All APIs follow standard HTTP status codes:

- **200**: Success
- **201**: Created
- **400**: Bad Request - Invalid parameters
- **404**: Not Found - Resource not found
- **500**: Internal Server Error

## 🔐 Authentication

All endpoints require proper authentication through JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## 🌐 Rate Limiting

API calls are rate-limited to prevent abuse:
- 100 requests per minute per user
- 1000 requests per hour per user

## 📈 Monitoring and Metrics

Each agent provides metrics through the Front Desk Agent status endpoint:
- Task completion rates
- Average response times
- Error rates
- Uptime percentages

## 🚀 Integration Guidelines

### Frontend Integration
1. Start with Front Desk Agent for initial user interaction
2. Use Admin Orchestrator for complex multi-agent tasks
3. Monitor agent status through the status endpoint
4. Handle errors gracefully with user-friendly messages

### Backend Integration
1. Implement proper authentication
2. Follow rate limiting guidelines
3. Handle all possible response statuses
4. Log errors for debugging and improvement

## 📞 Support

For API integration issues, contact:
- API Support: api-support@misybot.com
- Documentation: docs@misybot.com
- Technical Issues: tech-support@misybot.com

---
*Last Updated: September 25, 2025*
*Version: 1.0*