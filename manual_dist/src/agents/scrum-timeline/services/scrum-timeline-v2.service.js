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
exports.ScrumTimelineV2Service = void 0;
const common_1 = require("@nestjs/common");
const agent_base_1 = require("../../../common/agents/agent-base");
const redis_service_1 = require("../../../common/redis/redis.service");
const state_management_service_1 = require("../../../state/state-management.service");
const websocket_gateway_1 = require("../../../websocket/websocket.gateway");
let ScrumTimelineV2Service = class ScrumTimelineV2Service extends agent_base_1.AgentBase {
    constructor(redisService, stateManager, websocketGateway) {
        super('scrum-timeline-v2', 'Synchronize tasks with team calendar and coordinate Scrum-based task management with enhanced capabilities', ['task_synchronization', 'calendar_management', 'scrum_coordination', 'timeline_planning'], redisService, stateManager, websocketGateway);
    }
    async execute(payload) {
        const startTime = Date.now();
        try {
            if (!(await this.validate(payload))) {
                return this.handleError(new Error('Invalid payload'), 'execute.validate');
            }
            this.logActivity(payload.sessionId, 'Starting scrum timeline synchronization', payload);
            if (this.websocketGateway) {
                this.websocketGateway.broadcastSystemNotification({
                    type: 'agent_processing',
                    agent: this.config.name,
                    sessionId: payload.sessionId,
                    message: 'Synchronizing scrum timeline',
                    timestamp: new Date().toISOString(),
                });
            }
            const result = await this.synchronizeScrumTimeline(payload);
            const processingTime = Date.now() - startTime;
            this.updateMetrics({
                avgResponseTime: processingTime,
            });
            this.logActivity(payload.sessionId, 'Scrum timeline synchronization completed', { processingTime, taskCount: result.tasks.length });
            return this.formatResponse({
                timeline: result,
                timelineId: result.timelineId,
                tasks: result.tasks,
                calendarEvents: result.calendarEvents,
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
    async synchronizeScrumTimeline(payload) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const tasks = [
            {
                id: `task-${Date.now()}-1`,
                title: 'Daily Standup Meeting',
                assignee: 'team',
                dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                status: 'scheduled',
            },
            {
                id: `task-${Date.now()}-2`,
                title: 'Sprint Planning',
                assignee: 'scrum-master',
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'scheduled',
            },
            {
                id: `task-${Date.now()}-3`,
                title: 'Retrospective Meeting',
                assignee: 'team',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'scheduled',
            },
        ];
        const calendarEvents = tasks.map(task => ({
            id: `event-${task.id}`,
            title: task.title,
            start: task.dueDate,
            end: new Date(new Date(task.dueDate).getTime() + 60 * 60 * 1000).toISOString(),
            assignee: task.assignee,
        }));
        return {
            timelineId: `timeline-${Date.now()}`,
            tasks,
            calendarEvents,
            status: 'synchronized',
        };
    }
    async getMetrics() {
        return {
            ...this.metrics,
        };
    }
};
exports.ScrumTimelineV2Service = ScrumTimelineV2Service;
exports.ScrumTimelineV2Service = ScrumTimelineV2Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService])
], ScrumTimelineV2Service);
//# sourceMappingURL=scrum-timeline-v2.service.js.map