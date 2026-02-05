import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ViralizationRoute } from '../entities/viralization-route.entity';
import { ActivateRouteDto } from '../dto/activate-route.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ViralizationRouteEngineService {
  private readonly logger = new Logger(ViralizationRouteEngineService.name);

  constructor(
    @InjectRepository(ViralizationRoute)
    private readonly routeRepository: Repository<ViralizationRoute>,
    private readonly httpService: HttpService,
  ) {}

  async activateRoute(
    activateRouteDto: ActivateRouteDto,
    userId: string,
  ): Promise<any> {
    try {
      // Crear registro de la ruta de viralizaci n
      const route = this.routeRepository.create({
        routeType: activateRouteDto.routeType,
        sessionId: activateRouteDto.sessionId,
        userId,
        emotion: activateRouteDto.emotion,
        platforms: activateRouteDto.platforms,
        agents: activateRouteDto.agents,
        schedule: {
          start: new Date(activateRouteDto.schedule.start),
          end: new Date(activateRouteDto.schedule.end),
        },
        stages: activateRouteDto.agents.map((agent, index) => ({
          order: index + 1,
          agent,
          status: 'pending',
        })),
        currentStage: 1,
        status: 'initiated',
        metadata: activateRouteDto.metadata || {},
      });

      const savedRoute = await this.routeRepository.save(route);

      // Iniciar la primera etapa
      await this.executeStage(savedRoute.id, 1);

      return {
        status: 'route_activated',
        routeId: savedRoute.id,
        message: 'Viralization route activated successfully',
        sessionId: activateRouteDto.sessionId,
      };
    } catch (error) {
      this.logger.error(
        'Failed to activate viralization route:',
        error.message,
      );
      throw new Error(
        `Failed to activate viralization route: ${error.message}`,
      );
    }
  }

  async executeStage(routeId: string, stageOrder: number): Promise<void> {
    try {
      // Obtener la ruta
      const route = await this.routeRepository.findOne({
        where: { id: routeId },
      });

      if (!route) {
        throw new Error('Route not found');
      }

      // Verificar que la etapa exista
      const stage = route.stages.find((s) => s.order === stageOrder);
      if (!stage) {
        throw new Error(`Stage ${stageOrder} not found`);
      }

      // Actualizar estado seg n el agente
      const stageStatus = this.getStageStatus(stage.agent, 'processing');
      stage.status = stageStatus;
      stage.startedAt = new Date();
      route.currentStage = stageOrder;
      route.status = stageStatus;

      await this.routeRepository.save(route);

      // Ejecutar la etapa seg n el agente
      let output: any;
      switch (stage.agent) {
        case 'trend-scanner':
          output = await this.executeTrendScannerStage(route);
          break;
        case 'video-scriptor':
          output = await this.executeVideoScriptorStage(route);
          break;
        case 'creative-synthesizer':
          output = await this.executeCreativeSynthesizerStage(route);
          break;
        case 'post-scheduler':
          output = await this.executePostSchedulerStage(route);
          break;
        case 'analytics-reporter':
          output = await this.executeAnalyticsReporterStage(route);
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
        route.emotion,
        stage.agent,
        'completed',
      );

      // Verificar si hay m s etapas
      const nextStage = route.stages.find((s) => s.order === stageOrder + 1);
      if (nextStage) {
        route.currentStage = stageOrder + 1;
        route.status = this.getRouteStatusForNextStage(nextStage.agent);
      } else {
        route.status = 'completed';
      }

      await this.routeRepository.save(route);

      // Si hay m s etapas, ejecutar la siguiente
      if (nextStage) {
        setTimeout(() => {
          this.executeStage(routeId, stageOrder + 1);
        }, 1000); // Peque o retraso para evitar sobrecarga
      } else {
        // Ruta completada, notificar al Front Desk
        this.notifyFrontDeskRouteCompletion(route);
      }

      this.logger.log(
        `Stage ${stageOrder} completed successfully for route ${routeId}`,
      );
    } catch (error) {
      // Actualizar estado a "failed"
      const route = await this.routeRepository.findOne({
        where: { id: routeId },
      });

      if (route) {
        const stage = route.stages.find((s) => s.order === stageOrder);
        if (stage) {
          stage.status = 'failed';
          stage.completedAt = new Date();
        }
        route.status = 'failed';
        await this.routeRepository.save(route);
      }

      this.logger.error(
        `Failed to execute stage ${stageOrder} for route ${routeId}:`,
        error.message,
      );
      throw error;
    }
  }

  async getRouteStatus(routeId: string): Promise<any> {
    const route = await this.routeRepository.findOne({
      where: { id: routeId },
    });

    if (!route) {
      throw new Error('Route not found');
    }

    return {
      routeId: route.id,
      routeType: route.routeType,
      status: route.status,
      currentStage: route.currentStage,
      stages: route.stages,
      metrics: route.metrics,
      createdAt: route.createdAt,
      updatedAt: route.updatedAt,
    };
  }

  async getAllRoutesBySession(sessionId: string): Promise<ViralizationRoute[]> {
    return this.routeRepository.find({
      where: { sessionId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateRouteMetrics(routeId: string, metrics: any): Promise<void> {
    const route = await this.routeRepository.findOne({
      where: { id: routeId },
    });

    if (route) {
      route.metrics = { ...route.metrics, ...metrics };
      await this.routeRepository.save(route);
    }
  }

  private async executeTrendScannerStage(
    route: ViralizationRoute,
  ): Promise<any> {
    try {
      // Llamar al Trend Scanner Agent
      const response = await firstValueFrom(
        this.httpService.post(
          `${process.env.AGENT_TREND_SCANNER_URL || 'http://localhost:3007/api/agents/trend-scanner'}/scan`,
          {
            sessionId: route.sessionId,
            platforms: route.platforms,
            emotion: route.emotion,
          },
        ),
      );

      // Asegurar que la emoci n se propague en la respuesta
      return {
        ...response.data,
        emotion: route.emotion,
      };
    } catch (error) {
      this.logger.error(
        'Failed to execute Trend Scanner stage:',
        error.message,
      );
      throw new Error(`Trend Scanner stage failed: ${error.message}`);
    }
  }

  private async executeVideoScriptorStage(
    route: ViralizationRoute,
  ): Promise<any> {
    try {
      // Llamar al Video Scriptor Agent
      const response = await firstValueFrom(
        this.httpService.post(
          `${process.env.AGENT_VIDEO_SCRIPTOR_URL || 'http://localhost:3007/api/agents/video-scriptor'}/generate-script`,
          {
            sessionId: route.sessionId,
            emotion: route.emotion,
            platforms: route.platforms,
            // Usar la salida de la etapa anterior si est  disponible
            trendData: route.stages.find((s) => s.agent === 'trend-scanner')
              ?.output,
          },
        ),
      );

      // Asegurar que la emoci n se propague en la respuesta
      return {
        ...response.data,
        emotion: route.emotion,
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
    route: ViralizationRoute,
  ): Promise<any> {
    try {
      // Llamar al Creative Synthesizer Agent
      const response = await firstValueFrom(
        this.httpService.post(
          `${process.env.BACKEND_URL || 'http://localhost:3007'}/api/agents/creative-synthesizer`,
          {
            sessionId: route.sessionId,
            userId: route.userId,
            intention: 'generate_video', // Por defecto, se puede hacer configurable
            emotion: route.emotion,
            entities: {
              script: route.stages.find((s) => s.agent === 'video-scriptor')
                ?.output?.script,
              style: route.platforms[0], // Usar la primera plataforma como estilo
              duration: 30, // Duraci n por defecto, se puede hacer configurable
            },
            integrationId: route.platforms[0], // Usar la primera plataforma para integraci n
            integrationStatus: 'active',
          },
        ),
      );

      // Asegurar que la emoci n se propague en la respuesta
      return {
        ...response.data,
        emotion: route.emotion,
      };
    } catch (error) {
      this.logger.error(
        'Failed to execute Creative Synthesizer stage:',
        error.message,
      );
      throw new Error(`Creative Synthesizer stage failed: ${error.message}`);
    }
  }

  private async executePostSchedulerStage(
    route: ViralizationRoute,
  ): Promise<any> {
    try {
      // Llamar al Post Scheduler Agent
      const response = await firstValueFrom(
        this.httpService.post(
          `${process.env.AGENT_POST_SCHEDULER_URL || 'http://localhost:3007/api/agents/post-scheduler'}/schedule`,
          {
            sessionId: route.sessionId,
            platforms: route.platforms,
            content: route.stages.find(
              (s) => s.agent === 'creative-synthesizer',
            )?.output,
            schedule: route.schedule,
          },
        ),
      );

      // Asegurar que la emoci n se propague en la respuesta
      return {
        ...response.data,
        emotion: route.emotion,
      };
    } catch (error) {
      this.logger.error(
        'Failed to execute Post Scheduler stage:',
        error.message,
      );
      throw new Error(`Post Scheduler stage failed: ${error.message}`);
    }
  }

  private async executeAnalyticsReporterStage(
    route: ViralizationRoute,
  ): Promise<any> {
    try {
      // Llamar al Analytics Reporter Agent
      const response = await firstValueFrom(
        this.httpService.post(
          `${process.env.AGENT_ANALYTICS_REPORTER_URL || 'http://localhost:3007/api/agents/analytics-reporter'}/generate-report`,
          {
            sessionId: route.sessionId,
            platforms: route.platforms,
            contentId: route.stages.find(
              (s) => s.agent === 'creative-synthesizer',
            )?.output?.creationId,
            period: {
              start: route.schedule.start,
              end: route.schedule.end,
            },
          },
        ),
      );

      // Asegurar que la emoci n se propague en la respuesta
      return {
        ...response.data,
        emotion: route.emotion,
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
      'video-scriptor': {
        processing: 'scripting',
        completed: 'scripted',
        failed: 'script_failed',
      },
      'creative-synthesizer': {
        processing: 'generating',
        completed: 'generated',
        failed: 'generation_failed',
        publishing: 'publishing',
        published: 'published',
      },
      'post-scheduler': {
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
   * Get route status for next stage
   * @param agent Next stage agent
   * @returns Route status
   */
  private getRouteStatusForNextStage(agent: string): string {
    const statusMap = {
      'trend-scanner': 'scanning',
      'video-scriptor': 'scripting',
      'creative-synthesizer': 'generating',
      'post-scheduler': 'scheduling',
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
        published: {
          excited:
            ' Tu contenido ha sido publicado y est  generando engagement!   ',
          curious: 'Publicaci n completada, listo para monitorear resultados.',
          focused: 'Contenido publicado seg n estrategia definida.',
          default: 'Contenido publicado exitosamente.',
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
        published: [
          'Monitorea el rendimiento de tu publicaci n',
          'Interact a con los comentarios de tu audiencia',
          'Comparte en otros canales para maximizar alcance',
        ],
      },
      'post-scheduler': {
        completed: [
          'Verifica que todas las publicaciones est n correctamente programadas',
          'Prepara respuestas para comentarios esperados',
          'Considera ajustes seg n el performance inicial',
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
   * Notify Front Desk about route completion
   * @param route Completed route
   */
  private async notifyFrontDeskRouteCompletion(
    route: ViralizationRoute,
  ): Promise<void> {
    try {
      // En un entorno real, esto enviar a una notificaci n al Front Desk
      // a trav s de WebSockets o una cola de mensajes
      this.logger.log(`Route ${route.id} completed. Notifying Front Desk.`);

      // Aqu  se podr a implementar la notificaci n real
      // Por ahora, solo registramos el evento
    } catch (error) {
      this.logger.error(
        'Failed to notify Front Desk of route completion:',
        error.message,
      );
    }
  }
}
