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
var TrendAttackCoordinatorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrendAttackCoordinatorService = void 0;
const common_1 = require("@nestjs/common");
const state_management_service_1 = require("../../../state/state-management.service");
const websocket_gateway_1 = require("../../../websocket/websocket.gateway");
const daily_coordinator_service_1 = require("../../daily-coordinator/services/daily-coordinator.service");
const agent_post_scheduler_service_1 = require("../../agent-post-scheduler/services/agent-post-scheduler.service");
const meta_metrics_service_1 = require("../../meta-metrics/services/meta-metrics.service");
let TrendAttackCoordinatorService = TrendAttackCoordinatorService_1 = class TrendAttackCoordinatorService {
    constructor(stateManager, websocketGateway, dailyCoordinator, postScheduler, metaMetrics) {
        this.stateManager = stateManager;
        this.websocketGateway = websocketGateway;
        this.dailyCoordinator = dailyCoordinator;
        this.postScheduler = postScheduler;
        this.metaMetrics = metaMetrics;
        this.logger = new common_1.Logger(TrendAttackCoordinatorService_1.name);
    }
    async convocarCampanaViral(campaignData) {
        this.logger.log('Convocando campaa viral');
        const { trend, context } = campaignData;
        if (!trend || !context) {
            throw new Error('Datos de campaa invlidos');
        }
        this.websocketGateway.broadcastSystemNotification({
            type: 'trend_attack_started',
            trend,
            context,
            timestamp: new Date().toISOString(),
        });
        const agentStatus = await this.dailyCoordinator.consultarEstadoAgentes();
        const blockedAgents = agentStatus['estados'].filter((estado) => estado.estado === 'bloqueado');
        if (blockedAgents.length > 0) {
            this.logger.warn(`Agentes bloqueados detectados: ${blockedAgents.length}. Activando soporte.`);
            await this.dailyCoordinator.activarSoporte(blockedAgents);
        }
        const taskAssignments = await this.asignarTareas(trend, context);
        const schedulingResult = await this.sincronizarHorarios(trend, context);
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
    async activarPorTrendScanner(trendData, context) {
        this.logger.log('Activando campaa viral por deteccin automtica de Trend Scanner');
        const campaignData = {
            trend: trendData,
            context,
        };
        return await this.convocarCampanaViral(campaignData);
    }
    async escalarCampana(campaignId, sessionId) {
        this.logger.log(`Escalando campaa ${campaignId} segn resonancia`);
        try {
            const metrics = await this.metaMetrics.getAggregateMetrics();
            const resonanceLevel = this.calcularNivelResonancia(metrics);
            let escalationAction = null;
            if (resonanceLevel > 0.8) {
                escalationAction = 'high_engagement_scaling';
            }
            else if (resonanceLevel > 0.6) {
                escalationAction = 'medium_engagement_scaling';
            }
            else if (resonanceLevel < 0.3) {
                escalationAction = 'low_engagement_reduction';
            }
            if (escalationAction) {
                await this.ejecutarEscalamiento(escalationAction, campaignId, sessionId);
            }
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
        }
        catch (error) {
            this.logger.error(`Error escalando campaa: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    calcularNivelResonancia(metrics) {
        const viralResonance = metrics.compositeMetrics?.viralResonanceIndex || 0;
        const emotionalActivation = metrics.compositeMetrics?.emotionalActivationRate || 0;
        return viralResonance * 0.6 + emotionalActivation * 0.4;
    }
    async ejecutarEscalamiento(action, campaignId, sessionId) {
        this.logger.log(`Ejecutando escalamiento: ${action} para campaa ${campaignId}`);
        switch (action) {
            case 'high_engagement_scaling':
                this.websocketGateway.broadcastSystemNotification({
                    type: 'campaign_scaling',
                    action: 'high_engagement_scaling',
                    campaignId,
                    message: 'Aumentando recursos para campaa de alta resonancia',
                });
                break;
            case 'medium_engagement_scaling':
                this.websocketGateway.broadcastSystemNotification({
                    type: 'campaign_scaling',
                    action: 'medium_engagement_scaling',
                    campaignId,
                    message: 'Optimizando campaa para mejor resonancia',
                });
                break;
            case 'low_engagement_reduction':
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
    async asignarTareas(trend, context) {
        this.logger.log('Asignando tareas a agentes');
        const assignments = {
            'video-scriptor': {
                task: 'create_content',
                details: `Crear contenido viral sobre ${trend.name}`,
                deadline: new Date(Date.now() + 2 * 60 * 60 * 1000),
            },
            'faq-responder': {
                task: 'prepare_responses',
                details: `Preparar respuestas sobre ${trend.name}`,
                deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
            'post-scheduler': {
                task: 'schedule_posts',
                details: `Programar publicaciones sobre ${trend.name}`,
                deadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
            },
            'analytics-reporter': {
                task: 'monitor_metrics',
                details: `Monitorear mtricas de ${trend.name}`,
                deadline: new Date(Date.now() + 72 * 60 * 60 * 1000),
            },
        };
        for (const [agent, taskData] of Object.entries(assignments)) {
            const task = taskData;
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
        this.websocketGateway.broadcastSystemNotification({
            type: 'task_assignments',
            assignments,
            trend,
            timestamp: new Date().toISOString(),
        });
        return assignments;
    }
    async sincronizarHorarios(trend, context) {
        this.logger.log('Sincronizando horarios de publicacin con el Scheduler');
        try {
            const publicationPlan = {
                campaignId: `campaign-${Date.now()}`,
                contentTheme: trend.name,
                targetPlatforms: trend.platform ? [trend.platform] : ['tiktok', 'instagram'],
                scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
                metadata: {
                    trendId: trend.id,
                    context,
                },
            };
            const result = {
                id: `post-${Date.now()}`,
                status: 'scheduled',
                plan: publicationPlan,
            };
            this.stateManager.addConversationEntry(context.sessionId, {
                type: 'system_event',
                content: 'Horarios de publicacin sincronizados',
                metadata: {
                    schedulingResult: result,
                    synchronizationTime: new Date().toISOString(),
                },
            });
            return result;
        }
        catch (error) {
            this.logger.error('Error sincronizando horarios de publicacin:', error);
            throw error;
        }
    }
};
exports.TrendAttackCoordinatorService = TrendAttackCoordinatorService;
exports.TrendAttackCoordinatorService = TrendAttackCoordinatorService = TrendAttackCoordinatorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService,
        daily_coordinator_service_1.DailyCoordinatorService,
        agent_post_scheduler_service_1.AgentPostSchedulerService,
        meta_metrics_service_1.MetaMetricsService])
], TrendAttackCoordinatorService);
//# sourceMappingURL=trend-attack-coordinator.service.js.map