# Creative Synthesizer Agent

## 🧾 Nombre del Agente
**Creative Synthesizer Agent** (Alias simbólico: Creador Universal, Rol emocional: El que convierte intención en expresión, Rol técnico: Generador multimedia)

## 🎯 Objetivo General
Diseñar un agente que:

- Reciba contexto completo desde el Front Desk Agent
- Genere contenido multimedia (imagen, audio, video) según intención
- Se conecte a módulos internos o servicios externos de generación
- Devuelva respuestas trazables, emocionales y listas para publicación

## 🔧 Funciones Principales

### 1. Recepción de Contexto
Recibe payload desde el Front Desk con:

- Intención (generate_video, generate_image, generate_audio)
- Entidades extraídas (producto, estilo, duración, etc.)
- Emoción detectada
- Integración activa (TikTok, Meta, etc.)

### 2. Generación Multimedia
Ejecuta creación según tipo:

- Imagen → /api/media/image
- Audio → /api/media/audio
- Video → /api/media/video
- Puede combinar assets (ej. imagen + audio → video)

### 3. Envío a Plataforma Externa (opcional)
Si el contexto lo indica, publica directamente en TikTok, Meta, etc.

Usa integrationId y integrationStatus para validar conexión.

### 4. Respuesta Emocional
Devuelve respuesta con:

- Link o asset generado
- Narrativa emocional ("Aquí está tu video para inspirar confianza…")
- Sugerencias de mejora o publicación

### 5. Trazabilidad y Métricas
Guarda cada creación con:

- sessionId, userId, emotion, intention, platform
- Tiempo de generación, calidad, engagement estimado

## 📦 Estructura de Payload de Entrada

```json
{
  "sessionId": "user-session-123",
  "userId": "alejandro",
  "intention": "generate_video",
  "emotion": "excited",
  "entities": {
    "script": "Presentamos nuestro nuevo producto...",
    "style": "tiktok",
    "duration": 30,
    "assets": ["image1.png", "audio1.mp3"]
  },
  "integrationId": "tiktok-conn-456",
  "integrationStatus": "active"
}
```

## 📤 Endpoints del Agente

### 1. Procesar Creación
```
POST /api/agents/creative-synthesizer
```
**Descripción**: Recibe contexto y genera contenido multimedia

**Body**:
```json
{
  "sessionId": "string",
  "userId": "string",
  "intention": "generate_video|generate_image|generate_audio|publish",
  "emotion": "string",
  "entities": {},
  "integrationId": "string",
  "integrationStatus": "string"
}
```

**Respuesta**:
```json
{
  "status": "processing",
  "creationId": "string",
  "message": "Content creation request received and queued for processing",
  "sessionId": "string"
}
```

### 2. Obtener Estado de Creaciones
```
GET /api/agents/creative-synthesizer/status
```
**Descripción**: Devuelve métricas de generación (tiempo, éxito, fallos)

**Respuesta**:
```json
{
  "timestamp": "datetime",
  "statistics": {
    "totalCreations": 0,
    "processingCreations": 0,
    "completedCreations": 0,
    "failedCreations": 0,
    "avgGenerationTime": 0
  }
}
```

### 3. Obtener Creaciones por Sesión
```
GET /api/agents/creative-synthesizer/session/:sessionId
```
**Descripción**: Devuelve todas las creaciones asociadas a una sesión

**Respuesta**:
```json
[
  {
    "id": "string",
    "sessionId": "string",
    "userId": "string",
    "intention": "string",
    "emotion": "string",
    "entities": {},
    "integrationId": "string",
    "integrationStatus": "string",
    "assetUrl": "string",
    "assetType": "string",
    "status": "string",
    "generationTime": 0,
    "qualityScore": 0,
    "metadata": {},
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
]
```

### 4. Publicar en Plataforma Externa
```
POST /api/agents/creative-synthesizer/publish
```
**Body**:
```json
{
  "integrationId": "string",
  "assetId": "string",
  "caption": "string",
  "tags": ["string"]
}
```

**Respuesta**:
```json
{
  "status": "publishing",
  "assetId": "string",
  "message": "Content publish request received and queued for processing"
}
```

### 5. Obtener Todas las Creaciones
```
GET /api/agents/creative-synthesizer
```
**Descripción**: Recupera todas las creaciones del agente

### 6. Obtener Creación por ID
```
GET /api/agents/creative-synthesizer/:id
```
**Descripción**: Recupera una creación específica por su ID

## 🧭 Casos de Uso

| Intención | Acción | Resultado |
|-----------|--------|-----------|
| generate_video | Crea video con assets y script | Video listo para TikTok |
| generate_image | Crea imagen con estilo y dimensiones | Imagen para campaña |
| generate_audio | Crea audio con voz y guion | Audio promocional |
| publish | Publica contenido en red conectada | Post viral publicado |

## 🧙 Ritualización Final
Este agente debe:

- Transformar intención en arte con precisión emocional
- Responder con narrativa que conecte con el usuario
- Guardar trazabilidad para métricas y reputación
- Colaborar con el Front Desk como ejecutor de contexto

## 📦 Tecnologías y Arquitectura

- **Framework**: NestJS
- **Base de Datos**: PostgreSQL con TypeORM
- **Persistencia**: Entidad [CreativeSynthesizerCreation](file:///d:/MisyBot/Misy-Agent/meta-agent/backend-refactor/src/agents/agent-creative-synthesizer/entities/creative-synthesizer.entity.ts#L6-L56)
- **Comunicación Asíncrona**: Azure Service Bus
- **Procesamiento en Cola**: RabbitMQ para manejo de tareas largas