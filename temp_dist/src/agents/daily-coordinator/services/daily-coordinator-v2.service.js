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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyCoordinatorV2Service = void 0;
const common_1 = require("@nestjs/common");
const agent_base_1 = require("../../../common/agents/agent-base");
const redis_service_1 = require("../../../common/redis/redis.service");
const state_management_service_1 = require("../../../state/state-management.service");
const websocket_gateway_1 = require("../../../websocket/websocket.gateway");
let DailyCoordinatorV2Service = class DailyCoordinatorV2Service extends agent_base_1.AgentBase {
    constructor(redisService, stateManager, websocketGateway) {
        super('daily-coordinator-v2', 'Coordinate daily meetings and briefings between AI agents with enhanced capabilities', ['meeting_coordination', 'agent_briefing', 'schedule_management', 'status_monitoring'], redisService, stateManager, websocketGateway);
    }
    async execute(payload) {
        const startTime = Date.now();
        try {
            if (!(await this.validate(payload))) {
                return this.handleError(new Error('Invalid payload'), 'execute.validate');
            }
            this.logActivity(payload.sessionId, 'Starting daily coordination', payload);
            if (this.websocketGateway) {
                this.websocketGateway.broadcastSystemNotification({
                    type: 'agent_processing',
                    agent: this.config.name,
                    sessionId: payload.sessionId,
                    message: 'Coordinating daily meeting',
                    timestamp: new Date().toISOString(),
                });
            }
            const result = await this.coordinateDailyActivities(payload);
            const processingTime = Date.now() - startTime;
            this.updateMetrics({
                avgResponseTime: processingTime,
            });
            this.logActivity(payload.sessionId, 'Daily coordination completed', { processingTime, agentsBriefed: result.agentsBriefed.length });
            return this.formatResponse({
                coordination: result,
                coordinationId: result.coordinationId,
                agentsBriefed: result.agentsBriefed,
                schedule: result.schedule,
                status: result.status,
            });
        }
        catch (error) {
            return this.handleError(error, 'execute');
        }
    }
    async validate(payload) {
        if (!payload)
            return false;
        if (!payload.sessionId)
            return false;
        return true;
    }
    async coordinateDailyActivities(payload) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const agentsBriefed = [
            'trend-scanner',
            'video-scriptor',
            'faq-responder',
            'post-scheduler',
            'analytics-reporter'
        ];
        const schedule = [
            {
                time: '09:00',
                activity: 'Team standup meeting',
                participants: agentsBriefed,
            },
            {
                time: '10:30',
                activity: 'Trend analysis review',
                participants: ['trend-scanner', 'analytics-reporter'],
            },
            {
                time: '14:00',
                activity: 'Content creation session',
                participants: ['video-scriptor', 'creative-synthesizer'],
            },
        ];
        return {
            coordinationId: `coordination-${Date.now()}`,
            agentsBriefed,
            schedule,
            status: 'completed',
        };
    }
    async getMetrics() {
        return {
            ...this.metrics,
        };
    }
};
exports.DailyCoordinatorV2Service = DailyCoordinatorV2Service;
exports.DailyCoordinatorV2Service = DailyCoordinatorV2Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService])
], DailyCoordinatorV2Service);
//# sourceMappingURL=daily-coordinator-v2.service.js.map