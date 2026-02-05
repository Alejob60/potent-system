# 🎯 Front Desk Agent Design Document

## 🧩 Agent Role
The **Front Desk Agent** is the receptionist of the meta-agent system. Its role is to receive messages from the `/chat` endpoint, maintain a fluid conversation with the user, and determine their needs before routing them to the correct specialized agent.

## ✅ Agent To-Do List

1. **Receive user message** and analyze intent
2. **Detect key entities** (e.g., social media, campaign, video duration, language)
3. **Validate minimum information**:
   - What do they want to do? (e.g., generate video, analyze trends, schedule post)
   - For which channel or social media?
   - Any specific parameters (duration, tone, hashtags, etc.)?
4. **If information is missing** → ask short, guided, and clear questions
5. **Confirm final intent** with the user
6. **Route to the appropriate agent** with a clean JSON (do not execute the action yet)
7. **Maintain natural conversation**: friendly, professional tone in Spanish

## 🔄 Conversational Flow

1. **Input**: User message (example: "Quiero hacer un video corto para TikTok")
2. **Understanding**: Identify intent ("generate video"), channel ("TikTok"), parameters (duration = short)
3. **Clarification**:
   - If data is missing → ask: "¿Quieres que el video tenga narración o solo música de fondo?"
   - If unsure → suggest default options
4. **Confirmation**:
   - "Perfecto 🚀, entonces vas a generar un video de 30s para TikTok con narración y subtítulos, ¿cierto?"
5. **Output**: Return JSON with clear objective, target agent, and collected data

## 📤 Expected Output (JSON)
```json
{
  "agent": "front-desk",
  "status": "ready",
  "conversation": {
    "userMessage": "Quiero hacer un video corto para TikTok sobre mi nuevo producto",
    "agentResponse": "Perfecto 🚀, estás buscando crear un video promocional para TikTok. ¿Quieres que también agreguemos narración y subtítulos?",
    "objective": "generate_video",
    "targetAgent": "video-scriptor",
    "collectedInfo": {
      "platform": "tiktok",
      "duration": "30s",
      "topic": "nuevo producto",
      "extras": ["narración", "subtítulos"]
    },
    "missingInfo": ["tono de narración"]
  }
}
```

## 🛠️ Technical Implementation

### Module Structure
```
src/
└── agents/
    └── front-desk/
        ├── front-desk.module.ts
        ├── controllers/
        │   └── front-desk.controller.ts
        ├── services/
        │   └── front-desk.service.ts
        ├── dto/
        │   └── front-desk-request.dto.ts
        └── entities/
            └── front-desk-conversation.entity.ts
```

### Dependencies
- Azure OpenAI Service for natural language understanding
- Conversation state management
- Intent classification models
- Entity extraction capabilities

### Core Functions

#### 1. Intent Analysis Service
```typescript
async function analyzeIntent(userMessage: string): Promise<Intent> {
  // Implementation for identifying user intent
  // Returns: generate_video, analyze_trends, schedule_post, etc.
}
```

#### 2. Entity Extraction Service
```typescript
function extractEntities(userMessage: string): Entity[] {
  // Implementation for extracting key entities
  // Returns: platform, duration, topic, etc.
}
```

#### 3. Information Validation Service
```typescript
function validateInformation(collectedInfo: CollectedInfo): ValidationResult {
  // Implementation for validating minimum required information
  // Returns: missing fields, suggestions
}
```

#### 4. Conversation Management Service
```typescript
async function manageConversation(sessionId: string, userMessage: string): Promise<ConversationState> {
  // Implementation for maintaining conversation context
  // Returns: updated conversation state
}
```

#### 5. Agent Routing Service
```typescript
function routeToAgent(collectedInfo: CollectedInfo): TargetAgent {
  // Implementation for determining the correct agent
  // Returns: target agent based on intent and information
}
```

## 🎨 Conversation Management

### State Tracking
- User session management
- Conversation history
- Collected information tracking
- Missing information identification

### Response Generation
- Natural language responses in Spanish
- Guided question formulation
- Confirmation message creation
- Error handling and recovery

### Multi-turn Conversations
- Context preservation across multiple messages
- Information accumulation
- Clarification requests
- Intent confirmation

## 🔧 API Endpoints

### Primary Endpoint
```
POST /api/agents/front-desk
```

**Request Body:**
```json
{
  "message": "Quiero hacer un video corto para TikTok sobre mi nuevo producto",
  "context": {
    "sessionId": "user-session-123",
    "language": "es"
  }
}
```

**Response:**
```json
{
  "agent": "front-desk",
  "status": "ready",
  "conversation": {
    "userMessage": "Quiero hacer un video corto para TikTok sobre mi nuevo producto",
    "agentResponse": "Perfecto 🚀, estás buscando crear un video promocional para TikTok. ¿Quieres que también agreguemos narración y subtítulos?",
    "objective": "generate_video",
    "targetAgent": "video-scriptor",
    "collectedInfo": {
      "platform": "tiktok",
      "duration": "30s",
      "topic": "nuevo producto",
      "extras": ["narración", "subtítulos"]
    },
    "missingInfo": ["tono de narración"]
  }
}
```

### Additional Endpoints
```
GET /api/agents/front-desk                     # Get recent conversations
GET /api/agents/front-desk/:id                 # Get specific conversation
GET /api/agents/front-desk/session/:sessionId  # Get session conversations
```

## 🔄 Integration with Other Agents

### Routing Logic
- **Video Creation Requests** → VideoScriptor Agent
- **Trend Analysis Requests** → TrendScanner Agent
- **FAQ Responses** → FaqResponder Agent
- **Post Scheduling** → PostScheduler Agent
- **Analytics Reports** → AnalyticsReporter Agent

### Data Handoff
- Clean JSON payload with collected information
- Session context preservation
- Conversation history for context
- User preferences and language settings

## 🚀 Performance Considerations

### Response Time
- Target: < 2 seconds for intent analysis
- Target: < 1 second for response generation
- Caching for common conversation patterns

### Scalability
- Stateless service design
- Horizontal scaling support
- Load balancing for high traffic

### Error Handling
- Graceful degradation for API failures
- Fallback responses for unclear intents
- Session recovery mechanisms

## 🔐 Security Considerations

### Data Protection
- User message encryption at rest
- Session data protection
- PII handling compliance

### Access Control
- Session-based access validation
- Rate limiting for API endpoints
- Input sanitization

## 🧪 Testing Strategy

### Unit Tests
- Intent analysis accuracy
- Entity extraction validation
- Conversation flow testing
- Response generation quality

### Integration Tests
- API endpoint functionality
- Agent routing accuracy
- Session management
- Error handling scenarios

### User Acceptance Testing
- Conversation naturalness
- Intent recognition accuracy
- Response helpfulness
- Multi-turn conversation handling

## 📈 Monitoring and Analytics

### Key Metrics
- Conversation success rate
- Average conversation length
- Intent recognition accuracy
- User satisfaction scores
- Routing accuracy

### Logging
- Conversation start/end events
- Intent analysis results
- Entity extraction outcomes
- Routing decisions
- Error conditions

This design document provides a comprehensive blueprint for implementing the Front Desk Agent with all its functionalities, conversation management, and integration requirements.