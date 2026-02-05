# ViralizationRouteEngine - Activación de Rutas de Viralización

## 🧾 Nombre del Módulo
**ViralizationRouteEngine** (Alias simbólico: Ruta de Impacto, Rol emocional: Orquesta la transformación de intención en viralidad, emoción en conversión)

## 🎯 Objetivo General
Diseñar un motor de rutas de viralización que active agentes especializados en secuencia, según el tipo de campaña, emoción detectada, y plataformas objetivo. El motor debe ser capaz de:

- Activar rutas predefinidas (ej. lanzamiento de producto, evento, promoción)
- Coordinar agentes internos (Trend Scanner, Video Scriptor, Creative Synthesizer, Post Scheduler, Analytics Reporter)
- Integrarse con plataformas externas (TikTok, Instagram, YouTube, Google Ads)
- Mantener trazabilidad emocional, métrica y narrativa en cada etapa

## 🔁 Flujo Modular de Ruta Viral
```mermaid
graph TD
    A[Usuario] --> B[Front Desk Agent]
    B --> C[Detectar Intención y Emoción]
    C --> D[Activar Ruta Viral]
    D --> E[Trend Scanner Agent]
    E --> F[Video Scriptor Agent]
    F --> G[Creative Synthesizer Agent]
    G --> H[Post Scheduler Agent]
    H --> I[Creative Synthesizer Agent (Publicación)]
    I --> J[Analytics Reporter Agent]
    J --> K[Frontend Notifica Resultados]
```

## 📦 Payload de Activación
```json
{
  "routeType": "product_launch",
  "sessionId": "user-session-123",
  "userId": "alejandro",
  "emotion": "excited",
  "platforms": ["tiktok", "instagram", "google"],
  "agents": [
    "trend-scanner",
    "video-scriptor",
    "creative-synthesizer",
    "post-scheduler",
    "analytics-reporter"
  ],
  "schedule": {
    "start": "2025-10-10T10:00:00",
    "end": "2025-10-12T22:00:00"
  }
}
```

## 🔧 Funciones Clave

### 1. Activación de Ruta
**Endpoint**: `POST /api/routes/viralization`

**Funcionalidades**:
- Valida emoción, intención, plataformas y agentes disponibles
- Guarda ruta en base de datos con estado "initiated"
- Inicia ejecución secuencial de etapas

### 2. Coordinación de Agentes
- Cada agente recibe contexto emocional y técnico
- Se activa en secuencia según el tipo de contenido y plataforma
- Emoción detectada se propaga a través de todas las etapas

### 3. Encolado Asíncrono
- Usa `content_creation_queue` y `content_publish_queue` para cada etapa
- Publica en `content_notifications_topic` al completar cada fase
- Procesamiento en segundo plano sin bloquear la interfaz

### 4. Narrativa Emocional
Cada agente genera respuesta con:
- **Narrativa emocional** (`generateEmotionalNarrative`)
- **Sugerencias contextuales** (`generateSuggestions`)
- **SAS URL** del contenido generado (todas las URLs incluyen SAS)

### 5. Métricas y Monitoreo
**Endpoint**: `GET /api/routes/viralization/status/:sessionId`

**Devuelve**:
- Tiempo por etapa
- Tasa de éxito
- Impacto emocional
- Conversión estimada

## 🧬 Estados de Ruta

| Estado | Descripción |
|--------|-------------|
| initiated | Ruta activada por Front Desk |
| scanning | Tendencias siendo analizadas |
| scanned | Análisis de tendencias completado |
| scripting | Guión en proceso de generación |
| scripted | Guión generado |
| generating | Contenido en proceso de creación |
| generated | Contenido generado |
| scheduling | Publicación en proceso de agenda |
| scheduled | Publicación agendada |
| publishing | Contenido en proceso de publicación |
| published | Contenido publicado |
| analyzing | Métricas en análisis |
| analyzed | Análisis completado |
| completed | Ruta finalizada |
| failed | Error en alguna etapa |

## 🛠️ Estados por Agente

### Trend Scanner Agent
- `scanning` → `scanned` | `scan_failed`

### Video Scriptor Agent
- `scripting` → `scripted` | `script_failed`

### Creative Synthesizer Agent
- `generating` → `generated` | `generation_failed`
- `publishing` → `published` | `publish_failed`

### Post Scheduler Agent
- `scheduling` → `scheduled` | `schedule_failed`

### Analytics Reporter Agent
- `analyzing` → `analyzed` | `analysis_failed`

## 🔒 Seguridad y Validación

### Validación de Token
- Validación de token en cada activación
- Verificación de permisos por rol de usuario
- Logging de todas las actividades

### Encriptación de Datos
- Encriptación de datos sensibles en tránsito y reposo
- Uso de HTTPS para todas las comunicaciones
- Claves de encriptación gestionadas de forma segura

### Roles y Permisos
- **Usuario**: Acceso a creación y consulta de sus propias rutas
- **Admin**: Acceso completo a todas las funcionalidades
- **Worker**: Acceso solo a procesamiento de etapas

### Idempotencia
- Workers diseñados para ser idempotentes
- Prevención de duplicados mediante identificadores únicos
- Manejo de reintentos en caso de fallos

### URLs con SAS
- **Todas las URLs devueltas por el sistema incluyen una firma SAS**
- Garantiza que sean accesibles y funcionales
- Cualquier URL sin SAS se considera inservible

## 🧙 Ritualización Final

Cada ruta debe:

### Nombre Simbólico
- **Ruta de Impacto**
- **Ritual de Lanzamiento**
- **Journey Viral**

### Activación Emocional
- Iniciarse con emoción y propósito definidos
- Mantener coherencia narrativa a lo largo de todas las etapas
- Personalizar cada salida según la emoción detectada

### Trazabilidad Completa
- Dejar registro emocional en cada etapa
- Métricas detalladas de rendimiento
- Historial completo de ejecuciones

### Visualización
- Integración con React Flow para visualización de rutas
- Diagramas interactivos de progreso
- Detalles de cada etapa en tiempo real

### Reutilización
- Plantillas configurables para diferentes tipos de campañas
- Personalización de flujos según necesidades específicas
- Historial de rutas exitosas para replicación

## 📊 Métricas y Monitoreo

### Métricas por Etapa
- **Trend Scanner**: Relevancia de tendencias identificadas
- **Video Scriptor**: Calidad del guión generado
- **Creative Synthesizer**: Tiempo de generación y calidad del contenido
- **Post Scheduler**: Adherencia al calendario programado
- **Analytics Reporter**: Engagement, alcance y conversiones

### Métricas Agregadas
- Tiempo total de ejecución de la ruta
- Tasa de éxito de etapas
- ROI estimado de la campaña
- Engagement promedio por plataforma

## 🔄 Integración con Agentes

### Propagación de Emoción
La emoción detectada se propaga a través de todas las etapas:
1. **Front Desk** detecta emoción del usuario
2. **ViralizationRouteEngine** la incluye en el payload inicial
3. **Cada agente** recibe y utiliza la emoción para personalizar su salida
4. **Respuestas generadas** incluyen narrativa emocional coherente

### Coordinación Técnica
- Paso de salida de una etapa como entrada a la siguiente
- Manejo de errores con reintentos automáticos
- Notificaciones en tiempo real del progreso

## 🚀 Beneficios del Sistema

### Para el Usuario
- **Experiencia Unificada**: Un solo punto de interacción para campañas complejas
- **Transparencia Total**: Visibilidad completa del progreso de la campaña
- **Automatización Inteligente**: Ejecución sin intervención manual
- **Resultados Medibles**: Métricas claras de éxito y ROI

### Para el Sistema
- **Coordinación Perfecta**: Sincronización entre múltiples agentes especializados
- **Escalabilidad**: Múltiples campañas ejecutándose en paralelo
- **Tolerancia a Fallos**: Manejo de errores por etapa con reintentos
- **Extensibilidad**: Fácil adición de nuevos tipos de campañas

### Para el Negocio
- **Eficiencia Operativa**: Reducción de tiempo en planificación y ejecución
- **Consistencia de Marca**: Ejecución estandarizada de estrategias
- **Optimización Continua**: Aprendizaje automático de campañas exitosas
- **Ventaja Competitiva**: Automatización avanzada de marketing de contenidos

## 🧪 Ejemplo de Uso

### Activación de Ruta de Lanzamiento de Producto
```bash
curl -X POST "http://localhost:3007/api/routes/viralization" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "routeType": "product_launch",
    "sessionId": "sess_1234567890",
    "userId": "user_0987654321",
    "emotion": "excited",
    "platforms": ["tiktok", "instagram", "youtube"],
    "agents": [
      "trend-scanner",
      "video-scriptor",
      "creative-synthesizer",
      "post-scheduler",
      "analytics-reporter"
    ],
    "schedule": {
      "start": "2025-10-10T10:00:00Z",
      "end": "2025-10-12T22:00:00Z"
    }
  }'
```

### Respuesta de Activación
```json
{
  "status": "route_activated",
  "routeId": "route_9876543210",
  "message": "Viralization route activated successfully",
  "sessionId": "sess_1234567890"
}
```

### Consulta de Estado
```bash
curl -X GET "http://localhost:3007/api/routes/viralization/status/route_9876543210" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Respuesta de Estado
```json
{
  "routeId": "route_9876543210",
  "routeType": "product_launch",
  "status": "generating",
  "currentStage": 3,
  "stages": [
    {
      "order": 1,
      "agent": "trend-scanner",
      "status": "scanned",
      "startedAt": "2025-10-10T10:00:00Z",
      "completedAt": "2025-10-10T10:02:30Z",
      "output": {
        "trends": ["ai", "5g", "battery_life"],
        "hashtags": ["#InnovateX", "#TechTrends", "#FutureIsNow"],
        "narrative": "¡Hemos identificado las tendencias más virales para tu campaña! 🚀",
        "suggestions": [
          "Revisa las tendencias identificadas para ajustar tu mensaje",
          "Considera combinar varias tendencias para mayor impacto",
          "Analiza el timing óptimo para cada plataforma"
        ]
      }
    },
    {
      "order": 2,
      "agent": "video-scriptor",
      "status": "scripted",
      "startedAt": "2025-10-10T10:02:30Z",
      "completedAt": "2025-10-10T10:05:15Z",
      "output": {
        "script": "Introducing the future in your hands...",
        "duration": 30,
        "narrative": "¡Tu guión está listo para cautivar audiencias! 🎬",
        "suggestions": [
          "Refina el guión con base en tu audiencia objetivo",
          "Considera variaciones para diferentes plataformas",
          "Agrega llamados a la acción específicos"
        ]
      }
    },
    {
      "order": 3,
      "agent": "creative-synthesizer",
      "status": "generating",
      "startedAt": "2025-10-10T10:05:15Z",
      "output": null
    }
  ],
  "metrics": {
    "engagement": 85,
    "reach": 12000,
    "conversion": 3.2
  },
  "createdAt": "2025-10-10T09:59:45Z",
  "updatedAt": "2025-10-10T10:05:15Z"
}
```