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
exports.AgentCreativeSynthesizerV2Service = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_creative_synthesizer_entity_1 = require("../entities/agent-creative-synthesizer.entity");
const agent_base_1 = require("../../../common/agents/agent-base");
const redis_service_1 = require("../../../common/redis/redis.service");
const state_management_service_1 = require("../../../state/state-management.service");
const websocket_gateway_1 = require("../../../websocket/websocket.gateway");
let AgentCreativeSynthesizerV2Service = class AgentCreativeSynthesizerV2Service extends agent_base_1.AgentBase {
    constructor(repo, redisService, stateManager, websocketGateway) {
        super('creative-synthesizer-v2', 'Generate creative content and assets with enhanced capabilities', ['content_generation', 'asset_creation', 'style_adaptation', 'media_synthesis'], redisService, stateManager, websocketGateway);
        this.repo = repo;
    }
    async execute(payload) {
        const startTime = Date.now();
        try {
            if (!(await this.validate(payload))) {
                return this.handleError(new Error('Invalid payload'), 'execute.validate');
            }
            this.logActivity(payload.sessionId, 'Starting creative synthesis', payload);
            if (this.websocketGateway) {
                this.websocketGateway.broadcastSystemNotification({
                    type: 'agent_processing',
                    agent: this.config.name,
                    sessionId: payload.sessionId,
                    message: 'Generating creative content',
                    timestamp: new Date().toISOString(),
                });
            }
            const result = await this.generateCreativeContent(payload);
            const savedResult = await this.saveToDatabase(payload, result);
            const processingTime = Date.now() - startTime;
            this.updateMetrics({
                avgResponseTime: processingTime,
            });
            this.logActivity(payload.sessionId, 'Creative synthesis completed', { processingTime, creationId: savedResult.id, assetCount: result.assets.length });
            return this.formatResponse({
                creation: savedResult,
                creationId: savedResult.id,
                assets: result.assets,
                style: result.style,
                duration: result.duration,
                format: result.format,
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
        if (!payload.intention)
            return false;
        if (!payload.entities)
            return false;
        return true;
    }
    async generateCreativeContent(payload) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const style = payload.entities.style || 'modern';
        const duration = payload.entities.duration || 30;
        const format = 'video';
        const assets = [
            {
                id: `asset-${Date.now()}-1`,
                type: 'image',
                url: `https://example.com/assets/${Date.now()}-1.jpg`,
                description: 'Primary visual asset',
            },
            {
                id: `asset-${Date.now()}-2`,
                type: 'video',
                url: `https://example.com/assets/${Date.now()}-2.mp4`,
                description: 'Secondary video asset',
            },
        ];
        return {
            creationId: `creation-${Date.now()}`,
            assets,
            style,
            duration,
            format,
        };
    }
    async saveToDatabase(payload, result) {
        const entity = this.repo.create({
            ...payload,
            assets: result.assets,
            status: 'completed',
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
        const completed = await this.repo.count({ where: { status: 'completed' } });
        const failed = await this.repo.count({ where: { status: 'failed' } });
        return {
            totalCreations: total,
            dbSuccessRate: total > 0 ? (completed / total) * 100 : 0,
            dbFailureRate: total > 0 ? (failed / total) * 100 : 0,
            databaseMetrics: true,
            ...this.metrics,
        };
    }
};
exports.AgentCreativeSynthesizerV2Service = AgentCreativeSynthesizerV2Service;
exports.AgentCreativeSynthesizerV2Service = AgentCreativeSynthesizerV2Service = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_creative_synthesizer_entity_1.AgentCreativeSynthesizer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        redis_service_1.RedisService,
        state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService])
], AgentCreativeSynthesizerV2Service);
//# sourceMappingURL=agent-creative-synthesizer-v2.service.js.map