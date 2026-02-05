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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentPostSchedulerV2Service = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_post_scheduler_entity_1 = require("../entities/agent-post-scheduler.entity");
const agent_base_1 = require("../../../common/agents/agent-base");
const redis_service_1 = require("../../../common/redis/redis.service");
const state_management_service_1 = require("../../../state/state-management.service");
const websocket_gateway_1 = require("../../../websocket/websocket.gateway");
let AgentPostSchedulerV2Service = class AgentPostSchedulerV2Service extends agent_base_1.AgentBase {
    constructor(repo, redisService, stateManager, websocketGateway) {
        super('post-scheduler-v2', 'Schedule social media posts with enhanced capabilities', ['post_scheduling', 'content_publishing', 'social_media_integration', 'timing_optimization'], redisService, stateManager, websocketGateway);
        this.repo = repo;
    }
    async execute(payload) {
        const startTime = Date.now();
        try {
            if (!(await this.validate(payload))) {
                return this.handleError(new Error('Invalid payload'), 'execute.validate');
            }
            this.logActivity(payload.sessionId || 'unknown', 'Starting post scheduling', payload);
            if (this.websocketGateway) {
                this.websocketGateway.broadcastSystemNotification({
                    type: 'agent_processing',
                    agent: this.config.name,
                    sessionId: payload.sessionId || 'unknown',
                    message: 'Scheduling social media post',
                    timestamp: new Date().toISOString(),
                });
            }
            const result = await this.schedulePost(payload);
            const savedResult = await this.saveToDatabase(payload, result);
            const processingTime = Date.now() - startTime;
            this.updateMetrics({
                avgResponseTime: processingTime,
            });
            this.logActivity(payload.sessionId || 'unknown', 'Post scheduling completed', { processingTime, postId: savedResult.id, platform: result.platform });
            return this.formatResponse({
                post: savedResult,
                postId: savedResult.id,
                scheduledAt: savedResult.scheduledAt,
                platform: result.platform,
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
        if (!payload.content)
            return false;
        if (!payload.scheduledAt)
            return false;
        const scheduledDate = new Date(payload.scheduledAt);
        if (isNaN(scheduledDate.getTime()))
            return false;
        if (scheduledDate <= new Date())
            return false;
        return true;
    }
    async schedulePost(payload) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const platform = 'social-media';
        const postId = `post-${Date.now()}`;
        return {
            postId,
            scheduledAt: new Date(payload.scheduledAt),
            platform,
            status: 'scheduled',
        };
    }
    async saveToDatabase(payload, result) {
        const entity = this.repo.create({
            content: payload.content,
            scheduledAt: result.scheduledAt,
            published: false,
            sessionId: payload.sessionId,
            userId: payload.userId,
            status: result.status,
        });
        return this.repo.save(entity);
    }
    async findAll() {
        return this.repo.find();
    }
    async findOne(id) {
        return this.repo.findOneBy({ id });
    }
    async getMetrics() {
        const total = await this.repo.count();
        const scheduled = await this.repo.count({ where: { published: false } });
        const published = await this.repo.count({ where: { published: true } });
        const dbMetrics = {
            totalPosts: total,
            scheduledPosts: scheduled,
            publishedPosts: published,
        };
        return {
            ...dbMetrics,
            ...this.metrics,
        };
    }
};
exports.AgentPostSchedulerV2Service = AgentPostSchedulerV2Service;
exports.AgentPostSchedulerV2Service = AgentPostSchedulerV2Service = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_post_scheduler_entity_1.AgentPostScheduler)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        redis_service_1.RedisService,
        state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService])
], AgentPostSchedulerV2Service);
//# sourceMappingURL=agent-post-scheduler-v2.service.js.map