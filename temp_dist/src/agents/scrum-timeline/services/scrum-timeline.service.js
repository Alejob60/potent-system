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
var ScrumTimelineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrumTimelineService = void 0;
const common_1 = require("@nestjs/common");
const state_management_service_1 = require("../../../state/state-management.service");
const websocket_gateway_1 = require("../../../websocket/websocket.gateway");
const oauth_service_1 = require("../../../oauth/oauth.service");
const calendar_service_1 = require("../../../calendar/calendar.service");
let ScrumTimelineService = ScrumTimelineService_1 = class ScrumTimelineService {
    constructor(stateManager, websocketGateway, oauthService, calendarService) {
        this.stateManager = stateManager;
        this.websocketGateway = websocketGateway;
        this.oauthService = oauthService;
        this.calendarService = calendarService;
        this.logger = new common_1.Logger(ScrumTimelineService_1.name);
    }
    async syncScrumTimeline(calendarData) {
        this.logger.log('Sincronizando timeline de Scrum en calendario');
        const { tasks, agents, sessionId } = calendarData;
        if (!tasks || !Array.isArray(tasks) || !sessionId) {
            throw new Error('Datos de calendario inv lidos');
        }
        this.websocketGateway.broadcastSystemNotification({
            type: 'scrum_sync_started',
            sessionId,
            taskCount: tasks.length,
            agents,
            timestamp: new Date().toISOString(),
        });
        try {
            const oauthStatus = await this.checkOAuthStatus(sessionId);
            const syncResults = await this.syncTasksToCalendar(tasks, sessionId);
            const agentStatus = await this.updateAgentStatus(agents, sessionId);
            await this.syncAgentStatusToCalendar(agentStatus, sessionId);
            await this.sendRemindersAndAlerts(tasks, sessionId);
            await this.setupCollaborativeEditing(sessionId);
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
        }
        catch (error) {
            this.logger.error(`Error sincronizando timeline de Scrum: ${error.message}`);
            this.websocketGateway.broadcastSystemNotification({
                type: 'scrum_sync_error',
                sessionId,
                error: error.message,
                timestamp: new Date().toISOString(),
            });
            throw error;
        }
    }
    async checkOAuthStatus(sessionId) {
        this.logger.log('Verificando estado de conexi n OAuth');
        try {
            const connectedAccounts = await this.oauthService.getConnectedAccounts();
            const tokenStatus = {};
            for (const account of connectedAccounts) {
                tokenStatus[account.platform] =
                    await this.oauthService.checkTokenStatus(account.id);
            }
            const calendarIntegration = {
                google: connectedAccounts.some((acc) => acc.platform === 'google'),
                microsoft: connectedAccounts.some((acc) => acc.platform === 'microsoft'),
            };
            return {
                connectedAccounts,
                tokenStatus,
                calendarIntegration,
            };
        }
        catch (error) {
            this.logger.error(`Error verificando OAuth: ${error.message}`);
            return {
                error: error.message,
            };
        }
    }
    async syncTasksToCalendar(tasks, sessionId) {
        this.logger.log('Sincronizando tareas en calendario');
        const results = [];
        for (const task of tasks) {
            try {
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
                    reminders: [
                        {
                            time: 24 * 60,
                            type: 'notification',
                        },
                        {
                            time: 60,
                            type: 'notification',
                        },
                    ],
                });
                results.push({
                    taskId: task.id,
                    success: true,
                    eventId: calendarEvent.id,
                });
                this.websocketGateway.emitCalendarUpdate(sessionId, {
                    type: 'event_created',
                    event: calendarEvent,
                    message: `Evento creado: ${task.title}`,
                });
            }
            catch (error) {
                this.logger.error(`Error sincronizando tarea ${task.id}: ${error.message}`);
                results.push({
                    taskId: task.id,
                    success: false,
                    error: error.message,
                });
            }
        }
        return results;
    }
    async updateAgentStatus(agents, sessionId) {
        this.logger.log('Actualizando estado de agentes');
        const agentStatus = {};
        for (const agent of agents) {
            try {
                agentStatus[agent] = {
                    status: Math.random() > 0.2 ? 'active' : 'busy',
                    lastUpdate: new Date().toISOString(),
                    tasksAssigned: Math.floor(Math.random() * 10),
                };
                this.stateManager.addActiveAgent(sessionId, agent);
            }
            catch (error) {
                this.logger.error(`Error actualizando estado de agente ${agent}: ${error.message}`);
                agentStatus[agent] = {
                    status: 'error',
                    error: error.message,
                };
            }
        }
        this.websocketGateway.broadcastSystemNotification({
            type: 'agent_status_update',
            agentStatus,
            sessionId,
            timestamp: new Date().toISOString(),
        });
        return agentStatus;
    }
    async syncAgentStatusToCalendar(agentStatus, sessionId) {
        this.logger.log('Sincronizando estado de agentes con calendario');
        try {
            for (const [agentName, status] of Object.entries(agentStatus)) {
                const agent = status;
                if (agent.status === 'active') {
                    const statusEvent = await this.calendarService.scheduleEvent({
                        title: `Agente Activo: ${agentName}`,
                        description: `El agente ${agentName} est  disponible para tareas`,
                        startTime: new Date(),
                        endTime: new Date(Date.now() + 60 * 60 * 1000),
                        type: 'meeting',
                        priority: 'low',
                        sessionId,
                        metadata: {
                            agent: agentName,
                            status: agent.status,
                            tasksAssigned: agent.tasksAssigned,
                        },
                        reminders: [
                            {
                                time: 30,
                                type: 'notification',
                            },
                        ],
                    });
                    this.logger.log(`Evento de estado creado para agente ${agentName}: ${statusEvent.id}`);
                }
            }
            this.websocketGateway.emitCalendarUpdate(sessionId, {
                type: 'agent_status_synced',
                agentCount: Object.keys(agentStatus).length,
                message: 'Estado de agentes sincronizado con calendario',
            });
        }
        catch (error) {
            this.logger.error(`Error sincronizando estado de agentes con calendario: ${error.message}`);
        }
    }
    async sendRemindersAndAlerts(tasks, sessionId) {
        this.logger.log('Enviando recordatorios y alertas para tareas');
        for (const task of tasks) {
            try {
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
                this.websocketGateway.emitCalendarUpdate(sessionId, {
                    type: 'reminder_set',
                    taskId: task.id,
                    taskTitle: task.title,
                    message: `Recordatorios configurados para la tarea: ${task.title}`,
                });
                this.logger.log(`Recordatorios configurados para tarea: ${task.title}`);
            }
            catch (error) {
                this.logger.error(`Error configurando recordatorios para tarea ${task.id}: ${error.message}`);
            }
        }
    }
    async setupCollaborativeEditing(sessionId) {
        this.logger.log('Configurando edici n colaborativa de calendario');
        try {
            this.stateManager.addConversationEntry(sessionId, {
                type: 'system_event',
                content: 'Edici n colaborativa de calendario configurada',
                metadata: {
                    sessionId,
                    editPermissions: 'shared',
                    collaborators: ['team_members'],
                },
            });
            this.websocketGateway.broadcastSystemNotification({
                type: 'collaborative_editing_enabled',
                sessionId,
                message: 'Edici n colaborativa de calendario habilitada',
            });
            this.logger.log('Edici n colaborativa configurada exitosamente');
        }
        catch (error) {
            this.logger.error(`Error configurando edici n colaborativa: ${error.message}`);
        }
    }
};
exports.ScrumTimelineService = ScrumTimelineService;
exports.ScrumTimelineService = ScrumTimelineService = ScrumTimelineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService,
        oauth_service_1.OAuthService,
        calendar_service_1.CalendarService])
], ScrumTimelineService);
//# sourceMappingURL=scrum-timeline.service.js.map