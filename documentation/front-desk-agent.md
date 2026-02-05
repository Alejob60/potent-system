# Front Desk Agent

## 🧾 Nombre del Agente
**Front Desk Agent** (Alias simbólico: Conector Universal, Rol emocional: El que escucha, recuerda, conecta y activa)

## 🎯 Objetivo General
Diseñar y extender el Front Desk Agent como un router conversacional persistente, capaz de:

- Procesar mensajes del usuario en tiempo real
- Construir contexto emocional y técnico
- Enrutar a agentes internos especializados
- Activar integraciones externas (Google Ads, TikTok, Meta, etc.)
- Mantener trazabilidad de cada conversación y conexión

## 🔧 Funciones Extendidas

### 1. Persistencia de Contexto Conversacional
- Guardar cada mensaje con timestamp, intención, entidades extraídas y emociones detectadas
- Asociar contexto a sessionId y userId
- Comprimir información para mantener contexto funcional y reducir tamaño de almacenamiento

### 2. Enrutamiento Inteligente
- Determinar el agente interno más adecuado (video-scriptor, analytics-reporter, etc.)
- Si el objetivo requiere conexión externa (ej. publicar en TikTok), activar módulo de integración

### 3. Activación de Integraciones Externas
Conectar con APIs de:
- Google Ads: campañas, keywords, performance
- TikTok: publicación de videos, insights de engagement
- Meta (Facebook/Instagram): programación de posts, análisis de audiencia

### 4. Validación de Información Faltante
- Detectar campos faltantes para completar la intención del usuario
- Generar preguntas aclaratorias con tono emocional y estratégico

### 5. Generación de Respuestas Contextuales
- Responder con empatía, claridad y trazabilidad
- Incluir sugerencias, ejemplos y visualizaciones si aplica

## 🔌 Endpoints

### 📥 Procesar Mensaje del Usuario
```
POST /api/agents/front-desk
```
**Descripción**: Analiza el mensaje del usuario y enruta al agente apropiado

**Body**:
```json
{
  "message": "string",
  "context": {
    "sessionId": "string",
    "userId": "string",
    "language": "string"
  }
}
```

**Respuesta**:
```json
{
  "agent": "front-desk",
  "status": "ready|clarification_needed",
  "conversation": {
    "userMessage": "string",
    "agentResponse": "string",
    "objective": "string",
    "targetAgent": "string",
    "collectedInfo": {},
    "missingInfo": [],
    "confidence": 0.92,
    "emotion": "curious|frustrated|excited",
    "isComplete": true
  }
}
```

### 📡 Activar Conexión Externa
```
POST /api/agents/front-desk/integrations
```
**Descripción**: Activa conexión con plataforma externa según intención del usuario

**Body**:
```json
{
  "sessionId": "string",
  "platform": "google|tiktok|meta",
  "action": "create_campaign|publish_video|schedule_post",
  "payload": {
    "content": "string",
    "targetAudience": "string",
    "schedule": "datetime",
    "budget": "number"
  }
}
```

**Respuesta**:
```json
{
  "status": "success|error",
  "integrationId": "string",
  "platformResponse": {}
}
```

### 📊 Obtener Estado de Integraciones
```
GET /api/agents/front-desk/integrations/status
```
**Descripción**: Verifica estado de conexión con plataformas externas

**Respuesta**:
```json
{
  "timestamp": "datetime",
  "integrations": [
    {
      "platform": "string",
      "status": "string",
      "lastChecked": "datetime",
      "connectedAccounts": 0
    }
  ]
}
```

### 🧠 Obtener Contexto Persistente
```
GET /api/agents/front-desk/context/:sessionId
```
**Descripción**: Recupera el contexto emocional, técnico y conversacional de una sesión

**Respuesta**:
```json
{
  "sessionId": "string",
  "contextSummary": {
    "summary": "string",
    "keyPoints": [],
    "lastObjective": "string",
    "completionStatus": "complete|incomplete",
    "emotion": "string",
    "entities": {}
  },
  "keyContext": {
    "objective": "string",
    "targetAgent": "string",
    "collectedInfo": {},
    "confidence": 0.92,
    "emotion": "string",
    "entities": {},
    "context": {}
  }
}
```

### 🧭 Sugerir Próximo Paso
```
GET /api/agents/front-desk/suggestions/:sessionId
```
**Descripción**: Sugiere el siguiente paso en la conversación según intención, contexto y agentes disponibles

**Respuesta**:
```json
{
  "sessionId": "string",
  "suggestions": [
    {
      "action": "string",
      "description": "string",
      "confidence": 0.9,
      "requiredInfo": []
    }
  ],
  "availableAgents": []
}
```

### 📋 Obtener Estado del Agente
```
GET /api/agents/front-desk/status
```
**Descripción**: Recupera el estado y métricas de todos los agentes especializados

**Respuesta**:
```json
{
  "timestamp": "datetime",
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

### 📚 Obtener Todas las Conversaciones
```
GET /api/agents/front-desk
```
**Descripción**: Recupera todas las conversaciones del Front Desk

### 🔍 Obtener Conversación por ID
```
GET /api/agents/front-desk/:id
```
**Descripción**: Recupera una conversación específica por su ID

### 📂 Obtener Conversaciones por Sesión
```
GET /api/agents/front-desk/session/:sessionId
```
**Descripción**: Recupera todas las conversaciones para una sesión específica

## 🧬 Estructura de Datos

### Conversación
```json
{
  "sessionId": "string",
  "userId": "string",
  "messages": [
    {
      "text": "string",
      "timestamp": "datetime",
      "intent": "string",
      "entities": {},
      "emotion": "curious|frustrated|excited",
      "confidence": 0.92
    }
  ],
  "context": {
    "objective": "generate_video",
    "targetAgent": "video-scriptor",
    "platform": "tiktok",
    "missingInfo": ["targetAudience", "videoLength"],
    "isComplete": false
  }
}
```

## 🧠 Casos de Uso Extendidos

| Caso | Descripción | Activación |
|------|-------------|------------|
| Publicar video en TikTok | Usuario quiere viralizar contenido | Enruta a video-scriptor + activa integración TikTok |
| Crear campaña en Google Ads | Usuario quiere promocionar producto | Enruta a analytics-reporter + activa integración Google |
| Programar post en Instagram | Usuario quiere agendar contenido | Enruta a post-scheduler + activa integración Meta |

## 🧙 Ritualización Final
El Front Desk Agent debe:

- **Tener voz emocional**: responde con empatía, claridad y propósito
- **Ser archivista**: guarda cada conversación como parte del legado
- **Ser activador**: conecta usuarios con agentes y plataformas externas
- **Ser guía**: sugiere, aclara y empodera

## 📦 Tecnologías y Arquitectura

- **Framework**: NestJS
- **Base de Datos**: PostgreSQL con TypeORM
- **Persistencia**: Entidad [FrontDeskConversation](file:///d:/MisyBot/Misy-Agent/meta-agent/backend-refactor/src/agents/front-desk/entities/front-desk-conversation.entity.ts#L7-L44)
- **Compresión de Contexto**: [ContextCompressionService](file:///d:/MisyBot/Misy-Agent/meta-agent/backend-refactor/src/agents/front-desk/services/context-compression.service.ts#L4-L204)
- **Integraciones Externas**: Simuladas con posibilidad de extensión real
- **Detección de Emociones**: Mediante análisis de mensajes con IA