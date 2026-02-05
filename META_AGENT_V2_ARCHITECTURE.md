# Meta-Agent V2 — Arquitectura IA Moderna (GPT-5 + Voice + Vector DB)

## 📋 Resumen Ejecutivo

Meta-Agent V2 es la evolución del sistema de agentes conversacionales que integra:
- **GPT-5 (Thinking mini)** como LLM principal vía Azure OpenAI
- **Voice** (Speech-to-Text / Text-to-Speech) para llamadas y WebVoice
- **Vector DB** en MongoDB para contexto memorable y búsqueda semántica
- **Federated Context**: contexto local (Redis) + tenant (Mongo) + global anonimizado
- **Multi-tenant** con aislamiento completo de datos
- **Resiliencia** y degradación elegante ante fallos

---

## 🎯 Principios de Diseño

### 1. Federated Context (No Sustituir Backend Middleware)
**Modelo híbrido de contexto en capas:**

```
┌─────────────────────────────────────────────────────┐
│  Contexto In-Session (Redis)                        │
│  • Datos temporales                                 │
│  • Respuestas rápidas (< 100ms)                     │
│  • TTL automático                                   │
└─────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────┐
│  Contexto Tenant (MongoDB Vector Store)             │
│  • Embeddings + knowledge base                      │
│  • Búsqueda semántica                               │
│  • Tenant-scoped isolation                          │
└─────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────┐
│  Contexto Global/Anonimizado (PostgreSQL)           │
│  • Aprendizaje opt-in                               │
│  • Cluster separado para entrenamiento offline      │
│  • Sin PII                                          │
└─────────────────────────────────────────────────────┘
```

### 2. Orquestador Ligero
- **Toma decisiones** de ruteo basado en LLM
- **Delega ejecución** a agentes especializados (video, payments, voice, CRM)
- **No ejecuta** lógica de negocio compleja

### 3. Idempotencia y Correlación
- Cada request lleva: `correlationId` + `sessionId` + `tenantId`
- Deduplicación automática en 60s window

### 4. Failover y Degradación Elegante
```typescript
if (LLM.failed || Voice.failed) {
  → usar cached_responses
  → activar fallback_rules
  → notificar degraded_mode
}
```

### 5. Seguridad por Diseño
- **Tenant Isolation**: RLS en Postgres, tenant-scoped queries
- **HMAC** en payloads cross-service
- **KeyVault** para secretos
- **Audit trail** inmutable por tenant

### 6. Observabilidad Integrada
- **Traces**: AppInsights con correlationId
- **Metrics**: Prometheus (latency, tokens, success rate)
- **Logs**: Structured JSON con tenant/session
- **Alerts**: SLO breaches, error rate spikes

---

## 🏗️ Arquitectura de Componentes

### Diagrama de Alto Nivel
```
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway / Load Balancer             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              POST /v2/agents/meta-agent/process             │
│                  (Meta-Agent Controller V2)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴────────────────┐
        │                               │
        ▼                               ▼
┌────────────────────┐       ┌──────────────────────┐
│  JWT + Tenant      │       │  HMAC Signature      │
│  Validation Guard  │       │  Verification        │
└────────┬───────────┘       └──────────┬───────────┘
         │                              │
         └──────────────┬───────────────┘
                        ▼
         ┌──────────────────────────────────┐
         │    Meta-Agent Process Service    │
         │  • Validate Input                │
         │  • Retrieve Context              │
         │  • Vector Retrieval              │
         │  • Build Prompt                  │
         │  • Call GPT-5                    │
         │  • Parse Actions                 │
         │  • Persist Turn                  │
         │  • Publish Events                │
         └──────────────┬───────────────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
         ▼              ▼              ▼
┌────────────┐  ┌────────────┐  ┌────────────────┐
│   Redis    │  │  MongoDB   │  │  PostgreSQL    │
│ (Session)  │  │ (Vectors)  │  │ (Relational)   │
└────────────┘  └────────────┘  └────────────────┘
                        │
                        ▼
         ┌──────────────────────────────────┐
         │      Azure Service Bus           │
         │  • action.order.create           │
         │  • action.video.generate         │
         │  • action.post.schedule          │
         │  • action.voice.call             │
         └──────────────┬───────────────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
         ▼              ▼              ▼
┌────────────┐  ┌────────────┐  ┌────────────┐
│   Orders   │  │   Video    │  │   Voice    │
│  Consumer  │  │  Consumer  │  │  Consumer  │
└────────────┘  └────────────┘  └────────────┘
```

---

## 📊 Infraestructura Azure

### Servicios Requeridos

| Servicio | Propósito | Configuración |
|----------|-----------|---------------|
| **Azure OpenAI** | GPT-5 Thinking mini | Endpoint + Key en KeyVault |
| **Azure Speech** | STT/TTS real-time | Voice Live API |
| **Service Bus** | Orquestación async | Colas/Topics para agentes |
| **Redis Cache** | Session store + locks | Premium tier con RLS |
| **PostgreSQL** | Entidades relacionales | Flexible Server con RLS |
| **Cosmos DB (Mongo API)** | Vector embeddings | Vector search index |
| **Blob Storage** | Assets (audio/video) | Hot tier + lifecycle policies |
| **Key Vault** | Secrets, certs | RBAC + audit logs |
| **App Insights** | Tracing + metrics | Distributed tracing |
| **AKS / Web App** | Deployment | HPA + auto-scaling |

### Variables de Entorno (KeyVault)
```env
# Azure OpenAI GPT-5
AZURE_OPENAI_GPT5_ENDPOINT=https://...
AZURE_OPENAI_GPT5_KEY=***
AZURE_OPENAI_GPT5_DEPLOYMENT=gpt-5-thinking-mini
AZURE_OPENAI_GPT5_API_VERSION=2024-12-01-preview

# Azure Speech Service
AZURE_SPEECH_KEY=***
AZURE_SPEECH_REGION=eastus2
AZURE_SPEECH_ENDPOINT=https://...

# Vector Search
MONGODB_VECTOR_INDEX_NAME=tenant_embeddings_index
MONGODB_EMBEDDING_DIMENSIONS=1536

# Service Bus
AZURE_SERVICE_BUS_CONNECTION_STRING=***
SERVICE_BUS_TOPIC_ACTIONS=meta-agent-actions

# Security
JWT_SECRET=***
HMAC_SECRET=***
TENANT_ENCRYPTION_KEY=***
```

---

## 🔄 Flujos Técnicos Clave

### Flujo 1: User Message → LLM → Response

```typescript
// 1. API recibe POST /v2/agents/meta-agent/process
interface ProcessRequest {
  tenantId: string;
  sessionId: string;
  correlationId: string;
  userId?: string;
  channel: 'web' | 'whatsapp' | 'voice' | 'instagram';
  input: {
    type: 'text' | 'speech' | 'event';
    text?: string;
    speechUrl?: string;
    metadata?: any;
  };
  contextHints?: any;
}

// 2. Validate JWT + tenant check + HMAC
@UseGuards(JwtAuthGuard, TenantGuard, HmacGuard)

// 3. Retrieve shortContext from Redis (fast)
const sessionContext = await redisService.get(`session:${sessionId}`);
if (!sessionContext) {
  // Load from Postgres and compress
  const dbContext = await sessionContextRepo.findOne({ sessionId });
  sessionContext = compressContext(dbContext);
  await redisService.setex(`session:${sessionId}`, 900, sessionContext);
}

// 4. Vector retrieval (tenant-scoped)
const userEmbedding = await embeddingService.generateEmbedding(input.text);
const relevantDocs = await mongoVectorService.semanticSearch({
  embedding: userEmbedding,
  tenantId,
  limit: 5,
  threshold: 0.75
});

// 5. Build prompt
const prompt = {
  system: `${tenantADN}\n${safetyPolicy}`,
  context: [
    ...relevantDocs.map(doc => doc.text),
    ...sessionContext.recentTurns.slice(-5)
  ],
  user: input.text
};

// 6. Call GPT-5
const llmResponse = await azureOpenAIService.chat({
  messages: [
    { role: 'system', content: prompt.system },
    { role: 'user', content: prompt.user }
  ],
  temperature: 0.7,
  max_tokens: 1000
});

// 7. Parse actions (si LLM retorna special token)
const actions = parseActions(llmResponse.content);
// actions = [{ type: 'create_order', params: {...} }]

// 8. Persist turn
await sessionContextRepo.createTurn({
  sessionId,
  role: 'user',
  text: input.text,
  timestamp: new Date()
});
await sessionContextRepo.createTurn({
  sessionId,
  role: 'agent',
  text: llmResponse.content,
  actions,
  timestamp: new Date()
});

// 9. Publish to Service Bus
for (const action of actions) {
  await serviceBusService.sendMessage(`action.${action.type}`, {
    correlationId,
    tenantId,
    sessionId,
    action
  });
}

// 10. Return response
return {
  responseText: llmResponse.content,
  actions,
  embeddingsUsed: relevantDocs.length,
  tokensConsumed: llmResponse.usage.total_tokens
};
```

### Flujo 2: Voice Inbound Call

```typescript
// 1. WebRTC/SIP gateway recibe caller
const callId = uuid();
const stream = gateway.getAudioStream(callId);

// 2. Stream to Azure Speech STT (real-time)
const transcript = await azureSpeechService.streamSTT(stream);
// transcript emite eventos: { text: "...", isFinal: true }

// 3. Cada fragmento final → meta-agent flow
transcript.on('final', async (text) => {
  const response = await metaAgentService.process({
    tenantId,
    sessionId: callId,
    input: { type: 'text', text },
    channel: 'voice'
  });

  // 4. TTS la respuesta
  const audioStream = await azureSpeechService.streamTTS(response.responseText);

  // 5. Return audio to caller
  gateway.playAudio(callId, audioStream);
});

// 6. Store recording (con consent)
if (consentGiven) {
  await blobStorageService.uploadRecording(callId, audioBlob);
  // Indexar transcript a vector store
  await mongoVectorService.upsertEmbedding({
    sessionId: callId,
    tenantId,
    text: fullTranscript,
    metadata: { type: 'voice_call', consent: true }
  });
}
```

---

## 🗄️ Modelos de Datos

### SessionContext Entity (Postgres)
```typescript
@Entity('session_contexts')
export class SessionContext {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  sessionId: string;

  @Column()
  @Index()
  tenantId: string;

  @Column({ nullable: true })
  userId?: string;

  @Column('jsonb')
  shortContext: {
    summary: string;
    lastIntent: string;
    entities: Record<string, any>;
  };

  @Column('jsonb')
  recentTurns: Array<{
    role: 'user' | 'agent';
    text: string;
    timestamp: string;
  }>;

  @Column({ type: 'varchar', length: 50 })
  channel: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt?: Date;
}
```

### VectorDocument (MongoDB)
```typescript
interface VectorDocument {
  _id: ObjectId;
  tenantId: string;
  docId: string; // 'site-dna' | 'kb' | 'faq' | 'product-123'
  text: string;
  embedding: number[]; // 1536 dims (text-embedding-3-small)
  metadata: {
    source: string;
    lang: string;
    category?: string;
    tags?: string[];
  };
  createdAt: Date;
  visibility: 'tenant' | 'global';
}

// Índice vectorial (crear en Azure Portal)
{
  "indexName": "tenant_embeddings_index",
  "type": "vectorSearch",
  "path": "embedding",
  "numDimensions": 1536,
  "similarity": "cosine"
}
```

### ConversationTurn (Postgres)
```typescript
@Entity('conversation_turns')
export class ConversationTurn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  sessionId: string;

  @Column()
  @Index()
  tenantId: string;

  @Column({ type: 'varchar', length: 10 })
  role: 'user' | 'agent';

  @Column('text')
  text: string;

  @Column('jsonb', { nullable: true })
  actions?: Array<{
    type: string;
    params: any;
    status: 'pending' | 'sent' | 'failed';
  }>;

  @Column('jsonb', { nullable: true })
  metadata?: {
    channel: string;
    tokensUsed?: number;
    embeddingsRetrieved?: number;
    latencyMs?: number;
  };

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
```

---

## 🛡️ Seguridad y Privacidad

### 1. Tenant Isolation (RLS)
```sql
-- Política RLS en Postgres
CREATE POLICY tenant_isolation_policy ON session_contexts
  USING (tenant_id = current_setting('app.current_tenant_id')::TEXT);

ALTER TABLE session_contexts ENABLE ROW LEVEL SECURITY;
```

```typescript
// En cada query, establecer tenant context
await queryRunner.query(`SET app.current_tenant_id = '${tenantId}'`);
```

### 2. Auth: JWT + HMAC
```typescript
// JWT claims
interface JwtPayload {
  sub: string; // userId
  tenantId: string;
  role: string;
  iat: number;
  exp: number;
}

// HMAC para payloads cross-service
function generateHmac(payload: any): string {
  const hmac = crypto.createHmac('sha256', process.env.HMAC_SECRET);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
}
```

### 3. Consent Management
```typescript
@Entity('user_consents')
export class UserConsent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  tenantId: string;

  @Column({ type: 'boolean', default: false })
  voiceRecordingConsent: boolean;

  @Column({ type: 'boolean', default: false })
  dataLearningConsent: boolean;

  @Column({ type: 'timestamptz' })
  consentDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revokedDate?: Date;
}
```

### 4. Audit Logs (Immutable)
```typescript
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tenantId: string;

  @Column()
  @Index()
  correlationId: string;

  @Column('varchar')
  action: string; // 'routing_decision', 'action_trigger', 'llm_call'

  @Column('jsonb')
  payload: any;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  timestamp: Date;
}
```

---

## 📈 Observabilidad

### 1. AppInsights Traces
```typescript
// Decorador para trace automático
@Trace('meta-agent.process')
async process(request: ProcessRequest): Promise<ProcessResponse> {
  const span = telemetry.startSpan('meta-agent.process', {
    correlationId: request.correlationId,
    tenantId: request.tenantId,
    sessionId: request.sessionId
  });

  try {
    // ... lógica
    span.setTag('success', true);
    return response;
  } catch (error) {
    span.setTag('error', true);
    span.log({ event: 'error', message: error.message });
    throw error;
  } finally {
    span.finish();
  }
}
```

### 2. Prometheus Metrics
```typescript
const httpRequestDuration = new promClient.Histogram({
  name: 'meta_agent_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'tenant_id']
});

const llmTokensConsumed = new promClient.Counter({
  name: 'meta_agent_llm_tokens_total',
  help: 'Total LLM tokens consumed',
  labelNames: ['tenant_id', 'model']
});

const vectorSearchResults = new promClient.Histogram({
  name: 'meta_agent_vector_search_results',
  help: 'Number of results from vector search',
  labelNames: ['tenant_id']
});
```

### 3. Structured Logs
```typescript
logger.info({
  message: 'Meta-agent processing request',
  correlationId,
  tenantId,
  sessionId,
  channel: request.channel,
  inputType: request.input.type,
  timestamp: new Date().toISOString()
});
```

### 4. SLO Alerts
```yaml
# Azure Monitor Alert Rules
- name: meta-agent-high-latency
  condition: avg(http_request_duration_seconds) > 2
  window: 5m
  severity: warning

- name: meta-agent-error-rate
  condition: rate(http_requests_total{status_code=~"5.."}) > 0.05
  window: 5m
  severity: critical

- name: meta-agent-llm-failure
  condition: rate(llm_requests_total{status="failed"}) > 0.1
  window: 5m
  severity: critical
```

---

## 🧪 Casos de Uso Conversacionales

### Caso A: Venta por Chat Web (Recuperación de Carrito)
**Flow:**
1. Usuario: "Quiero comprar la zapatilla Kobe, la dejé en el carrito."
2. Meta-agent:
   - Retrieve cart via product API
   - Intent detection: `checkout_flow`
   - Offer coupon, payment link, ask shipping
3. Usuario confirma
4. Meta-agent triggers:
   - `orders.service.create()`
   - `payments.service.initiate()` (Wompi/Stripe)
5. Return payment link in-chat

**Criterio de éxito:** Pago iniciado o reservación en ≤ 2 interacciones

### Caso B: Llamada Inbound (Voz) → Información + Compra
**Flow:**
1. Inbound call → STT → "Quiero información del producto X"
2. Meta-agent:
   - Recognizes intent: `product_inquiry`
   - Retrieve product + stock + price
3. Agent TTS: "El producto X cuesta $Y. ¿Desea reservarlo?"
4. User STT: "Sí"
5. Meta-agent captures address/email via conversación
6. Send payment link via WhatsApp/email

**Criterio de éxito:** Reservación creada; recording stored con consent

### Caso C: Soporte + Escalado Humano
**Flow:**
1. User: "Mi pedido no llegó"
2. Meta-agent tries troubleshooting scripts (knowledge injector)
3. Si confidence < 0.6:
   - Escalate: create ticket
   - Notify human via WebSocket
   - Transfer full context
4. Human agent receives chat history + user info

**Criterio de éxito:** Humano recibe contexto completo; user no repite información

---

## 🚀 Roadmap de Implementación

### Sprint 1 (2 semanas): Foundation & Infra
- Provisionar Azure resources (OpenAI, Speech, Service Bus, KeyVault, Blob)
- Configurar CI/CD pipelines
- Setup monitoring (AppInsights, Prometheus)

### Sprint 2 (2 semanas): Core Meta-Agent API
- Endpoint POST /v2/agents/meta-agent/process
- SessionContext entity + Redis caching
- Vector retrieval client (MongoDB)

### Sprint 3 (2 semanas): LLM Integration
- Azure OpenAI GPT-5 client
- Prompt builder (tenant ADN + safety + docs + context)
- Token accounting + rate limiting

### Sprint 4 (2 semanas): Actions & Orchestration
- Action parser (JSON schema)
- Service Bus publisher
- Consumers (orders, video-generator, post-scheduler)

### Sprint 5 (2 semanas): Voice Flows
- Azure Speech integration (STT/TTS)
- Inbound/outbound call adaptors
- Consent & recording management

### Sprint 6 (2 semanas): Security & Hardening
- RLS implementation
- JwtGuard + HMAC validation
- AppInsights traces + structured logs
- E2E tests + chaos tests

---

## 📚 Referencias

- [Azure OpenAI GPT-5 Docs](https://learn.microsoft.com/azure/ai-services/openai/)
- [Azure Speech Service](https://learn.microsoft.com/azure/ai-services/speech-service/)
- [Cosmos DB Vector Search](https://learn.microsoft.com/azure/cosmos-db/mongodb/vcore/vector-search)
- [Azure Service Bus](https://learn.microsoft.com/azure/service-bus-messaging/)
- [Row-Level Security (RLS) PostgreSQL](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

**Versión:** 2.0  
**Fecha:** 2025-12-04  
**Autor:** Arquitecto Senior + Backend Engineer (Node/NestJS) + DevOps Azure
