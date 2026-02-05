"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DailyCoordinatorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyCoordinatorService = void 0;
const common_1 = require("@nestjs/common");
const state_management_service_1 = require("../../../state/state-management.service");
const websocket_gateway_1 = require("../../../websocket/websocket.gateway");
const calendar_service_1 = require("../../../calendar/calendar.service");
let DailyCoordinatorService = DailyCoordinatorService_1 = class DailyCoordinatorService {
    constructor(stateManager, websocketGateway, calendarService) {
        this.stateManager = stateManager;
        this.websocketGateway = websocketGateway;
        this.calendarService = calendarService;
        this.logger = new common_1.Logger(DailyCoordinatorService_1.name);
        this.agentesRegistrados = [
            'trend-scanner',
            'video-scriptor',
            'faq-responder',
            'post-scheduler',
            'analytics-reporter',
            'front-desk',
        ];
    }
    async convocarReunionDiaria() {
        this.logger.log('Convocando reuni n diaria entre agentes');
        let session = this.stateManager.getSession('daily-coordination');
        if (!session) {
            session = this.stateManager.createSession('daily-coordination');
        }
        this.websocketGateway.broadcastSystemNotification({
            type: 'daily_sync',
            message: 'Reuni n diaria convocada',
            timestamp: new Date().toISOString(),
        });
        await this.registrarReunionEnCalendario();
        return {
            status: 'success',
            message: 'Reuni n diaria convocada exitosamente',
            timestamp: new Date().toISOString(),
        };
    }
    async consultarEstadoAgentes() {
        this.logger.log('Consultando estado de agentes');
        const estados = this.agentesRegistrados.map((agente) => ({
            agente,
            estado: Math.random() > 0.1 ? 'activo' : 'bloqueado',
            ultimaActividad: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString(),
        }));
        return {
            timestamp: new Date().toISOString(),
            estados,
        };
    }
    async publicarResumenDiario(datos) {
        this.logger.log('Publicando resumen diario');
        this.stateManager.addConversationEntry('daily-coordination', {
            type: 'system_event',
            content: `Resumen diario: ${datos.summary}`,
            metadata: datos,
        });
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
        const bloqueados = estados['estados'].filter((estado) => estado.estado === 'bloqueado');
        if (bloqueados.length > 0) {
            this.logger.warn(`Agentes bloqueados detectados: ${bloqueados.length}`);
            this.websocketGateway.broadcastSystemNotification({
                type: 'agent_blocked',
                blockedAgents: bloqueados,
                timestamp: new Date().toISOString(),
            });
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
    async activarSoporte(bloqueados) {
        this.logger.log('Activando soporte para agentes bloqueados');
        bloqueados.forEach((agente) => {
            this.logger.log(`Soporte activado para agente: ${agente.agente}`);
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
    async registrarReunionEnCalendario() {
        this.logger.log('Registrando reuni n en calendario');
        try {
            const eventoReunion = {
                title: 'Reuni n Diaria de Agentes',
                description: 'Sincronizaci n diaria del ecosistema de agentes creativos',
                startTime: new Date(),
                endTime: new Date(Date.now() + 30 * 60000),
                type: 'meeting',
                priority: 'high',
                sessionId: 'daily-coordination',
                metadata: {
                    attendees: this.agentesRegistrados,
                    location: 'Sistema de Coordinaci n',
                },
            };
            const evento = await this.calendarService.scheduleEvent(eventoReunion);
            this.logger.log('Reuni n registrada en calendario:', evento);
        }
        catch (error) {
            this.logger.error('Error al registrar reuni n en calendario:', error);
        }
    }
};
exports.DailyCoordinatorService = DailyCoordinatorService;
exports.DailyCoordinatorService = DailyCoordinatorService = DailyCoordinatorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService,
        calendar_service_1.CalendarService])
], DailyCoordinatorService);
//# sourceMappingURL=daily-coordinator.service.js.map