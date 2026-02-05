# 🧩 MisyBot-2: Orchestrator Usage Example

## Ejemplo de Uso del Nuevo Sistema de Orquestación

### Crear y Ejecutar un Workflow Simple

```typescript
import { WorkflowEngineService } from '../src/common/workflow/workflow-engine.service';
import { PipelineStep, PipelineContext } from '../src/common/workflow/pipeline-step.interface';

// Crear pasos para un workflow de análisis de tendencias
const trendAnalysisSteps: PipelineStep[] = [
  {
    id: 'trend-discovery',
    name: 'Descubrir Tendencias',
    description: 'Analizar tendencias actuales en redes sociales',
    agent: 'trend-scanner',
    input: {
      platform: 'tiktok',
      topic: 'tecnología',
      dateRange: 'last_7_days'
    },
    retryConfig: {
      maxAttempts: 3,
      delay: 1000,
      backoffMultiplier: 2
    }
  },
  {
    id: 'content-creation',
    name: 'Crear Contenido',
    description: 'Generar guión basado en tendencias',
    agent: 'video-scriptor',
    input: {
      format: 'unboxing',
      objective: 'product_launch'
    },
    dependencies: ['trend-discovery']
  },
  {
    id: 'schedule-content',
    name: 'Programar Contenido',
    description: 'Programar publicación en redes sociales',
    agent: 'post-scheduler',
    input: {
      platforms: ['tiktok', 'instagram']
    },
    dependencies: ['content-creation']
  }
];

// Crear definición de workflow
const workflow = workflowEngine.createWorkflow(
  'Análisis de Tendencias Viral',
  'Workflow para analizar tendencias y crear contenido viral',
  trendAnalysisSteps
);

// Validar workflow
if (workflowEngine.validateWorkflow(workflow)) {
  // Crear contexto de ejecución
  const context: PipelineContext = {
    sessionId: 'session-12345',
    sharedData: {
      userId: 'user-abcde',
      campaignId: 'campaign-xyz'
    },
    stepResults: {}
  };

  // Ejecutar workflow
  const result = await workflowEngine.executeWorkflow(workflow, context);
  
  console.log('Resultado del workflow:', result);
} else {
  console.error('Workflow inválido');
}
```

### Usar el Conector de Agentes Directamente

```typescript
import { AgentConnectorService } from '../src/common/orchestrator/agent-connector.service';

// Ejecutar una solicitud POST a un agente
const result = await agentConnector.post('trend-scanner', {
  sessionId: 'session-12345',
  platform: 'tiktok',
  topic: 'inteligencia artificial',
  dateRange: 'last_30_days'
});

if (result.success) {
  console.log('Resultado del análisis de tendencias:', result.data);
} else {
  console.error('Error en el análisis de tendencias:', result.error);
}

// Verificar la salud de un agente
const isHealthy = await agentConnector.checkHealth('video-scriptor');
console.log('Video Scriptor está saludable:', isHealthy);
```

### Obtener Métricas del Orchestrator

```typescript
import { OrchestratorMetricsService } from '../src/common/orchestrator/orchestrator-metrics.service';

// Obtener métricas agregadas
const metrics = await metricsService.getMetrics();
console.log('Métricas del orchestrator:', metrics);

// Obtener métricas de un agente específico
const agentMetrics = await metricsService.getAgentMetrics('trend-scanner');
if (agentMetrics) {
  console.log('Métricas del Trend Scanner:', agentMetrics);
}

// Obtener datos para el dashboard
const dashboardData = await metricsService.getMetrics().then(metrics => {
  const topAgents = Object.entries(metrics.agentMetrics)
    .sort(([,a], [,b]) => b.executions - a.executions)
    .slice(0, 5)
    .map(([name, metrics]) => ({
      name,
      executions: metrics.executions,
      successRate: metrics.successRate,
      averageResponseTime: metrics.averageResponseTime
    }));

  return {
    overview: {
      workflowsExecuted: metrics.workflowsExecuted,
      successfulWorkflows: metrics.successfulWorkflows,
      failedWorkflows: metrics.failedWorkflows,
      successRate: metrics.workflowsExecuted > 0 
        ? (metrics.successfulWorkflows / metrics.workflowsExecuted) * 100 
        : 0
    },
    topAgents
  };
});

console.log('Datos del dashboard:', dashboardData);
```

### Usar la API del Orchestrator

#### Ejecutar un Workflow (POST /api/v1/orchestrator/workflow)

```bash
curl -X POST http://localhost:3007/api/v1/orchestrator/workflow \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": {
      "id": "workflow_1234567890",
      "name": "Análisis de Tendencias",
      "description": "Analizar tendencias virales",
      "steps": [
        {
          "id": "trend-analysis",
          "name": "Análisis de Tendencias",
          "description": "Analizar tendencias en TikTok",
          "agent": "trend-scanner",
          "input": {
            "platform": "tiktok",
            "topic": "tecnología"
          }
        }
      ],
      "createdAt": "2023-01-01T00:00:00Z",
      "version": "1.0.0"
    },
    "context": {
      "sessionId": "session-12345",
      "sharedData": {
        "userId": "user-abcde"
      },
      "stepResults": {}
    }
  }'
```

#### Obtener Métricas (GET /api/v1/orchestrator/metrics)

```bash
curl http://localhost:3007/api/v1/orchestrator/metrics
```

#### Obtener Métricas de un Agente (GET /api/v1/orchestrator/metrics/agent/{agentName})

```bash
curl http://localhost:3007/api/v1/orchestrator/metrics/agent/trend-scanner
```

#### Obtener Datos del Dashboard (GET /api/v1/orchestrator/metrics/dashboard)

```bash
curl http://localhost:3007/api/v1/orchestrator/metrics/dashboard
```

### Integración con WebSockets para Actualizaciones en Tiempo Real

```typescript
// En el frontend, conectar a WebSocket para recibir actualizaciones
const socket = new WebSocket('ws://localhost:3007');

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'workflow_started':
      console.log(`Workflow ${data.workflowName} iniciado`);
      break;
    case 'step_started':
      console.log(`Paso ${data.stepName} iniciado (intento ${data.attempt})`);
      break;
    case 'step_completed':
      console.log(`Paso ${data.stepName} completado (${data.success ? 'éxito' : 'fallido'})`);
      break;
    case 'workflow_completed':
      console.log(`Workflow ${data.workflowName} completado con estado: ${data.status}`);
      break;
    case 'workflow_failed':
      console.error(`Workflow ${data.workflowName} fallido: ${data.error}`);
      break;
  }
};
```

### Ejemplo de Streaming de Métricas en Tiempo Real

```bash
# Conectar al endpoint SSE para recibir métricas en tiempo real
curl http://localhost:3007/api/v1/orchestrator/dashboard/live
```

Esto proporcionará actualizaciones cada 5 segundos con las métricas actuales del sistema.

### Beneficios del Nuevo Sistema

1. **Modularidad**: Los workflows se definen como colecciones de pasos reutilizables
2. **Resiliencia**: Reintentos automáticos con backoff exponencial
3. **Observabilidad**: Métricas detalladas y logs estructurados
4. **Tiempo Real**: Actualizaciones instantáneas via WebSockets
5. **Estandarización**: Interface común para todos los agentes
6. **Flexibilidad**: Configuración personalizada por agente y por paso

El nuevo sistema de orquestación permite una gestión más eficiente de los flujos de trabajo complejos mientras proporciona visibilidad completa del rendimiento del sistema.