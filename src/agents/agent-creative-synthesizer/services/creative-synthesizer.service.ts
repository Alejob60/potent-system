import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreativeSynthesizerCreation } from '../entities/creative-synthesizer.entity';
import { CreateContentDto } from '../dto/create-content.dto';
import { PublishContentDto } from '../dto/publish-content.dto';
import { ClientProxy } from '@nestjs/microservices';
import { IsNull, Not } from 'typeorm';

@Injectable()
export class CreativeSynthesizerService {
  constructor(
    @InjectRepository(CreativeSynthesizerCreation)
    private readonly creationRepository: Repository<CreativeSynthesizerCreation>,
    @Inject('ServiceBusClient') private readonly serviceBusClient: ClientProxy,
  ) {}

  async processCreationRequest(
    createContentDto: CreateContentDto,
  ): Promise<any> {
    try {
      // Guardar el registro inicial de la creaci n
      const creationRecord = this.creationRepository.create({
        sessionId: createContentDto.sessionId,
        userId: createContentDto.userId,
        intention: createContentDto.intention,
        emotion: createContentDto.emotion,
        entities: createContentDto.entities,
        integrationId: createContentDto.integrationId,
        integrationStatus: createContentDto.integrationStatus,
        status: 'processing',
        metadata: {
          startTime: new Date(),
        },
      });

      const savedRecord = await this.creationRepository.save(creationRecord);

      // Enviar mensaje al Service Bus para procesamiento as ncrono
      const message = {
        creationId: savedRecord.id,
        ...createContentDto,
      };

      // Publicar mensaje en la cola de Service Bus
      this.serviceBusClient.emit('content_creation_request', message);

      // Retornar respuesta inmediata al Front Desk
      return {
        status: 'processing',
        creationId: savedRecord.id,
        message: 'Content creation request received and queued for processing',
        sessionId: createContentDto.sessionId,
      };
    } catch (error) {
      throw new Error(`Failed to process creation request: ${error.message}`);
    }
  }

  async publishContent(publishContentDto: PublishContentDto): Promise<any> {
    try {
      // Obtener el registro de creaci n
      const creationRecord = await this.creationRepository.findOne({
        where: { id: publishContentDto.assetId },
      });

      if (!creationRecord) {
        throw new Error('Creation record not found');
      }

      // Actualizar el estado a "publishing"
      creationRecord.status = 'publishing';
      await this.creationRepository.save(creationRecord);

      // Enviar mensaje al Service Bus para publicaci n
      const message = {
        ...publishContentDto,
        creationRecord,
      };

      // Publicar mensaje en la cola de Service Bus
      this.serviceBusClient.emit('content_publish_request', message);

      // Notificar al Front Desk sobre el inicio de publicaci n
      const notification = {
        creationId: publishContentDto.assetId,
        status: 'publishing',
        assetUrl: creationRecord.assetUrl, // URL con SAS
        sessionId: creationRecord.sessionId,
        narrative: this.generateEmotionalNarrative(
          'publishing',
          creationRecord.intention,
          creationRecord.emotion,
        ),
        suggestions: this.generateSuggestions(
          'publishing',
          creationRecord.intention,
        ),
      };

      this.serviceBusClient.emit('content_publish_started', notification);

      return {
        status: 'publishing',
        assetId: publishContentDto.assetId,
        message: 'Content publish request received and queued for processing',
        narrative: notification.narrative,
        suggestions: notification.suggestions,
      };
    } catch (error) {
      // Actualizar estado a "failed" en caso de error
      const creationRecord = await this.creationRepository.findOne({
        where: { id: publishContentDto.assetId },
      });

      if (creationRecord) {
        creationRecord.status = 'failed';
        await this.creationRepository.save(creationRecord);

        // Notificar error al Front Desk
        const errorNotification = {
          creationId: publishContentDto.assetId,
          status: 'failed',
          assetUrl: creationRecord.assetUrl, // URL con SAS
          sessionId: creationRecord.sessionId,
          narrative: this.generateEmotionalNarrative(
            'failed',
            creationRecord.intention,
            creationRecord.emotion,
          ),
          suggestions: this.generateSuggestions(
            'failed',
            creationRecord.intention,
          ),
        };

        this.serviceBusClient.emit('content_publish_failed', errorNotification);
      }

      throw new Error(`Failed to publish content: ${error.message}`);
    }
  }

  async getCreationsBySession(
    sessionId: string,
  ): Promise<CreativeSynthesizerCreation[]> {
    return this.creationRepository.find({
      where: { sessionId },
      order: { createdAt: 'DESC' },
    });
  }

  async getCreationStatus(): Promise<any> {
    // Obtener estad sticas de creaciones
    const totalCreations = await this.creationRepository.count();
    const processingCreations = await this.creationRepository.count({
      where: { status: 'processing' },
    });
    const completedCreations = await this.creationRepository.count({
      where: { status: 'completed' },
    });
    const failedCreations = await this.creationRepository.count({
      where: { status: 'failed' },
    });

    // Calcular tiempos promedio
    const allCreations = await this.creationRepository.find({
      where: {
        generationTime: Not(IsNull()),
      },
    });

    const avgGenerationTime =
      allCreations.length > 0
        ? allCreations.reduce(
            (sum, creation) => sum + creation.generationTime,
            0,
          ) / allCreations.length
        : 0;

    return {
      timestamp: new Date().toISOString(),
      statistics: {
        totalCreations,
        processingCreations,
        completedCreations,
        failedCreations,
        avgGenerationTime: Math.round(avgGenerationTime * 100) / 100,
      },
    };
  }

  async updateCreationStatus(
    creationId: string,
    status: string,
    assetUrl?: string,
    generationTime?: number,
    qualityScore?: number,
  ): Promise<void> {
    try {
      const creationRecord = await this.creationRepository.findOne({
        where: { id: creationId },
      });

      if (creationRecord) {
        creationRecord.status = status;
        if (assetUrl) creationRecord.assetUrl = this.generateSasUrl(assetUrl);
        if (generationTime) creationRecord.generationTime = generationTime;
        if (qualityScore) creationRecord.qualityScore = qualityScore;

        creationRecord.metadata = {
          ...creationRecord.metadata,
          endTime: new Date(),
          processingTime: generationTime,
        };

        await this.creationRepository.save(creationRecord);

        // Notificar al Front Desk sobre la finalizaci n
        const notification = {
          creationId,
          status,
          assetUrl: creationRecord.assetUrl, // URL con SAS
          sessionId: creationRecord.sessionId,
          // A adir narrativa emocional seg n el estado
          narrative: this.generateEmotionalNarrative(
            status,
            creationRecord.intention,
            creationRecord.emotion,
          ),
          suggestions: this.generateSuggestions(
            status,
            creationRecord.intention,
          ),
        };

        this.serviceBusClient.emit('content_creation_completed', notification);
      }
    } catch (error) {
      console.error('Failed to update creation status:', error.message);
    }
  }

  async findAll(): Promise<CreativeSynthesizerCreation[]> {
    return this.creationRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<CreativeSynthesizerCreation | null> {
    return this.creationRepository.findOneBy({ id });
  }

  /**
   * Generate SAS URL for asset access
   * @param url Original asset URL
   * @returns URL with SAS token
   */
  private generateSasUrl(url: string): string {
    // En un entorno real, aqu  se generar a un token SAS real
    // Por ahora, simulamos la adici n de un par metro de SAS
    const sasToken = `sv=2020-08-04&ss=b&srt=sco&sp=rwdlacx&se=2025-12-31T23:59:59Z&st=2025-01-01T00:00:00Z&spr=https&sig=SIMULATED_SAS_SIGNATURE`;
    return url.includes('?') ? `${url}&${sasToken}` : `${url}?${sasToken}`;
  }

  /**
   * Generate emotional narrative based on status and intention
   * @param status Current status of the creation
   * @param intention Creation intention
   * @param emotion Detected user emotion
   * @returns Emotional narrative
   */
  private generateEmotionalNarrative(
    status: string,
    intention: string,
    emotion: string,
  ): string {
    const narratives = {
      completed: {
        generate_video: {
          excited:
            ' Tu video est  listo para inspirar confianza y generar engagement!    ',
          curious:
            'Tu video ha sido creado con  xito, listo para compartir con tu audiencia.   ',
          focused: 'Video completado con precisi n, tal como lo imaginaste.   ',
          default:
            'Tu video ha sido generado exitosamente.  Listo para viralizar!   ',
        },
        generate_image: {
          excited:
            ' Tu imagen est  lista para cautivar corazones y generar likes!     ',
          curious: 'Imagen creada con  xito, lista para ser compartida.   ',
          focused: 'Imagen completada con precisi n art stica.   ',
          default:
            'Tu imagen ha sido generada exitosamente.  Perfecta para publicar!   ',
        },
        generate_audio: {
          excited:
            ' Tu audio est  listo para emocionar y conectar con tu audiencia!    ',
          curious: 'Audio creado con  xito, listo para ser escuchado.   ',
          focused: 'Audio completado con la calidad que buscabas.   ',
          default:
            'Tu audio ha sido generado exitosamente.  Listo para compartir!   ',
        },
      },
      failed: {
        default:
          'Lo sentimos, hubo un problema al generar tu contenido. Nuestro equipo est  trabajando para resolverlo.    ',
      },
      published: {
        default: ' Tu contenido ha sido publicado exitosamente!   ',
      },
    };

    // Intentar obtener narrativa espec fica
    if (
      narratives[status] &&
      narratives[status][intention] &&
      narratives[status][intention][emotion]
    ) {
      return narratives[status][intention][emotion];
    }

    // Intentar obtener narrativa por intenci n
    if (
      narratives[status] &&
      narratives[status][intention] &&
      narratives[status][intention]['default']
    ) {
      return narratives[status][intention]['default'];
    }

    // Intentar obtener narrativa por estado
    if (narratives[status] && narratives[status]['default']) {
      return narratives[status]['default'];
    }

    // Narrativa por defecto
    return 'Tu contenido est  en proceso de generaci n.   ';
  }

  /**
   * Generate suggestions based on status and intention
   * @param status Current status of the creation
   * @param intention Creation intention
   * @returns Array of suggestions
   */
  private generateSuggestions(status: string, intention: string): string[] {
    const suggestions = {
      completed: {
        generate_video: [
          'Considera agregar subt tulos para mayor alcance',
          'Programa la publicaci n para horarios de mayor engagement',
          'Comparte en m ltiples plataformas para maximizar impacto',
        ],
        generate_image: [
          'Agrega un llamado a la acci n en tu publicaci n',
          'Usa hashtags relevantes para aumentar visibilidad',
          'Considera crear una serie de im genes relacionadas',
        ],
        generate_audio: [
          'Agrega una descripci n atractiva para acompa ar el audio',
          'Comparte en plataformas especializadas en audio',
          'Considera crear una versi n visual del contenido',
        ],
        default: [
          'Revisa la calidad del contenido antes de publicar',
          'Considera programar la publicaci n para mejor engagement',
          'Comparte en m ltiples plataformas',
        ],
      },
      failed: {
        default: [
          'Intenta nuevamente con una configuraci n diferente',
          'Verifica que toda la informaci n requerida est  completa',
          'Contacta a soporte si el problema persiste',
        ],
      },
      published: {
        default: [
          'Monitorea el rendimiento de tu publicaci n',
          'Interact a con los comentarios de tu audiencia',
          'Considera crear contenido relacionado',
        ],
      },
    };

    // Intentar obtener sugerencias espec ficas
    if (suggestions[status] && suggestions[status][intention]) {
      return suggestions[status][intention];
    }

    // Intentar obtener sugerencias por estado
    if (suggestions[status] && suggestions[status]['default']) {
      return suggestions[status]['default'];
    }

    // Sugerencias por defecto
    return ['Contin a interactuando con el sistema para mejores resultados'];
  }
}
