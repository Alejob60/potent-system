import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentVideoScriptor } from '../entities/agent-video-scriptor.entity';
import { CreateAgentVideoScriptorDto } from '../dto/create-agent-video-scriptor.dto';
import { AgentBase, AgentResult } from '../../../common/agents/agent-base';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';

interface ScriptGenerationResult {
  script: string;
  narrative: string;
  suggestions: any;
  visualStyle: any;
  compressedScript: string;
}

@Injectable()
export class AgentVideoScriptorV2Service extends AgentBase {
  constructor(
    @InjectRepository(AgentVideoScriptor)
    private readonly repo: Repository<AgentVideoScriptor>,
    redisService: RedisService,
    stateManager: StateManagementService,
    websocketGateway: WebSocketGatewayService,
  ) {
    super(
      'video-scriptor-v2',
      'Generate emotional video scripts adapted for specific platforms with enhanced capabilities',
      ['script_generation', 'emotional_narrative', 'platform_adaptation', 'visual_suggestions'],
      redisService,
      stateManager,
      websocketGateway,
    );
  }

  /**
   * Execute script generation
   * @param payload Script generation parameters
   * @returns Generated script and related data
   */
  async execute(payload: CreateAgentVideoScriptorDto): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      // Validate input
      if (!(await this.validate(payload))) {
        return this.handleError(
          new Error('Invalid payload'),
          'execute.validate',
        );
      }
      
      // Log activity
      this.logActivity(
        payload.sessionId,
        'Starting script generation',
        payload,
      );
      
      // Notify via WebSocket
      if (this.websocketGateway) {
        this.websocketGateway.broadcastSystemNotification({
          type: 'agent_processing',
          agent: this.config.name,
          sessionId: payload.sessionId,
          message: 'Generating emotional video script',
          timestamp: new Date().toISOString(),
        });
      }
      
      // Generate script
      const result = await this.generateScriptWithNarrative(payload);
      
      // Save to database
      const savedResult = await this.saveToDatabase(payload, result);
      
      // Calculate processing time
      const processingTime = Date.now() - startTime;
      
      // Update metrics
      this.updateMetrics({
        avgResponseTime: processingTime,
      });
      
      // Log completion
      this.logActivity(
        payload.sessionId,
        'Script generation completed',
        { processingTime, format: payload.format, platform: payload.platform },
      );
      
      return this.formatResponse({
        creation: savedResult,
        script: result.script,
        narrative: result.narrative,
        suggestions: result.suggestions,
        visualStyle: result.visualStyle,
        compressedScript: result.compressedScript,
      });
    } catch (error) {
      return this.handleError(error, 'execute');
    }
  }

  /**
   * Validate script generation payload
   * @param payload Payload to validate
   * @returns Boolean indicating if payload is valid
   */
  async validate(payload: CreateAgentVideoScriptorDto): Promise<boolean> {
    if (!payload) return false;
    if (!payload.sessionId) return false;
    if (!payload.emotion) return false;
    if (!payload.platform) return false;
    if (!payload.format) return false;
    if (!payload.product) return false;
    
    const validEmotions = ['excited', 'curious', 'focused'];
    const validPlatforms = ['tiktok', 'instagram', 'youtube', 'shorts', 'reels'];
    const validFormats = ['unboxing', 'reaction', 'tutorial', 'review'];
    
    if (!validEmotions.includes(payload.emotion)) return false;
    if (!validPlatforms.includes(payload.platform)) return false;
    if (!validFormats.includes(payload.format)) return false;
    
    return true;
  }

  /**
   * Generate script with emotional narrative
   * @param dto Script generation parameters
   * @returns Generated script and related data
   */
  private async generateScriptWithNarrative(
    dto: CreateAgentVideoScriptorDto,
  ): Promise<ScriptGenerationResult> {
    // Generate gui n emocional adaptado
    const script = this.generateScript(dto);
    const narrative = this.generateNarrative(dto.emotion, dto.platform);
    const suggestions = this.suggestVisuals(
      dto.platform,
      dto.format,
      dto.emotion,
    );
    const compressedScript = this.compressScript(script, dto.platform);
    const visualStyle = {
      platform: dto.platform,
      format: dto.format,
      emotion: dto.emotion,
      timestamp: new Date().toISOString(),
    };

    return {
      script,
      narrative,
      suggestions,
      visualStyle,
      compressedScript,
    };
  }

  /**
   * Save script to database
   * @param payload Original payload
   * @param result Generation results
   * @returns Saved entity
   */
  private async saveToDatabase(
    payload: CreateAgentVideoScriptorDto,
    result: ScriptGenerationResult,
  ): Promise<AgentVideoScriptor> {
    const entity = this.repo.create({
      ...payload,
      product: JSON.stringify(payload.product),
      script: result.script,
      narrative: result.narrative,
      suggestions: JSON.stringify(result.suggestions),
      visualStyle: JSON.stringify(result.visualStyle),
      compressedScript: result.compressedScript,
      status: 'completed',
    });

    return this.repo.save(entity);
  }

  // Funci n clave: Genera gui n adaptado por emoci n, formato y plataforma
  private generateScript(dto: CreateAgentVideoScriptorDto): string {
    const { emotion, platform, format, product } = dto;

    // Plantillas de guiones seg n plataforma y formato
    const scriptTemplates: Record<
      string,
      Record<string, Record<string, string>>
    > = {
      tiktok: {
        unboxing: {
          excited: ` ${product.name} est  aqu !   

[0:00-0:03]  Hola a todos! Hoy tenemos algo INCRE BLE para mostrarles

[0:03-0:08] Miren este empaque,  es tan bonito que casi no lo quiero abrir!

[0:08-0:15]  Vamos a abrirlo! *sonido de rasgado*  WOW!

[0:15-0:25] Miren estas ${product.features[0]} y ${product.features[1]}...  esto va a cambiar mi vida!

[0:25-0:30]  Listos para probarlo?  D jenme saber en los comentarios!`,
          curious: ` Qu  hay dentro de esta caja misteriosa?   

[0:00-0:03] Hola curiosos, hoy exploramos ${product.name}

[0:03-0:08] El empaque sugiere algo especial...  ser  real?

[0:08-0:15]  Vamos a descubrirlo! *abriendo*

[0:15-0:25] ${product.features[0]}... esto es interesante.  C mo se siente en la mano?

[0:25-0:30]  Qu  opinan?  Vale la pena?`,
          focused: `An lisis detallado de ${product.name}

[0:00-0:03] Hoy revisamos ${product.name} objetivamente

[0:03-0:08] Especificaciones clave: ${product.features.join(', ')}

[0:08-0:15] Evaluando ${product.features[0]}

[0:15-0:25] Probando ${product.features[1]}

[0:25-0:30] Conclusi n: ${product.name} ofrece valor s lido`,
        },
      },
      shorts: {
        reaction: {
          excited: `[0:00-0:02] *reacci n sorprendida*

[0:02-0:05]  No puedo creer lo que veo!

[0:05-0:10] ${product.name} es REALMENTE incre ble

[0:10-0:15] Miren estas ${product.features[0]}

[0:15-0:20]  Han probado esto?  Es revolucionario!

[0:20-0:25] *gestos entusiasmados*

[0:25-0:30]  Suscr banse para m s!`,
          curious: `[0:00-0:02]  Qu  es esto?

[0:02-0:05] Investigando ${product.name}

[0:05-0:10] Interesante concepto de ${product.features[0]}

[0:10-0:15]  C mo funciona?

[0:15-0:20] Miren esto...

[0:20-0:25]  Qu  opinan?

[0:25-0:30]  Merece la pena?`,
          focused: `[0:00-0:03] Evaluaci n objetiva de ${product.name}

[0:03-0:08] An lisis de ${product.features[0]}

[0:08-0:13] Prueba de ${product.features[1]}

[0:13-0:18] Comparativa con competencia

[0:18-0:23] M tricas de rendimiento

[0:23-0:28] Conclusi n t cnica

[0:28-0:30] M s detalles en la descripci n`,
        },
      },
      reels: {
        unboxing: {
          excited: ` UNBOXING ESPECIAL!   

[0:00-0:03]  ${product.name} lleg !

[0:03-0:08]  Est n listos?

[0:08-0:15] *abriendo*  WOW!

[0:15-0:25] ${product.features[0]} es INCRE BLE

[0:25-0:30]  Me lo llevo?`,
          curious: ` Qu  hay aqu ?   

[0:00-0:03] Misterio por resolver

[0:03-0:08] ${product.name}  real o hype?

[0:08-0:15] *explorando*

[0:15-0:25] ${product.features[1]} me sorprende

[0:25-0:30]  Qu  piensan?`,
          focused: `An lisis t cnico ${product.name}

[0:00-0:05] Especificaciones

[0:05-0:10] ${product.features[0]}

[0:10-0:15] Prueba pr ctica

[0:15-0:20] ${product.features[1]}

[0:20-0:25] Resultados

[0:25-0:30] Recomendaci n`,
        },
      },
      youtube: {
        tutorial: {
          excited: ` APRENDE ESTO AHORA!   

[0:00-0:10]  Bienvenidos! Hoy les ense ar  ${product.name} que va a cambiar su vida

[0:10-0:25] Paso 1: Configuraci n inicial - Miren estas ${product.features[0]}

[0:25-0:40] Paso 2: Funciones avanzadas - Esta caracter stica ${product.features[1]} es incre ble

[0:40-0:55] Consejos profesionales - Trucos que nadie te ense a

[0:55-1:10] Ejemplos pr cticos - Veamos c mo se usa en la vida real

[1:10-1:20] Conclusi n -  Listos para dominarlo?`,
          curious: ` C mo funciona ${product.name}?   

[0:00-0:10] Hoy exploramos a fondo ${product.name}

[0:10-0:25]  Qu  hace exactamente? - Vamos paso a paso

[0:25-0:40]  Vale la pena? - An lisis objetivo

[0:40-0:55] Alternativas -  Hay algo mejor?

[0:55-1:10] Mi recomendaci n personal

[1:10-1:20]  Qu  opinan ustedes?`,
          focused: `Tutorial completo de ${product.name}

[0:00-0:10] Introducci n y objetivos

[0:10-0:30] Requisitos y configuraci n

[0:30-0:50] Funciones principales

[0:50-1:10] Casos de uso avanzados

[1:10-1:20] Resumen y recursos`,
        },
      },
    };

    // Seleccionar plantilla seg n par metros
    const platformTemplate =
      scriptTemplates[platform] || scriptTemplates.tiktok;
    const formatTemplate =
      platformTemplate[format] || platformTemplate.unboxing;
    const emotionTemplate = formatTemplate[emotion] || formatTemplate.excited;

    return emotionTemplate;
  }

  // Funci n clave: Sugiere estilo visual, ritmo y efectos
  private suggestVisuals(
    platform: string,
    format: string,
    emotion: string,
  ): any {
    const visualSuggestions = {
      tiktok: {
        unboxing: {
          excited: {
            style: 'vibrant, colorful, energetic',
            pace: 'fast cuts, dynamic transitions',
            effects: 'sparkles, zoom effects, text overlays',
            music: 'upbeat, trending track',
          },
          curious: {
            style: 'mysterious, soft lighting, intrigue',
            pace: 'slow build-up, suspenseful cuts',
            effects: 'blur transitions, question marks, dim lighting',
            music: 'suspenseful, ambient',
          },
          focused: {
            style: 'clean, professional, minimalist',
            pace: 'steady, clear segments',
            effects: 'text highlights, clean transitions',
            music: 'instrumental, calm',
          },
        },
      },
      shorts: {
        reaction: {
          excited: {
            style: 'expressive, exaggerated reactions',
            pace: 'quick reactions, jump cuts',
            effects: 'reaction emojis, speed lines',
            music: 'energetic, punchy',
          },
          curious: {
            style: 'questioning, exploratory',
            pace: 'medium, discovery-focused',
            effects: 'thinking bubbles, magnifying glass',
            music: 'curious, light',
          },
          focused: {
            style: 'analytical, data-driven',
            pace: 'methodical, structured',
            effects: 'charts, text analysis',
            music: 'technical, neutral',
          },
        },
      },
      reels: {
        unboxing: {
          excited: {
            style: 'luxury, premium feel',
            pace: 'smooth, cinematic',
            effects: 'glow effects, slow motion',
            music: 'trending, emotional',
          },
          curious: {
            style: 'mysterious, intriguing',
            pace: 'teasing, suspenseful',
            effects: 'shadow play, reveal effects',
            music: 'mysterious, ambient',
          },
          focused: {
            style: 'clean, informative',
            pace: 'clear, structured',
            effects: 'clean transitions, text info',
            music: 'neutral, informative',
          },
        },
      },
      youtube: {
        tutorial: {
          excited: {
            style: 'engaging, educational',
            pace: 'varied, demonstration-focused',
            effects: 'screen captures, annotations, callouts',
            music: 'upbeat background, fade during speech',
          },
          curious: {
            style: 'exploratory, investigative',
            pace: 'methodical, question-driven',
            effects: 'comparison charts, side-by-side views',
            music: 'light background, fade during speech',
          },
          focused: {
            style: 'professional, instructional',
            pace: 'clear, step-by-step',
            effects: 'text overlays, diagrams, process flows',
            music: 'minimal, fade during speech',
          },
        },
      },
    };

    const platformSuggestion =
      visualSuggestions[platform] || visualSuggestions.tiktok;
    const formatSuggestion =
      platformSuggestion[format] || platformSuggestion.unboxing;
    const emotionSuggestion =
      formatSuggestion[emotion] || formatSuggestion.excited;

    return emotionSuggestion;
  }

  // Funci n clave: Devuelve narrativa emocional para el usuario
  private generateNarrative(emotion: string, platform: string): string {
    const narratives = {
      excited: {
        tiktok:
          ' Estoy tan emocionado de compartir esto con ustedes! Este producto va a revolucionar la forma en que ven el contenido viral.  Prep rense para una experiencia  nica!',
        shorts:
          ' WOW! Esto es exactamente lo que necesit bamos.  El potencial viral aqu  es INCRE BLE! No puedo esperar a que lo vean todos.',
        reels:
          ' Esto es ESPECTACULAR! Definitivamente va a causar sensaci n.  Tengo que mostrarles cada detalle!',
        youtube:
          ' Amigos, esto es un GAME CHANGER! Estoy literalmente temblando de emoci n mientras les muestro esta incre ble herramienta que va a transformar su contenido.',
      },
      curious: {
        tiktok:
          'Honestamente, no s  qu  esperar de esto. Hay tantas posibilidades interesantes aqu .  Qu  creen que va a funcionar mejor?',
        shorts:
          'Esto es fascinante. Hay algo aqu  que realmente capta mi atenci n. Me encantar a explorar m s a fondo con ustedes.',
        reels:
          'Tengo muchas preguntas sobre esto. La curiosidad me est  comiendo vivo.  Est n tan intrigados como yo?',
        youtube:
          'Hoy vamos a explorar juntos un territorio desconocido. No tengo todas las respuestas, pero el viaje de descubrimiento ser  incre ble.  Vienen conmigo?',
      },
      focused: {
        tiktok:
          'Vamos a analizar esto objetivamente. Bas ndonos en datos y m tricas, necesitamos una estrategia clara para maximizar el impacto.',
        shorts:
          'Concentr monos en los hechos. La estrategia de contenido debe basarse en an lisis s lidos y objetivos medibles.',
        reels:
          'Necesitamos una aproximaci n met dica. Cada elemento debe contribuir a nuestros objetivos espec ficos de engagement.',
        youtube:
          'Hoy vamos a desglosar esto cient ficamente. Cada punto est  respaldado por datos y experiencia. Prep rense para una sesi n de aprendizaje intensiva.',
      },
    };

    // Verificar que emotion y platform existan en narratives
    if (narratives[emotion] && narratives[emotion][platform]) {
      return (narratives[emotion][platform] as string | undefined) || '';
    }

    // Valor por defecto
    return narratives['excited']['tiktok'];
  }

  // Funci n clave: Optimiza gui n para duraci n y formato
  private compressScript(script: string, platform: string): string {
    // L gica de compresi n seg n plataforma
    const compressionRules = {
      tiktok: 0.8, // 20% de compresi n
      shorts: 0.7, // 30% de compresi n
      reels: 0.75, // 25% de compresi n
      youtube: 0.9, // 10% de compresi n (m s contenido para videos largos)
    };

    const compressionRatio = compressionRules[platform] || 0.8;

    // Simular compresi n de gui n
    const lines = script.split('\n');
    const compressedLines = lines.slice(
      0,
      Math.floor(lines.length * compressionRatio),
    );

    return compressedLines.join('\n');
  }

  /**
   * Find all script creations
   * @returns Array of script creations
   */
  async findAll(): Promise<AgentVideoScriptor[]> {
    return this.repo.find();
  }

  /**
   * Find one script creation by ID
   * @param id Script creation ID
   * @returns Script creation or null
   */
  async findOne(id: string): Promise<AgentVideoScriptor | null> {
    return this.repo.findOneBy({ id });
  }

  /**
   * Find script creations by session ID
   * @param sessionId Session ID
   * @returns Array of script creations
   */
  async findBySessionId(sessionId: string): Promise<AgentVideoScriptor[]> {
    return this.repo.find({ where: { sessionId } });
  }

  /**
   * Get agent metrics
   * @returns Current metrics
   */
  async getMetrics(): Promise<any> {
    const total = await this.repo.count();
    const completed = await this.repo.count({ where: { status: 'completed' } });
    const failed = await this.repo.count({ where: { status: 'failed' } });

    // Calcular tiempo promedio (simulado)
    const avgTime = 5.2; // segundos

    return {
      totalScripts: total,
      dbSuccessRate: total > 0 ? (completed / total) * 100 : 0,
      dbFailureRate: total > 0 ? (failed / total) * 100 : 0,
      averageGenerationTime: avgTime,
      databaseMetrics: true,
      ...this.metrics,
    };
  }
}