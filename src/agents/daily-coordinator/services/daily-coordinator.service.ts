import { Injectable, Logger } from '@nestjs/common';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
import {
  CalendarService,
  CalendarEvent,
} from '../../../calendar/calendar.service';

@Injectable()
export class DailyCoordinatorService {
  private readonly logger = new Logger(DailyCoordinatorService.name);
  private agentesRegistrados: string[] = [
    'trend-scanner',
    'video-scriptor',
    'faq-responder',
    'post-scheduler',
    'analytics-reporter',
    'front-desk',
  ];

  constructor(
    private readonly stateManager: StateManagementService,
    private readonly websocketGateway: WebSocketGatewayService,
    private readonly calendarService: CalendarService,
  ) {}

  async convocarReunionDiaria() {
    this.logger.log('Convocando reuni n diaria entre agentes');

    // Crear una sesi n especial para la coordinaci n diaria si no existe
    let session = this.stateManager.getSession('daily-coordination');
    if (!session) {
      session = this.stateManager.createSession('daily-coordination');
    }

    // Notificar a todos los agentes sobre la reuni n mediante WebSocket
    this.websocketGateway.broadcastSystemNotification({
      type: 'daily_sync',
      message: 'Reuni n diaria convocada',
      timestamp: new Date().toISOString(),
    });

    // Registrar la reuni n en el calendario
    await this.registrarReunionEnCalendario();

    return {
      status: 'success',
      message: 'Reuni n diaria convocada exitosamente',
      timestamp: new Date().toISOString(),
    };
  }

  async consultarEstadoAgentes() {
    this.logger.log('Consultando estado de agentes');

    // En un sistema real, esto consultar a el estado real de cada agente
    // Por ahora, simulamos estados
    const estados = this.agentesRegistrados.map((agente) => ({
      agente,
      estado: Math.random() > 0.1 ? 'activo' : 'bloqueado', // 90% chance de estar activo
      ultimaActividad: new Date(
        Date.now() - Math.floor(Math.random() * 3600000),
      ).toISOString(), // Hace hasta 1 hora
    }));

    return {
      timestamp: new Date().toISOString(),
      estados,
    };
  }

  async publicarResumenDiario(datos: any) {
    this.logger.log('Publicando resumen diario');

    // Agregar entrada al historial de conversaciones de la sesi n de coordinaci n
    this.stateManager.addConversationEntry('daily-coordination', {
      type: 'system_event',
      content: `Resumen diario: ${datos.summary}`,
      metadata: datos,
    });

    // Notificar mediante WebSocket
    this.websocketGateway.broadcastSystemNotification({
      type: 'daily_summary',
      data: datos,
      timestamp: new Date().toISOString(),
    });

    return {
      status: 'success',
      message: 'Resumen diario publicado exitosamente',
      timestamp: new Date().toISOString(),
    };
  }

  async detectarBloqueos() {
    this.logger.log('Detectando bloqueos en agentes');

    const estados = await this.consultarEstadoAgentes();
    const bloqueados = estados['estados'].filter(
      (estado: any) => estado.estado === 'bloqueado',
    );

    if (bloqueados.length > 0) {
      this.logger.warn(`Agentes bloqueados detectados: ${bloqueados.length}`);

      // Notificar sobre agentes bloqueados
      this.websocketGateway.broadcastSystemNotification({
        type: 'agent_blocked',
        blockedAgents: bloqueados,
        timestamp: new Date().toISOString(),
      });

      // Activar soporte para agentes bloqueados
      await this.activarSoporte(bloqueados);

      return {
        status: 'warning',
        message: 'Bloqueos detectados y soporte activado',
        blockedAgents: bloqueados,
      };
    }

    return {
      status: 'success',
      message: 'No se detectaron bloqueos',
    };
  }

  // Hacer p blico el m todo para que otros servicios puedan acceder
  async activarSoporte(bloqueados: any[]) {
    this.logger.log('Activando soporte para agentes bloqueados');

    // En un sistema real, esto conectar a con un sistema de soporte
    // Por ahora, solo registramos la acci n
    bloqueados.forEach((agente) => {
      this.logger.log(`Soporte activado para agente: ${agente.agente}`);

      // Agregar tarea de soporte al estado
      this.stateManager.addTask('daily-coordination', {
        type: 'agent_support',
        status: 'pending',
        data: {
          agent: agente.agente,
          issue: 'Agente bloqueado detectado',
        },
      });
    });
  }

  private async registrarReunionEnCalendario() {
    this.logger.log('Registrando reuni n en calendario');

    try {
      // Crear evento de reuni n en el calendario
      const eventoReunion: Omit<CalendarEvent, 'id' | 'status'> = {
        title: 'Reuni n Diaria de Agentes',
        description:
          'Sincronizaci n diaria del ecosistema de agentes creativos',
        startTime: new Date(),
        endTime: new Date(Date.now() + 30 * 60000), // 30 minutos
        type: 'meeting',
        priority: 'high',
        sessionId: 'daily-coordination',
        metadata: {
          attendees: this.agentesRegistrados,
          location: 'Sistema de Coordinaci n',
        },
      };

      // Registrar en calendario usando el CalendarService
      const evento = await this.calendarService.scheduleEvent(eventoReunion);
      this.logger.log('Reuni n registrada en calendario:', evento);
    } catch (error) {
      this.logger.error('Error al registrar reuni n en calendario:', error);
    }
  }
}
