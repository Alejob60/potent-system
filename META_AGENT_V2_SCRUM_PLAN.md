# Meta-Agent V2 — Plan SCRUM Detallado

## 📋 Overview

Este documento detalla el plan de implementación SCRUM para Meta-Agent V2, dividido en 6 épicas con sprints de 2 semanas cada uno. Incluye stories, tareas técnicas, criterios de aceptación y estimaciones.

---

## 🎯 ÉPICA 1 — Foundation & Infrastructure

**Duración:** 2 semanas (Sprint 1)  
**Objetivo:** Provisionar y configurar toda la infraestructura Azure necesaria para Meta-Agent V2

### Sprint 1.1: Provisión de Recursos Azure

#### Story 1.1.1: Provisionar Azure OpenAI con GPT-5
**Como:** Arquitecto DevOps  
**Quiero:** Provisionar Azure OpenAI Service con deployments GPT-5 y embeddings  
**Para:** Tener disponible el LLM principal del sistema

**Tareas:**
1. Crear Cognitive Service (OpenAI) en Azure Portal o Terraform
2. Configurar deployment `gpt-5-thinking-mini` con capacity 100 TPM
3. Configurar deployment `text-embedding-3-small` para embeddings
4. Obtener endpoint y API key
5. Almacenar secrets en Azure Key Vault
6. Validar conectividad con test script

**Criterios de Aceptación:**
- ✅ Deployment GPT-5 responde correctamente a llamada de test
- ✅ Embedding service retorna vectores de 1536 dimensiones
- ✅ Secrets almacenados en Key Vault y accesibles
- ✅ Latencia promedio < 2s para llamadas GPT-5

**Estimación:** 2 días

---

#### Story 1.1.2: Provisionar Azure Speech Service
**Como:** Arquitecto DevOps  
**Quiero:** Provisionar Azure Speech Service para STT/TTS  
**Para:** Soportar flujos de voz (llamadas y WebVoice)

**Tareas:**
1. Crear Cognitive Service (Speech) en región eastus2
2. Configurar Voice Live API access
3. Configurar Custom Voice (opcional)
4. Obtener key y region
5. Almacenar en Key Vault
6. Test STT con audio de muestra
7. Test TTS con texto de muestra

**Criterios de Aceptación:**
- ✅ STT transcribe audio correctamente (español)
- ✅ TTS genera audio natural
- ✅ Latencia STT < 1s para 5s de audio
- ✅ Secrets en Key Vault

**Estimación:** 2 días

---

#### Story 1.1.3: Configurar Service Bus para Orquestación
**Como:** Arquitecto DevOps  
**Quiero:** Configurar Azure Service Bus con topics/subscriptions  
**Para:** Orquestar acciones entre agentes especializados

**Tareas:**
1. Crear Service Bus Namespace (Standard tier)
2. Crear topic `meta-agent-actions`
3. Crear subscriptions:
   - `orders-consumer`
   - `video-generator-consumer`
   - `voice-consumer`
   - `post-scheduler-consumer`
4. Configurar dead letter queues
5. Configurar retention policies (7 días)
6. Obtener connection string
7. Almacenar en Key Vault
8. Test publish/subscribe con mensaje de prueba

**Criterios de Aceptación:**
- ✅ Messages publicados llegan a subscriptions
- ✅ DLQ configurada y funcional
- ✅ Idempotency garantizada (deduplication window 60s)
- ✅ Secrets en Key Vault

**Estimación:** 1 día

---

#### Story 1.1.4: Configurar MongoDB (Cosmos DB) para Vector Search
**Como:** Arquitecto DevOps  
**Quiero:** Configurar Cosmos DB MongoDB API con índice vectorial  
**Para:** Almacenar y buscar embeddings semánticos

**Tareas:**
1. Crear Cosmos DB Account (MongoDB API, serverless)
2. Crear database `metaagent_vectors`
3. Crear collection `tenant_embeddings`
4. Crear vector index en Azure Portal:
   - Path: `embedding`
   - Dimensions: 1536
   - Similarity: cosine
   - Index name: `tenant_embeddings_index`
5. Crear compound indexes (tenantId + timestamp)
6. Obtener connection string
7. Almacenar en Key Vault
8. Test insert + vector search

**Criterios de Aceptación:**
- ✅ Vector index funcional
- ✅ Semantic search retorna resultados ordenados por score
- ✅ Query latency < 500ms para 10K documentos
- ✅ Secrets en Key Vault

**Estimación:** 2 días

---

#### Story 1.1.5: Configurar Redis Cache y PostgreSQL
**Como:** Arquitecto DevOps  
**Quiero:** Configurar Redis Premium y PostgreSQL Flexible Server  
**Para:** Session caching y almacenamiento relacional

**Tareas:**
1. Crear Redis Cache (Premium P1, TLS 1.2, non-SSL disabled)
2. Configurar persistence (RDB snapshots)
3. Obtener hostname + key
4. Crear PostgreSQL Flexible Server (GP_Standard_D2s_v3)
5. Crear database `metaagent_v2`
6. Habilitar RLS (Row-Level Security) en Postgres
7. Configurar firewall rules
8. Almacenar credentials en Key Vault
9. Test conectividad

**Criterios de Aceptación:**
- ✅ Redis responde con latency < 10ms
- ✅ Postgres acepta conexiones TLS
- ✅ RLS configurado y probado
- ✅ Secrets en Key Vault

**Estimación:** 2 días

---

#### Story 1.1.6: Configurar Blob Storage y App Insights
**Como:** Arquitecto DevOps  
**Quiero:** Configurar Blob Storage y Application Insights  
**Para:** Almacenar assets (audio/video) y observabilidad

**Tareas:**
1. Crear Storage Account (Standard LRS, TLS 1.2)
2. Crear containers:
   - `audio-recordings` (private)
   - `video-assets` (private)
3. Configurar lifecycle policies (delete after 90d)
4. Crear Log Analytics Workspace
5. Crear Application Insights (Node.JS)
6. Habilitar distributed tracing
7. Obtener instrumentation key
8. Almacenar en Key Vault
9. Test upload/download blob
10. Test AppInsights trace

**Criterios de Aceptación:**
- ✅ Blobs se suben y descargan correctamente
- ✅ Lifecycle policies activas
- ✅ AppInsights recibe traces con correlationId
- ✅ Secrets en Key Vault

**Estimación:** 1 día

---

### Sprint 1.2: CI/CD Pipeline

#### Story 1.2.1: Configurar Pipeline Azure DevOps
**Como:** DevOps Engineer  
**Quiero:** Configurar pipeline CI/CD completo  
**Para:** Deployar Meta-Agent V2 a staging y producción

**Tareas:**
1. Crear `azure-pipelines.yml` en repo
2. Configurar build stage:
   - npm install
   - npm run build
   - npm run test
   - SonarQube scan (opcional)
3. Configurar test stage:
   - Unit tests
   - Integration tests
   - Coverage > 80%
4. Configurar deploy stage (staging):
   - Deploy to Azure Web App (staging slot)
   - Run smoke tests
5. Configurar deploy stage (prod):
   - Swap staging → production
   - Manual approval gate
6. Configurar secret scanning (detect-secrets)
7. Configurar notifications (Teams/Slack)

**Criterios de Aceptación:**
- ✅ Pipeline ejecuta build/test/deploy sin errores
- ✅ Coverage > 80%
- ✅ Deploy a staging automático
- ✅ Deploy a prod requiere aprobación manual
- ✅ No secrets en código

**Estimación:** 3 días

---

## 🎯 ÉPICA 2 — Core Meta-Agent API & Context

**Duración:** 2 semanas (Sprint 2)  
**Objetivo:** Implementar endpoint principal `/v2/agents/meta-agent/process` y gestión de contexto

### Sprint 2.1: Endpoint Principal

#### Story 2.1.1: Implementar DTOs y Validación
**Como:** Backend Developer  
**Quiero:** Crear DTOs con validación robusta  
**Para:** Garantizar integridad de datos de entrada/salida

**Tareas:**
1. Crear `process-request.dto.ts` con class-validator
2. Crear `process-response.dto.ts`
3. Implementar validaciones:
   - tenantId: string not empty
   - sessionId: string not empty
   - correlationId: UUID v4
   - channel: enum
   - input: nested validation
4. Crear unit tests para DTOs
5. Documentar con Swagger decorators

**Criterios de Aceptación:**
- ✅ Validación rechaza payloads inválidos (400)
- ✅ Swagger UI muestra schemas correctamente
- ✅ Unit tests > 90% coverage

**Estimación:** 1 día

---

#### Story 2.1.2: Implementar Controller POST /process
**Como:** Backend Developer  
**Quiero:** Crear controller con endpoint `/v2/agents/meta-agent/process`  
**Para:** Recibir requests de usuarios

**Tareas:**
1. Crear `meta-agent-v2.controller.ts`
2. Implementar método `process()`
3. Agregar guards (JWT, Tenant, HMAC) - stubs por ahora
4. Agregar logging estructurado
5. Agregar try/catch con fallback response
6. Documentar con Swagger
7. Crear integration tests

**Criterios de Aceptación:**
- ✅ Endpoint responde 200 con payload válido
- ✅ Endpoint responde 400/401/500 según caso
- ✅ Logs estructurados con correlationId
- ✅ Integration tests > 80% coverage

**Estimación:** 2 días

---

### Sprint 2.2: Session Context Management

#### Story 2.2.1: Implementar SessionContext Entity
**Como:** Backend Developer  
**Quiero:** Crear entity TypeORM para session contexts  
**Para:** Persistir contexto de sesiones en Postgres

**Tareas:**
1. Crear `session-context.entity.ts` con decorators TypeORM
2. Definir interfaces `ShortContextData`, `ConversationTurn`
3. Agregar indexes (tenantId+sessionId unique, tenantId+updatedAt)
4. Crear migration SQL
5. Crear unit tests

**Criterios de Aceptación:**
- ✅ Entity mapeada correctamente a tabla
- ✅ Indexes creados en DB
- ✅ Migration ejecutada sin errores
- ✅ Unit tests > 90%

**Estimación:** 1 día

---

#### Story 2.2.2: Implementar SessionContextService
**Como:** Backend Developer  
**Quiero:** Crear service para gestionar session contexts  
**Para:** Proveer CRUD y caching de contextos

**Tareas:**
1. Crear `session-context.service.ts`
2. Implementar métodos:
   - `getOrCreateContext()`
   - `addConversationTurn()`
   - `updateShortContext()`
   - `getRecentTurns()`
   - `compressContext()`
   - `deleteSession()` (GDPR)
3. Integrar Redis caching (stub por ahora)
4. Implementar compresión de contexto (keep last 10 turns)
5. Crear unit tests
6. Crear integration tests con DB

**Criterios de Aceptación:**
- ✅ Context creado/recuperado correctamente
- ✅ Turns agregados en orden
- ✅ Compresión mantiene últimos 10 turns
- ✅ Delete elimina datos completamente (GDPR)
- ✅ Tests > 85% coverage

**Estimación:** 3 días

---

### Sprint 2.3: Vector Retrieval

#### Story 2.3.1: Implementar Tenant-Scoped Vector Retrieval
**Como:** Backend Developer  
**Quiero:** Crear service para semantic search tenant-scoped  
**Para:** Recuperar documentos relevantes desde MongoDB

**Tareas:**
1. Extender `MongoVectorService` existente
2. Implementar `semanticSearchTenantScoped()`:
   - Query embedding
   - Filter por tenantId
   - Top-K results (limit)
   - Threshold (0.75 default)
3. Agregar metrics (search time, results count)
4. Crear unit tests (mock MongoDB)
5. Crear integration tests (test MongoDB)

**Criterios de Aceptación:**
- ✅ Search retorna solo docs del tenant correcto
- ✅ Results ordenados por score descendente
- ✅ Threshold filtra docs con score < 0.75
- ✅ Query latency < 500ms
- ✅ Tests > 85% coverage

**Estimación:** 2 días

---

## 🎯 ÉPICA 3 — LLM Integration & Prompting

**Duración:** 2 semanas (Sprint 3)  
**Objetivo:** Integrar GPT-5 y construir sistema de prompting

### Sprint 3.1: GPT-5 Client

#### Story 3.1.1: Implementar AzureOpenAIGPT5Service
**Como:** Backend Developer  
**Quiero:** Crear service robusto para llamar GPT-5  
**Para:** Generar respuestas inteligentes

**Tareas:**
1. Crear `azure-openai-gpt5.service.ts`
2. Implementar `chatCompletion()`:
   - Build URL with deployment
   - HTTP POST con retry logic (exponential backoff)
   - Rate limiting (429 handling)
   - Timeout 30s
3. Implementar `generateEmbedding()`
4. Agregar metrics Prometheus:
   - Tokens consumed (counter)
   - Request duration (histogram)
   - Request count (counter by status)
5. Implementar `healthCheck()`
6. Crear unit tests (mock HTTP)
7. Crear integration tests (real API)

**Criterios de Aceptación:**
- ✅ Chat completion retorna respuesta válida
- ✅ Retry funciona en errores 429/5xx (max 3)
- ✅ Metrics exportadas correctamente
- ✅ Health check retorna status
- ✅ Tests > 90% coverage

**Estimación:** 3 días

---

#### Story 3.1.2: Implementar Token Accounting y Rate Limiting
**Como:** Backend Developer  
**Quiero:** Trackear consumo de tokens por tenant  
**Para:** Controlar costos y prevenir abuso

**Tareas:**
1. Crear tabla `token_usage` (tenantId, date, tokens_used)
2. Implementar tracking post-LLM call
3. Implementar rate limiter por tenant (max tokens/día)
4. Agregar alertas si tenant excede límite
5. Crear dashboard Grafana para visualizar
6. Crear tests

**Criterios de Aceptación:**
- ✅ Tokens trackeados correctamente por tenant
- ✅ Rate limit bloquea requests si excede cuota
- ✅ Alert enviado a Teams/Slack si threshold > 80%
- ✅ Dashboard muestra consumo en tiempo real

**Estimación:** 2 días

---

### Sprint 3.2: Prompt Builder

#### Story 3.2.1: Implementar Prompt Builder con Tenant ADN
**Como:** Backend Developer  
**Quiero:** Construir prompts dinámicos con tenant ADN, safety policy y retrieved docs  
**Para:** Personalizar respuestas por tenant y contexto

**Tareas:**
1. Implementar `buildSystemPrompt()`:
   - Cargar tenant ADN desde `TenantContextStore`
   - Insertar safety policy
   - Formatear correctamente
2. Implementar `buildContextPrompt()`:
   - Formatear retrieved docs
   - Formatear recent turns
   - Limitar tokens totales (< 8000)
3. Implementar prompt size guard (truncate si excede)
4. Crear tests con diferentes tenants

**Criterios de Aceptación:**
- ✅ Prompt incluye tenant ADN correctamente
- ✅ Prompt incluye top-K retrieved docs
- ✅ Prompt incluye últimos 5 turns
- ✅ Prompt total < 8000 tokens
- ✅ Tests > 85% coverage

**Estimación:** 2 días

---

## 🎯 ÉPICA 4 — Actions & Orchestration

**Duración:** 2 semanas (Sprint 4)  
**Objetivo:** Parser de acciones y orquestación vía Service Bus

### Sprint 4.1: Action Parser

#### Story 4.1.1: Implementar Parser de Acciones JSON
**Como:** Backend Developer  
**Quiero:** Extraer acciones del LLM response en formato JSON  
**Para:** Ejecutar acciones downstream

**Tareas:**
1. Definir formato de acción:
   ```
   <ACTION>{"type":"create_order","params":{...},"target":"orders-service"}</ACTION>
   ```
2. Implementar `parseActions()`:
   - Regex para extraer <ACTION>...</ACTION>
   - Parse JSON
   - Validate schema (Zod)
3. Agregar error handling (action malformada → log warning)
4. Crear tests con diferentes payloads

**Criterios de Aceptación:**
- ✅ Parser extrae acciones correctamente
- ✅ JSON malformado no rompe flujo (log warning)
- ✅ Schema validation rechaza acciones inválidas
- ✅ Tests > 90% coverage

**Estimación:** 2 días

---

#### Story 4.1.2: Implementar Service Bus Publisher
**Como:** Backend Developer  
**Quiero:** Publicar acciones a Service Bus topic  
**Para:** Triggerar ejecución en agentes especializados

**Tareas:**
1. Crear `service-bus-publisher.service.ts`
2. Implementar `publishAction()`:
   - Build message con headers (correlationId, tenantId)
   - Publish to topic `meta-agent-actions`
   - Add message properties (type, timestamp)
3. Implementar retry logic (max 3)
4. Agregar metrics (messages published, failures)
5. Crear tests (mock Service Bus)

**Criterios de Aceptación:**
- ✅ Messages publicados correctamente
- ✅ Headers incluyen correlationId y tenantId
- ✅ Retry funciona en errores transitorios
- ✅ Metrics correctas
- ✅ Tests > 85% coverage

**Estimación:** 2 días

---

### Sprint 4.2: Consumers

#### Story 4.2.1: Implementar Orders Consumer
**Como:** Backend Developer  
**Quiero:** Consumir mensajes de `orders-consumer` subscription  
**Para:** Crear órdenes en sistema de ecommerce

**Tareas:**
1. Crear `orders-consumer.service.ts`
2. Implementar `handleMessage()`:
   - Parse message
   - Validate action type = `create_order`
   - Call orders API (HTTP POST)
   - Update action status in DB
3. Implementar idempotency (check duplicates por correlationId)
4. Implementar DLQ handling (max 10 deliveries)
5. Agregar logging
6. Crear tests

**Criterios de Aceptación:**
- ✅ Orders creadas correctamente
- ✅ Idempotency garantizada (no duplicados)
- ✅ DLQ recibe mensajes fallidos tras 10 intentos
- ✅ Tests > 80% coverage

**Estimación:** 3 días

---

#### Story 4.2.2: Implementar Video & Post Consumers
**Como:** Backend Developer  
**Quiero:** Consumir mensajes de `video-generator-consumer` y `post-scheduler-consumer`  
**Para:** Generar videos y agendar posts

**Tareas:**
1. Crear `video-generator-consumer.service.ts`
2. Crear `post-scheduler-consumer.service.ts`
3. Implementar handlers similares a orders consumer
4. Integrar con servicios existentes
5. Crear tests

**Criterios de Aceptación:**
- ✅ Consumers funcionan correctamente
- ✅ Idempotency y DLQ configurados
- ✅ Tests > 80% coverage

**Estimación:** 3 días

---

## 🎯 ÉPICA 5 — Voice Flows

**Duración:** 2 semanas (Sprint 5)  
**Objetivo:** Integrar Azure Speech para flujos de voz

### Sprint 5.1: Speech Integration

#### Story 5.1.1: Implementar Azure Speech STT Service
**Como:** Backend Developer  
**Quiero:** Integrar Speech-to-Text streaming  
**Para:** Transcribir audio en tiempo real

**Tareas:**
1. Crear `azure-speech-stt.service.ts`
2. Implementar `streamSTT()`:
   - Connect to Azure Speech WebSocket
   - Stream audio chunks
   - Emit events (interim, final)
3. Configurar idioma español (es-MX)
4. Agregar error handling
5. Crear tests

**Criterios de Aceptación:**
- ✅ Audio transcrito correctamente
- ✅ Latency < 1s para fragmentos de 5s
- ✅ Events emitidos correctamente
- ✅ Tests > 80% coverage

**Estimación:** 3 días

---

#### Story 5.1.2: Implementar Azure Speech TTS Service
**Como:** Backend Developer  
**Quiero:** Integrar Text-to-Speech streaming  
**Para:** Generar audio natural

**Tareas:**
1. Crear `azure-speech-tts.service.ts`
2. Implementar `streamTTS()`:
   - Convert text to audio stream
   - Return audio chunks
3. Configurar voz neural (es-MX-DaliaNeural)
4. Agregar SSML support (opcional)
5. Crear tests

**Criterios de Aceptación:**
- ✅ Audio generado correctamente
- ✅ Calidad: neural voice
- ✅ Latency < 2s para 50 palabras
- ✅ Tests > 80% coverage

**Estimación:** 2 días

---

#### Story 5.1.3: Implementar Voice Call Adaptor
**Como:** Backend Developer  
**Quiero:** Crear adaptador para manejar llamadas inbound/outbound  
**Para:** Integrar STT/TTS con gateway SIP/WebRTC

**Tareas:**
1. Crear `voice-call-adaptor.service.ts`
2. Implementar flujo inbound:
   - Receive call → STT → Meta-Agent → TTS → Return audio
3. Implementar flujo outbound:
   - Trigger call → Play IVR → Capture response
4. Integrar con gateway (stub por ahora)
5. Crear tests

**Criterios de Aceptación:**
- ✅ Flujo inbound funcional end-to-end
- ✅ Flujo outbound funcional
- ✅ Tests > 75% coverage

**Estimación:** 4 días

---

### Sprint 5.2: Consent & Recording

#### Story 5.2.1: Implementar Consent Management
**Como:** Backend Developer  
**Quiero:** Gestionar consentimientos de usuarios para grabación de voz  
**Para:** Cumplir con regulaciones de privacidad

**Tareas:**
1. Crear entity `UserConsent`
2. Implementar CRUD operations
3. Agregar validación pre-recording:
   - Si no hay consent → pedir consent
   - Si consent → grabar
4. Implementar revocación de consent
5. Crear tests

**Criterios de Aceptación:**
- ✅ Consent almacenado correctamente
- ✅ Recording solo si consent = true
- ✅ Revocación elimina recordings existentes
- ✅ Tests > 85% coverage

**Estimación:** 2 días

---

#### Story 5.2.2: Implementar Recording Storage en Blob
**Como:** Backend Developer  
**Quiero:** Almacenar recordings en Blob Storage  
**Para:** Persistir audios con políticas de retención

**Tareas:**
1. Crear `recording-storage.service.ts`
2. Implementar `uploadRecording()`:
   - Upload audio to container `audio-recordings`
   - Add metadata (tenantId, sessionId, consent)
3. Implementar `downloadRecording()`
4. Implementar `deleteRecording()` (GDPR)
5. Configurar lifecycle policies (delete after 90d)
6. Crear tests

**Criterios de Aceptación:**
- ✅ Recordings subidos correctamente
- ✅ Metadata incluida
- ✅ Download funcional
- ✅ Delete elimina blob
- ✅ Lifecycle policy activa
- ✅ Tests > 85% coverage

**Estimación:** 2 días

---

## 🎯 ÉPICA 6 — Security & Observability

**Duración:** 2 semanas (Sprint 6)  
**Objetivo:** Hardening de seguridad y observabilidad completa

### Sprint 6.1: Security

#### Story 6.1.1: Implementar RLS (Row-Level Security) en Postgres
**Como:** Backend Developer  
**Quiero:** Implementar políticas RLS en todas las tablas  
**Para:** Garantizar aislamiento de datos por tenant

**Tareas:**
1. Crear SQL migration con RLS policies:
   ```sql
   CREATE POLICY tenant_isolation_policy ON session_contexts_v2
     USING (tenant_id = current_setting('app.current_tenant_id')::TEXT);
   ```
2. Aplicar a todas las tablas V2
3. Modificar queries para establecer tenant context:
   ```sql
   SET app.current_tenant_id = '${tenantId}';
   ```
4. Crear tests de seguridad (intentar acceder datos de otro tenant)

**Criterios de Aceptación:**
- ✅ RLS activo en todas las tablas
- ✅ Query sin tenant context falla
- ✅ Query con tenant incorrecto retorna 0 filas
- ✅ Tests de seguridad pasan

**Estimación:** 2 días

---

#### Story 6.1.2: Implementar JWT Guard y HMAC Validation
**Como:** Backend Developer  
**Quiero:** Validar JWT tokens y firmas HMAC  
**Para:** Autenticar requests y prevenir tampering

**Tareas:**
1. Crear `JwtAuthGuard`:
   - Validate JWT token
   - Extract claims (sub, tenantId, role)
   - Set in request context
2. Crear `TenantGuard`:
   - Validate tenantId in payload matches JWT claim
3. Crear `HmacGuard`:
   - Validate HMAC signature en payloads cross-service
4. Aplicar guards en controller
5. Crear tests

**Criterios de Aceptación:**
- ✅ Requests sin JWT → 401
- ✅ JWT inválido → 401
- ✅ tenantId mismatch → 403
- ✅ HMAC inválido → 403
- ✅ Tests > 90% coverage

**Estimación:** 3 días

---

### Sprint 6.2: Observability

#### Story 6.2.1: Implementar AppInsights Traces con Correlation
**Como:** Backend Developer  
**Quiero:** Enviar traces estructurados a AppInsights  
**Para:** Debuggear problemas en producción

**Tareas:**
1. Configurar AppInsights SDK
2. Crear decorator `@Trace()` para auto-tracing
3. Implementar correlation ID propagation:
   - Extract from request
   - Set in all traces/logs
   - Propagate to downstream services
4. Agregar custom events:
   - `meta_agent.process.start`
   - `meta_agent.llm.call`
   - `meta_agent.action.published`
5. Crear dashboard en Azure Portal

**Criterios de Aceptación:**
- ✅ Traces visibles en AppInsights
- ✅ Correlation ID presente en todos los traces
- ✅ Dashboard muestra request flow end-to-end
- ✅ Query latency visible

**Estimación:** 2 días

---

#### Story 6.2.2: Implementar Structured Logging y SLO Alerts
**Como:** Backend Developer  
**Quiero:** Logs JSON estructurados y alertas SLO  
**Para:** Detectar degradaciones rápidamente

**Tareas:**
1. Configurar Winston logger con formato JSON
2. Agregar campos estándar:
   - timestamp, level, message, correlationId, tenantId, sessionId
3. Crear Azure Monitor Alert Rules:
   - Latency > 2s (5min window) → Warning
   - Error rate > 5% (5min window) → Critical
   - LLM failure rate > 10% (5min window) → Critical
4. Configurar notificaciones (email, Teams)
5. Crear runbook para cada alerta

**Criterios de Aceptación:**
- ✅ Logs en formato JSON
- ✅ Alertas configuradas y funcionales
- ✅ Notificaciones llegan correctamente
- ✅ Runbooks documentados

**Estimación:** 2 días

---

## 📊 Resumen de Estimaciones

| Épica | Stories | Estimación Total |
|-------|---------|------------------|
| ÉPICA 1 - Foundation & Infra | 7 | 13 días (~2.5 semanas) |
| ÉPICA 2 - Core API & Context | 5 | 9 días (~2 semanas) |
| ÉPICA 3 - LLM Integration | 4 | 9 días (~2 semanas) |
| ÉPICA 4 - Actions & Orchestration | 4 | 10 días (~2 semanas) |
| ÉPICA 5 - Voice Flows | 5 | 13 días (~2.5 semanas) |
| ÉPICA 6 - Security & Observability | 4 | 9 días (~2 semanas) |
| **TOTAL** | **29** | **~13 semanas (3 meses)** |

---

## 🚀 Roadmap Visual

```
Sprint 1-2:  [ÉPICA 1] Foundation & Infra
Sprint 3-4:  [ÉPICA 2] Core API & Context
Sprint 5-6:  [ÉPICA 3] LLM Integration
Sprint 7-8:  [ÉPICA 4] Actions & Orchestration
Sprint 9-10: [ÉPICA 5] Voice Flows
Sprint 11-12:[ÉPICA 6] Security & Observability
Sprint 13:   Buffer + E2E Testing + Documentation
```

---

## 📋 Definition of Done (DoD)

Para considerar una story **DONE**, debe cumplir:

✅ Código implementado y mergeado a `main`  
✅ Unit tests escritos (coverage > 80%)  
✅ Integration tests escritos (si aplica)  
✅ Code review aprobado  
✅ Documentación actualizada (README, Swagger)  
✅ Logs estructurados agregados  
✅ Métricas implementadas (si aplica)  
✅ Deploy exitoso a staging  
✅ Smoke tests pasan en staging  

---

**Versión:** 1.0  
**Fecha:** 2025-12-04  
**Autor:** Arquitecto Senior + Scrum Master
