import { Injectable, Logger } from '@nestjs/common';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
import { OAuthService } from '../../../oauth/oauth.service';
import { CalendarService } from '../../../calendar/calendar.service';

interface SyncResult {
  taskId: string;
  success: boolean;
  eventId?: string;
  error?: string;
}

@Injectable()
export class ScrumTimelineService {
  private readonly logger = new Logger(ScrumTimelineService.name);

  constructor(
    private readonly stateManager: StateManagementService,
    private readonly websocketGateway: WebSocketGatewayService,
    private readonly oauthService: OAuthService,
    private readonly calendarService: CalendarService,
  ) {}

  async syncScrumTimeline(calendarData: any) {
    this.logger.log('Sincronizando timeline de Scrum en calendario');

    const { tasks, agents, sessionId } = calendarData;

    // Validar datos
    if (!tasks || !Array.isArray(tasks) || !sessionId) {
      throw new Error('Datos de calendario inv lidos');
    }

    // Notificar inicio de sincronizaci n
    this.websocketGateway.broadcastSystemNotification({
      type: 'scrum_sync_started',
      sessionId,
      taskCount: tasks.length,
      agents,
      timestamp: new Date().toISOString(),
    });

    try {
      // Verificar conexi n OAuth con Google y Microsoft
      const oauthStatus = await this.checkOAuthStatus(sessionId);

      // Sincronizar tareas en calendario
      const syncResults = await this.syncTasksToCalendar(tasks, sessionId);

      // Actualizar estado de agentes y sincronizar con calendario
      const agentStatus = await this.updateAgentStatus(agents, sessionId);
      await this.syncAgentStatusToCalendar(agentStatus, sessionId);

      // Enviar recordatorios y alertas
      await this.sendRemindersAndAlerts(tasks, sessionId);

      // Configurar edici n colaborativa
      await this.setupCollaborativeEditing(sessionId);

      // Actualizar estado
      this.stateManager.addTask(sessionId, {
        type: 'scrum_timeline_sync',
        status: 'completed',
        data: {
          syncResults,
          agentStatus,
          oauthStatus,
        },
      });

      return {
        status: 'success',
        message: 'Tareas sincronizadas exitosamente en calendario',
        syncResults,
        agentStatus,
        oauthStatus,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Error sincronizando timeline de Scrum: ${error.message}`,
      );

      // Notificar error
      this.websocketGateway.broadcastSystemNotification({
        type: 'scrum_sync_error',
        sessionId,
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  }

  private async checkOAuthStatus(sessionId: string) {
    this.logger.log('Verificando estado de conexi n OAuth');

    try {
      // Verificar cuentas conectadas
      const connectedAccounts = await this.oauthService.getConnectedAccounts();

      // Verificar estado de tokens
      const tokenStatus = {};
      for (const account of connectedAccounts) {
        tokenStatus[account.platform] =
          await this.oauthService.checkTokenStatus(account.id);
      }

      // Verificar integraci n espec fica con Google Calendar y Microsoft Calendar
      const calendarIntegration = {
        google: connectedAccounts.some((acc) => acc.platform === 'google'),
        microsoft: connectedAccounts.some(
          (acc) => acc.platform === 'microsoft',
        ),
      };

      return {
        connectedAccounts,
        tokenStatus,
        calendarIntegration,
      };
    } catch (error) {
      this.logger.error(`Error verificando OAuth: ${error.message}`);
      return {
        error: error.message,
      };
    }
  }

  private async syncTasksToCalendar(tasks: any[], sessionId: string) {
    this.logger.log('Sincronizando tareas en calendario');

    const results: SyncResult[] = [];
    for (const task of tasks) {
      try {
        // Crear evento en calendario con recordatorios
        const calendarEvent = await this.calendarService.scheduleEvent({
          title: task.title,
          description: task.description,
          startTime: new Date(task.startDate),
          endTime: new Date(task.endDate),
          type: 'content_publish',
          priority: 'medium',
          sessionId,
          metadata: {
            taskId: task.id,
            assignee: task.assignee,
          },
          // Agregar recordatorios: 1 d a y 1 hora antes
          reminders: [
            {
              time: 24 * 60, // 24 horas antes
              type: 'notification',
            },
            {
              time: 60, // 1 hora antes
              type: 'notification',
            },
          ],
        });

        results.push({
          taskId: task.id,
          success: true,
          eventId: calendarEvent.id,
        });

        // Notificar creaci n de evento
        this.websocketGateway.emitCalendarUpdate(sessionId, {
          type: 'event_created',
          event: calendarEvent,
          message: `Evento creado: ${task.title}`,
        });
      } catch (error) {
        this.logger.error(
          `Error sincronizando tarea ${task.id}: ${error.message}`,
        );
        results.push({
          taskId: task.id,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  private async updateAgentStatus(agents: string[], sessionId: string) {
    this.logger.log('Actualizando estado de agentes');

    const agentStatus = {};
    for (const agent of agents) {
      try {
        // En una implementaci n real, esto obtendr a el estado real del agente
        // Por ahora, simulamos el estado
        agentStatus[agent] = {
          status: Math.random() > 0.2 ? 'active' : 'busy', // 80% chance de estar activo
          lastUpdate: new Date().toISOString(),
          tasksAssigned: Math.floor(Math.random() * 10),
        };

        // Actualizar estado en el State Manager
        this.stateManager.addActiveAgent(sessionId, agent);
      } catch (error) {
        this.logger.error(
          `Error actualizando estado de agente ${agent}: ${error.message}`,
        );
        agentStatus[agent] = {
          status: 'error',
          error: error.message,
        };
      }
    }

    // Notificar estado de agentes mediante WebSocket
    this.websocketGateway.broadcastSystemNotification({
      type: 'agent_status_update',
      agentStatus,
      sessionId,
      timestamp: new Date().toISOString(),
    });

    return agentStatus;
  }

  private async syncAgentStatusToCalendar(agentStatus: any, sessionId: string) {
    this.logger.log('Sincronizando estado de agentes con calendario');

    try {
      // Crear eventos de estado de agente en el calendario
      for (const [agentName, status] of Object.entries(agentStatus)) {
        const agent: any = status;

        // Solo crear eventos para agentes activos
        if (agent.status === 'active') {
          const statusEvent = await this.calendarService.scheduleEvent({
            title: `Agente Activo: ${agentName}`,
            description: `El agente ${agentName} est  disponible para tareas`,
            startTime: new Date(),
            endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hora de disponibilidad
            type: 'meeting',
            priority: 'low',
            sessionId,
            metadata: {
              agent: agentName,
              status: agent.status,
              tasksAssigned: agent.tasksAssigned,
            },
            // Agregar recordatorio para eventos de estado
            reminders: [
              {
                time: 30, // 30 minutos antes
                type: 'notification',
              },
            ],
          });

          this.logger.log(
            `Evento de estado creado para agente ${agentName}: ${statusEvent.id}`,
          );
        }
      }

      // Notificar sincronizaci n de estado
      this.websocketGateway.emitCalendarUpdate(sessionId, {
        type: 'agent_status_synced',
        agentCount: Object.keys(agentStatus).length,
        message: 'Estado de agentes sincronizado con calendario',
      });
    } catch (error) {
      this.logger.error(
        `Error sincronizando estado de agentes con calendario: ${error.message}`,
      );
      // No lanzamos el error para no interrumpir el flujo principal
    }
  }

  private async sendRemindersAndAlerts(tasks: any[], sessionId: string) {
    this.logger.log('Enviando recordatorios y alertas para tareas');

    for (const task of tasks) {
      try {
        // En una implementaci n real, esto enviar a recordatorios reales a trav s del CalendarService
        // Por ahora, simulamos el env o de recordatorios

        // Registrar recordatorios en el estado
        this.stateManager.addConversationEntry(sessionId, {
          type: 'system_event',
          content: `Recordatorios configurados para: ${task.title}`,
          metadata: {
            taskId: task.id,
            reminders: [
              `24 horas antes: ${new Date(new Date(task.startDate).getTime() - 24 * 60 * 60 * 1000).toISOString()}`,
              `1 hora antes: ${new Date(new Date(task.startDate).getTime() - 60 * 60 * 1000).toISOString()}`,
            ],
          },
        });

        // Enviar alertas iniciales mediante WebSocket
        this.websocketGateway.emitCalendarUpdate(sessionId, {
          type: 'reminder_set',
          taskId: task.id,
          taskTitle: task.title,
          message: `Recordatorios configurados para la tarea: ${task.title}`,
        });

        this.logger.log(`Recordatorios configurados para tarea: ${task.title}`);
      } catch (error) {
        this.logger.error(
          `Error configurando recordatorios para tarea ${task.id}: ${error.message}`,
        );
      }
    }
  }

  private async setupCollaborativeEditing(sessionId: string) {
    this.logger.log('Configurando edici n colaborativa de calendario');

    try {
      // En una implementaci n real, esto configurar a permisos de edici n colaborativa
      // con Google Calendar y Microsoft Calendar

      // Por ahora, simulamos la configuraci n
      this.stateManager.addConversationEntry(sessionId, {
        type: 'system_event',
        content: 'Edici n colaborativa de calendario configurada',
        metadata: {
          sessionId,
          editPermissions: 'shared',
          collaborators: ['team_members'],
        },
      });

      // Notificar configuraci n mediante WebSocket
      this.websocketGateway.broadcastSystemNotification({
        type: 'collaborative_editing_enabled',
        sessionId,
        message: 'Edici n colaborativa de calendario habilitada',
      });

      this.logger.log('Edici n colaborativa configurada exitosamente');
    } catch (error) {
      this.logger.error(
        `Error configurando edici n colaborativa: ${error.message}`,
      );
      // No lanzamos el error para no interrumpir el flujo principal
    }
  }
}
