# Activación del Creative Synthesizer Agent

## 🧾 Nombre del Agente
**Creative Synthesizer Agent** (Alias simbólico: Creador Universal, Rol emocional: Transforma intención en arte, emoción en expresión)

## 🎯 Propósito del Agente
Este agente recibe contexto completo desde el Front Desk Agent y ejecuta la creación de contenido multimedia (imagen, audio, video). Opera de forma asíncrona mediante Azure Service Bus y puede publicar automáticamente en plataformas externas si el contexto lo requiere.

## 🔧 Funciones Principales

### 1. Recepción de Solicitud
**Endpoint**: `POST /api/agents/creative-synthesizer`

**Funcionalidades**:
- Valida token, intención, emoción, entidades y estado de integración
- Guarda solicitud en base de datos con estado "processing"
- Retorna respuesta inmediata al Front Desk

**Estructura del Request**:
```json
{
  "sessionId": "string",
  "userId": "string",
  "intention": "generate_video|generate_image|generate_audio",
  "emotion": "excited|curious|focused",
  "entities": {
    "script": "string",
    "style": "string",
    "duration": "number",
    "assets": ["string"]
  },
  "integrationId": "string",
  "integrationStatus": "active"
}
```

### 2. Encolado Asíncrono
**Cola**: `content_creation_queue`

**Funcionalidades**:
- Encola mensaje con metadata completa
- Permite procesamiento en segundo plano
- Mantiene contexto para workers

**Estructura del Mensaje**:
```json
{
  "creationId": "string",
  "sessionId": "string",
  "userId": "string",
  "intention": "generate_video|generate_image|generate_audio",
  "emotion": "excited|curious|focused",
  "entities": {
    "script": "string",
    "style": "string",
    "duration": "number",
    "assets": ["string"]
  },
  "integrationId": "string",
  "integrationStatus": "active"
}
```

### 3. Worker de Procesamiento
**Funcionalidades**:
- Escucha `content_creation_queue`
- Ejecuta generación multimedia según intención:
  - Imagen → `/api/media/image`
  - Audio → `/api/media/audio`
  - Video → `/api/media/video`
- Actualiza estado a "completed" o "failed" en base de datos
- Notifica al Front Desk sobre la finalización

**Tiempos de Procesamiento Estimados**:
- Video: 2 minutos
- Imagen: 30 segundos
- Audio: 1 minuto

### 4. Notificación de Finalización
**Tópico**: `content_notifications_topic`

**Estructura de la Notificación**:
```json
{
  "creationId": "string",
  "sessionId": "string",
  "status": "completed|failed",
  "assetUrl": "https://.../asset.mp4?sv=2020-08-04&ss=b&srt=sco&sp=rwdlacx&se=2025-12-31T23:59:59Z&st=2025-01-01T00:00:00Z&spr=https&sig=SIMULATED_SAS_SIGNATURE",
  "narrative": "Tu video está listo para inspirar confianza y generar engagement! 🎬✨",
  "suggestions": [
    "Considera agregar subtítulos para mayor alcance",
    "Programa la publicación para horarios de mayor engagement",
    "Comparte en múltiples plataformas para maximizar impacto"
  ]
}
```

### 5. Publicación Automática (Opcional)
**Endpoint**: `POST /api/agents/creative-synthesizer/publish`

**Funcionalidades**:
- Encola mensaje en `content_publish_queue`
- Actualiza estado a "publishing" y luego "published"
- Retorna narrativa emocional y sugerencias

**Estructura del Request**:
```json
{
  "integrationId": "string",
  "assetId": "string",
  "caption": "string",
  "tags": ["string"]
}
```

**Estructura del Mensaje en Cola**:
```json
{
  "integrationId": "string",
  "assetId": "string",
  "caption": "string",
  "tags": ["string"],
  "creationRecord": {
    // Registro completo de creación
  }
}
```

## 📦 Endpoints del Agente

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/agents/creative-synthesizer` | Recibe solicitud de creación |
| POST | `/api/agents/creative-synthesizer/publish` | Solicita publicación automática |
| GET | `/api/agents/creative-synthesizer/status` | Devuelve métricas del agente |
| GET | `/api/agents/creative-synthesizer/session/:sessionId` | Devuelve creaciones por sesión |
| GET | `/api/agents/creative-synthesizer` | Devuelve todas las creaciones |
| GET | `/api/agents/creative-synthesizer/:id` | Devuelve creación específica |

## 🧬 Estados del Proceso

| Estado | Descripción |
|--------|-------------|
| processing | Solicitud recibida y encolada |
| generating | Worker está creando el contenido |
| completed | Contenido generado exitosamente |
| failed | Error en la generación |
| publishing | En proceso de publicación |
| published | Contenido publicado exitosamente |

## 📈 Métricas a Capturar

1. **Tiempo promedio de generación por tipo de contenido**
   - Video: 120 segundos
   - Imagen: 30 segundos
   - Audio: 60 segundos

2. **Tasa de éxito/fallo por intención**
   - Tasa de éxito objetivo: > 95%
   - Tasa de fallo objetivo: < 5%

3. **Engagement estimado (si se publica)**
   - Video: 60-100 puntos
   - Imagen: 50-90 puntos
   - Audio: 40-80 puntos

4. **Uso de recursos por sesión**
   - CPU, memoria, ancho de banda

5. **Tiempo entre solicitud y entrega**
   - Total: tiempo de encolado + tiempo de procesamiento

## 🧙 Ritualización Emocional

Cada respuesta del agente incluye:

### Narrativas Emocionales
- **Video (excited)**: "¡Tu video está listo para inspirar confianza y generar engagement! 🎬✨"
- **Imagen (curious)**: "Imagen creada con éxito, lista para ser compartida. 📸"
- **Audio (focused)**: "Audio completado con la calidad que buscabas. 🎧"

### Sugerencias Contextuales
- **Video**: "Considera agregar subtítulos para mayor alcance"
- **Imagen**: "Agrega un llamado a la acción en tu publicación"
- **Audio**: "Agrega una descripción atractiva para acompañar el audio"

### Estados y Próximos Pasos
- Información clara sobre el estado actual
- Guía para acciones siguientes

## 🔒 Seguridad y Validación

### Validación de Token
- Todos los endpoints validan token JWT
- Tokens verificados en cada solicitud
- Acceso restringido por roles

### Encriptación de Datos
- Datos sensibles encriptados en tránsito y reposo
- Uso de HTTPS para todas las comunicaciones
- Claves de encriptación gestionadas de forma segura

### Roles y Permisos
- **Usuario**: Acceso a creación y consulta de sus propios contenidos
- **Admin**: Acceso completo a todas las funcionalidades
- **Worker**: Acceso solo a procesamiento de colas

### Idempotencia
- Workers diseñados para ser idempotentes
- Prevención de duplicados mediante identificadores únicos
- Manejo de reintentos en caso de fallos

## 🌐 Integración con Azure Service Bus

### Configuración
- **Cadena de conexión**: `AZURE_SERVICE_BUS_CONNECTION_STRING`
- **Cola de creación**: `content_creation_queue`
- **Cola de publicación**: `content_publish_queue`
- **Tópico de notificaciones**: `content_notifications_topic`

### Patrones de Mensajería
- **Productor**: Creative Synthesizer Agent
- **Consumidor**: Workers de procesamiento
- **Notificador**: Creative Synthesizer Agent
- **Suscriptor**: Front Desk Agent

## 📊 Monitoreo y Logging

### Métricas en Tiempo Real
- Conteo de solicitudes por estado
- Tiempos de procesamiento promedio
- Tasa de éxito/fallo
- Uso de recursos del sistema

### Logging Detallado
- Logs de entrada/salida de solicitudes
- Logs de procesamiento de workers
- Logs de errores y excepciones
- Logs de notificaciones enviadas

### Alertas Automáticas
- Alertas por tasas de fallo elevadas
- Alertas por tiempos de procesamiento excesivos
- Alertas por congestión en colas
- Alertas por errores críticos

## 🚀 Despliegue y Escalabilidad

### Escalabilidad Horizontal
- Múltiples instancias de workers pueden procesar en paralelo
- Balanceo de carga automático
- Auto-escalado basado en longitud de colas

### Tolerancia a Fallos
- Reintentos automáticos de mensajes fallidos
- Dead letter queues para mensajes problemáticos
- Monitoreo continuo de salud del sistema

### Actualizaciones Sin Interrupción
- Deployments blue-green
- Migración gradual de workers
- Compatibilidad hacia atrás de mensajes