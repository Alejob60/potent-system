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
exports.AgentAnalyticsReporterV2Service = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_analytics_reporter_entity_1 = require("../entities/agent-analytics-reporter.entity");
const agent_base_1 = require("../../../common/agents/agent-base");
const redis_service_1 = require("../../../common/redis/redis.service");
const state_management_service_1 = require("../../../state/state-management.service");
const websocket_gateway_1 = require("../../../websocket/websocket.gateway");
let AgentAnalyticsReporterV2Service = class AgentAnalyticsReporterV2Service extends agent_base_1.AgentBase {
    constructor(repo, redisService, stateManager, websocketGateway) {
        super('analytics-reporter-v2', 'Generate comprehensive analytics reports with enhanced capabilities', ['analytics_reporting', 'data_analysis', 'insight_generation', 'performance_monitoring'], redisService, stateManager, websocketGateway);
        this.repo = repo;
    }
    async execute(payload) {
        const startTime = Date.now();
        try {
            if (!(await this.validate(payload))) {
                return this.handleError(new Error('Invalid payload: missing required fields'), 'execute.validate');
            }
            this.logActivity(payload.sessionId || 'unknown', 'Starting analytics report generation', payload);
            if (this.websocketGateway) {
                this.websocketGateway.broadcastSystemNotification({
                    type: 'agent_processing',
                    agent: this.config.name,
                    sessionId: payload.sessionId || 'unknown',
                    message: 'Generating analytics report',
                    timestamp: new Date().toISOString(),
                });
            }
            const result = await this.generateAnalyticsReport(payload);
            const savedResult = await this.saveToDatabase(payload, result);
            const processingTime = Date.now() - startTime;
            this.updateMetrics({
                avgResponseTime: processingTime,
            });
            this.logActivity(payload.sessionId || 'unknown', 'Analytics report generation completed', { processingTime, reportId: savedResult.id, metric: result.metric });
            return this.formatResponse({
                report: savedResult,
                reportId: savedResult.id,
                metric: result.metric,
                period: result.period,
                stats: result.stats,
                insights: result.insights,
                recommendations: result.recommendations,
            });
        }
        catch (error) {
            this.logger.error(`Error executing analytics report: ${error.message}`, error.stack);
            return this.handleError(error, 'execute');
        }
    }
    async validate(payload) {
        if (!payload)
            return false;
        return typeof payload === 'object';
    }
    async generateAnalyticsReport(payload) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const metric = payload.metric || 'engagement';
        const period = payload.period || 'daily';
        const stats = Array.from({ length: 30 }, () => Math.floor(Math.random() * 100));
        const insights = [
            `The ${metric} metric shows consistent performance over the ${period} period`,
            `Peak activity occurs during business hours`,
            `Weekend engagement is ${Math.random() > 0.5 ? 'higher' : 'lower'} than weekdays`,
        ];
        const recommendations = [
            `Focus on increasing ${metric} during peak hours`,
            `Consider adjusting content strategy for weekend engagement`,
            `Monitor trends for optimization opportunities`,
        ];
        return {
            reportId: `report-${Date.now()}`,
            metric,
            period,
            stats,
            insights,
            recommendations,
        };
    }
    async saveToDatabase(payload, result) {
        const entity = this.repo.create({
            metric: payload.metric,
            period: payload.period,
            sessionId: payload.sessionId,
            userId: payload.userId,
            reportData: {
                metric: result.metric,
                period: result.period,
                stats: result.stats,
                insights: result.insights,
                recommendations: result.recommendations,
            },
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
        const dbMetrics = {
            totalReports: total,
            dbSuccessRate: total > 0 ? (completed / total) * 100 : 0,
            dbFailureRate: total > 0 ? (failed / total) * 100 : 0,
            databaseMetrics: true,
        };
        return {
            ...dbMetrics,
            ...this.metrics,
        };
    }
};
exports.AgentAnalyticsReporterV2Service = AgentAnalyticsReporterV2Service;
exports.AgentAnalyticsReporterV2Service = AgentAnalyticsReporterV2Service = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_analytics_reporter_entity_1.AgentAnalyticsReporter)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        redis_service_1.RedisService,
        state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService])
], AgentAnalyticsReporterV2Service);
//# sourceMappingURL=agent-analytics-reporter-v2.service.js.map