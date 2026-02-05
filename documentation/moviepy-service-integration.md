# Integración del Servicio MoviePy con MisyBot

## 📋 Descripción

Este documento describe cómo integrar el servicio MoviePy con MisyBot para procesamiento avanzado de video, manteniendo la arquitectura de microservicios y la comunicación asíncrona.

## 🏗️ Arquitectura de Integración

```
┌─────────────────┐    ┌──────────────────────┐    ┌────────────────────┐
│  MisyBot        │    │  MoviePy Service     │    │  Azure Service Bus │
│  (NestJS)       │    │  (Python/Flask)      │    │                    │
│                 │    │                      │    │                    │
│ ┌─────────────┐ │    │ ┌──────────────────┐ │    │ ┌────────────────┐ │
│ │Creative     │ │    │ │Video Processing  │ │    │ │Video           │ │
│ │Synthesizer  │─┼───▶│ │API               │ │───▶│ │Processing      │ │
│ │Agent        │ │    │ │                  │ │    │ │Queue           │ │
│ └─────────────┘ │    │ └──────────────────┘ │    │ └────────────────┘ │
│                 │    │                      │    │                    │
│ ┌─────────────┐ │    │ ┌──────────────────┐ │    │ ┌────────────────┐ │
│ │Viral        │ │    │ │Health & Status   │ │    │ │Notifications   │ │
│ │Campaign     │ │    │ │Endpoints         │ │    │ │Topic           │ │
│ │Orchestrator │ │    │ │                  │ │    │ │                │ │
│ └─────────────┘ │    │ └──────────────────┘ │    │ └────────────────┘ │
└─────────────────┘    └──────────────────────┘    └────────────────────┘
         │                           │                         │
         │                           │                         │
         ▼                           ▼                         ▼
┌─────────────────┐    ┌──────────────────────┐    ┌────────────────────┐
│  Front Desk     │    │  Monitoring & Logs   │    │  External Storage  │
│  Agent          │    │                      │    │  (Azure Storage)   │
└─────────────────┘    └──────────────────────┘    └────────────────────┘
```

## 🚀 Configuración de Integración

### 1. Variables de Entorno en MisyBot

Agregar al archivo `.env.local`:

```bash
# MoviePy Service Configuration
MOVIEPY_SERVICE_URL=https://misybot-moviepy-service.azurewebsites.net
MOVIEPY_SERVICE_API_KEY=your-generated-api-key-here
MOVIEPY_SERVICE_TIMEOUT=300000  # 5 minutos

# Azure Service Bus for MoviePy Notifications
MOVIEPY_SERVICE_BUS_CONNECTION_STRING=Endpoint=sb://...
MOVIEPY_NOTIFICATIONS_QUEUE=moviepy-notifications
```

### 2. Módulo de Integración en MisyBot

#### Crear el módulo de MoviePy Service

```typescript
// src/integrations/moviepy/moviepy.module.ts
import { Module, HttpModule } from '@nestjs/common';
import { MoviePyService } from './moviepy.service';

@Module({
  imports: [HttpModule],
  providers: [MoviePyService],
  exports: [MoviePyService],
})
export class MoviePyModule {}
```

#### Servicio de Integración

```typescript
// src/integrations/moviepy/moviepy.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MoviePyService {
  private readonly logger = new Logger(MoviePyService.name);

  constructor(private readonly httpService: HttpService) {}

  async trimVideo(videoUrl: string, startTime: number, endTime: number, sessionId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${process.env.MOVIEPY_SERVICE_URL}/process/video/trim`,
          {
            video_url: videoUrl,
            start_time: startTime,
            end_time: endTime,
            session_id: sessionId
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.MOVIEPY_SERVICE_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: parseInt(process.env.MOVIEPY_SERVICE_TIMEOUT) || 300000
          }
        )
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to trim video: ${error.message}`);
      throw new Error(`Video trimming failed: ${error.message}`);
    }
  }

  async addTextToVideo(videoUrl: string, text: string, position: string, sessionId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${process.env.MOVIEPY_SERVICE_URL}/process/video/add_text`,
          {
            video_url: videoUrl,
            text: text,
            position: position,
            font_size: 50,
            color: 'white',
            session_id: sessionId
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.MOVIEPY_SERVICE_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: parseInt(process.env.MOVIEPY_SERVICE_TIMEOUT) || 300000
          }
        )
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to add text to video: ${error.message}`);
      throw new Error(`Adding text to video failed: ${error.message}`);
    }
  }

  async concatenateVideos(videoUrls: string[], sessionId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${process.env.MOVIEPY_SERVICE_URL}/process/video/concatenate`,
          {
            video_urls: videoUrls,
            session_id: sessionId
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.MOVIEPY_SERVICE_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: parseInt(process.env.MOVIEPY_SERVICE_TIMEOUT) || 300000
          }
        )
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to concatenate videos: ${error.message}`);
      throw new Error(`Video concatenation failed: ${error.message}`);
    }
  }
}
```

## 🧠 Integración con Agentes Existentes

### 1. Integración con Creative Synthesizer Agent

#### Modificación del servicio

```typescript
// src/agents/agent-creative-synthesizer/services/creative-synthesizer.service.ts
import { MoviePyService } from '../../../integrations/moviepy/moviepy.service';

@Injectable()
export class CreativeSynthesizerService {
  constructor(
    // ... otras dependencias
    private readonly moviePyService: MoviePyService,
  ) {}

  async processVideoEditing(editingRequest: any): Promise<any> {
    try {
      // Determinar tipo de edición basado en la solicitud
      let result;
      if (editingRequest.operation === 'trim') {
        result = await this.moviePyService.trimVideo(
          editingRequest.videoUrl,
          editingRequest.startTime,
          editingRequest.endTime,
          editingRequest.sessionId
        );
      } else if (editingRequest.operation === 'add_text') {
        result = await this.moviePyService.addTextToVideo(
          editingRequest.videoUrl,
          editingRequest.text,
          editingRequest.position,
          editingRequest.sessionId
        );
      } else if (editingRequest.operation === 'concatenate') {
        result = await this.moviePyService.concatenateVideos(
          editingRequest.videoUrls,
          editingRequest.sessionId
        );
      }

      // Actualizar estado de creación
      await this.updateCreationStatus(
        editingRequest.creationId,
        'editing_completed',
        result.asset_url,
        undefined, // generationTime
        undefined  // qualityScore
      );

      return result;
    } catch (error) {
      // Actualizar estado a "failed"
      await this.updateCreationStatus(
        editingRequest.creationId,
        'editing_failed',
        undefined,
        undefined,
        undefined
      );
      
      throw new Error(`Video editing failed: ${error.message}`);
    }
  }
}
```

### 2. Integración con Viral Campaign Orchestrator

#### Modificación del servicio

```typescript
// src/agents/viral-campaign-orchestrator/services/viral-campaign-orchestrator.service.ts
import { MoviePyService } from '../../../integrations/moviepy/moviepy.service';

@Injectable()
export class ViralCampaignOrchestratorService {
  constructor(
    // ... otras dependencias
    private readonly moviePyService: MoviePyService,
  ) {}

  private async executeContentEditorStage(campaign: ViralCampaign): Promise<any> {
    try {
      // Obtener el contenido generado por el Creative Synthesizer
      const creativeOutput = campaign.stages.find(s => s.agent === 'creative-synthesizer')?.output;
      
      // Procesar cada asset con MoviePy
      const editedAssets = [];
      for (const asset of creativeOutput?.assets || []) {
        if (asset.type === 'video') {
          // Ejemplo: recortar video para ajustarse a requisitos de plataforma
          const editedAsset = await this.moviePyService.trimVideo(
            asset.url,
            0, // start time
            60, // end time (primer minuto)
            campaign.sessionId
          );
          editedAssets.push(editedAsset);
        }
      }

      const editedContent = {
        assets: editedAssets,
        optimizedFor: campaign.platforms,
        editingNotes: 'Contenido editado para cumplir con los requisitos de cada plataforma',
        emotion: campaign.emotion
      };

      return editedContent;
    } catch (error) {
      this.logger.error('Failed to execute Content Editor stage:', error.message);
      throw new Error(`Content Editor stage failed: ${error.message}`);
    }
  }
}
```

## 🔄 Manejo de Notificaciones Asíncronas

### Configuración del Listener de Notificaciones

```typescript
// src/integrations/moviepy/moviepy-notifications.listener.ts
import { Injectable, Logger } from '@nestjs/common';
import { ServiceBusClient, ServiceBusReceiver } from '@azure/service-bus';

@Injectable()
export class MoviePyNotificationsListener {
  private readonly logger = new Logger(MoviePyNotificationsListener.name);
  private receiver: ServiceBusReceiver;

  constructor() {
    this.initializeListener();
  }

  private async initializeListener() {
    try {
      const serviceBusClient = new ServiceBusClient(
        process.env.MOVIEPY_SERVICE_BUS_CONNECTION_STRING
      );
      
      this.receiver = serviceBusClient.createReceiver(
        process.env.MOVIEPY_NOTIFICATIONS_QUEUE
      );

      this.receiver.subscribe({
        processMessage: async (message) => {
          await this.handleMoviePyNotification(message.body);
        },
        processError: async (args) => {
          this.logger.error(`Error processing MoviePy notification: ${args.error.message}`);
        }
      });

      this.logger.log('MoviePy notifications listener initialized');
    } catch (error) {
      this.logger.error(`Failed to initialize MoviePy notifications listener: ${error.message}`);
    }
  }

  private async handleMoviePyNotification(notification: any) {
    try {
      this.logger.log(`Received MoviePy notification: ${JSON.stringify(notification)}`);
      
      // Aquí se procesaría la notificación y se actualizaría el estado correspondiente
      // en la base de datos o se enviaría una notificación al Front Desk
      
      // Ejemplo: Actualizar estado de creación
      // await this.creativeSynthesizerService.updateCreationStatus(
      //   notification.creationId,
      //   notification.status,
      //   notification.asset_url
      // );
      
    } catch (error) {
      this.logger.error(`Failed to handle MoviePy notification: ${error.message}`);
    }
  }
}
```

## 📦 Actualización del Módulo Principal

### Modificación de AppModule

```typescript
// src/app.module.ts
import { MoviePyModule } from './integrations/moviepy/moviepy.module';
import { MoviePyNotificationsListener } from './integrations/moviepy/moviepy-notifications.listener';

@Module({
  imports: [
    // ... otros módulos
    MoviePyModule,
  ],
  providers: [
    // ... otros providers
    MoviePyNotificationsListener,
  ],
})
export class AppModule {}
```

## 🧪 Pruebas de Integración

### Prueba de Edición de Video

```typescript
// test/moviepy-integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { MoviePyService } from '../src/integrations/moviepy/moviepy.service';

describe('MoviePy Integration', () => {
  let service: MoviePyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MoviePyService],
    }).compile();

    service = module.get<MoviePyService>(MoviePyService);
  });

  it('should trim video successfully', async () => {
    const result = await service.trimVideo(
      'https://example.com/test-video.mp4',
      0,
      30,
      'test-session-123'
    );
    
    expect(result.status).toBe('completed');
    expect(result.asset_url).toBeDefined();
  });
});
```

## 📊 Métricas y Monitoreo

### Métricas de Rendimiento

1. **Tiempo de procesamiento de video**
   - Promedio: < 2 minutos por operación
   - Máximo: 5 minutos por operación

2. **Tasa de éxito**
   - Objetivo: > 95%
   - Alerta: < 90%

3. **Uso de recursos**
   - CPU: < 80%
   - Memoria: < 70%

### Logging

```typescript
// En los servicios de integración
this.logger.log(`Sending video editing request to MoviePy service: ${operation}`);
this.logger.log(`Received response from MoviePy service: ${JSON.stringify(response)}`);
this.logger.error(`MoviePy service error: ${error.message}`);
```

## 🔒 Seguridad

### Autenticación

- Uso de API Keys para autenticar solicitudes entre MisyBot y MoviePy Service
- Validación de tokens JWT para operaciones sensibles
- Cifrado de datos en tránsito (HTTPS)

### Autorización

- Control de acceso basado en roles
- Limitación de cuotas por usuario
- Validación de permisos para operaciones de edición

## 🚀 Despliegue y Escalabilidad

### Escalabilidad Horizontal

- Múltiples instancias de MoviePy Service pueden ejecutarse en paralelo
- Balanceo de carga automático con Azure Load Balancer
- Auto-escalado basado en longitud de colas de Service Bus

### Tolerancia a Fallos

- Reintentos automáticos de solicitudes fallidas
- Dead letter queues para mensajes problemáticos
- Monitoreo continuo de salud del servicio

## 📚 Documentación de Endpoints

### Endpoints del MoviePy Service

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Verificar estado del servicio |
| POST | `/process/video/trim` | Recortar video entre dos tiempos |
| POST | `/process/video/add_text` | Agregar texto a video |
| POST | `/process/video/concatenate` | Concatenar múltiples videos |

### Formatos de Solicitud y Respuesta

#### Recortar Video
```json
// Request
{
  "video_url": "https://example.com/video.mp4",
  "start_time": 10,
  "end_time": 30,
  "session_id": "user-session-123"
}

// Response
{
  "status": "completed",
  "asset_url": "https://example.com/trimmed-video.mp4?sv=...",
  "message": "Video recortado exitosamente"
}
```

## 🆘 Troubleshooting

### Problemas Comunes y Soluciones

1. **Timeout en solicitudes**
   - Aumentar timeout en configuración
   - Implementar procesamiento asíncrono con polling

2. **Errores de autenticación**
   - Verificar API Key
   - Validar URL del servicio

3. **Fallos en procesamiento de video**
   - Revisar logs del MoviePy Service
   - Verificar formato y calidad del video de entrada

## 📞 Soporte y Mantenimiento

### Contacto

- Equipo de Desarrollo: dev-team@misybot.com
- Infraestructura: infra-team@misybot.com

### Actualizaciones

- Versionado semántico del MoviePy Service
- Compatibilidad hacia atrás garantizada
- Documentación actualizada con cada release