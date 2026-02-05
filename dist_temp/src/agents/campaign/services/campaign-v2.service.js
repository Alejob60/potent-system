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
exports.CampaignV2Service = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const campaign_entity_1 = require("../entities/campaign.entity");
const agent_base_1 = require("../../../common/agents/agent-base");
const redis_service_1 = require("../../../common/redis/redis.service");
const state_management_service_1 = require("../../../state/state-management.service");
const websocket_gateway_1 = require("../../../websocket/websocket.gateway");
let CampaignV2Service = class CampaignV2Service extends agent_base_1.AgentBase {
    constructor(repo, redisService, stateManager, websocketGateway) {
        super('campaign-v2', 'Manage and execute viral marketing campaigns with enhanced capabilities', ['campaign_management', 'execution_tracking', 'performance_monitoring', 'optimization'], redisService, stateManager, websocketGateway);
        this.repo = repo;
    }
    async execute(payload) {
        const startTime = Date.now();
        try {
            if (!(await this.validate(payload))) {
                return this.handleError(new Error('Invalid payload: missing required fields'), 'execute.validate');
            }
            this.logActivity(payload.sessionId, 'Starting campaign management', payload);
            if (this.websocketGateway) {
                this.websocketGateway.broadcastSystemNotification({
                    type: 'agent_processing',
                    agent: this.config.name,
                    sessionId: payload.sessionId,
                    message: 'Managing campaign',
                    timestamp: new Date().toISOString(),
                });
            }
            const result = await this.manageCampaign(payload);
            const savedResult = await this.saveToDatabase(payload, result);
            const processingTime = Date.now() - startTime;
            this.updateMetrics({
                avgResponseTime: processingTime,
            });
            this.logActivity(payload.sessionId, 'Campaign management completed', { processingTime, campaignId: savedResult.id, status: result.status });
            return this.formatResponse({
                campaign: savedResult,
                campaignId: savedResult.id,
                status: result.status,
                progress: result.progress,
                metrics: result.metrics,
            });
        }
        catch (error) {
            this.logger.error(`Error executing campaign management: ${error.message}`, error.stack);
            return this.handleError(error, 'execute');
        }
    }
    async validate(payload) {
        if (!payload)
            return false;
        if (!payload.sessionId)
            return false;
        if (!payload.name)
            return false;
        if (!payload.objective)
            return false;
        return true;
    }
    async manageCampaign(payload) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const metrics = {
            reach: Math.floor(Math.random() * 10000),
            engagement: Math.random() * 100,
            conversions: Math.floor(Math.random() * 1000),
            roi: (Math.random() * 5).toFixed(2),
        };
        return {
            campaignId: `campaign-${Date.now()}`,
            status: 'active',
            progress: Math.floor(Math.random() * 100),
            metrics,
        };
    }
    async saveToDatabase(payload, result) {
        const entity = this.repo.create({
            ...payload,
            status: result.status,
            progress: result.progress,
            metrics: result.metrics,
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
        const active = await this.repo.count({ where: { status: 'active' } });
        const completed = await this.repo.count({ where: { status: 'completed' } });
        return {
            totalCampaigns: total,
            activeCampaigns: active,
            completedCampaigns: completed,
            ...this.metrics,
        };
    }
};
exports.CampaignV2Service = CampaignV2Service;
exports.CampaignV2Service = CampaignV2Service = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(campaign_entity_1.Campaign)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        redis_service_1.RedisService,
        state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService])
], CampaignV2Service);
//# sourceMappingURL=campaign-v2.service.js.map