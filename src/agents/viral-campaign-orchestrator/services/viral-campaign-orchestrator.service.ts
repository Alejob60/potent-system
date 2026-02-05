import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ViralCampaign } from '../entities/viral-campaign.entity';
import { ActivateCampaignDto } from '../dto/activate-campaign.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ViralCampaignOrchestratorService {
  private readonly logger = new Logger(ViralCampaignOrchestratorService.name);

  constructor(
    @InjectRepository(ViralCampaign)
    private readonly campaignRepository: Repository<ViralCampaign>,
    private readonly httpService: HttpService,
  ) {}

  async activateCampaign(
    activateCampaignDto: ActivateCampaignDto,
    userId: string,
  ): Promise<any> {
    try {
      // Crear registro de la campa a viral
      const campaign = this.campaignRepository.create({
        campaignType: activateCampaignDto.campaignType,
        sessionId: activateCampaignDto.sessionId,
        userId,
        emotion: activateCampaignDto.emotion,
        platforms: activateCampaignDto.platforms,
        durationDays: activateCampaignDto.durationDays,
        agents: activateCampaignDto.agents,
        schedule: {
          start: new Date(activateCampaignDto.schedule.start),
          end: new Date(activateCampaignDto.schedule.end),
        },
        // Definir etapas Scrum para la campa a
        stages: this.defineScrumStages(),
        currentStage: 1,
        status: 'initiated',
        metadata: activateCampaignDto.metadata || {},
      });

      const savedCampaign = await this.campaignRepository.save(campaign);

      // Iniciar la primera etapa
      await this.executeStage(savedCampaign.id, 1);

      return {
        status: 'campaign_activated',
        campaignId: savedCampaign.id,
        message: 'Viral campaign activated successfully',
        sessionId: activateCampaignDto.sessionId,
      };
    } catch (error) {
      this.logger.error('Failed to activate viral campaign:', error.message);
      throw new Error(`Failed to activate viral campaign: ${error.message}`);
    }
  }

  async executeStage(campaignId: string, stageOrder: number): Promise<void> {
    try {
      // Obtener la campa a
      const campaign = await this.campaignRepository.findOne({
        where: { id: campaignId },
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Verificar que la etapa exista
      const stage = campaign.stages.find((s) => s.order === stageOrder);
      if (!stage) {
        throw new Error(`Stage ${stageOrder} not found`);
      }

      // Actualizar estado seg n el agente
      const stageStatus = this.getStageStatus(stage.agent, 'processing');
      stage.status = stageStatus;
      stage.startedAt = new Date();
      campaign.currentStage = stageOrder;
      campaign.status = stageStatus;

      await this.campaignRepository.save(campaign);

      // Ejecutar la etapa seg n el agente
      let output: any;
      switch (stage.agent) {
        case 'trend-scanner':
          output = await this.executeTrendScannerStage(campaign);
          break;
        case 'scrum-strategy':
          output = await this.executeScrumStrategyStage(campaign);
          break;
        case 'video-scriptor':
          output = await this.executeVideoScriptorStage(campaign);
          break;
        case 'creative-synthesizer':
          output = await this.executeCreativeSynthesizerStage(campaign);
          break;
        case 'content-editor':
          output = await this.executeContentEditorStage(campaign);
          break;
        case 'post-scheduler':
          output = await this.executePostSchedulerStage(campaign);
          break;
        case 'calendar':
          output = await this.executeCalendarStage(campaign);
          break;
        case 'analytics-reporter':
          output = await this.executeAnalyticsReporterStage(campaign);
          break;
        default:
          throw new Error(`Unsupported agent: ${stage.agent}`);
      }

      // Actualizar estado a "completed" con narrativa emocional
      const completedStatus = this.getStageStatus(stage.agent, 'completed');
      stage.status = completedStatus;
      stage.completedAt = new Date();
      stage.output = this.addEmotionalNarrative(
        output,
        campaign.emotion,
        stage.agent,
        'completed',
      );

      // Verificar si hay m s etapas
      const nextStage = campaign.stages.find((s) => s.order === stageOrder + 1);
      if (nextStage) {
        campaign.currentStage = stageOrder + 1;
        campaign.status = this.getCampaignStatusForNextStage(nextStage.agent);
      } else {
        campaign.status = 'completed';
      }

      await this.campaignRepository.save(campaign);

      // Si hay m s etapas, ejecutar la siguiente
      if (nextStage) {
        setTimeout(() => {
          this.executeStage(campaignId, stageOrder + 1);
        }, 1000); // Peque o retraso para evitar sobrecarga
      } else {
        // Campa a completada, notificar al Front Desk
        this.notifyFrontDeskCampaignCompletion(campaign);
      }

      this.logger.log(
        `Stage ${stageOrder} completed successfully for campaign ${campaignId}`,
      );
    } catch (error) {
      // Actualizar estado a "failed"
      const campaign = await this.campaignRepository.findOne({
        where: { id: campaignId },
      });

      if (campaign) {
        const stage = campaign.stages.find((s) => s.order === stageOrder);
        if (stage) {
          stage.status = 'failed';
          stage.completedAt = new Date();
        }
        campaign.status = 'failed';
        await this.campaignRepository.save(campaign);
      }

      this.logger.error(
        `Failed to execute stage ${stageOrder} for campaign ${campaignId}:`,
        error.message,
      );
      throw error;
    }
  }

  async getCampaignStatus(campaignId: string): Promise<any> {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    return {
      campaignId: campaign.id,
      campaignType: campaign.campaignType,
      status: campaign.status,
      currentStage: campaign.currentStage,
      stages: campaign.stages,
      metrics: campaign.metrics,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    };
  }

  async getAllCampaignsBySession(sessionId: string): Promise<ViralCampaign[]> {
    return this.campaignRepository.find({
      where: { sessionId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateCampaignMetrics(campaignId: string, metrics: any): Promise<void> {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId },
    });

    if (campaign) {
      campaign.metrics = { ...campaign.metrics, ...metrics };
      await this.campaignRepository.save(campaign);
    }
  }

  /**
   * Define Scrum stages for the campaign
   * @returns Array of stages
   */
  private defineScrumStages(): any[] {
    // Definir las etapas Scrum seg n el tipo de campa a
    const scrumStages = [
      {
        order: 1,
        name: 'Lluvia de ideas y contexto',
        agent: 'trend-scanner',
        status: 'pending',
      },
      {
        order: 2,
        name: 'Estrategia Scrum',
        agent: 'scrum-strategy',
        status: 'pending',
      },
      {
        order: 3,
        name: 'Generaci n de guiones',
        agent: 'video-scriptor',
        status: 'pending',
      },
      {
        order: 4,
        name: 'Creaci n de contenido',
        agent: 'creative-synthesizer',
        status: 'pending',
      },
      {
        order: 5,
        name: 'Edici n de medios',
        agent: 'content-editor',
        status: 'pending',
      },
      {
        order: 6,
        name: 'Programaci n de publicaciones',
        agent: 'post-scheduler',
        status: 'pending',
      },
      {
        order: 7,
        name: 'Calendario din mico',
        agent: 'calendar',
        status: 'pending',
      },
      {
        order: 8,
        name: 'Monitoreo y an lisis',
        agent: 'analytics-reporter',
        status: 'pending',
      },
    ];

    return scrumStages;
  }

  private async executeTrendScannerStage(
    campaign: ViralCampaign,
  ): Promise<any> {
    try {
      // Llamar al Trend Scanner Agent
      const response = await firstValueFrom(
        this.httpService.post(
          `${process.env.AGENT_TREND_SCANNER_URL || 'http://localhost:3007/api/agents/trend-scanner'}`,
          {
            topic: campaign.campaignType || 'trends', // Usar el tipo de campa a como topic o un valor por defecto
            sessionId: campaign.sessionId,
            platforms: campaign.platforms,
            emotion: campaign.emotion,
          },
        ),
      );

      // Asegurar que la emoci n se propague en la respuesta
      return {
        ...response.data,
        emotion: campaign.emotion,
      };
    } catch (error) {
      this.logger.error(
        'Failed to execute Trend Scanner stage:',
        error.message,
      );
      throw new Error(`Trend Scanner stage failed: ${error.message}`);
    }
  }

  private async executeScrumStrategyStage(
    campaign: ViralCampaign,
  ): Promise<any> {
    try {
      // Llamar al Scrum Strategy Generator (simulado)
      // En una implementaci n real, esto ser a un agente separado
      const strategy = {
        duration: campaign.durationDays,
        sprints: this.generateSprints(campaign.durationDays),
        deliverables: this.generateDeliverables(),
        startDate: campaign.schedule.start,
        endDate: campaign.schedule.end,
      };

      // Simular una operaci n as ncrona
      await Promise.resolve();

      return {
        strategy,
        emotion: campaign.emotion,
      };
    } catch (error) {
      this.logger.error(
        'Failed to execute Scrum Strategy stage:',
        error.message,
      );
      throw new Error(`Scrum Strategy stage failed: ${error.message}`);
    }
  }

  private async executeVideoScriptorStage(
    campaign: ViralCampaign,
  ): Promise<any> {
    try {
      // Llamar al Video Scriptor Agent
      const response = await firstValueFrom(
        this.httpService.post(
          `${process.env.AGENT_VIDEO_SCRIPTOR_URL || 'http://localhost:3007/api/agents/video-scriptor'}`,
          {
            sessionId: campaign.sessionId,
            emotion: campaign.emotion,
            platform: campaign.platforms[0], // Usar la primera plataforma
            format: 'unboxing', // Formato por defecto, se puede hacer configurable
            objective: campaign.campaignType,
            product: campaign.metadata?.product || {
              name: 'Producto Viral',
              features: [
                'caracter stica 1',
                'caracter stica 2',
                'caracter stica 3',
              ],
            },
          },
        ),
      );

      // Asegurar que la emoci n se propague en la respuesta
      return {
        ...response.data,
        emotion: campaign.emotion,
      };
    } catch (error) {
      this.logger.error(
        'Failed to execute Video Scriptor stage:',
        error.message,
      );
      throw new Error(`Video Scriptor stage failed: ${error.message}`);
    }
  }

  private async executeCreativeSynthesizerStage(
    campaign: ViralCampaign,
  ): Promise<any> {
    try {
      // Llamar al Creative Synthesizer Agent
      const response = await firstValueFrom(
        this.httpService.post(
          `${process.env.BACKEND_URL || 'http://localhost:3007'}/api/agents/creative-synthesizer`,
          {
            sessionId: campaign.sessionId,
            userId: campaign.userId,
            intention: 'generate_video', // Por defecto, se puede hacer configurable
            emotion: campaign.emotion,
            entities: {
              script: campaign.stages.find((s) => s.agent === 'video-scriptor')
                ?.output?.script,
              style: campaign.platforms[0], // Usar la primera plataforma como estilo
              duration: 30, // Duraci n por defecto, se puede hacer configurable
            },
            integrationId: campaign.platforms[0], // Usar la primera plataforma para integraci n
            integrationStatus: 'active',
          },
        ),
      );

      // Asegurar que la emoci n se propague en la respuesta
      return {
        ...response.data,
        emotion: campaign.emotion,
      };
    } catch (error) {
      this.logger.error(
        'Failed to execute Creative Synthesizer stage:',
        error.message,
      );
      throw new Error(`Creative Synthesizer stage failed: ${error.message}`);
    }
  }

  private async executeContentEditorStage(
    campaign: ViralCampaign,
  ): Promise<any> {
    try {
      // Llamar al Content Editor Agent (simulado)
      // En una implementaci n real, esto ser a un agente separado
      const creativeOutput = campaign.stages.find(
        (s) => s.agent === 'creative-synthesizer',
      )?.output;

      const editedContent = {
        assets: this.editAssetsForPlatforms(
          creativeOutput?.assets || [],
          campaign.platforms,
        ),
        optimizedFor: campaign.platforms,
        editingNotes:
          'Contenido editado para cumplir con los requisitos de cada plataforma',
        emotion: campaign.emotion,
      };

      // Simular una operaci n as ncrona
      await Promise.resolve();

      return editedContent;
    } catch (error) {
      this.logger.error(
        'Failed to execute Content Editor stage:',
        error.message,
      );
      throw new Error(`Content Editor stage failed: ${error.message}`);
    }
  }

  private async executePostSchedulerStage(
    campaign: ViralCampaign,
  ): Promise<any> {
    try {
      // Obtener el contenido del editor de contenido
      const contentEditorOutput = campaign.stages.find(
        (s) => s.agent === 'content-editor',
      )?.output;

      // Preparar los datos para cada plataforma
      const scheduledPosts: any[] = [];

      for (const platform of campaign.platforms) {
        // Llamar al Post Scheduler Agent para cada plataforma
        const response = await firstValueFrom(
          this.httpService.post(
            `${process.env.AGENT_POST_SCHEDULER_URL || 'http://localhost:3007/api/agents/post-scheduler'}`,
            {
              sessionId: campaign.sessionId,
              platform: platform,
              content:
                contentEditorOutput?.narrative ||
                `Publicaci n programada para campa a ${campaign.campaignType}`,
              scheduledTime: campaign.schedule.start.toISOString(),
            },
          ),
        );

        scheduledPosts.push(response.data);
      }

      // Asegurar que la emoci n se propague en la respuesta
      return {
        scheduledPosts,
        emotion: campaign.emotion,
      };
    } catch (error) {
      this.logger.error(
        'Failed to execute Post Scheduler stage:',
        error.message,
      );
      throw new Error(`Post Scheduler stage failed: ${error.message}`);
    }
  }

  private async executeCalendarStage(campaign: ViralCampaign): Promise<any> {
    try {
      // Llamar al Calendar Agent (simulado)
      // En una implementaci n real, esto ser a un agente separado
      const schedulerOutput = campaign.stages.find(
        (s) => s.agent === 'post-scheduler',
      )?.output;

      const calendar = {
        scheduledPosts: schedulerOutput?.scheduledPosts || [],
        calendarView: this.generateCalendarView(
          schedulerOutput?.scheduledPosts || [],
        ),
        reminders: this.generateReminders(
          schedulerOutput?.scheduledPosts || [],
        ),
        emotion: campaign.emotion,
      };

      // Simular una operaci n as ncrona
      await Promise.resolve();

      return calendar;
    } catch (error) {
      this.logger.error('Failed to execute Calendar stage:', error.message);
      throw new Error(`Calendar stage failed: ${error.message}`);
    }
  }

  private async executeAnalyticsReporterStage(
    campaign: ViralCampaign,
  ): Promise<any> {
    try {
      // Llamar al Analytics Reporter Agent
      const response = await firstValueFrom(
        this.httpService.post(
          `${process.env.AGENT_ANALYTICS_REPORTER_URL || 'http://localhost:3007/api/agents/analytics-reporter'}`,
          {
            sessionId: campaign.sessionId,
            platforms: campaign.platforms,
            contentId: campaign.stages.find(
              (s) => s.agent === 'creative-synthesizer',
            )?.output?.creationId,
            period: {
              start: campaign.schedule.start,
              end: campaign.schedule.end,
            },
          },
        ),
      );

      // Asegurar que la emoci n se propague en la respuesta
      return {
        ...response.data,
        emotion: campaign.emotion,
      };
    } catch (error) {
      this.logger.error(
        'Failed to execute Analytics Reporter stage:',
        error.message,
      );
      throw new Error(`Analytics Reporter stage failed: ${error.message}`);
    }
  }

  /**
   * Get stage status based on agent and processing state
   * @param agent Agent name
   * @param state Processing state
   * @returns Stage status
   */
  private getStageStatus(agent: string, state: string): string {
    const statusMap = {
      'trend-scanner': {
        processing: 'scanning',
        completed: 'scanned',
        failed: 'scan_failed',
      },
      'scrum-strategy': {
        processing: 'strategizing',
        completed: 'strategized',
        failed: 'strategy_failed',
      },
      'video-scriptor': {
        processing: 'scripting',
        completed: 'scripted',
        failed: 'script_failed',
      },
      'creative-synthesizer': {
        processing: 'creating',
        completed: 'created',
        failed: 'creation_failed',
      },
      'content-editor': {
        processing: 'editing',
        completed: 'edited',
        failed: 'edit_failed',
      },
      'post-scheduler': {
        processing: 'scheduling',
        completed: 'scheduled',
        failed: 'schedule_failed',
      },
      calendar: {
        processing: 'scheduling',
        completed: 'scheduled',
        failed: 'schedule_failed',
      },
      'analytics-reporter': {
        processing: 'analyzing',
        completed: 'analyzed',
        failed: 'analysis_failed',
      },
    };

    return statusMap[agent]?.[state] || state;
  }

  /**
   * Get campaign status for next stage
   * @param agent Next stage agent
   * @returns Campaign status
   */
  private getCampaignStatusForNextStage(agent: string): string {
    const statusMap = {
      'trend-scanner': 'scanning',
      'scrum-strategy': 'strategizing',
      'video-scriptor': 'scripting',
      'creative-synthesizer': 'creating',
      'content-editor': 'editing',
      'post-scheduler': 'scheduling',
      calendar: 'scheduling',
      'analytics-reporter': 'analyzing',
    };

    return statusMap[agent] || 'processing';
  }

  /**
   * Add emotional narrative to output
   * @param output Original output
   * @param emotion Detected emotion
   * @param agent Agent name
   * @param status Stage status
   * @returns Output with emotional narrative
   */
  private addEmotionalNarrative(
    output: any,
    emotion: string,
    agent: string,
    status: string,
  ): any {
    // Si el output ya tiene narrativa emocional, retornarlo tal cual
    if (output && output.narrative) {
      return output;
    }

    // Generar narrativa emocional seg n el agente y estado
    const narratives = {
      'trend-scanner': {
        completed: {
          excited:
            ' Hemos identificado las tendencias m s virales para tu campa a!   ',
          curious:
            'An lisis de tendencias completado, listo para inspirar tu contenido.',
          focused: 'Tendencias relevantes identificadas con precisi n.',
          default: 'An lisis de tendencias completado exitosamente.',
        },
      },
      'scrum-strategy': {
        completed: {
          excited: ' Estrategia Scrum definida para m ximo impacto viral!   ',
          curious:
            'Plan de acci n Scrum creado con etapas claras y entregables.',
          focused: 'Estrategia estructurada con sprints y objetivos definidos.',
          default: 'Estrategia Scrum generada exitosamente.',
        },
      },
      'video-scriptor': {
        completed: {
          excited: ' Tu gui n est  listo para cautivar audiencias!   ',
          curious: 'Gui n creado con historias que conectan emocionalmente.',
          focused: 'Narrativa estructurada con impacto garantizado.',
          default: 'Gui n generado exitosamente.',
        },
      },
      'creative-synthesizer': {
        completed: {
          excited: ' Tu contenido est  listo para viralizarse!   ',
          curious: 'Contenido multimedia creado con estilo  nico.',
          focused: 'Asset generado con precisi n art stica.',
          default: 'Contenido generado exitosamente.',
        },
      },
      'content-editor': {
        completed: {
          excited:
            ' Tus assets est n perfectamente optimizados para cada plataforma!   ',
          curious: 'Edici n completada con ajustes espec ficos por red social.',
          focused:
            'Assets editados seg n requisitos t cnicos de cada plataforma.',
          default: 'Edici n de contenido completada exitosamente.',
        },
      },
      'post-scheduler': {
        completed: {
          excited:
            ' Tu calendario de publicaci n est  optimizado para m ximo impacto!   ',
          curious: 'Calendario creado para maximizar alcance y engagement.',
          focused: 'Programaci n estrat gica establecida.',
          default: 'Calendario de publicaci n generado exitosamente.',
        },
      },
      calendar: {
        completed: {
          excited: ' Tu calendario din mico est  listo para acci n!    ',
          curious:
            'Calendario interactivo creado con recordatorios y seguimiento.',
          focused:
            'Calendario estructurado con fechas y eventos claramente definidos.',
          default: 'Calendario din mico generado exitosamente.',
        },
      },
      'analytics-reporter': {
        completed: {
          excited: ' Tus m tricas muestran un rendimiento excepcional!   ',
          curious: 'An lisis completo con insights valiosos para optimizaci n.',
          focused: 'M tricas precisas para toma de decisiones informada.',
          default: 'Reporte anal tico generado exitosamente.',
        },
      },
    };

    // Obtener narrativa espec fica
    let narrative = '';
    if (
      narratives[agent] &&
      narratives[agent][status] &&
      narratives[agent][status][emotion]
    ) {
      narrative = narratives[agent][status][emotion];
    } else if (
      narratives[agent] &&
      narratives[agent][status] &&
      narratives[agent][status]['default']
    ) {
      narrative = narratives[agent][status]['default'];
    } else {
      narrative = 'Etapa completada exitosamente.';
    }

    // Generar sugerencias contextuales
    const suggestions = this.generateContextualSuggestions(agent, status);

    return {
      ...output,
      narrative,
      suggestions,
      // Asegurar que todas las URLs incluyan SAS
      ...(output?.assetUrl
        ? { assetUrl: this.generateSasUrl(output.assetUrl) }
        : {}),
    };
  }

  /**
   * Generate contextual suggestions
   * @param agent Agent name
   * @param status Stage status
   * @returns Array of suggestions
   */
  private generateContextualSuggestions(
    agent: string,
    status: string,
  ): string[] {
    const suggestions = {
      'trend-scanner': {
        completed: [
          'Revisa las tendencias identificadas para ajustar tu mensaje',
          'Considera combinar varias tendencias para mayor impacto',
          'Analiza el timing  ptimo para cada plataforma',
        ],
      },
      'scrum-strategy': {
        completed: [
          'Revisa los sprints definidos y ajusta seg n tu disponibilidad',
          'Considera asignar recursos espec ficos a cada etapa',
          'Prepara entregables intermedios para medir progreso',
        ],
      },
      'video-scriptor': {
        completed: [
          'Refina el gui n con base en tu audiencia objetivo',
          'Considera variaciones para diferentes plataformas',
          'Agrega llamados a la acci n espec ficos',
        ],
      },
      'creative-synthesizer': {
        completed: [
          'Revisa la calidad del contenido generado',
          'Considera crear variaciones para A/B testing',
          'Programa la publicaci n para horarios de mayor engagement',
        ],
      },
      'content-editor': {
        completed: [
          'Verifica que todos los assets cumplan con los requisitos de cada plataforma',
          'Considera crear versiones alternativas para testing',
          'Revisa la optimizaci n de tags y descripciones',
        ],
      },
      'post-scheduler': {
        completed: [
          'Verifica que todas las publicaciones est n correctamente programadas',
          'Prepara respuestas para comentarios esperados',
          'Considera ajustes seg n el performance inicial',
        ],
      },
      calendar: {
        completed: [
          'Revisa el calendario para asegurar cobertura en todos los d as clave',
          'Configura recordatorios para fechas importantes',
          'Prepara contenido de respaldo por si se requiere reprogramaci n',
        ],
      },
      'analytics-reporter': {
        completed: [
          'Analiza las m tricas para identificar oportunidades',
          'Compara el performance entre diferentes plataformas',
          'Usa los insights para optimizar futuras campa as',
        ],
      },
    };

    return (
      suggestions[agent]?.[status] || [
        'Contin a con la siguiente etapa del proceso',
      ]
    );
  }

  /**
   * Generate SAS URL for asset access
   * @param url Original asset URL
   * @returns URL with SAS token
   */
  private generateSasUrl(url: string): string {
    // En un entorno real, aqu  se generar a un token SAS real
    // Por ahora, simulamos la adici n de un par metro de SAS
    if (!url) return url;

    const sasToken = `sv=2020-08-04&ss=b&srt=sco&sp=rwdlacx&se=2025-12-31T23:59:59Z&st=2025-01-01T00:00:00Z&spr=https&sig=SIMULATED_SAS_SIGNATURE`;
    return url.includes('?') ? `${url}&${sasToken}` : `${url}?${sasToken}`;
  }

  /**
   * Generate sprints for Scrum strategy
   * @param durationDays Campaign duration in days
   * @returns Array of sprints
   */
  private generateSprints(durationDays: number): any[] {
    const sprints: any[] = [];
    const sprintDuration = Math.ceil(durationDays / 4); // Dividir en 4 sprints aproximadamente

    for (let i = 1; i <= 4; i++) {
      sprints.push({
        sprintNumber: i,
        duration: sprintDuration,
        goals: [`Objetivo del sprint ${i}`],
        deliverables: [`Entregable del sprint ${i}`],
      });
    }

    return sprints;
  }

  /**
   * Generate deliverables for Scrum strategy
   * @returns Array of deliverables
   */
  private generateDeliverables(): string[] {
    return [
      'An lisis de tendencias',
      'Estrategia Scrum',
      'Guiones virales',
      'Contenido multimedia',
      'Assets editados',
      'Calendario de publicaci n',
      'Reporte anal tico',
    ];
  }

  /**
   * Edit assets for specific platforms
   * @param assets Original assets
   * @param platforms Target platforms
   * @returns Edited assets
   */
  private editAssetsForPlatforms(assets: any[], platforms: string[]): any[] {
    return platforms.map((platform) => {
      const requirements = this.getPlatformRequirements(platform);
      return {
        platform,
        requirements,
        editedAssets: assets.map((asset) => ({
          ...asset,
          editedFor: platform,
          dimensions: requirements.dimensions,
          duration: requirements.duration,
          format: requirements.format,
        })),
      };
    });
  }

  /**
   * Get platform requirements for content editing
   * @param platform Target platform
   * @returns Platform requirements
   */
  private getPlatformRequirements(platform: string): any {
    const requirements = {
      tiktok: {
        dimensions: '9:16',
        duration: ' 60s',
        format: 'vertical',
        tags: 'hashtags virales',
      },
      instagram: {
        dimensions: '1:1 or 9:16',
        duration: ' 90s',
        format: 'square or vertical',
        tags: 'subt tulos y hashtags',
      },
      youtube: {
        dimensions: '9:16',
        duration: ' 60s',
        format: 'vertical',
        tags: 't tulo optimizado',
      },
    };

    return requirements[platform] || requirements.tiktok;
  }

  /**
   * Generate calendar view
   * @param scheduledPosts Scheduled posts
   * @returns Calendar view
   */
  private generateCalendarView(scheduledPosts: any[]): any {
    // Simular una vista de calendario
    return {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      events: scheduledPosts.map((post, index) => ({
        id: `event_${index}`,
        title: post.title || `Publicaci n ${index + 1}`,
        date: post.scheduledTime,
        platform: post.platform,
        type: 'publication',
      })),
    };
  }

  /**
   * Generate reminders
   * @param scheduledPosts Scheduled posts
   * @returns Array of reminders
   */
  private generateReminders(scheduledPosts: any[]): any[] {
    return scheduledPosts.map((post, index) => ({
      id: `reminder_${index}`,
      eventId: `event_${index}`,
      time: new Date(new Date(post.scheduledTime).getTime() - 30 * 60000), // 30 minutos antes
      message: `Preparar publicaci n para ${post.platform}: ${post.title || `Publicaci n ${index + 1}`}`,
    }));
  }

  /**
   * Notify Front Desk about campaign completion
   * @param campaign Completed campaign
   */
  private async notifyFrontDeskCampaignCompletion(
    campaign: ViralCampaign,
  ): Promise<void> {
    try {
      // En un entorno real, esto enviar a una notificaci n al Front Desk
      // a trav s de WebSockets o una cola de mensajes
      this.logger.log(
        `Campaign ${campaign.id} completed. Notifying Front Desk.`,
      );

      // Aqu  se podr a implementar la notificaci n real
      // Por ahora, solo registramos el evento
      await Promise.resolve();
    } catch (error) {
      this.logger.error(
        'Failed to notify Front Desk of campaign completion:',
        error.message,
      );
    }
  }
}
