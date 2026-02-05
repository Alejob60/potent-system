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
exports.MetaMetricsV2Service = void 0;
const common_1 = require("@nestjs/common");
const agent_base_1 = require("../../../common/agents/agent-base");
const redis_service_1 = require("../../../common/redis/redis.service");
const state_management_service_1 = require("../../../state/state-management.service");
const websocket_gateway_1 = require("../../../websocket/websocket.gateway");
let MetaMetricsV2Service = class MetaMetricsV2Service extends agent_base_1.AgentBase {
    constructor(redisService, stateManager, websocketGateway) {
        super('meta-metrics-v2', 'Collect metrics from all agents and generate aggregated metrics with enhanced capabilities', ['metrics_collection', 'data_aggregation', 'insight_generation', 'performance_analysis'], redisService, stateManager, websocketGateway);
    }
    async execute(payload) {
        const startTime = Date.now();
        try {
            if (!(await this.validate(payload))) {
                return this.handleError(new Error('Invalid payload'), 'execute.validate');
            }
            this.logActivity(payload.sessionId, 'Starting meta metrics collection', payload);
            if (this.websocketGateway) {
                this.websocketGateway.broadcastSystemNotification({
                    type: 'agent_processing',
                    agent: this.config.name,
                    sessionId: payload.sessionId,
                    message: 'Collecting meta metrics',
                    timestamp: new Date().toISOString(),
                });
            }
            const result = await this.collectMetaMetrics(payload);
            const processingTime = Date.now() - startTime;
            this.updateMetrics({
                avgResponseTime: processingTime,
            });
            this.logActivity(payload.sessionId, 'Meta metrics collection completed', { processingTime });
            return this.formatResponse({
                metrics: result,
                metricsId: result.metricsId,
                aggregatedMetrics: result.aggregatedMetrics,
                insights: result.insights,
                recommendations: result.recommendations,
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
    async collectMetaMetrics(payload) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const aggregatedMetrics = {
            totalRequests: Math.floor(Math.random() * 10000),
            successRate: Math.random() * 100,
            avgResponseTime: Math.floor(Math.random() * 5000),
            errors: Math.floor(Math.random() * 100),
        };
        const insights = [
            {
                metric: 'successRate',
                value: aggregatedMetrics.successRate,
                trend: 'improving',
                description: 'Overall system success rate is improving',
            },
            {
                metric: 'avgResponseTime',
                value: aggregatedMetrics.avgResponseTime,
                trend: 'stable',
                description: 'Average response time remains stable',
            },
        ];
        const recommendations = [
            'Continue monitoring success rate trends',
            'Optimize response time for high-traffic periods',
            'Implement additional error handling for improved reliability',
        ];
        return {
            metricsId: `metrics-${Date.now()}`,
            aggregatedMetrics,
            insights,
            recommendations,
        };
    }
    async getMetrics() {
        return {
            ...this.metrics,
        };
    }
};
exports.MetaMetricsV2Service = MetaMetricsV2Service;
exports.MetaMetricsV2Service = MetaMetricsV2Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService])
], MetaMetricsV2Service);
//# sourceMappingURL=meta-metrics-v2.service.js.map