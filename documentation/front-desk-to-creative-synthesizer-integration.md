# Integración Front Desk → Creative Synthesizer

## 🔄 Flujo de Integración Completo

### 1. Detección de Intención de Creación de Contenido

Cuando el Front Desk Agent detecta que el usuario quiere crear contenido multimedia:

```typescript
// En el servicio del Front Desk
private async handleContentCreationIntent(
  sessionId: string,
  userId: string,
  intention: string,
  emotion: string,
  entities: any,
  integrationId?: string,
  integrationStatus?: string
): Promise<any> {
  try {
    // Enviar solicitud al Creative Synthesizer
    const response = await this.creativeSynthesizerIntegrationService.sendToCreativeSynthesizer({
      sessionId,
      userId,
      intention,
      emotion,
      entities,
      integrationId,
      integrationStatus,
    });

    // Generar respuesta emocional para el usuario
    const emotionalResponse = this.generateEmotionalResponse(emotion, intention);
    
    return {
      status: response.status,
      creationId: response.creationId,
      message: emotionalResponse,
      suggestions: this.generateNextStepSuggestions(intention),
    };
  } catch (error) {
    console.error('Failed to send request to Creative Synthesizer:', error.message);
    throw error;
  }
}
```

### 2. Envío de Solicitud al Creative Synthesizer

```typescript
// En el servicio de integración del Front Desk
async sendToCreativeSynthesizer(payload: any): Promise<any> {
  try {
    // Enviar la solicitud al Creative Synthesizer Agent
    const response = await firstValueFrom(
      this.httpService.post(
        `${process.env.BACKEND_URL}/api/agents/creative-synthesizer`,
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
      `Failed to send request to Creative Synthesizer: ${error.message}`,
    );
  }
}
```

### 3. Recepción de Notificaciones del Creative Synthesizer

```typescript
// En el controlador del Front Desk para recibir notificaciones
@Post('notifications/content-completed')
@ApiOperation({
  summary: 'Receive content creation completion notification',
  description: 'Receive notification when content creation is completed',
})
async handleContentCreationCompleted(@Body() notification: any) {
  try {
    // Actualizar estado de la conversación
    await this.updateConversationWithContentResult(
      notification.sessionId,
      notification.creationId,
      notification.status,
      notification.assetUrl
    );

    // Enviar notificación al frontend a través de WebSocket
    this.websocketGateway.notifyUser(
      notification.sessionId,
      'content_ready',
      {
        creationId: notification.creationId,
        status: notification.status,
        assetUrl: notification.assetUrl,
        narrative: notification.narrative,
        suggestions: notification.suggestions,
      }
    );

    return { status: 'received' };
  } catch (error) {
    console.error('Failed to handle content creation completion:', error.message);
    throw new HttpException(
      {
        status: 'error',
        message: `Failed to handle content creation completion: ${error.message}`,
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
```

### 4. Manejo de Publicación Automática

```typescript
// En el servicio del Front Desk
async handleAutomaticPublishing(
  sessionId: string,
  assetId: string,
  integrationId: string,
  caption: string,
  tags: string[]
): Promise<any> {
  try {
    // Enviar solicitud de publicación al Creative Synthesizer
    const response = await this.creativeSynthesizerIntegrationService.requestPublishing({
      assetId,
      integrationId,
      caption,
      tags,
    });

    // Generar respuesta emocional para el usuario
    const emotionalResponse = '¡Tu contenido está en camino de ser publicado! 🚀';
    
    return {
      status: response.status,
      message: emotionalResponse,
      narrative: response.narrative,
      suggestions: response.suggestions,
    };
  } catch (error) {
    console.error('Failed to request automatic publishing:', error.message);
    throw error;
  }
}
```

## 📡 Ejemplos de Comunicación

### Solicitud Inicial al Creative Synthesizer

```json
{
  "sessionId": "sess_1234567890",
  "userId": "user_0987654321",
  "intention": "generate_video",
  "emotion": "excited",
  "entities": {
    "script": "Presentamos nuestro nuevo producto innovador que revolucionará la industria",
    "style": "tiktok",
    "duration": 30,
    "assets": ["logo.png", "product-image.jpg"]
  },
  "integrationId": "tiktok_integration_123",
  "integrationStatus": "active"
}
```

### Respuesta Inmediata del Creative Synthesizer

```json
{
  "status": "processing",
  "creationId": "creation_9876543210",
  "message": "Content creation request received and queued for processing",
  "sessionId": "sess_1234567890"
}
```

### Notificación de Finalización

```json
{
  "creationId": "creation_9876543210",
  "sessionId": "sess_1234567890",
  "status": "completed",
  "assetUrl": "https://realculturestorage.blob.core.windows.net/videos/generated-video-1234567890.mp4?sv=2020-08-04&ss=b&srt=sco&sp=rwdlacx&se=2025-12-31T23:59:59Z&st=2025-01-01T00:00:00Z&spr=https&sig=SIMULATED_SAS_SIGNATURE",
  "narrative": "¡Tu video está listo para inspirar confianza y generar engagement! 🎬✨",
  "suggestions": [
    "Considera agregar subtítulos para mayor alcance",
    "Programa la publicación para horarios de mayor engagement",
    "Comparte en múltiples plataformas para maximizar impacto"
  ]
}
```

### Solicitud de Publicación

```json
{
  "assetId": "creation_9876543210",
  "integrationId": "tiktok_integration_123",
  "caption": "¡Descubre nuestro nuevo producto innovador! 🚀 #innovacion #tecnologia",
  "tags": ["innovacion", "tecnologia", "producto"]
}
```

### Respuesta de Publicación

```json
{
  "status": "publishing",
  "assetId": "creation_9876543210",
  "message": "Content publish request received and queued for processing",
  "narrative": "Tu video está en camino de ser publicado en TikTok. 🚀",
  "suggestions": [
    "Interactúa con los comentarios de tus seguidores",
    "Comparte en otras redes sociales",
    "Monitorea el rendimiento de la publicación"
  ]
}
```

## 🧠 Manejo de Estados y Errores

### Estados de la Conversación

```typescript
// Actualización del estado de la conversación en el Front Desk
private async updateConversationWithContentResult(
  sessionId: string,
  creationId: string,
  status: string,
  assetUrl?: string
): Promise<void> {
  try {
    // Obtener la última conversación de la sesión
    const conversation = await this.getLatestConversation(sessionId);
    
    if (conversation) {
      // Actualizar con los resultados de la creación de contenido
      conversation.context = {
        ...conversation.context,
        contentCreation: {
          creationId,
          status,
          assetUrl,
          completedAt: new Date(),
        }
      };
      
      // Guardar los cambios
      await this.conversationRepository.save(conversation);
      
      // Comprimir el historial de conversaciones
      await this.compressConversationHistory(sessionId);
    }
  } catch (error) {
    console.error('Failed to update conversation with content result:', error.message);
  }
}
```

### Manejo de Errores

```typescript
// Manejo de errores en la integración
private async handleContentCreationError(
  sessionId: string,
  creationId: string,
  errorMessage: string
): Promise<void> {
  try {
    // Registrar el error en la base de datos
    await this.logContentCreationError(sessionId, creationId, errorMessage);
    
    // Actualizar el estado de la conversación
    await this.updateConversationWithError(sessionId, creationId, errorMessage);
    
    // Notificar al usuario sobre el error
    this.websocketGateway.notifyUser(
      sessionId,
      'content_error',
      {
        creationId,
        message: 'Lo sentimos, hubo un problema al generar tu contenido. Nuestro equipo está trabajando para resolverlo. 🛠️',
        suggestions: [
          'Intenta nuevamente con una configuración diferente',
          'Verifica que toda la información requerida esté completa',
          'Contacta a soporte si el problema persiste'
        ]
      }
    );
  } catch (error) {
    console.error('Failed to handle content creation error:', error.message);
  }
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

Cuando el frontend recibe una notificación de contenido listo:

```javascript
// En el frontend (dashboard_desktop_v4)
socket.on('content_ready', (data) => {
  // Actualizar la interfaz de usuario
  updateContentDisplay(data);
  
  // Mostrar notificación al usuario
  showNotification({
    title: '¡Contenido Listo!',
    message: data.narrative,
    type: 'success',
    duration: 5000
  });
  
  // Actualizar la lista de contenidos
  refreshContentList();
});

socket.on('content_error', (data) => {
  // Mostrar error al usuario
  showNotification({
    title: 'Error en la Creación',
    message: data.message,
    type: 'error',
    duration: 5000
  });
  
  // Mostrar sugerencias
  showSuggestions(data.suggestions);
});
```

## 📊 Métricas y Monitoreo

### Seguimiento de Rendimiento

```typescript
// Métricas recolectadas por el Front Desk
private async collectContentCreationMetrics(
  sessionId: string,
  creationId: string,
  startTime: Date,
  endTime: Date
): Promise<void> {
  try {
    const duration = (endTime.getTime() - startTime.getTime()) / 1000; // segundos
    
    // Registrar métricas
    await this.metricsService.recordMetric({
      sessionId,
      creationId,
      metricType: 'content_creation_time',
      value: duration,
      timestamp: new Date(),
    });
    
    // Actualizar estadísticas del usuario
    await this.updateUserStatistics(sessionId, duration);
  } catch (error) {
    console.error('Failed to collect content creation metrics:', error.message);
  }
}
```

### Reportes y Análisis

```typescript
// Generación de reportes para el usuario
async generateContentCreationReport(sessionId: string): Promise<any> {
  try {
    const creations = await this.getCreativeSynthesizerCreations(sessionId);
    
    const report = {
      totalCreations: creations.length,
      successRate: this.calculateSuccessRate(creations),
      averageCreationTime: this.calculateAverageTime(creations),
      mostCreatedType: this.getMostCreatedType(creations),
      engagementEstimates: this.estimateEngagement(creations),
      suggestions: this.generateImprovementSuggestions(creations),
    };
    
    return report;
  } catch (error) {
    console.error('Failed to generate content creation report:', error.message);
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

Esta integración completa permite que el Front Desk Agent coordine eficientemente con el Creative Synthesizer Agent, proporcionando una experiencia de usuario fluida y emocionalmente conectada, mientras maneja de forma asíncrona la generación de contenido multimedia complejo.