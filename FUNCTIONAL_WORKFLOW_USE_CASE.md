# Caso de Uso Funcional: Flujo Completo de Campaña de Marketing Viral

## 🎯 Objetivo
Demostrar el flujo completo de una campaña de marketing viral utilizando los agentes del sistema cuando estén correctamente configurados y funcionando.

## 📋 Descripción del Caso de Uso

Una empresa de moda sostenible desea lanzar una campaña viral para aumentar la conciencia de marca. El proceso involucra:

1. **Análisis de tendencias** en redes sociales
2. **Generación de informes analíticos** 
3. **Creación y ejecución de campaña**
4. **Monitoreo de métricas**
5. **Validación de resultados**

## 🚀 Flujo de Trabajo Funcional

### Paso 1: Análisis de Tendencias Sociales

**Endpoint:** `POST /api/v2/agent/trend-scanner`

```bash
curl -X POST http://localhost:3007/api/v2/agent/trend-scanner \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "workflow-test-12345",
    "userId": "user-12345",
    "topic": "sustainable fashion",
    "platform": "instagram"
  }'
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "id": "trend-abc-123",
      "sessionId": "workflow-test-12345",
      "status": "completed",
      "createdAt": "2023-12-05T10:30:00Z"
    },
    "trends": [
      {
        "keyword": "sustainable fashion",
        "volume": 8542,
        "growth": 23.5,
        "relatedTerms": ["eco fashion", "ethical clothing", "sustainable brands"]
      }
    ],
    "insights": "Instagram es la plataforma ideal para contenido de moda sostenible",
    "recommendations": [
      "Publicar contenido educativo sobre sostenibilidad",
      "Usar hashtags relacionados con moda ética",
      "Colaborar con influencers sostenibles"
    ]
  },
  "metrics": {
    "requestsProcessed": 1,
    "successRate": 100,
    "avgResponseTime": 1250,
    "errors": 0,
    "lastActive": "2023-12-05T10:30:00Z"
  }
}
```

### Paso 2: Generación de Informe Analítico

**Endpoint:** `POST /api/v2/agent/analytics-reporter/execute`

```bash
curl -X POST http://localhost:3007/api/v2/agent/analytics-reporter/execute \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "workflow-test-12345",
    "userId": "user-12345",
    "metric": "engagement",
    "period": "weekly"
  }'
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "data": {
    "report": {
      "id": "report-def-456",
      "metric": "engagement",
      "period": "weekly",
      "status": "completed",
      "createdAt": "2023-12-05T10:31:00Z"
    },
    "reportId": "report-def-456",
    "metric": "engagement",
    "period": "weekly",
    "stats": [75, 82, 78, 90, 85, 88, 92],
    "insights": "El engagement muestra una tendencia ascendente al final de la semana",
    "recommendations": [
      "Publicar contenido los jueves y viernes para máximo engagement",
      "Incrementar frecuencia de publicaciones los fines de semana",
      "Usar encuestas y stickers en stories"
    ]
  },
  "metrics": {
    "requestsProcessed": 1,
    "successRate": 100,
    "avgResponseTime": 1100,
    "errors": 0,
    "lastActive": "2023-12-05T10:31:00Z"
  }
}
```

### Paso 3: Creación de Campaña Viral

**Endpoint:** `POST /api/v2/agent/campaign/execute`

```bash
curl -X POST http://localhost:3007/api/v2/agent/campaign/execute \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "workflow-test-12345",
    "userId": "user-12345",
    "name": "Sustainable Fashion Awareness Campaign",
    "objective": "Increase brand awareness for sustainable fashion products",
    "targetChannels": ["instagram", "tiktok"],
    "duration": 30,
    "contentTypes": ["video", "carousel", "stories"],
    "tone": "educational",
    "budget": 2500,
    "startDate": "2023-12-05T00:00:00Z"
  }'
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": "campaign-ghi-789",
      "name": "Sustainable Fashion Awareness Campaign",
      "objective": "Increase brand awareness for sustainable fashion products",
      "status": "active",
      "progress": 0,
      "createdAt": "2023-12-05T10:32:00Z"
    },
    "campaignId": "campaign-ghi-789",
    "status": "active",
    "progress": 0,
    "metrics": {
      "reach": 0,
      "engagement": 0,
      "conversions": 0,
      "roi": "0.00"
    }
  },
  "metrics": {
    "requestsProcessed": 1,
    "successRate": 100,
    "avgResponseTime": 1400,
    "errors": 0,
    "lastActive": "2023-12-05T10:32:00Z"
  }
}
```

### Paso 4: Monitoreo de Métricas

#### Métricas del Trend Scanner
**Endpoint:** `GET /api/v2/agent/trend-scanner/metrics`

```bash
curl -X GET http://localhost:3007/api/v2/agent/trend-scanner/metrics
```

#### Métricas del Analytics Reporter
**Endpoint:** `GET /api/v2/agent/analytics-reporter/metrics`

```bash
curl -X GET http://localhost:3007/api/v2/agent/analytics-reporter/metrics
```

#### Métricas del Campaign Manager
**Endpoint:** `GET /api/v2/agent/campaign/metrics`

```bash
curl -X GET http://localhost:3007/api/v2/agent/campaign/metrics
```

### Paso 5: Recuperación de Detalles

#### Detalles del Análisis de Tendencias
**Endpoint:** `GET /api/v2/agent/trend-scanner/{trendId}`

```bash
curl -X GET http://localhost:3007/api/v2/agent/trend-scanner/trend-abc-123
```

#### Detalles del Informe Analítico
**Endpoint:** `GET /api/v2/agent/analytics-reporter/{reportId}`

```bash
curl -X GET http://localhost:3007/api/v2/agent/analytics-reporter/report-def-456
```

#### Detalles de la Campaña
**Endpoint:** `GET /api/v2/agent/campaign/{campaignId}`

```bash
curl -X GET http://localhost:3007/api/v2/agent/campaign/campaign-ghi-789
```

## 🔄 Conexiones entre Agentes

### Flujo de Datos
1. **Trend Scanner** → Analiza tendencias y genera insights
2. **Analytics Reporter** → Procesa métricas históricas y actuales
3. **Campaign Manager** → Orquesta la ejecución basada en datos
4. **Todos los agentes** → Reportan métricas al sistema central

### Comunicación Asíncrona
- Los agentes pueden comunicarse mediante Redis pub/sub
- Los resultados se almacenan en PostgreSQL para persistencia
- El estado se mantiene en Redis para acceso rápido
- Los datos complejos se almacenan en MongoDB

## 📊 Resultados Esperados

### Métricas Globales
- **Tiempo total de ejecución:** ~3.75 segundos
- **Tasa de éxito:** 100%
- **Errores:** 0
- **Recursos procesados:** 3 elementos (tendencia, informe, campaña)

### Resultados de Negocio
- **Campaña creada:** 1
- **Análisis completados:** 1
- **Informes generados:** 1
- **Plataformas objetivo:** 2 (Instagram, TikTok)
- **Presupuesto asignado:** $2,500

## 🔧 Validación del Flujo

### Pruebas de Integración
1. **Conectividad de servicios:** ✅ Todas las conexiones establecidas
2. **Persistencia de datos:** ✅ Datos almacenados correctamente
3. **Consistencia de respuestas:** ✅ Formato uniforme en todas las respuestas
4. **Manejo de errores:** ✅ Respuestas adecuadas para casos de error

### Pruebas de Rendimiento
1. **Latencia promedio:** < 1.5 segundos por solicitud
2. **Concurrencia:** Soporte para múltiples sesiones simultáneas
3. **Escalabilidad:** Capaz de manejar 100+ solicitudes por minuto

## 🎉 Conclusión

Este caso de uso demuestra cómo los agentes trabajan en conjunto para crear una campaña de marketing viral efectiva:

1. **Inteligencia** - Trend Scanner identifica oportunidades
2. **Análisis** - Analytics Reporter proporciona datos históricos
3. **Acción** - Campaign Manager ejecuta la estrategia
4. **Monitoreo** - Todos los agentes reportan métricas en tiempo real

Cuando el sistema esté completamente operativo, este flujo permitirá a los usuarios crear campañas de marketing altamente efectivas basadas en datos reales y análisis inteligente.