# MisyBot Backend-Refactor Technical Specification

## 📋 Overview

This document provides detailed technical specifications for rearchitecting the MisyBot backend-refactor system to enhance context control, integrate with MongoDB Vector Search, harden infrastructure, and improve security and traceability while maintaining compatibility with existing agents.

## 🏗️ Architecture Overview

### Current Architecture
The existing system is built on NestJS with PostgreSQL (TypeORM), Azure Service Bus/RabbitMQ for messaging, and various specialized AI agents.

### Target Architecture
The enhanced system will feature:
- PostgreSQL for structured data persistence
- MongoDB Atlas Vector Search for semantic embeddings
- Redis for caching and coordination
- Azure Service Bus as primary message broker
- Enhanced security with Azure Key Vault
- Comprehensive observability with OpenTelemetry/Application Insights

## 🗃️ Data Models

### PostgreSQL Entities

#### ContextBundle
```typescript
@Entity('context_bundles')
export class ContextBundle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  sessionId: string;

  @Column()
  userId: string;

  @Column('jsonb')
  shortMemory: any; // Recent conversation turns

  @Column('jsonb')
  longMemorySummary: any; // Compressed historical context

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastAccessedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date; // For retention policy
}
```

#### ContextTurn
```typescript
@Entity('context_turns')
export class ContextTurn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sessionId: string;

  @Column()
  bundleId: string;

  @Column()
  role: 'user' | 'agent';

  @Column()
  text: string;

  @Column({ nullable: true })
  turnId: string; // For referencing specific turns

  @Column('jsonb', { nullable: true })
  metadata: any;

  @Column({ type: 'timestamptz' })
  timestamp: Date;
}
```

#### AgentWorkflow (Saga)
```typescript
@Entity('agent_workflows')
export class AgentWorkflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sessionId: string;

  @Column()
  correlationId: string;

  @Column()
  workflowType: string;

  @Column('jsonb')
  steps: WorkflowStep[]; // Array of steps with status

  @Column({
    type: 'enum',
    enum: ['pending', 'in_progress', 'completed', 'failed', 'compensated'],
    default: 'pending'
  })
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'compensated';

  @Column('jsonb', { nullable: true })
  result: any;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date;
}

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'compensated';
  agent: string;
  payload: any;
  result: any;
  compensationHandler: string;
  startedAt?: Date;
  completedAt?: Date;
}
```

#### AgentEventLog
```typescript
@Entity('agent_events')
export class AgentEventLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sessionId: string;

  @Column()
  correlationId: string;

  @Column()
  agent: string;

  @Column({
    type: 'enum',
    enum: ['started', 'progress', 'completed', 'failed'],
  })
  eventType: 'started' | 'progress' | 'completed' | 'failed';

  @Column('jsonb')
  payload: any;

  @Column('jsonb', { nullable: true })
  metadata: any;

  @Column({ type: 'timestamptz' })
  timestamp: Date;
}
```

#### GeneratedArtifact
```typescript
@Entity('generated_artifacts')
export class GeneratedArtifact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sessionId: string;

  @Column()
  correlationId: string;

  @Column()
  agent: string;

  @Column()
  type: string; // 'script', 'video', 'image', 'audio', etc.

  @Column()
  storageRef: string; // blob://container/path or s3://bucket/path

  @Column('jsonb', { nullable: true })
  metadata: any;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date; // For retention policy
}
```

### MongoDB Embeddings Collection

#### Document Structure
```javascript
{
  "_id": ObjectId,
  "sessionId": "uuid",
  "turnId": "uuid",
  "bundleId": "uuid",
  "role": "user|agent",
  "text": "original text",
  "embedding": [0.123, -0.234, ...], // Vector of configurable dimension
  "metadata": {
    "agent": "video-scriptor",
    "timestamp": "2025-10-26T...",
    "type": "conversation_turn|script|trend|artifact"
  },
  "ttl": ISODate  // Optional TTL for retention
}
```

#### Indices
1. **Vector Index**: For similarity search (cosine or dotProduct)
2. **Compound Index**: sessionId + timestamp for session-based queries
3. **Agent Index**: metadata.agent for agent-specific filtering

## 🔄 Message Contracts

### Agent Request
```json
{
  "type": "agent.request",
  "schemaVersion": "1.0.0",
  "sessionId": "uuid-session",
  "correlationId": "uuid-corr",
  "timestamp": "2025-10-26T12:00:00Z",
  "agent": "video-scriptor",
  "payload": {
    "intent": "crear video promocional 30s",
    "contextSnapshotRef": "postgres://context_bundle/123",
    "scriptConstraints": {
      "max_seconds": 30,
      "platforms": ["instagram", "youtube"]
    }
  },
  "metadata": {
    "priority": "high",
    "requestOrigin": "front-desk"
  }
}
```

### Agent Response
```json
{
  "type": "agent.response",
  "schemaVersion": "1.0.0",
  "sessionId": "uuid-session",
  "correlationId": "uuid-corr",
  "agent": "video-scriptor",
  "status": "completed",
  "resultSummary": "scriptRef:artifact://script/uuid",
  "artifacts": [
    {
      "type": "script",
      "ref": "artifact://script/uuid"
    }
  ],
  "metrics": {
    "elapsed_ms": 1234
  }
}
```

## 🔧 Core Services

### ContextBundleService
```typescript
@Injectable()
export class ContextBundleService {
  async createContextBundle(sessionId: string, userId: string): Promise<ContextBundle> {
    // Create new context bundle
  }

  async getContextBundle(sessionId: string): Promise<ContextBundle> {
    // Retrieve context bundle with Redis caching
  }

  async updateContextBundle(bundleId: string, updates: Partial<ContextBundle>): Promise<ContextBundle> {
    // Update context bundle
  }

  async addContextTurn(bundleId: string, turn: ContextTurn): Promise<ContextTurn> {
    // Add conversation turn to bundle
  }

  async getContextTurns(bundleId: string, limit?: number): Promise<ContextTurn[]> {
    // Retrieve recent context turns
  }
}
```

### MongoVectorService
```typescript
@Injectable()
export class MongoVectorService {
  async upsertEmbedding(embeddingDoc: EmbeddingDocument): Promise<void> {
    // Insert or update embedding document
  }

  async semanticSearch(
    queryEmbedding: number[],
    sessionId?: string,
    filters?: any,
    limit?: number
  ): Promise<EmbeddingSearchResult[]> {
    // Perform semantic search with optional filtering
  }

  async deleteEmbeddings(sessionId: string): Promise<void> {
    // Delete embeddings for a session (GDPR compliance)
  }
}

interface EmbeddingDocument {
  sessionId: string;
  turnId?: string;
  bundleId?: string;
  role: 'user' | 'agent';
  text: string;
  embedding: number[];
  metadata: any;
  ttl?: Date;
}

interface EmbeddingSearchResult {
  document: EmbeddingDocument;
  score: number;
}
```

### ServiceBusService
```typescript
@Injectable()
export class ServiceBusService {
  async sendAgentRequest(request: AgentRequest): Promise<void> {
    // Send agent request to Service Bus
  }

  async sendAgentResponse(response: AgentResponse): Promise<void> {
    // Send agent response to Service Bus
  }

  async subscribeToAgentRequests(agent: string, handler: (message: AgentRequest) => Promise<void>): Promise<void> {
    // Subscribe to agent requests for specific agent
  }

  async subscribeToAgentResponses(sessionId: string, handler: (message: AgentResponse) => Promise<void>): Promise<void> {
    // Subscribe to agent responses for specific session
  }
}
```

### SecurityService
```typescript
@Injectable()
export class SecurityService {
  async encryptToken(token: string): Promise<string> {
    // Encrypt OAuth token with AES-256-GCM
  }

  async decryptToken(encryptedToken: string): Promise<string> {
    // Decrypt OAuth token
  }

  async getSecret(secretName: string): Promise<string> {
    // Retrieve secret from Key Vault or HashiCorp Vault
  }

  async rotateEncryptionKey(): Promise<void> {
    // Rotate encryption key every 90 days
  }
}
```

### SagaManagerService
```typescript
@Injectable()
export class SagaManagerService {
  async createSaga(workflow: AgentWorkflow): Promise<AgentWorkflow> {
    // Create and persist new saga
  }

  async executeStep(workflowId: string, stepId: string): Promise<void> {
    // Execute specific step in saga
  }

  async compensateStep(workflowId: string, stepId: string): Promise<void> {
    // Execute compensation for specific step
  }

  async completeSaga(workflowId: string): Promise<AgentWorkflow> {
    // Mark saga as completed
  }

  async failSaga(workflowId: string, error: any): Promise<AgentWorkflow> {
    // Mark saga as failed and trigger compensations
  }
}
```

## 🤖 Agent Adaptations

### Front Desk Agent

#### Enhanced Functionality
1. **Context Persistence**: Create/update ContextBundle in PostgreSQL for each session
2. **Embedding Generation**: Generate embeddings for each conversation turn and persist in MongoDB
3. **Semantic Routing**: Use semantic search to inform routing decisions
4. **Caching**: Cache ContextBundle in Redis with 5-15 minute TTL
5. **Semantic Search Endpoint**: `GET /api/agents/front-desk/semantic-search?query=...`

#### Key Methods
```typescript
// In FrontDeskService
async processMessage(sessionId: string, message: string): Promise<FrontDeskResponse> {
  // 1. Get or create ContextBundle
  const bundle = await this.contextBundleService.getContextBundle(sessionId);
  
  // 2. Add turn to context
  const turn = await this.contextBundleService.addContextTurn(bundle.id, {
    sessionId,
    bundleId: bundle.id,
    role: 'user',
    text: message,
    timestamp: new Date()
  });
  
  // 3. Generate embedding and persist
  const embedding = await this.embeddingService.generateEmbedding(message);
  await this.mongoVectorService.upsertEmbedding({
    sessionId,
    turnId: turn.id,
    bundleId: bundle.id,
    role: 'user',
    text: message,
    embedding,
    metadata: { agent: 'front-desk', timestamp: new Date() }
  });
  
  // 4. Use semantic search for context retrieval
  const relevantContext = await this.mongoVectorService.semanticSearch(
    embedding,
    sessionId,
    { agent: 'front-desk' },
    5
  );
  
  // 5. Route to appropriate agent
  const agentRequest: AgentRequest = {
    type: 'agent.request',
    schemaVersion: '1.0.0',
    sessionId,
    correlationId: uuid(),
    timestamp: new Date(),
    agent: this.determineTargetAgent(message, relevantContext),
    payload: {
      intent: message,
      contextSnapshotRef: `postgres://context_bundle/${bundle.id}`,
      // Additional payload based on routing decision
    },
    metadata: {
      priority: 'normal',
      requestOrigin: 'front-desk'
    }
  };
  
  await this.serviceBusService.sendAgentRequest(agentRequest);
  
  return {
    status: 'processing',
    message: 'Request forwarded to appropriate agent'
  };
}
```

### Creative Synthesizer Agent

#### Enhanced Functionality
1. **Context Retrieval**: Fetch context from PostgreSQL + MongoDB embeddings
2. **Embedding Persistence**: Store embeddings of generated content
3. **Artifact Storage**: Upload artifacts to Blob Storage and reference in GeneratedArtifact
4. **Rate Limiting**: Monitor resource usage and report metrics

#### Key Methods
```typescript
// In CreativeSynthesizerService
async processCreationRequest(request: AgentRequest): Promise<AgentResponse> {
  const { sessionId, correlationId, payload } = request;
  
  // 1. Retrieve context
  const contextBundle = await this.contextBundleService.getContextBundle(sessionId);
  
  // 2. If needed, enhance context with semantic search
  if (payload.enhanceContext) {
    const queryEmbedding = await this.embeddingService.generateEmbedding(
      payload.intent
    );
    
    const semanticContext = await this.mongoVectorService.semanticSearch(
      queryEmbedding,
      sessionId,
      {},
      10
    );
    
    // Enhance payload with semantic context
    payload.semanticContext = semanticContext;
  }
  
  // 3. Generate content (implementation specific)
  const generatedContent = await this.generateContent(payload);
  
  // 4. Upload artifact to Blob Storage
  const storageRef = await this.blobStorageService.upload(
    generatedContent.data,
    `artifacts/${sessionId}/${uuid()}.${generatedContent.extension}`
  );
  
  // 5. Register artifact
  const artifact = await this.generatedArtifactService.create({
    sessionId,
    correlationId,
    agent: 'creative-synthesizer',
    type: generatedContent.type,
    storageRef,
    metadata: generatedContent.metadata
  });
  
  // 6. Generate and store embedding of captions/prompts
  if (generatedContent.captions) {
    const captionEmbedding = await this.embeddingService.generateEmbedding(
      generatedContent.captions.join(' ')
    );
    
    await this.mongoVectorService.upsertEmbedding({
      sessionId,
      bundleId: contextBundle.id,
      role: 'agent',
      text: generatedContent.captions.join(' '),
      embedding: captionEmbedding,
      metadata: {
        agent: 'creative-synthesizer',
        artifactId: artifact.id,
        type: 'caption',
        timestamp: new Date()
      }
    });
  }
  
  // 7. Send response
  return {
    type: 'agent.response',
    schemaVersion: '1.0.0',
    sessionId,
    correlationId,
    agent: 'creative-synthesizer',
    status: 'completed',
    resultSummary: `Generated ${generatedContent.type}`,
    artifacts: [{
      type: generatedContent.type,
      ref: `artifact://${artifact.id}`
    }],
    metrics: {
      elapsed_ms: Date.now() - request.timestamp.getTime(),
      resourceUsage: this.getResourceUsage()
    }
  };
}
```

### Video Scriptor Agent

#### Enhanced Functionality
1. **Semantic Template Retrieval**: Use MongoDB to find similar previous scripts/templates
2. **Duration Synchronization**: Include timing information in scripts
3. **Embedding Persistence**: Store embeddings of generated scripts
4. **Validation**: Validate script constraints

### Trend Scanner Agent

#### Enhanced Functionality
1. **Trend Persistence**: Store trends in GeneratedArtifact and agent_events
2. **Embedding Generation**: Represent trends with embeddings for clustering
3. **ViralScore Persistence**: Store metrics in agent_events and trend_index

### Viralization Route Engine

#### Enhanced Functionality
1. **Saga Implementation**: Convert workflows to persistent sagas
2. **Compensation Handlers**: Define rollback mechanisms for each step
3. **Checkpointing**: Persist state at each step for recovery

### Viral Campaign Orchestrator

#### Enhanced Functionality
1. **Multi-session Support**: Handle campaigns with multiple sessions
2. **Performance Analytics**: Ingest performance data back into context
3. **Privacy Enforcement**: Apply policies per account/client

## 🔐 Security Implementation

### Encryption
- **Token Encryption**: AES-256-GCM with per-tenant IV
- **Key Management**: Azure Key Vault with rotation every 90 days
- **Data at Rest**: Enabled on PostgreSQL, MongoDB, and Blob Storage
- **Data in Transit**: TLS 1.2+ between all services

### Access Control
- **RBAC**: Role-based access control on endpoints
- **Audit Logging**: Log all read/write operations on context
- **Header Validation**: Validate x-correlation-id, x-session-id, x-user-id

## 📊 Observability

### OpenTelemetry Instrumentation
- **Tracing**: Distributed tracing with correlation IDs
- **Metrics**: Custom metrics for agent performance, queue depth, etc.
- **Logging**: Structured JSON logging with all relevant context

### Application Insights
- **Custom Dimensions**: Session ID, correlation ID, agent name, step
- **Dependencies**: Track calls to external services
- **Exceptions**: Capture and analyze errors

## 🧪 Testing Strategy

### Unit Tests
- Test each service method in isolation
- Mock external dependencies (databases, message queues)
- Validate edge cases and error conditions

### Integration Tests
- Test with emulators (MongoDB, Service Bus, Redis)
- Validate database operations and queries
- Test message production/consumption

### End-to-End Tests
- Simulate complete agent workflows
- Test GDPR compliance endpoints
- Validate observability and monitoring

## 🌐 Frontend Integration

### Backend Connection
The frontend applications connect to the backend using the following configuration:
- **Base URL**: `https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net`
- **Environment Variable**: `NEXT_PUBLIC_API_BASE_URL`

### Authentication
Two authentication methods are supported:
1. **JWT Token Authentication**: For user interactions
   - Header: `Authorization: Bearer <jwt_token>`
2. **API Key Authentication**: For service-to-service communication
   - Header: `x-api-key: <API_KEY>`

### Core Endpoints Integration

#### Context Management
Frontend applications should integrate with the context management system by:
1. Maintaining session IDs for context continuity
2. Using context bundles to maintain conversation history
3. Leveraging semantic search capabilities for intelligent responses

#### Agent Communication
Frontend applications communicate with agents through:
1. **Agent Requests**: Send requests to specific agents via the message bus
2. **Response Handling**: Process agent responses with proper correlation IDs
3. **Real-time Updates**: Implement WebSocket connections for real-time status updates

### Access Management and Performance Optimization

#### Connection Pooling
Implement connection pooling to prevent port overloading:
```javascript
class ApiClient {
  constructor() {
    this.maxConnections = 10;
    this.activeConnections = 0;
  }
  
  async makeRequest(endpoint, options) {
    if (this.activeConnections >= this.maxConnections) {
      await this.waitForAvailableConnection();
    }
    
    this.activeConnections++;
    try {
      return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, options);
    } finally {
      this.activeConnections--;
    }
  }
}
```

#### Rate Limiting
Implement client-side rate limiting to prevent overwhelming the backend:
```javascript
class RateLimiter {
  constructor(maxRequests = 5, timeWindow = 1000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }
  
  async execute(requestFn) {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      const waitTime = this.timeWindow - (now - this.requests[0]);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requests.push(now);
    return requestFn();
  }
}
```

#### Request Queuing
For resource-intensive operations like image generation:
```javascript
class RequestQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }
  
  add(request) {
    this.queue.push(request);
    if (!this.processing) {
      this.processQueue();
    }
  }
  
  async processQueue() {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const request = this.queue.shift();
      try {
        await request();
        // Add delay between requests to prevent overloading
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Request failed:', error);
      }
    }
    
    this.processing = false;
  }
}
```

## 🚀 Deployment

### Azure Services Configuration
1. **Azure Key Vault**: Store secrets and encryption keys
2. **Azure Service Bus**: Message broker for agent communication
3. **Azure Cache for Redis**: Caching layer for context bundles
4. **Azure Cosmos DB for MongoDB**: Vector search database
5. **Azure Database for PostgreSQL**: Structured data storage
6. **Azure Storage Account**: Blob storage for artifacts
7. **Application Insights**: Monitoring and observability

### Environment Variables
```env
# Database Configuration
DB_HOST=your-postgres-server.postgres.database.azure.com
DB_PORT=5432
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_NAME=misybot
DB_SSL=true

# MongoDB Configuration
MONGODB_CONNECTION_STRING=mongodb+srv://<USER>:<PWD>@cluster0.mongodb.net/misybot?retryWrites=true&w=majority

# Redis Configuration
REDIS_CONNECTION_STRING=your-redis-connection-string

# Service Bus Configuration
SERVICE_BUS_CONNECTION_STRING=your-service-bus-connection-string
SERVICE_BUS_TOPIC=mishy-agent-requests

# Key Vault Configuration
KEY_VAULT_URL=https://your-key-vault.vault.azure.net/

# Blob Storage Configuration
BLOB_STORAGE_CONNECTION_STRING=your-blob-storage-connection-string

# Application Insights
APPINSIGHTS_INSTRUMENTATIONKEY=your-instrumentation-key

# Encryption
DATABASE_ENCRYPTION_KEY=your-32-byte-hex-key
```

## 📈 Success Metrics

### Performance
- Agent latency (p95, p99)
- Saga completion time
- Queue depth monitoring
- Embedding search performance
- Resource usage and cost per request

### Reliability
- Agent success rates
- Compensation/rollback frequency
- System uptime
- Error rates and recovery times

### Security
- Encryption compliance
- Access control effectiveness
- Audit trail completeness
- Vulnerability scan results

This technical specification provides a comprehensive guide for implementing the enhanced MisyBot backend system with improved context control, vector search integration, and hardened infrastructure.