import { Injectable, Logger } from '@nestjs/common';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
import { DailyCoordinatorService } from '../../daily-coordinator/services/daily-coordinator.service';
import { AgentPostSchedulerService } from '../../agent-post-scheduler/services/agent-post-scheduler.service';
import { MetaMetricsService } from '../../meta-metrics/services/meta-metrics.service';

@Injectable()
export class TrendAttackCoordinatorService {
  private readonly logger = new Logger(TrendAttackCoordinatorService.name);

  constructor(
    private readonly stateManager: StateManagementService,
    private readonly websocketGateway: WebSocketGatewayService,
    private readonly dailyCoordinator: DailyCoordinatorService,
    private readonly postScheduler: AgentPostSchedulerService,
    private readonly metaMetrics: MetaMetricsService,
  ) {}

  async convocarCampanaViral(campaignData: any) {
    this.logger.log('Convocando campaa viral');

    const { trend, context } = campaignData;

    // Validar datos de la campaa
    if (!trend || !context) {
      throw new Error('Datos de campaa invlidos');
    }

    // Notificar inicio de campaa
    this.websocketGateway.broadcastSystemNotification({
      type: 'trend_attack_started',
      trend,
      context,
      timestamp: new Date().toISOString(),
    });

    // Convocar reunin con el Daily Coordinator y obtener estado de agentes
    const agentStatus = await this.dailyCoordinator.consultarEstadoAgentes();

    // Verificar si hay agentes bloqueados
    const blockedAgents = agentStatus['estados'].filter(
      (estado: any) => estado.estado === 'bloqueado',
    );

    if (blockedAgents.length > 0) {
      this.logger.warn(
        `Agentes bloqueados detectados: ${blockedAgents.length}. Activando soporte.`,
      );
      await this.dailyCoordinator.activarSoporte(blockedAgents);
    }

    // Asignar tareas a los agentes
    const taskAssignments = await this.asignarTareas(trend, context);

    // Sincronizar horarios de publicacin con el Scheduler
    const schedulingResult = await this.sincronizarHorarios(trend, context);

    // Actualizar estado
    this.stateManager.addTask(context.sessionId, {
      type: 'trend_attack',
      status: 'in_progress',
      data: {
        trend,
        taskAssignments,
        agentStatus,
        schedulingResult,
      },
    });

    return {
      status: 'success',
      message: 'Campaa viral convocada exitosamente',
      trend,
      taskAssignments,
      agentStatus,
      schedulingResult,
      timestamp: new Date().toISOString(),
    };
  }

  async activarPorTrendScanner(trendData: any, context: any) {
    this.logger.log(
      'Activando campaa viral por deteccin automtica de Trend Scanner',
    );

    // Preparar datos de campaa
    const campaignData = {
      trend: trendData,
      context,
    };

    // Convocar campaa viral
    return await this.convocarCampanaViral(campaignData);
  }

  async escalarCampana(campaignId: string, sessionId: string) {
    this.logger.log(`Escalando campaa ${campaignId} segn resonancia`);

    try {
      // Obtener mtricas actuales
      const metrics = await this.metaMetrics.getAggregateMetrics();

      // Calcular nivel de resonancia
      const resonanceLevel = this.calcularNivelResonancia(metrics);

      // Determinar escalamiento basado en resonancia
      let escalationAction: string | null = null;
      if (resonanceLevel > 0.8) {
        escalationAction = 'high_engagement_scaling';
      } else if (resonanceLevel > 0.6) {
        escalationAction = 'medium_engagement_scaling';
      } else if (resonanceLevel < 0.3) {
        escalationAction = 'low_engagement_reduction';
      }

      // Si se requiere escalamiento, ejecutar acciones
      if (escalationAction) {
        await this.ejecutarEscalamiento(
          escalationAction,
          campaignId,
          sessionId,
        );
      }

      // Actualizar estado
      this.stateManager.addConversationEntry(sessionId, {
        type: 'system_event',
        content: `Campaa escalada con accin: ${escalationAction || 'no_action'}`,
        metadata: {
          campaignId,
          resonanceLevel,
          escalationAction,
        },
      });

      return {
        success: true,
        campaignId,
        resonanceLevel,
        escalationAction,
      };
    } catch (error) {
      this.logger.error(`Error escalando campaa: ${error.message}`);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  private calcularNivelResonancia(metrics: any): number {
    // Calcular nivel de resonancia basado en mtricas
    // Esta es una implementacin simplificada
    const viralResonance = metrics.compositeMetrics?.viralResonanceIndex || 0;
    const emotionalActivation =
      metrics.compositeMetrics?.emotionalActivationRate || 0;

    // Promedio ponderado
    return viralResonance * 0.6 + emotionalActivation * 0.4;
  }

  private async ejecutarEscalamiento(
    action: string,
    campaignId: string,
    sessionId: string,
  ) {
    this.logger.log(
      `Ejecutando escalamiento: ${action} para campaa ${campaignId}`,
    );

    switch (action) {
      case 'high_engagement_scaling':
        // Aumentar frecuencia de publicaciones
        // Asignar ms recursos a agentes
        // Extender campaa
        this.websocketGateway.broadcastSystemNotification({
          type: 'campaign_scaling',
          action: 'high_engagement_scaling',
          campaignId,
          message: 'Aumentando recursos para campaa de alta resonancia',
        });
        break;

      case 'medium_engagement_scaling':
        // Ajustar horarios de publicacin
        // Optimizar contenido
        this.websocketGateway.broadcastSystemNotification({
          type: 'campaign_scaling',
          action: 'medium_engagement_scaling',
          campaignId,
          message: 'Optimizando campaa para mejor resonancia',
        });
        break;

      case 'low_engagement_reduction':
        // Reducir frecuencia
        // Reasignar recursos
        this.websocketGateway.broadcastSystemNotification({
          type: 'campaign_scaling',
          action: 'low_engagement_reduction',
          campaignId,
          message: 'Reduciendo recursos para campaa de baja resonancia',
        });
        break;

      default:
        this.logger.warn(`Accin de escalamiento desconocida: ${action}`);
    }

    // Registrar escalamiento en el estado
    this.stateManager.addTask(sessionId, {
      type: 'campaign_scaling',
      status: 'completed',
      data: {
        campaignId,
        action,
        timestamp: new Date().toISOString(),
      },
    });
  }

  private async asignarTareas(trend: any, context: any) {
    this.logger.log('Asignando tareas a agentes');

    // Asignar tareas especficas a cada agente segn la tendencia
    const assignments: any = {
      'video-scriptor': {
        task: 'create_content',
        details: `Crear contenido viral sobre ${trend.name}`,
        deadline: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas
      },
      'faq-responder': {
        task: 'prepare_responses',
        details: `Preparar respuestas sobre ${trend.name}`,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      },
      'post-scheduler': {
        task: 'schedule_posts',
        details: `Programar publicaciones sobre ${trend.name}`,
        deadline: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 horas
      },
      'analytics-reporter': {
        task: 'monitor_metrics',
        details: `Monitorear mtricas de ${trend.name}`,
        deadline: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 horas
      },
    };

    // Registrar tareas en el estado
    for (const [agent, taskData] of Object.entries(assignments)) {
      const task = taskData as { task: string; details: string; deadline: Date };
      this.stateManager.addTask(context.sessionId, {
        type: 'agent_assignment',
        status: 'pending',
        data: {
          agent,
          task: task.task,
          details: task.details,
          deadline: task.deadline
        },
      });
    }

    // Notificar asignaciones mediante WebSocket
    this.websocketGateway.broadcastSystemNotification({
      type: 'task_assignments',
      assignments,
      trend,
      timestamp: new Date().toISOString(),
    });

    return assignments;
  }

  private async sincronizarHorarios(trend: any, context: any) {
    this.logger.log('Sincronizando horarios de publicacin con el Scheduler');

    try {
      // Crear plan de publicacin
      const publicationPlan = {
        campaignId: `campaign-${Date.now()}`,
        contentTheme: trend.name,
        targetPlatforms: trend.platform ? [trend.platform] : ['tiktok', 'instagram'],
        scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // En 2 horas
        metadata: {
          trendId: trend.id,
          context,
        },
      };

      // Programar publicacin (comentado para evitar efectos reales)
      // const scheduledPost = await this.postScheduler.create(publicationPlan);

      // Simular resultado de programacin
      const result = {
        id: `post-${Date.now()}`,
        status: 'scheduled',
        plan: publicationPlan,
      };

      // Registrar en el estado de conversacin
      this.stateManager.addConversationEntry(context.sessionId, {
        type: 'system_event',
        content: 'Horarios de publicacin sincronizados',
        metadata: {
          schedulingResult: result,
          synchronizationTime: new Date().toISOString(),
        },
      });

      return result;
    } catch (error) {
      this.logger.error(
        'Error sincronizando horarios de publicacin:',
        error,
      );
      throw error;
    }
  }
}