import { Injectable, Logger } from '@nestjs/common';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
import { AgentVideoScriptorService } from '../../agent-video-scriptor/services/agent-video-scriptor.service';
import { AgentPostSchedulerService } from '../../agent-post-scheduler/services/agent-post-scheduler.service';
import { CreateAgentPostSchedulerDto } from '../../agent-post-scheduler/dto/create-agent-post-scheduler.dto';

interface GeneratedContent {
  id: string;
  [key: string]: any;
}

@Injectable()
export class ViralContentGeneratorService {
  private readonly logger = new Logger(ViralContentGeneratorService.name);

  constructor(
    private readonly stateManager: StateManagementService,
    private readonly websocketGateway: WebSocketGatewayService,
    private readonly videoScriptor: AgentVideoScriptorService,
    private readonly postScheduler: AgentPostSchedulerService,
  ) {}

  async generateViralContent(contentData: any) {
    this.logger.log('Generando contenido viral multiformato');

    const { context } = contentData;

    // Validar datos
    if (!context) {
      throw new Error('Datos de contenido inv lidos');
    }

    // Notificar inicio de generaci n
    this.websocketGateway.broadcastSystemNotification({
      type: 'content_generation_started',
      context,
      timestamp: new Date().toISOString(),
    });

    // Generar contenido seg n el objetivo
    let generatedContent: GeneratedContent | null = null;
    switch (context.objective) {
      case 'create_viral_video':
        generatedContent = await this.generateVideoContent(context);
        break;
      case 'create_viral_image':
        generatedContent = await this.generateImageContent(context);
        break;
      case 'create_viral_meme':
        generatedContent = await this.generateMemeContent(context);
        break;
      case 'create_viral_post':
        generatedContent = await this.generatePostContent(context);
        break;
      case 'generate_tags':
        generatedContent = await this.generateTagsContent(context);
        break;
      default:
        throw new Error(
          `Objetivo de contenido no soportado: ${context.objective}`,
        );
    }

    // Coordinar con Scriptor y Scheduler seg n el tipo de contenido
    await this.coordinarConAgentes(generatedContent, context);

    // Guardar en repositorio versionado
    const asset = await this.saveToRepository(generatedContent, context);

    // Actualizar estado
    this.stateManager.addTask(context.sessionId, {
      type: 'content_generation',
      status: 'completed',
      data: {
        content: generatedContent,
        asset,
      },
    });

    return {
      status: 'success',
      message: 'Contenido viral generado exitosamente',
      content: generatedContent,
      asset,
      timestamp: new Date().toISOString(),
    };
  }

  private async coordinarConAgentes(content: GeneratedContent, context: any) {
    this.logger.log('Coordinando con agentes Scriptor y Scheduler');

    try {
      // Coordinar con el Video Scriptor para contenido de video
      if (context.objective === 'create_viral_video') {
        this.websocketGateway.broadcastSystemNotification({
          type: 'agent_coordination',
          agents: ['video-scriptor'],
          contentId: content.id,
          message: 'Iniciando coordinaci n con Video Scriptor',
        });
      }

      // Coordinar con el Post Scheduler para programar publicaci n
      if (
        [
          'create_viral_post',
          'create_viral_image',
          'create_viral_meme',
        ].includes(context.objective)
      ) {
        // Crear entrada en el Post Scheduler
        const schedulerDto: CreateAgentPostSchedulerDto = {
          content: content.copy || content.text,
          scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Programar en 1 hora
        };

        const scheduledPost = await this.postScheduler.create(schedulerDto);

        this.websocketGateway.broadcastSystemNotification({
          type: 'agent_coordination',
          agents: ['post-scheduler'],
          contentId: content.id,
          scheduledPostId: scheduledPost.id,
          message: 'Contenido programado con Post Scheduler',
        });

        // Actualizar estado con informaci n de programaci n
        this.stateManager.addConversationEntry(context.sessionId, {
          type: 'system_event',
          content: 'Contenido programado para publicaci n',
          metadata: {
            contentId: content.id,
            scheduledPostId: scheduledPost.id,
            scheduledAt: scheduledPost.scheduledAt,
          },
        });
      }
    } catch (error) {
      this.logger.error(`Error en coordinaci n con agentes: ${error.message}`);
      // No lanzamos el error para no interrumpir el flujo principal
    }
  }

  private async generateVideoContent(context: any) {
    this.logger.log('Generando contenido de video viral');

    try {
      // Coordinar con el Video Scriptor para crear guion
      const script = await this.videoScriptor.create({
        sessionId: `session-${Date.now()}`,
        emotion: context.emotionalGoal,
        platform: context.trend.platform,
        format: 'unboxing',
        objective: 'viral_content',
        product: {
          name: context.trend.name,
          features: [
            'caracter stica viral 1',
            'caracter stica viral 2',
            'caracter stica viral 3',
          ],
        },
      });

      // En una implementaci n real, esto integrar a con un servicio de generaci n de video
      // con voz clonada y narrativa emocional

      // Por ahora, simulamos el resultado con m s detalle
      const videoContent: GeneratedContent = {
        id: `video-${Date.now()}`,
        title: `Video viral sobre ${context.trend.name}`,
        script: script.script,
        platform: context.trend.platform,
        emotionalNarrative: context.emotionalGoal,
        voiceClone: this.generateVoiceClone(context),
        duration: this.calculateOptimalDuration(context),
        format: 'mp4',
        resolution: '1080p',
        aspectRatio: this.calculateAspectRatio(context.trend.platform),
        subtitles: true,
        music: true,
        effects: this.generateEffects(context.emotionalGoal),
      };

      return videoContent;
    } catch (error) {
      this.logger.error(`Error generando video: ${error.message}`);
      throw error;
    }
  }

  private generateVoiceClone(context: any) {
    // Generar voz clonada basada en el objetivo emocional
    const voiceProfiles = {
      humor: 'energetic_male',
      education: 'calm_female',
      controversy: 'dramatic_male',
      emotion: 'warm_female',
    };

    return voiceProfiles[context.emotionalGoal] || 'default_voice';
  }

  private calculateOptimalDuration(context: any) {
    // Calcular duraci n  ptima basada en la plataforma
    const durationMap = {
      tiktok: '15s-30s',
      instagram: '30s-60s',
      youtube: '60s-120s',
    };

    return durationMap[context.trend.platform] || '30s-60s';
  }

  private calculateAspectRatio(platform: string) {
    // Calcular relaci n de aspecto  ptima por plataforma
    const aspectRatios = {
      tiktok: '9:16',
      instagram: '4:5',
      youtube: '16:9',
    };

    return aspectRatios[platform] || '9:16';
  }

  private generateEffects(emotionalGoal: string) {
    // Generar efectos basados en el objetivo emocional
    const effectPresets = {
      humor: ['quick_cuts', 'text_overlays', 'sound_effects'],
      education: ['smooth_transitions', 'info_graphics', 'calm_colors'],
      controversy: ['dramatic_lighting', 'intense_music', 'bold_text'],
      emotion: ['soft_lighting', 'emotional_music', 'close_ups'],
    };

    return effectPresets[emotionalGoal] || ['basic_effects'];
  }

  private async generateImageContent(context: any) {
    this.logger.log('Generando contenido de imagen viral');

    // En una implementaci n real, esto integrar a con un servicio de generaci n de im genes
    // con texto viral y estilo de tendencia

    // Por ahora, simulamos el resultado
    const imageContent: GeneratedContent = {
      id: `image-${Date.now()}`,
      title: `Imagen viral sobre ${context.trend.name}`,
      text: ` No te pierdas la  ltima tendencia en ${context.trend.name}!`,
      style: context.trend.platform,
      emotionalTone: context.emotionalGoal,
      format: 'png',
      size: '1080x1080',
      filters: this.generateImageFilters(context.emotionalGoal),
      textPosition: 'center',
      font: this.selectOptimalFont(context.emotionalGoal),
    };

    return imageContent;
  }

  private generateImageFilters(emotionalGoal: string) {
    const filterPresets = {
      humor: ['bright', 'saturated', 'comic_style'],
      education: ['clean', 'professional', 'minimal'],
      controversy: ['high_contrast', 'dramatic', 'bold'],
      emotion: ['warm', 'soft', 'pastel'],
    };

    return filterPresets[emotionalGoal] || ['standard'];
  }

  private selectOptimalFont(emotionalGoal: string) {
    const fontPresets = {
      humor: 'Comic Sans MS',
      education: 'Arial',
      controversy: 'Impact',
      emotion: 'Georgia',
    };

    return fontPresets[emotionalGoal] || 'Arial';
  }

  private async generateMemeContent(context: any) {
    this.logger.log('Generando contenido de meme viral');

    // En una implementaci n real, esto integrar a con un servicio de generaci n de memes
    // con timing cultural

    // Por ahora, simulamos el resultado
    const memeContent: GeneratedContent = {
      id: `meme-${Date.now()}`,
      title: `Meme viral sobre ${context.trend.name}`,
      text: `Cuando ves la tendencia de ${context.trend.name}`,
      culturalReference: context.trend.name,
      emotionalTone: context.emotionalGoal,
      format: 'jpg',
      template: this.selectMemeTemplate(context.emotionalGoal),
      overlayText: true,
      watermark: false,
    };

    return memeContent;
  }

  private selectMemeTemplate(emotionalGoal: string) {
    const templatePresets = {
      humor: 'drake_pointing',
      education: 'confused_math',
      controversy: 'mocking_spongebob',
      emotion: 'distracted_boyfriend',
    };

    return templatePresets[emotionalGoal] || 'standard_meme';
  }

  private async generatePostContent(context: any) {
    this.logger.log('Generando contenido de post viral');

    // En una implementaci n real, esto integrar a con un servicio de copywriting emocional

    // Por ahora, simulamos el resultado
    const postContent: GeneratedContent = {
      id: `post-${Date.now()}`,
      title: `Post viral sobre ${context.trend.name}`,
      copy: ` Incre ble tendencia en ${context.trend.name}!   

 Ya la conoces?  Es viral!   

#${context.trend.name.replace(/\s+/g, '')} #TendenciaViral`,
      platform: context.trend.platform,
      emotionalTone: context.emotionalGoal,
      callToAction: 'Ver m s',
      emojis: this.generateEmojis(context.emotionalGoal),
      mentions: [],
    };

    return postContent;
  }

  private generateEmojis(emotionalGoal: string) {
    const emojiPresets = {
      humor: ['  ', '  ', '  ', '  '],
      education: ['  ', '  ', '  ', '  '],
      controversy: ['  ', '  ', ' ', '  '],
      emotion: ['  ', '  ', '  ', '  '],
    };

    return emojiPresets[emotionalGoal] || [' ', '  ', '  '];
  }

  private async generateTagsContent(context: any) {
    this.logger.log('Generando tags y hashtags optimizados');

    // En una implementaci n real, esto integrar a con un servicio de optimizaci n de tags

    // Por ahora, simulamos el resultado
    const tagsContent: GeneratedContent = {
      id: `tags-${Date.now()}`,
      hashtags: [
        `#${context.trend.name.replace(/\s+/g, '')}`,
        '#TendenciaViral',
        '#ContenidoViral',
        `#${context.trend.platform}`,
        '#MisyBot',
      ],
      tags: [
        context.trend.name,
        'viral',
        context.trend.platform,
        context.emotionalGoal,
      ],
      optimizedFor: context.trend.platform,
      trendingTags: this.generateTrendingTags(context.trend),
    };

    return tagsContent;
  }

  private generateTrendingTags(trend: any) {
    // Generar tags de tendencia basados en la tendencia detectada
    return [
      `#${trend.name.replace(/\s+/g, '')}Challenge`,
      `#${trend.name.replace(/\s+/g, '')}Viral`,
      `#${trend.platform}${trend.name.replace(/\s+/g, '')}`,
    ];
  }

  private async saveToRepository(content: GeneratedContent, context: any) {
    this.logger.log('Guardando contenido en repositorio versionado');

    // En una implementaci n real, esto guardar a el contenido en un sistema de archivos
    // o base de datos versionada

    // Por ahora, simulamos un sistema de guardado m s completo
    const asset = {
      id: `asset-${Date.now()}`,
      contentId: content.id,
      type: context.objective,
      createdAt: new Date().toISOString(),
      version: '1.0.0',
      metadata: {
        trend: context.trend,
        emotionalGoal: context.emotionalGoal,
        platform: context.trend.platform,
      },
      content: content,
      repositoryPath: `/assets/${context.trend.platform}/${context.objective}/${content.id}`,
      tags: [
        context.trend.name,
        context.trend.platform,
        context.emotionalGoal,
        context.objective,
      ],
    };

    // Registrar en el estado con m s detalle
    this.stateManager.addConversationEntry(context.sessionId, {
      type: 'system_event',
      content: 'Contenido guardado en repositorio versionado',
      metadata: {
        asset,
        saveTime: new Date().toISOString(),
        repositoryPath: asset.repositoryPath,
      },
    });

    // Notificar guardado mediante WebSocket
    this.websocketGateway.broadcastSystemNotification({
      type: 'content_saved',
      assetId: asset.id,
      contentId: content.id,
      repositoryPath: asset.repositoryPath,
      message: 'Contenido guardado exitosamente en repositorio versionado',
    });

    return asset;
  }
}
