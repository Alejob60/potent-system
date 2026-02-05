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
exports.AgentTrendScannerV2Service = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_trend_scanner_entity_1 = require("../entities/agent-trend-scanner.entity");
const agent_base_1 = require("../../../common/agents/agent-base");
const redis_service_1 = require("../../../common/redis/redis.service");
const state_management_service_1 = require("../../../state/state-management.service");
const websocket_gateway_1 = require("../../../websocket/websocket.gateway");
let AgentTrendScannerV2Service = class AgentTrendScannerV2Service extends agent_base_1.AgentBase {
    constructor(agentTrendScannerRepository, redisService, stateManager, websocketGateway) {
        super('trend-scanner-v2', 'Analyze social media trends for specific topics or keywords with enhanced capabilities', ['trend_analysis', 'social_media_monitoring', 'insight_generation', 'real_time_analytics'], redisService, stateManager, websocketGateway);
        this.agentTrendScannerRepository = agentTrendScannerRepository;
    }
    async execute(payload) {
        const startTime = Date.now();
        try {
            if (!(await this.validate(payload))) {
                return this.handleError(new Error('Invalid payload: missing required fields'), 'execute.validate');
            }
            const cacheKey = `${payload.platform || 'default'}:${payload.topic}`;
            const cachedResult = await this.getCachedData(cacheKey);
            if (cachedResult) {
                this.logActivity(payload.sessionId || 'unknown', 'Returning cached trend analysis', { cacheKey });
                this.updateMetrics({
                    avgResponseTime: 10,
                });
                return this.formatResponse({
                    analysis: cachedResult,
                    trends: cachedResult.trends,
                    insights: cachedResult.insights,
                    recommendations: cachedResult.recommendations,
                    fromCache: true,
                });
            }
            this.logActivity(payload.sessionId || 'unknown', 'Starting trend analysis', payload);
            if (this.websocketGateway && payload.sessionId) {
                this.websocketGateway.broadcastSystemNotification({
                    type: 'agent_processing',
                    agent: this.config.name,
                    sessionId: payload.sessionId,
                    message: 'Analyzing social media trends',
                    timestamp: new Date().toISOString(),
                });
            }
            const result = await this.performTrendAnalysis(payload);
            const savedResult = await this.saveToDatabase(payload, result);
            await this.cacheData(cacheKey, {
                ...result,
                cachedAt: new Date().toISOString(),
            }, 1800);
            const processingTime = Date.now() - startTime;
            this.updateMetrics({
                avgResponseTime: processingTime,
            });
            this.logActivity(payload.sessionId || 'unknown', 'Trend analysis completed', { processingTime, trendCount: result.trends.length });
            return this.formatResponse({
                analysis: savedResult,
                trends: result.trends,
                insights: result.insights,
                recommendations: result.recommendations,
                fromCache: false,
            });
        }
        catch (error) {
            this.logger.error(`Error executing trend analysis: ${error.message}`, error.stack);
            return this.handleError(error, 'execute');
        }
    }
    async validate(payload) {
        if (!payload)
            return false;
        if (!payload.topic)
            return false;
        if (payload.platform) {
            const validPlatforms = ['tiktok', 'instagram', 'twitter', 'facebook', 'youtube'];
            if (!validPlatforms.includes(payload.platform))
                return false;
        }
        return true;
    }
    async performTrendAnalysis(payload) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const trends = [
            {
                keyword: payload.topic,
                volume: Math.floor(Math.random() * 10000) + 1000,
                growth: Math.random() * 100,
                relatedTerms: [
                    `${payload.topic} trends`,
                    `${payload.topic} ${payload.platform}`,
                    `best ${payload.topic}`,
                ],
            },
            {
                keyword: `${payload.topic} tips`,
                volume: Math.floor(Math.random() * 5000) + 500,
                growth: Math.random() * 50,
                relatedTerms: [
                    `how to ${payload.topic}`,
                    `${payload.topic} guide`,
                    `${payload.topic} tutorial`,
                ],
            },
            {
                keyword: `${payload.topic} review`,
                volume: Math.floor(Math.random() * 3000) + 300,
                growth: Math.random() * 30,
                relatedTerms: [
                    `${payload.topic} honest review`,
                    `${payload.topic} pros and cons`,
                    `is ${payload.topic} worth it`,
                ],
            },
        ];
        const platformInsights = {
            tiktok: 'Short-form video content performs best with trending audio',
            instagram: 'Visual storytelling with relevant hashtags drives engagement',
            twitter: 'Real-time conversations and trending hashtags are key',
            facebook: 'Community building through groups and live videos',
            youtube: 'Long-form educational content with clear titles',
        };
        const insights = (payload.platform && platformInsights[payload.platform]) || 'Platform-specific insights not available';
        const recommendations = [
            `Focus on ${payload.topic} content for the next 7 days`,
            `Use trending hashtags related to ${payload.topic}`,
            `Engage with ${payload.topic} communities on ${payload.platform}`,
            `Create ${payload.platform}-specific content formats`,
        ];
        return {
            trends,
            insights,
            recommendations,
        };
    }
    async saveToDatabase(payload, result) {
        const entity = this.agentTrendScannerRepository.create({
            topic: payload.topic,
            platform: payload.platform,
            sessionId: payload.sessionId,
            userId: payload.userId,
            trends: result.trends,
            status: 'completed',
        });
        return this.agentTrendScannerRepository.save(entity);
    }
    async findAll() {
        return this.agentTrendScannerRepository.find();
    }
    async findOne(id) {
        return this.agentTrendScannerRepository.findOneBy({ id });
    }
    async getMetrics() {
        const total = await this.agentTrendScannerRepository.count();
        const completed = await this.agentTrendScannerRepository.count({ where: { status: 'completed' } });
        const failed = await this.agentTrendScannerRepository.count({ where: { status: 'failed' } });
        const dbMetrics = {
            totalAnalyses: total,
            dbSuccessRate: total > 0 ? (completed / total) * 100 : 0,
            dbFailureRate: total > 0 ? (failed / total) * 100 : 0,
        };
        return {
            ...dbMetrics,
            ...this.metrics,
        };
    }
};
exports.AgentTrendScannerV2Service = AgentTrendScannerV2Service;
exports.AgentTrendScannerV2Service = AgentTrendScannerV2Service = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_trend_scanner_entity_1.AgentTrendScanner)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        redis_service_1.RedisService,
        state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService])
], AgentTrendScannerV2Service);
//# sourceMappingURL=agent-trend-scanner-v2.service.js.map