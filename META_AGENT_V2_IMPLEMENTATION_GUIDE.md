# Meta-Agent V2 — Guía de Implementación Rápida

## 🚀 Quick Start

Este documento proporciona instrucciones paso a paso para implementar y desplegar Meta-Agent V2 con GPT-5, Voice y Vector DB.

---

## 📋 Pre-requisitos

### Software Requerido
- **Node.js** 18.x o superior
- **npm** 9.x o superior
- **PostgreSQL** 14.x o superior
- **Redis** 6.x o superior  
- **MongoDB** 5.x o superior (o Cosmos DB MongoDB API)
- **Azure CLI** (para deployment)
- **Terraform** 1.0+ (para infra provisioning)

### Cuentas Necesarias
- Azure Subscription activa
- Acceso a Azure OpenAI Service (GPT-5 preview)
- Acceso a Azure Speech Service

---

## 🏗️ Paso 1: Provisionar Infraestructura Azure

### Opción A: Terraform (Recomendado)

```bash
# Navegar a directorio de Terraform
cd infrastructure/terraform

# Inicializar Terraform
terraform init

# Revisar plan
terraform plan -var="environment=dev" -var="tenant_prefix=misybot"

# Aplicar cambios
terraform apply -auto-approve

# Guardar outputs
terraform output > ../../.terraform-outputs
```

### Opción B: Manual (Azure Portal)

Seguir las instrucciones en [`META_AGENT_V2_ARCHITECTURE.md`](./META_AGENT_V2_ARCHITECTURE.md) sección "Infraestructura Azure".

**Recursos a crear:**
1. Azure OpenAI (GPT-5 deployment)
2. Azure Speech Service
3. Service Bus (topic + subscriptions)
4. Key Vault
5. Redis Cache (Premium)
6. PostgreSQL Flexible Server
7. Cosmos DB (MongoDB API)
8. Blob Storage
9. Application Insights

---

## 📦 Paso 2: Configurar Variables de Entorno

### 2.1 Crear archivo `.env.local`

```bash
cd backend-refactor
cp .env.example .env.local
```

### 2.2 Completar variables con valores de Terraform/Portal

```env
# ===== AZURE OPENAI GPT-5 =====
AZURE_OPENAI_GPT5_ENDPOINT=https://your-openai.openai.azure.com
AZURE_OPENAI_GPT5_KEY=***
AZURE_OPENAI_GPT5_DEPLOYMENT=gpt-5-thinking-mini
AZURE_OPENAI_GPT5_API_VERSION=2024-12-01-preview

# Embeddings
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-3-small

# ===== AZURE SPEECH =====
AZURE_SPEECH_KEY=***
AZURE_SPEECH_REGION=eastus2
AZURE_SPEECH_ENDPOINT=https://eastus2.api.cognitive.microsoft.com

# ===== SERVICE BUS =====
AZURE_SERVICE_BUS_CONNECTION_STRING=***
SERVICE_BUS_TOPIC_ACTIONS=meta-agent-actions

# ===== KEY VAULT =====
AZURE_KEY_VAULT_URL=https://your-kv.vault.azure.net/

# ===== REDIS =====
REDIS_HOST=your-redis.redis.cache.windows.net
REDIS_PORT=6380
REDIS_PASSWORD=***
REDIS_TLS=true

# ===== POSTGRESQL =====
DB_HOST=your-psql.postgres.database.azure.com
DB_PORT=5432
DB_USERNAME=misybotadmin
DB_PASSWORD=***
DB_NAME=metaagent_v2
DB_SSL=true

# ===== MONGODB (COSMOS) =====
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=metaagent_vectors
MONGODB_COLLECTION_EMBEDDINGS=tenant_embeddings
MONGODB_VECTOR_INDEX_NAME=tenant_embeddings_index

# ===== BLOB STORAGE =====
AZURE_STORAGE_CONNECTION_STRING=***
AZURE_STORAGE_CONTAINER_AUDIO=audio-recordings
AZURE_STORAGE_CONTAINER_VIDEO=video-assets

# ===== APPLICATION INSIGHTS =====
APPINSIGHTS_INSTRUMENTATIONKEY=***
APPLICATIONINSIGHTS_CONNECTION_STRING=***

# ===== APPLICATION =====
PORT=3007
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000
```

---

## 🗄️ Paso 3: Ejecutar Migraciones de Base de Datos

### 3.1 PostgreSQL

```bash
# Conectar a PostgreSQL
psql -h your-psql.postgres.database.azure.com -U misybotadmin -d metaagent_v2

# Ejecutar migration
\i src/migrations/1733324400000-MetaAgentV2Initial.sql

# Verificar tablas creadas
\dt

# Verificar RLS habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename LIKE '%_v2';
```

### 3.2 MongoDB - Crear Vector Index

```bash
# Conectar a Mongo shell (o usar Azure Portal)
mongosh "mongodb+srv://..."

use metaagent_vectors

# Crear collection
db.createCollection("tenant_embeddings")

# Crear vector index (ejecutar en Azure Portal > Cosmos DB > Data Explorer)
# O esperar a que se cree via código
```

**En Azure Portal:**
1. Ir a Cosmos DB → Data Explorer
2. Seleccionar database `metaagent_vectors`
3. Crear vector index en collection `tenant_embeddings`:
   - Index name: `tenant_embeddings_index`
   - Index type: `vectorSearch`
   - Path: `embedding`
   - Dimensions: `1536`
   - Similarity: `cosine`

---

## 📥 Paso 4: Instalar Dependencias

```bash
cd backend-refactor

# Instalar dependencias
npm install

# Opcional: instalar dependencias adicionales para Meta-Agent V2
npm install prom-client
```

---

## 🔧 Paso 5: Integrar Meta-Agent V2 en App Module

Editar `src/app.module.ts`:

```typescript
import { MetaAgentV2Module } from './meta-agent/v2/meta-agent-v2.module';

@Module({
  imports: [
    // ... existing modules
    MetaAgentV2Module, // ← Add this
  ],
})
export class AppModule {}
```

---

## ✅ Paso 6: Ejecutar Tests

```bash
# Unit tests
npm run test

# E2E tests (meta-agent v2 específicos)
npm run test:e2e -- --testPathPattern=meta-agent-v2

# Coverage
npm run test:cov
```

---

## 🚀 Paso 7: Iniciar Aplicación

### Desarrollo

```bash
npm run start:dev
```

### Producción

```bash
npm run build
npm run start:prod
```

---

## 🧪 Paso 8: Verificar Deployment

### 8.1 Health Check

```bash
curl http://localhost:3007/v2/agents/meta-agent/health
```

**Respuesta esperada:**
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "dependencies": {
    "gpt5": "healthy",
    "vectorDB": "healthy",
    "database": "healthy"
  }
}
```

### 8.2 Test de Proceso

```bash
curl -X POST http://localhost:3007/v2/agents/meta-agent/process \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "test-tenant-123",
    "sessionId": "test-session-456",
    "correlationId": "550e8400-e29b-41d4-a716-446655440000",
    "channel": "web",
    "input": {
      "type": "text",
      "text": "Hola, ¿qué productos tienen disponibles?"
    }
  }'
```

**Respuesta esperada:**
```json
{
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "sessionId": "test-session-456",
  "responseText": "¡Hola! Actualmente tenemos...",
  "metrics": {
    "processingTimeMs": 1250,
    "tokensConsumed": 450,
    "embeddingsUsed": 5,
    "cacheStatus": "miss"
  },
  "timestamp": "2025-12-04T10:30:00.000Z"
}
```

### 8.3 Verificar Swagger UI

Abrir en navegador: `http://localhost:3007/api-docs`

Buscar sección: **"Meta-Agent V2 - AI Engine"**

---

## 📊 Paso 9: Configurar Monitoring

### 9.1 Azure Application Insights

```bash
# Verificar que traces se están enviando
# En Azure Portal: Application Insights → Logs

# Query KQL de ejemplo:
traces
| where operation_Name contains "meta-agent"
| where customDimensions.correlationId != ""
| project timestamp, message, customDimensions
| order by timestamp desc
| take 50
```

### 9.2 Prometheus Metrics

```bash
# Exponer endpoint de métricas (opcional)
curl http://localhost:3007/metrics
```

---

## 🔐 Paso 10: Hardening de Seguridad (Producción)

### 10.1 Habilitar Autenticación JWT

Descomentar guards en `meta-agent-v2.controller.ts`:

```typescript
@UseGuards(JwtAuthGuard, TenantGuard)
export class MetaAgentV2Controller {
  // ...
}
```

### 10.2 Verificar RLS en Postgres

```sql
-- Test RLS con tenant context
SET app.current_tenant_id = 'tenant-123';

SELECT * FROM session_contexts_v2;
-- Debería retornar solo sesiones de tenant-123

SET app.current_tenant_id = 'tenant-456';

SELECT * FROM session_contexts_v2;
-- Debería retornar solo sesiones de tenant-456
```

### 10.3 Rotar Secrets en Key Vault

```bash
# Ejemplo: rotar API key de OpenAI
az keyvault secret set \
  --vault-name your-kv \
  --name AZURE-OPENAI-GPT5-KEY \
  --value NEW_KEY_HERE
```

---

## 🐛 Troubleshooting

### Problema: "Azure OpenAI endpoint not responding"

**Solución:**
1. Verificar que deployment `gpt-5-thinking-mini` existe en Azure Portal
2. Verificar que API key es correcta
3. Verificar que endpoint incluye `/openai/deployments/`

### Problema: "Vector search not working"

**Solución:**
1. Verificar que vector index fue creado en Cosmos DB
2. Verificar que embeddings tienen dimensión 1536
3. Ejecutar test script: `npm run test:mongodb`

### Problema: "RLS blocking queries"

**Solución:**
1. Asegurarse de ejecutar `SET app.current_tenant_id = 'tenant-id'` antes de queries
2. Verificar que RLS policy permite SELECT con ese tenant

### Problema: "Service Bus messages not arriving"

**Solución:**
1. Verificar connection string correcta
2. Verificar que topic y subscriptions existen
3. Revisar dead letter queue para mensajes fallidos

---

## 📈 Métricas Clave a Monitorear

| Métrica | Threshold | Acción |
|---------|-----------|--------|
| Request Latency | > 2s | Investigar slow queries |
| Error Rate | > 5% | Check logs + AppInsights |
| LLM Token Usage | > 100K/día por tenant | Review prompts + alertar |
| Vector Search Latency | > 500ms | Optimize indexes |
| Cache Hit Rate | < 50% | Ajustar TTL o cache strategy |

---

## 🎯 Next Steps

1. **Implementar Voice Flows** (ÉPICA 5)
2. **Configurar Consumers** para orders, video, posts (ÉPICA 4)
3. **Integrar con Frontend** (WebSocket real-time updates)
4. **Setup CI/CD** completo con staging/prod
5. **Load Testing** (k6 o Artillery)
6. **Documentar APIs** para otros equipos

---

## 📚 Documentación Adicional

- [Arquitectura Completa](./META_AGENT_V2_ARCHITECTURE.md)
- [Plan SCRUM](./META_AGENT_V2_SCRUM_PLAN.md)
- [Terraform Infrastructure](./infrastructure/terraform/meta-agent-v2-main.tf)
- [API Swagger](http://localhost:3007/api-docs)

---

## 🆘 Soporte

**Issues:** Crear issue en repositorio con tag `meta-agent-v2`  
**Slack:** `#meta-agent-v2-dev`  
**Email:** devops@misybot.com

---

**Versión:** 1.0  
**Fecha:** 2025-12-04  
**Autor:** DevOps Team + Backend Engineers
