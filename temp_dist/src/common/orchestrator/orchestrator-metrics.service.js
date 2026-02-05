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
var OrchestratorMetricsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestratorMetricsService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../common/redis/redis.service");
let OrchestratorMetricsService = OrchestratorMetricsService_1 = class OrchestratorMetricsService {
    constructor(redisService) {
        this.redisService = redisService;
        this.logger = new common_1.Logger(OrchestratorMetricsService_1.name);
        this.METRICS_KEY = 'orchestrator:metrics';
        this.EXECUTIONS_KEY = 'orchestrator:executions';
    }
    async recordWorkflowExecution(executionRecord) {
        try {
            const executionKey = `${this.EXECUTIONS_KEY}:${executionRecord.workflowId}`;
            await this.redisService.set(executionKey, JSON.stringify(executionRecord), 86400);
            const currentMetrics = await this.getMetrics();
            currentMetrics.workflowsExecuted++;
            if (executionRecord.status === 'success') {
                currentMetrics.successfulWorkflows++;
            }
            else {
                currentMetrics.failedWorkflows++;
            }
            const totalExecutions = currentMetrics.workflowsExecuted;
            const currentAverage = currentMetrics.averageExecutionTime;
            currentMetrics.averageExecutionTime =
                ((currentAverage * (totalExecutions - 1)) + executionRecord.duration) / totalExecutions;
            for (const agentExecution of executionRecord.agentExecutions) {
                if (!currentMetrics.agentMetrics[agentExecution.agent]) {
                    currentMetrics.agentMetrics[agentExecution.agent] = {
                        executions: 0,
                        successRate: 100,
                        averageResponseTime: 0,
                        errors: 0,
                        lastExecution: new Date(),
                    };
                }
                const agentMetric = currentMetrics.agentMetrics[agentExecution.agent];
                agentMetric.executions++;
                agentMetric.lastExecution = new Date();
                if (agentExecution.status === 'success') {
                    const total = agentMetric.executions;
                    const successes = agentMetric.executions - agentMetric.errors;
                    agentMetric.successRate = (successes / total) * 100;
                    const currentAvg = agentMetric.averageResponseTime;
                    agentMetric.averageResponseTime =
                        ((currentAvg * (agentMetric.executions - 1)) + agentExecution.duration) / agentMetric.executions;
                }
                else {
                    agentMetric.errors++;
                    const total = agentMetric.executions;
                    const successes = agentMetric.executions - agentMetric.errors;
                    agentMetric.successRate = (successes / total) * 100;
                }
            }
            currentMetrics.lastUpdated = new Date();
            await this.redisService.set(this.METRICS_KEY, JSON.stringify(currentMetrics));
            this.logger.log(`Recorded workflow execution: ${executionRecord.workflowId}`);
        }
        catch (error) {
            this.logger.error(`Failed to record workflow execution: ${error.message}`);
        }
    }
    async getMetrics() {
        try {
            const metricsData = await this.redisService.get(this.METRICS_KEY);
            if (metricsData) {
                return JSON.parse(metricsData);
            }
        }
        catch (error) {
            this.logger.error(`Failed to get metrics: ${error.message}`);
        }
        return {
            workflowsExecuted: 0,
            successfulWorkflows: 0,
            failedWorkflows: 0,
            averageExecutionTime: 0,
            agentMetrics: {},
            lastUpdated: new Date(),
        };
    }
    async getRecentExecutions(limit = 50) {
        try {
            return [];
        }
        catch (error) {
            this.logger.error(`Failed to get recent executions: ${error.message}`);
            return [];
        }
    }
    async resetMetrics() {
        try {
            await this.redisService.del(this.METRICS_KEY);
            this.logger.log('Metrics reset successfully');
        }
        catch (error) {
            this.logger.error(`Failed to reset metrics: ${error.message}`);
        }
    }
    async getAgentMetrics(agentName) {
        try {
            const metrics = await this.getMetrics();
            return metrics.agentMetrics[agentName] || null;
        }
        catch (error) {
            this.logger.error(`Failed to get agent metrics for ${agentName}: ${error.message}`);
            return null;
        }
    }
    async getWorkflowExecution(workflowId) {
        try {
            const executionKey = `${this.EXECUTIONS_KEY}:${workflowId}`;
            const executionData = await this.redisService.get(executionKey);
            if (executionData) {
                return JSON.parse(executionData);
            }
            return null;
        }
        catch (error) {
            this.logger.error(`Failed to get workflow execution ${workflowId}: ${error.message}`);
            return null;
        }
    }
};
exports.OrchestratorMetricsService = OrchestratorMetricsService;
exports.OrchestratorMetricsService = OrchestratorMetricsService = OrchestratorMetricsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], OrchestratorMetricsService);
//# sourceMappingURL=orchestrator-metrics.service.js.map