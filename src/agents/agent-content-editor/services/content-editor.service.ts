import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentEditTask, ContentEditStatus } from '../entities/content-edit-task.entity';
import { EditContentDto } from '../dto/edit-content.dto';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ContentEditorService {
  private readonly logger = new Logger(ContentEditorService.name);

  constructor(
    @InjectRepository(ContentEditTask)
    private readonly contentEditTaskRepository: Repository<ContentEditTask>,
    private readonly httpService: HttpService,
  ) {}

  async editContent(editContentDto: EditContentDto): Promise<ContentEditTask> {
    try {
      // Crear registro de tarea de edici n
      const task = this.contentEditTaskRepository.create({
        assetId: editContentDto.assetId,
        platform: editContentDto.platform,
        emotion: editContentDto.emotion,
        campaignId: editContentDto.campaignId,
        editingProfile: editContentDto.editingProfile,
        status: ContentEditStatus.RECEIVED,
        sasUrl: '', // Se generar  despu s de la edici n
      });

      const savedTask = await this.contentEditTaskRepository.save(task);

      // Actualizar estado a editing
      savedTask.status = ContentEditStatus.EDITING;
      await this.contentEditTaskRepository.save(savedTask);

      // Validar el asset antes de editar
      const isValid = await this.validateAsset(editContentDto);
      if (!isValid) {
        savedTask.status = ContentEditStatus.FAILED;
        savedTask.sasUrl = '';
        await this.contentEditTaskRepository.save(savedTask);
        throw new Error('Asset validation failed');
      }

      savedTask.status = ContentEditStatus.VALIDATED;
      await this.contentEditTaskRepository.save(savedTask);

      // Llamar al servicio de MoviePy para editar el contenido
      const editedAssetUrl = await this.callMoviePyService(editContentDto);
      
      // Generar SAS URL para el asset editado
      const sasUrl = this.generateSasUrl(editedAssetUrl);
      
      // Actualizar tarea con la URL del asset editado
      savedTask.status = ContentEditStatus.EDITED;
      savedTask.sasUrl = sasUrl;
      await this.contentEditTaskRepository.save(savedTask);

      return savedTask;
    } catch (error) {
      this.logger.error('Failed to edit content:', error.message);
      
      // Actualizar estado a failed
      const task = await this.contentEditTaskRepository.findOne({
        where: { assetId: editContentDto.assetId }
      });
      
      if (task) {
        task.status = ContentEditStatus.FAILED;
        await this.contentEditTaskRepository.save(task);
      }
      
      throw new Error(`Content editing failed: ${error.message}`);
    }
  }

  async validateAsset(editContentDto: EditContentDto): Promise<boolean> {
    try {
      // Verificar requisitos t cnicos por plataforma
      const platformRequirements = this.getPlatformRequirements(editContentDto.platform);
      
      // Validar resoluci n
      if (editContentDto.editingProfile.resolution !== platformRequirements.resolution) {
        this.logger.warn(`Resolution mismatch for ${editContentDto.platform}`);
        return false;
      }
      
      // Validar relaci n de aspecto
      if (editContentDto.editingProfile.aspectRatio !== platformRequirements.aspectRatio) {
        this.logger.warn(`Aspect ratio mismatch for ${editContentDto.platform}`);
        return false;
      }
      
      // Validar duraci n
      const durationLimit = parseInt(editContentDto.editingProfile.durationLimit);
      const platformDurationLimit = parseInt(platformRequirements.durationLimit);
      if (durationLimit > platformDurationLimit) {
        this.logger.warn(`Duration exceeds limit for ${editContentDto.platform}`);
        return false;
      }
      
      return true;
    } catch (error) {
      this.logger.error('Asset validation failed:', error.message);
      return false;
    }
  }

  async getContentEditTask(assetId: string): Promise<ContentEditTask | null> {
    return this.contentEditTaskRepository.findOne({ where: { assetId } });
  }

  async getContentEditTasksBySession(sessionId: string): Promise<ContentEditTask[]> {
    // En una implementaci n real, se relacionar a con una sesi n
    // Por ahora, simulamos esta funcionalidad
    return this.contentEditTaskRepository.find();
  }

  async updateTaskStatus(assetId: string, status: ContentEditStatus): Promise<ContentEditTask | null> {
    const task = await this.contentEditTaskRepository.findOne({ where: { assetId } });
    if (task) {
      task.status = status;
      return this.contentEditTaskRepository.save(task);
    }
    return null;
  }

  generateSasUrl(url: string): string {
    // En un entorno real, aqu  se generar a un token SAS real
    // Por ahora, simulamos la adici n de un par metro de SAS
    if (!url) return url;
    
    const sasToken = `sv=2020-08-04&ss=b&srt=sco&sp=rwdlacx&se=2025-12-31T23:59:59Z&st=2025-01-01T00:00:00Z&spr=https&sig=SIMULATED_SAS_SIGNATURE`;
    return url.includes('?') ? `${url}&${sasToken}` : `${url}?${sasToken}`;
  }

  generateNarrative(emotion: string, platform: string, status: ContentEditStatus): string {
    const narratives = {
      received: {
        excited: ' Hemos recibido tu asset! Prepar ndonos para darle un toque m gico que lo haga brillar en ' + platform,
        curious: 'Asset recibido. Explorando posibilidades creativas para ' + platform,
        focused: 'Asset en proceso. Aplicando t cnicas profesionales de edici n para ' + platform,
        default: 'Asset recibido y listo para edici n en ' + platform,
      },
      editing: {
        excited: ' Editando con pasi n! Cada corte est  dise ado para maximizar el impacto en ' + platform,
        curious: 'En proceso de edici n. Experimentando con efectos que cautivar n a tu audiencia en ' + platform,
        focused: 'Edici n t cnica en curso. Optimizando cada frame para resultados profesionales en ' + platform,
        default: 'Edici n en progreso para ' + platform,
      },
      validated: {
        excited: ' Perfecto! Tu asset cumple con todos los requisitos de ' + platform + '.  A darle vida!',
        curious: 'Validaci n completada. El asset cumple con los est ndares de ' + platform,
        focused: 'Requisitos t cnicos verificados. Listo para edici n avanzada en ' + platform,
        default: 'Asset validado para ' + platform,
      },
      edited: {
        excited: ' Tu contenido est  listo para volverse viral en ' + platform + '!   ',
        curious: 'Edici n completada. El asset est  optimizado para ' + platform,
        focused: 'Edici n finalizada. Contenido listo para publicaci n en ' + platform,
        default: 'Asset editado y preparado para ' + platform,
      },
      failed: {
        excited: ' Ups! Encontramos un peque o obst culo en la edici n. Nuestro equipo lo est  revisando para que pronto brille en ' + platform,
        curious: 'La edici n encontr  algunos desaf os. Estamos investigando soluciones para ' + platform,
        focused: 'Error en edici n. Revisando requisitos t cnicos para ' + platform,
        default: 'Edici n fallida para ' + platform + '. Reintentando...',
      },
    };

    const statusNarratives = narratives[status] || narratives.received;
    return statusNarratives[emotion] || statusNarratives.default;
  }

  generateSuggestions(platform: string, emotion: string): string[] {
    const suggestions = {
      tiktok: {
        excited: [
          'Considera a adir efectos de transici n din micos',
          'Agrega texto grande y llamativo en los primeros 3 segundos',
          'Usa m sica trending para maximizar el engagement',
          'Incluye un CTA claro al final del video'
        ],
        curious: [
          'Prueba con efectos de revelaci n para mantener la intriga',
          'Usa preguntas visuales para involucrar a la audiencia',
          'A ade subt tulos para mejorar la accesibilidad',
          'Considera crear una serie de contenido relacionado'
        ],
        focused: [
          'Mant n una estructura clara con introducci n, desarrollo y cierre',
          'Usa gr ficos limpios y profesionales',
          'Incluye datos o estad sticas relevantes',
          'Optimiza el video para sonido apagado con elementos visuales claros'
        ]
      },
      instagram: {
        excited: [
          'A ade stickers interactivos para aumentar el engagement',
          'Usa una combinaci n de fotos y videos en el carrusel',
          'Incluye una descripci n atractiva con hashtags relevantes',
          'Considera usar Reels para contenido m s din mico'
        ],
        curious: [
          'Crea historias con encuestas o preguntas para involucrar',
          'Usa filtros sutiles que complementen tu contenido',
          'A ade elementos interactivos en las historias',
          'Considera las tendencias de Instagram para tu nicho'
        ],
        focused: [
          'Mant n una est tica coherente en tu feed',
          'Usa una paleta de colores consistente',
          'Incluye informaci n valiosa en las descripciones',
          'Optimiza los primeros segundos para captar atenci n'
        ]
      },
      youtube: {
        excited: [
          'Crea una miniatura atractiva que invite a hacer clic',
          'Usa palabras clave relevantes en el t tulo y descripci n',
          'Incluye llamados a la acci n durante el video',
          'Considera crear una serie para fidelizar suscriptores'
        ],
        curious: [
          'Desarrolla una narrativa que invite a explorar m s',
          'Incluye enlaces relevantes en la descripci n',
          'Usa tarjetas y pantallas finales para guiar a los espectadores',
          'Crea contenido que invite a comentarios y discusi n'
        ],
        focused: [
          'Estructura el contenido con secciones claras',
          'Usa gr ficos y presentaciones profesionales',
          'Incluye referencias y fuentes confiables',
          'Optimiza la duraci n seg n el tema y audiencia objetivo'
        ]
      }
    };

    return suggestions[platform]?.[emotion] || [
      'Revisa las mejores pr cticas para ' + platform,
      'Considera el timing  ptimo para publicar en ' + platform,
      'Aseg rate de que el contenido se adapte al estilo de ' + platform,
      'Prueba diferentes enfoques para ver qu  resuena mejor'
    ];
  }

  private getPlatformRequirements(platform: string): any {
    const requirements = {
      tiktok: {
        resolution: '1080x1920',
        durationLimit: '60',
        aspectRatio: '9:16',
        format: 'mp4'
      },
      instagram: {
        resolution: '1080x1080',
        durationLimit: '60',
        aspectRatio: '1:1',
        format: 'mp4'
      },
      youtube: {
        resolution: '1920x1080',
        durationLimit: '600',
        aspectRatio: '16:9',
        format: 'mp4'
      }
    };

    return requirements[platform] || requirements.tiktok;
  }

  private async callMoviePyService(editContentDto: EditContentDto): Promise<string> {
    try {
      // En una implementaci n real, esto llamar a al servicio de MoviePy
      // Por ahora, simulamos la llamada y devolvemos una URL simulada
      
      // Simular URL del asset editado
      return `https://storage.azure.com/assets/${editContentDto.assetId}_edited.mp4`;
    } catch (error) {
      this.logger.error('MoviePy service call failed:', error.message);
      throw new Error(`MoviePy service error: ${error.message}`);
    }
  }
}