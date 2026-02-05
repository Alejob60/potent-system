# 📊 MODELO DE DATOS MULTITENANT

### Tablas relacionales

#### tenants
```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(75) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    website_url VARCHAR(500),
    business_industry VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### tenant_credentials
```sql
CREATE TABLE tenant_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    client_id VARCHAR(100) UNIQUE NOT NULL,
    client_secret_encrypted TEXT NOT NULL,
    hmac_secret_encrypted TEXT NOT NULL,
    jwt_public_key TEXT,
    jwt_private_key_encrypted TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    rotated_at TIMESTAMP
);
```

#### tenant_domains
```sql
CREATE TABLE tenant_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    domain VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### tenant_limits
```sql
CREATE TABLE tenant_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    agent_usage_limit INTEGER DEFAULT 1000,
    requests_per_minute INTEGER DEFAULT 100,
    requests_per_hour INTEGER DEFAULT 5000,
    storage_limit_mb INTEGER DEFAULT 1000,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### sessions
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    channel VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    context JSONB
) WITH (tenant_id);
```

#### conversations
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    session_id UUID,
    user_id VARCHAR(100),
    message TEXT,
    response TEXT,
    agent_name VARCHAR(100),
    sentiment VARCHAR(20),
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) WITH (tenant_id);
```

#### workflows
```sql
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    workflow_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255),
    status VARCHAR(20),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT
) WITH (tenant_id);
```

#### workflow_steps
```sql
CREATE TABLE workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    workflow_id UUID,
    step_name VARCHAR(100),
    status VARCHAR(20),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    input_data JSONB,
    output_data JSONB
) WITH (tenant_id);
```

#### local_context
```sql
CREATE TABLE local_context (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    context_key VARCHAR(255),
    context_value JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) WITH (tenant_id);
```

#### global_context
```sql
CREATE TABLE global_context (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_key VARCHAR(255),
    context_value JSONB,
    source_tenant_id UUID,
    anonymized BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### user_consent
```sql
CREATE TABLE user_consent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id VARCHAR(100),
    consent_type VARCHAR(100),
    granted BOOLEAN DEFAULT false,
    granted_at TIMESTAMP,
    revoked_at TIMESTAMP,
    consent_details JSONB
) WITH (tenant_id);
```

### RLS policies

#### Política para tabla tenants
```sql
CREATE POLICY tenant_isolation_policy ON tenants
FOR ALL TO authenticated
USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

#### Política para tabla tenant_credentials
```sql
CREATE POLICY tenant_credentials_policy ON tenant_credentials
FOR ALL TO authenticated
USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

#### Política para tabla sessions
```sql
CREATE POLICY sessions_policy ON sessions
FOR ALL TO authenticated
USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

#### Política para tabla conversations
```sql
CREATE POLICY conversations_policy ON conversations
FOR ALL TO authenticated
USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

#### Política para tabla workflows
```sql
CREATE POLICY workflows_policy ON workflows
FOR ALL TO authenticated
USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

#### Política para tabla workflow_steps
```sql
CREATE POLICY workflow_steps_policy ON workflow_steps
FOR ALL TO authenticated
USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

#### Política para tabla local_context
```sql
CREATE POLICY local_context_policy ON local_context
FOR ALL TO authenticated
USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

#### Política para tabla user_consent
```sql
CREATE POLICY user_consent_policy ON user_consent
FOR ALL TO authenticated
USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

### Campos obligatorios

1. **tenantId** - Identificador único del tenant en todas las tablas
2. **contextScope** - Indicador de alcance del contexto (local/global)
3. **consentFlag** - Indicador de consentimiento para procesamiento de datos
4. **createdAt** - Timestamp de creación del registro
5. **updatedAt** - Timestamp de última actualización
6. **createdBy** - Identificador del usuario/tenant que creó el registro
7. **updatedBy** - Identificador del usuario/tenant que actualizó el registro

### Estructuras JSON para memoria, embeddings y aprendizajes

#### Estructura de memoria de contexto
```json
{
  "sessionId": "uuid-string",
  "userId": "user-identifier",
  "conversationHistory": [
    {
      "timestamp": "ISO-timestamp",
      "role": "user|assistant",
      "content": "message-content",
      "metadata": {
        "channel": "web|whatsapp|etc",
        "sentiment": "positive|negative|neutral",
        "confidence": 0.95
      }
    }
  ],
  "userPreferences": {
    "language": "es|en|fr",
    "tone": "formal|casual|professional",
    "topics": ["topic1", "topic2"]
  },
  "businessContext": {
    "industry": "technology|healthcare|finance",
    "size": "small|medium|large",
    "location": "country-code"
  },
  "sessionMetadata": {
    "startTime": "ISO-timestamp",
    "lastActivity": "ISO-timestamp",
    "channel": "web|whatsapp|etc",
    "device": "mobile|desktop"
  }
}
```

#### Estructura de embeddings
```json
{
  "embeddingId": "uuid-string",
  "sourceText": "original text content",
  "vector": [0.123, 0.456, 0.789],
  "metadata": {
    "tenantId": "tenant-uuid",
    "contentType": "conversation|document|faq",
    "language": "es|en|fr",
    "timestamp": "ISO-timestamp",
    "tags": ["tag1", "tag2"],
    "consentVerified": true
  },
  "anonymized": true,
  "anonymizationMetadata": {
    "method": "masking|hashing|removal",
    "originalFields": ["field1", "field2"]
  }
}
```

#### Estructura de aprendizajes
```json
{
  "learningId": "uuid-string",
  "type": "pattern|insight|correlation",
  "sourceTenantId": "tenant-uuid",
  "isGlobal": true,
  "content": {
    "pattern": "description of pattern",
    "confidence": 0.85,
    "supportingData": [
      {
        "dataPoint": "data-point-description",
        "relevance": 0.92
      }
    ],
    "application": "how to apply this learning"
  },
  "metadata": {
    "createdAt": "ISO-timestamp",
    "updatedAt": "ISO-timestamp",
    "contributors": ["tenant-uuid-1", "tenant-uuid-2"],
    "anonymized": true,
    "validationStatus": "pending|validated|rejected"
  }
}
```