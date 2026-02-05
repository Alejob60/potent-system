# Integración Front Desk → Viralization Route Engine

## 🔄 Flujo de Integración Completo

### 1. Detección de Intención de Campaña Viral

Cuando el Front Desk Agent detecta que el usuario quiere iniciar una campaña viral:

```typescript
// En el servicio del Front Desk
private async handleViralCampaignIntent(
  sessionId: string,
  userId: string,
  campaignType: string,
  emotion: string,
  platforms: string[]
): Promise<any> {
  try {
    // Determinar los agentes necesarios según el tipo de campaña
    const agents = this.getRequiredAgentsForCampaign(campaignType);
    
    // Activar la ruta de viralización
    const response = await this.viralizationRouteIntegrationService.activateRoute({
      routeType: campaignType,
      sessionId,
      emotion,
      platforms,
      agents,
      schedule: {
        start: new Date().toISOString(),
        end: this.calculateCampaignEndDate(campaignType),
      },
      metadata: {
        userId,
        campaignObjective: this.getCampaignObjective(campaignType),
        targetAudience: this.estimateTargetAudience(campaignType),
      }
    });

    // Generar respuesta emocional para el usuario
    const emotionalResponse = this.generateCampaignActivationResponse(emotion, campaignType);
    
    return {
      status: response.status,
      routeId: response.routeId,
      message: emotionalResponse,
      suggestions: this.generateCampaignSuggestions(campaignType),
      estimatedTimeline: this.getEstimatedTimeline(campaignType),
    };
  } catch (error) {
    console.error('Failed to activate viralization route:', error.message);
    throw error;
  }
}

private getRequiredAgentsForCampaign(campaignType: string): string[] {
  const agentMap = {
    'product_launch': [
      'trend-scanner',
      'video-scriptor',
      'creative-synthesizer',
      'post-scheduler',
      'analytics-reporter'
    ],
    'event_promotion': [
      'trend-scanner',
      'video-scriptor',
      'creative-synthesizer',
      'post-scheduler',
      'analytics-reporter'
    ],
    'content_campaign': [
      'trend-scanner',
      'video-scriptor',
      'creative-synthesizer',
      'post-scheduler',
      'analytics-reporter'
    ],
    'brand_awareness': [
      'trend-scanner',
      'video-scriptor',
      'creative-synthesizer',
      'post-scheduler',
      'analytics-reporter'
    ]
  };
  
  return agentMap[campaignType] || agentMap['product_launch'];
}
```

### 2. Servicio de Integración con el Motor de Rutas

```typescript
// En el servicio de integración del Front Desk
@Injectable()
export class ViralizationRouteIntegrationService {
  constructor(private readonly httpService: HttpService) {}

  async activateRoute(payload: any): Promise<any> {
    try {
      // Enviar la solicitud al Viralization Route Engine
      const response = await firstValueFrom(
        this.httpService.post(
          `${process.env.BACKEND_URL}/api/agents/viralization-route-engine/activate`,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${this.getUserToken()}`, // Token de autenticación
              'Content-Type': 'application/json',
            },
          }
        ),
      );

      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to activate viralization route: ${error.message}`,
      );
    }
  }

  async getRouteStatus(routeId: string): Promise<any> {
    try {
      // Obtener el estado de la ruta
      const response = await firstValueFrom(
        this.httpService.get(
          `${process.env.BACKEND_URL}/api/agents/viralization-route-engine/status/${routeId}`,
          {
            headers: {
              'Authorization': `Bearer ${this.getUserToken()}`,
            },
          }
        ),
      );

      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to get route status: ${error.message}`,
      );
    }
  }
}
```

### 3. Recepción de Notificaciones del Motor de Rutas

```typescript
// En el controlador del Front Desk para recibir notificaciones
@Post('notifications/route-updated')
@ApiOperation({
  summary: 'Receive route status update notification',
  description: 'Receive notification when viralization route status changes',
})
async handleRouteStatusUpdate(@Body() notification: any) {
  try {
    // Actualizar estado de la conversación
    await this.updateConversationWithRouteStatus(
      notification.sessionId,
      notification.routeId,
      notification.status,
      notification.currentStage,
      notification.stages
    );

    // Enviar notificación al frontend a través de WebSocket
    this.websocketGateway.notifyUser(
      notification.sessionId,
      'route_status_update',
      {
        routeId: notification.routeId,
        status: notification.status,
        currentStage: notification.currentStage,
        stageDetails: notification.stages.find(s => s.order === notification.currentStage),
        progress: this.calculateRouteProgress(notification.stages),
      }
    );

    return { status: 'received' };
  } catch (error) {
    console.error('Failed to handle route status update:', error.message);
    throw new HttpException(
      {
        status: 'error',
        message: `Failed to handle route status update: ${error.message}`,
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
```

## 📡 Ejemplos de Comunicación

### Solicitud de Activación de Ruta

```json
{
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
  },
  "metadata": {
    "productName": "InnovateX Pro",
    "targetAudience": "tech enthusiasts 25-40",
    "keyFeatures": ["AI-powered", "5G compatible", "24h battery"]
  }
}
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

### Notificación de Actualización de Estado

```json
{
  "routeId": "route_9876543210",
  "sessionId": "sess_1234567890",
  "status": "processing",
  "currentStage": 3,
  "stages": [
    {
      "order": 1,
      "agent": "trend-scanner",
      "status": "completed",
      "startedAt": "2025-10-10T10:00:00Z",
      "completedAt": "2025-10-10T10:02:30Z"
    },
    {
      "order": 2,
      "agent": "video-scriptor",
      "status": "completed",
      "startedAt": "2025-10-10T10:02:30Z",
      "completedAt": "2025-10-10T10:05:15Z"
    },
    {
      "order": 3,
      "agent": "creative-synthesizer",
      "status": "processing",
      "startedAt": "2025-10-10T10:05:15Z"
    }
  ]
}
```

## 🧠 Coordinación entre Agentes

### Paso 1: Trend Scanner Agent
```typescript
// El Trend Scanner recibe la solicitud
@Post('scan')
async scanTrends(@Body() request: any) {
  // Analizar tendencias para las plataformas especificadas
  const trends = await this.trendAnalysisService.analyzePlatforms(
    request.platforms,
    request.emotion
  );
  
  // Generar recomendaciones de formato y hashtags
  const recommendations = this.trendAnalysisService.generateRecommendations(trends);
  
  return {
    trends: trends.map(t => t.name),
    hashtags: recommendations.hashtags,
    formats: recommendations.formats,
    emotionalTone: request.emotion
  };
}
```

### Paso 2: Video Scriptor Agent
```typescript
// El Video Scriptor recibe la salida del Trend Scanner
@Post('generate-script')
async generateScript(@Body() request: any) {
  // Usar las tendencias identificadas para crear un guión
  const script = await this.scriptGenerationService.createEmotionalScript(
    request.trendData,
    request.emotion,
    request.platforms
  );
  
  return {
    script: script.content,
    duration: script.estimatedDuration,
    keyPoints: script.keyPoints,
    callToAction: script.callToAction
  };
}
```

### Paso 3: Creative Synthesizer Agent
```typescript
// El Creative Synthesizer recibe el guión y crea el contenido
@Post()
async createContent(@Body() request: CreateContentDto) {
  // Guardar la solicitud y encolar para procesamiento
  const creationRecord = await this.creationService.saveRequest(request);
  
  // Enviar a la cola de Service Bus
  this.serviceBusClient.emit('content_creation_request', {
    creationId: creationRecord.id,
    ...request
  });
  
  return {
    status: 'processing',
    creationId: creationRecord.id,
    message: 'Content creation request received and queued for processing',
    estimatedTime: this.estimateProcessingTime(request.intention)
  };
}
```

### Paso 4: Post Scheduler Agent
```typescript
// El Post Scheduler programa las publicaciones
@Post('schedule')
async schedulePosts(@Body() request: any) {
  // Crear calendario de publicaciones basado en el contenido generado
  const schedule = await this.schedulingService.createOptimalSchedule(
    request.content,
    request.schedule,
    request.platforms
  );
  
  // Guardar el calendario
  const savedSchedule = await this.scheduleRepository.save(schedule);
  
  return {
    scheduleId: savedSchedule.id,
    posts: savedSchedule.posts,
    platforms: request.platforms,
    status: 'scheduled'
  };
}
```

### Paso 5: Analytics Reporter Agent
```typescript
// El Analytics Reporter genera reportes de impacto
@Post('generate-report')
async generateReport(@Body() request: any) {
  // Recopilar métricas de las publicaciones
  const metrics = await this.analyticsService.collectMetrics(
    request.contentId,
    request.platforms,
    request.period
  );
  
  // Generar reporte con recomendaciones
  const report = await this.reportGenerationService.createReport(
    metrics,
    request.sessionId
  );
  
  return {
    reportId: report.id,
    metrics: report.metrics,
    recommendations: report.recommendations,
    summary: report.executiveSummary
  };
}
```

## 🔄 Sincronización con el Frontend

### Notificaciones en Tiempo Real

```typescript
// Uso de WebSockets para notificaciones en tiempo real
@WebSocketGateway({ cors: { origin: '*' } })
export class FrontDeskWebSocketGateway {
  @WebSocketServer()
  server: Server;

  notifyUser(sessionId: string, eventType: string, data: any): void {
    // Emitir notificación a todos los clientes conectados con esa sesión
    this.server.to(sessionId).emit(eventType, data);
  }

  @SubscribeMessage('join_session')
  handleSessionJoin(@ConnectedSocket() client: Socket, @MessageBody() sessionId: string): void {
    // Unir al cliente a la sala de la sesión
    client.join(sessionId);
  }

  @SubscribeMessage('leave_session')
  handleSessionLeave(@ConnectedSocket() client: Socket, @MessageBody() sessionId: string): void {
    // Remover al cliente de la sala de la sesión
    client.leave(sessionId);
  }
}
```

### Actualización del Dashboard

Cuando el frontend recibe una notificación de actualización de ruta:

```javascript
// En el frontend (dashboard_desktop_v4)
socket.on('route_status_update', (data) => {
  // Actualizar la interfaz de usuario
  updateCampaignDisplay(data);
  
  // Mostrar notificación al usuario
  showNotification({
    title: 'Actualización de Campaña',
    message: `Etapa ${data.currentStage} en progreso`,
    type: 'info',
    duration: 3000
  });
  
  // Actualizar la barra de progreso
  updateProgressBar(data.progress);
  
  // Mostrar detalles de la etapa actual
  showStageDetails(data.stageDetails);
});
```

## 📊 Métricas y Monitoreo

### Seguimiento de Rendimiento

```typescript
// Métricas recolectadas por el Front Desk
private async collectCampaignMetrics(
  sessionId: string,
  routeId: string,
  startTime: Date
): Promise<void> {
  try {
    // Obtener el estado actual de la ruta
    const routeStatus = await this.viralizationRouteIntegrationService.getRouteStatus(routeId);
    
    // Registrar métricas
    await this.metricsService.recordMetric({
      sessionId,
      routeId,
      metricType: 'campaign_progress',
      value: this.calculateRouteProgress(routeStatus.stages),
      timestamp: new Date(),
    });
    
    // Actualizar estadísticas del usuario
    await this.updateUserCampaignStatistics(sessionId, routeStatus);
  } catch (error) {
    console.error('Failed to collect campaign metrics:', error.message);
  }
}
```

### Reportes y Análisis

```typescript
// Generación de reportes para el usuario
async generateCampaignReport(sessionId: string, routeId: string): Promise<any> {
  try {
    // Obtener el estado completo de la ruta
    const routeStatus = await this.viralizationRouteIntegrationService.getRouteStatus(routeId);
    
    const report = {
      campaignId: routeId,
      campaignType: routeStatus.routeType,
      status: routeStatus.status,
      timeline: this.generateCampaignTimeline(routeStatus.stages),
      performanceMetrics: routeStatus.metrics,
      stageBreakdown: routeStatus.stages.map(stage => ({
        stage: stage.order,
        agent: stage.agent,
        status: stage.status,
        duration: stage.completedAt && stage.startedAt 
          ? (new Date(stage.completedAt).getTime() - new Date(stage.startedAt).getTime()) / 1000 
          : null,
        outputPreview: stage.output ? this.generateOutputPreview(stage.output) : null
      })),
      recommendations: this.generateCampaignRecommendations(routeStatus),
      nextSteps: this.generateNextSteps(routeStatus)
    };
    
    return report;
  } catch (error) {
    console.error('Failed to generate campaign report:', error.message);
    throw error;
  }
}
```

## 🔒 Seguridad en la Integración

### Validación de Tokens

```typescript
// Middleware para validar tokens en endpoints de notificación
@Injectable()
export class TokenValidationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req['user'] = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido' });
    }
  }
}
```

### Encriptación de Datos Sensibles

```typescript
// Encriptación de datos sensibles en tránsito
private encryptSensitiveData(data: any): string {
  const jsonString = JSON.stringify(data);
  const encrypted = crypto.encrypt(jsonString, process.env.DATABASE_ENCRYPTION_KEY);
  return encrypted;
}

private decryptSensitiveData(encryptedData: string): any {
  const decrypted = crypto.decrypt(encryptedData, process.env.DATABASE_ENCRYPTION_KEY);
  return JSON.parse(decrypted);
}
```

## 🎯 Beneficios de la Integración

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

Esta integración completa permite que el Front Desk Agent coordine campañas virales complejas de principio a fin, proporcionando una experiencia de usuario fluida y emocionalmente conectada, mientras maneja de forma asíncrona la ejecución de múltiples agentes especializados.