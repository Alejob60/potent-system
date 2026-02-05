# Resumen de Rutas de API de Agentes

## Agentes V2

### 1. Analytics Reporter
- **Ruta base**: `/api/v2/agent/analytics-reporter`
- **Endpoints**:
  - `POST /execute` - Generar informe analítico
  - `GET /metrics` - Obtener métricas del agente
  - `GET /:id` - Obtener informe por ID
  - `GET /` - Obtener todos los informes

### 2. Trend Scanner
- **Ruta base**: `/api/v2/agent/trend-scanner`
- **Endpoints**:
  - `POST /` - Analizar tendencias
  - `GET /` - Obtener todos los análisis
  - `GET /:id` - Obtener análisis por ID
  - `GET /metrics` - Obtener métricas del agente

### 3. Campaign
- **Ruta base**: `/api/v2/agent/campaign`
- **Endpoints**:
  - `POST /execute` - Gestionar campaña
  - `GET /metrics` - Obtener métricas del agente
  - `GET /:id` - Obtener campaña por ID
  - `GET /` - Obtener todas las campañas

## Agentes V1 (Legacy)

### 4. Video Scritor
- **Ruta base**: `/api/v1/agent/video-scriptor`
- **Endpoints**:
  - `POST /generate` - Generar guion de video
  - `GET /:id` - Obtener guion por ID
  - `GET /` - Obtener todos los guiones

### 5. FAQ Responder
- **Ruta base**: `/api/v1/agent/faq-responder`
- **Endpoints**:
  - `POST /answer` - Generar respuesta a pregunta
  - `GET /:id` - Obtener respuesta por ID
  - `GET /` - Obtener todas las respuestas

### 6. Post Scheduler
- **Ruta base**: `/api/v1/agent/post-scheduler`
- **Endpoints**:
  - `POST /schedule` - Programar publicación
  - `GET /:id` - Obtener programación por ID
  - `GET /` - Obtener todas las programaciones

## Meta-Agent

### 7. Meta-Agent V2 (Principal)
- **Ruta base**: `/api/v2/meta-agent`
- **Endpoints**:
  - `POST /process` - Procesar solicitud
  - `POST /session` - Crear/gestionar sesión
  - `POST /feedback` - Enviar retroalimentación
  - `GET /health` - Verificar estado del sistema
  - `GET /metrics` - Obtener métricas del sistema

## Servicios Especiales

### 8. Front Desk V2
- **Ruta base**: `/api/v2/front-desk`
- **Endpoints**:
  - `POST /chat` - Interacción de chat
  - `POST /voice` - Interacción de voz
  - `GET /session/:id` - Obtener sesión por ID

### 9. Admin Orchestrator
- **Ruta base**: `/api/v2/admin/orchestrator`
- **Endpoints**:
  - `POST /manage` - Gestionar agentes
  - `GET /status` - Estado del sistema
  - `POST /configure` - Configurar sistema

## Notas importantes:

1. Todos los endpoints V2 siguen el patrón: `/api/v2/agent/{nombre-agente}/{accion}`
2. Los endpoints protegidos requieren autenticación JWT
3. Algunos agentes pueden tener endpoints adicionales según su funcionalidad específica
4. Las rutas V1 son heredadas y eventualmente se migrarán a V2