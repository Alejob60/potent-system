# Viralization Route Engine

## 🎯 Propósito del Motor
El Viralization Route Engine es un módulo que coordina flujos de viralización predefinidos, activando secuencias de agentes especializados para ejecutar campañas completas de contenido viral.

## 🔧 Funciones Principales

### 1. Activación de Rutas
**Endpoint**: `POST /api/agents/viralization-route-engine/activate`

**Funcionalidades**:
- Recibe configuración de ruta viral
- Crea registro en base de datos
- Inicia ejecución de etapas secuencialmente
- Coordina comunicación entre agentes

**Estructura del Request**:
```json
{
  "routeType": "product_launch",
  "sessionId": "user-session-123",
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

### 2. Ejecución Secuencial de Etapas
El motor ejecuta cada etapa en orden, pasando la salida de una etapa como entrada a la siguiente:

| Etapa | Agente | Acción | Output |
|-------|--------|--------|--------|
| 1 | Trend Scanner | Escanea tendencias | Formato + hashtags virales |
| 2 | Video Scriptor | Genera guión emocional | Script adaptado por plataforma |
| 3 | Creative Synthesizer | Crea video, imagen, audio | Asset con SAS URL + narrativa |
| 4 | Post Scheduler | Agenda publicación | Calendario sincronizado |
| 5 | Analytics Reporter | Mide impacto | Reporte con recomendaciones |

### 3. Monitoreo de Estado
**Endpoint**: `GET /api/agents/viralization-route-engine/status/:routeId`

**Información devuelta**:
- Estado actual de la ruta
- Etapa en ejecución
- Progreso de cada etapa
- Métricas de rendimiento

### 4. Gestión de Sesiones
**Endpoint**: `GET /api/agents/viralization-route-engine/session/:sessionId`

**Funcionalidades**:
- Listar todas las rutas de una sesión
- Historial de campañas ejecutadas
- Métricas agregadas por sesión

## 📦 Tipos de Rutas Predefinidas

### 1. Lanzamiento de Producto (`product_launch`)
**Agentes involucrados**:
1. Trend Scanner: Identifica tendencias relevantes para el producto
2. Video Scriptor: Crea guión que resalte características únicas
3. Creative Synthesizer: Genera contenido multimedia atractivo
4. Post Scheduler: Programa publicaciones estratégicamente
5. Analytics Reporter: Mide impacto y ROI

### 2. Promoción de Evento (`event_promotion`)
**Agentes involucrados**:
1. Trend Scanner: Analiza tendencias relacionadas con el evento
2. Video Scriptor: Desarrolla narrativa emocional del evento
3. Creative Synthesizer: Crea contenido promocional
4. Post Scheduler: Agenda publicaciones antes, durante y después
5. Analytics Reporter: Evalúa engagement y asistencia

### 3. Campaña de Contenido (`content_campaign`)
**Agentes involucrados**:
1. Trend Scanner: Encuentra temas virales actuales
2. Video Scriptor: Escribe guiones para series de contenido
3. Creative Synthesizer: Genera múltiples piezas de contenido
4. Post Scheduler: Crea calendario de publicación coherente
5. Analytics Reporter: Analiza rendimiento de la serie

### 4. Concienciación de Marca (`brand_awareness`)
**Agentes involucrados**:
1. Trend Scanner: Identifica oportunidades de posicionamiento
2. Video Scriptor: Desarrolla mensaje de marca consistente
3. Creative Synthesizer: Crea contenido que refuerce valores
4. Post Scheduler: Distribuye contenido estratégicamente
5. Analytics Reporter: Mide reconocimiento y percepción

## 🧬 Estados del Proceso

| Estado | Descripción |
|--------|-------------|
| active | Ruta activada, esperando ejecución |
| processing | Ejecutando etapa actual |
| completed | Todas las etapas completadas exitosamente |
| failed | Error en alguna etapa |
| paused | Ruta pausada manualmente |

## 📊 Métricas de Seguimiento

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

## 🔁 Flujo de Ejecución

```mermaid
graph TD
    A[Activar Ruta] --> B{Validar Configuración}
    B -->|Válida| C[Crear Registro en BD]
    B -->|Inválida| D[Retornar Error]
    C --> E[Iniciar Etapa 1]
    E --> F[Ejecutar Agente]
    F --> G{Éxito?}
    G -->|Sí| H[Actualizar Estado]
    G -->|No| I[Marcar como Fallida]
    H --> J{Más Etapas?}
    J -->|Sí| K[Iniciar Siguiente Etapa]
    J -->|No| L[Marcar Ruta Completa]
    K --> F
    I --> M[Notificar Error]
    L --> N[Generar Reporte Final]
```

## 🛠️ Configuración y Personalización

### Parámetros Configurables
- **Emoción objetivo**: Define el tono emocional de toda la campaña
- **Plataformas**: Especifica en qué redes sociales se publicará
- **Horario**: Define ventana de tiempo para la ejecución
- **Agentes**: Permite personalizar la secuencia de ejecución

### Metadata Adicional
El motor acepta metadata personalizada que puede ser utilizada por los agentes:
```json
{
  "metadata": {
    "targetAudience": "jóvenes 18-35",
    "brandVoice": "divertido e innovador",
    "keyMessages": ["calidad", "precio", "innovación"],
    "budget": 5000
  }
}
```

## 🔒 Seguridad y Validación

### Autenticación
- Todas las solicitudes requieren token JWT válido
- Verificación de permisos por rol de usuario
- Logging de todas las actividades

### Validación de Datos
- Validación de tipos de ruta soportados
- Verificación de agentes disponibles
- Compatibilidad de plataformas
- Integridad de horarios

## 📈 Integración con Dashboard

### Notificaciones en Tiempo Real
- WebSocket para actualizaciones de estado
- Eventos de inicio/completitud de etapas
- Alertas de errores o retrasos

### Visualización de Progreso
- Barra de progreso por etapa
- Timeline de ejecución
- Métricas en tiempo real
- Historial de campañas

## 🚀 Beneficios del Sistema

### Para el Usuario
- **Automatización completa**: Ejecución sin intervención manual
- **Coordinación perfecta**: Sincronización entre múltiples agentes
- **Seguimiento detallado**: Visibilidad total del proceso
- **Resultados medibles**: Métricas claras de éxito

### Para el Sistema
- **Escalabilidad**: Múltiples rutas ejecutándose en paralelo
- **Tolerancia a fallos**: Manejo de errores por etapa
- **Extensibilidad**: Fácil adición de nuevos tipos de rutas
- **Monitoreo**: Logging completo para análisis

### Para el Negocio
- **Eficiencia**: Reducción de tiempo en campañas
- **Consistencia**: Ejecución estandarizada de estrategias
- **ROI medible**: Análisis detallado de resultados
- **Innovación**: Uso de IA para optimización continua

## 🧪 Ejemplo de Uso

### Activación de Ruta de Lanzamiento de Producto
```bash
curl -X POST "http://localhost:3007/api/agents/viralization-route-engine/activate" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "routeType": "product_launch",
    "sessionId": "sess_1234567890",
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
    },
    "metadata": {
      "productName": "InnovateX Pro",
      "targetAudience": "tech enthusiasts 25-40",
      "keyFeatures": ["AI-powered", "5G compatible", "24h battery"]
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
curl -X GET "http://localhost:3007/api/agents/viralization-route-engine/status/route_9876543210" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Respuesta de Estado
```json
{
  "routeId": "route_9876543210",
  "routeType": "product_launch",
  "status": "processing",
  "currentStage": 3,
  "stages": [
    {
      "order": 1,
      "agent": "trend-scanner",
      "status": "completed",
      "startedAt": "2025-10-10T10:00:00Z",
      "completedAt": "2025-10-10T10:02:30Z",
      "output": {
        "trends": ["ai", "5g", "battery_life"],
        "hashtags": ["#InnovateX", "#TechTrends", "#FutureIsNow"]
      }
    },
    {
      "order": 2,
      "agent": "video-scriptor",
      "status": "completed",
      "startedAt": "2025-10-10T10:02:30Z",
      "completedAt": "2025-10-10T10:05:15Z",
      "output": {
        "script": "Introducing the future in your hands...",
        "duration": 30
      }
    },
    {
      "order": 3,
      "agent": "creative-synthesizer",
      "status": "processing",
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