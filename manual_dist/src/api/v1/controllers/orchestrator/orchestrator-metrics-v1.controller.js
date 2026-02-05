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
exports.OrchestratorMetricsV1Controller = void 0;
const common_1 = require("@nestjs/common");
const orchestrator_metrics_service_1 = require("../../../../common/orchestrator/orchestrator-metrics.service");
const swagger_1 = require("@nestjs/swagger");
let OrchestratorMetricsV1Controller = class OrchestratorMetricsV1Controller {
    constructor(metricsService) {
        this.metricsService = metricsService;
    }
    async getMetrics() {
        return this.metricsService.getMetrics();
    }
    async getAgentMetrics(agentName) {
        const metrics = await this.metricsService.getAgentMetrics(agentName);
        if (!metrics) {
            return { message: `Agent ${agentName} not found` };
        }
        return metrics;
    }
    async getWorkflowExecution(workflowId) {
        const execution = await this.metricsService.getWorkflowExecution(workflowId);
        if (!execution) {
            return { message: `Workflow ${workflowId} not found` };
        }
        return execution;
    }
    async getRecentExecutions(limit = 50) {
        return this.metricsService.getRecentExecutions(limit);
    }
    async getDashboard() {
        const metrics = await this.metricsService.getMetrics();
        const topAgents = Object.entries(metrics.agentMetrics)
            .sort(([, a], [, b]) => b.executions - a.executions)
            .slice(0, 5)
            .map(([name, metrics]) => ({
            name,
            ...metrics
        }));
        return {
            metrics: {
                workflowsExecuted: metrics.workflowsExecuted,
                successfulWorkflows: metrics.successfulWorkflows,
                failedWorkflows: metrics.failedWorkflows,
                averageExecutionTime: metrics.averageExecutionTime,
            },
            topAgents,
            recentExecutions: [],
        };
    }
};
exports.OrchestratorMetricsV1Controller = OrchestratorMetricsV1Controller;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get orchestrator metrics',
        description: 'Retrieve current orchestrator metrics including workflow and agent statistics',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Orchestrator metrics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                workflowsExecuted: { type: 'number' },
                successfulWorkflows: { type: 'number' },
                failedWorkflows: { type: 'number' },
                averageExecutionTime: { type: 'number' },
                agentMetrics: { type: 'object' },
                lastUpdated: { type: 'string', format: 'date-time' },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrchestratorMetricsV1Controller.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('agent/:agentName'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get metrics for a specific agent',
        description: 'Retrieve metrics for a specific agent including execution statistics',
    }),
    (0, swagger_1.ApiParam)({
        name: 'agentName',
        description: 'Name of the agent',
        example: 'trend-scanner',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Agent metrics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                executions: { type: 'number' },
                successRate: { type: 'number' },
                averageResponseTime: { type: 'number' },
                errors: { type: 'number' },
                lastExecution: { type: 'string', format: 'date-time' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Agent not found' }),
    __param(0, (0, common_1.Param)('agentName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrchestratorMetricsV1Controller.prototype, "getAgentMetrics", null);
__decorate([
    (0, common_1.Get)('workflow/:workflowId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get execution details for a specific workflow',
        description: 'Retrieve detailed execution information for a specific workflow',
    }),
    (0, swagger_1.ApiParam)({
        name: 'workflowId',
        description: 'ID of the workflow',
        example: 'workflow_1234567890',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Workflow execution details retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                workflowId: { type: 'string' },
                status: { type: 'string', enum: ['success', 'failure', 'partial'] },
                duration: { type: 'number' },
                startTime: { type: 'string', format: 'date-time' },
                endTime: { type: 'string', format: 'date-time' },
                agentExecutions: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            agent: { type: 'string' },
                            status: { type: 'string', enum: ['success', 'failure'] },
                            duration: { type: 'number' },
                            startTime: { type: 'string', format: 'date-time' },
                            endTime: { type: 'string', format: 'date-time' },
                            error: { type: 'string' },
                        },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Workflow not found' }),
    __param(0, (0, common_1.Param)('workflowId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrchestratorMetricsV1Controller.prototype, "getWorkflowExecution", null);
__decorate([
    (0, common_1.Get)('recent'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get recent workflow executions',
        description: 'Retrieve a list of recent workflow executions',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        description: 'Number of executions to return (default: 50)',
        type: Number,
        example: 10,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Recent workflow executions retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    workflowId: { type: 'string' },
                    status: { type: 'string', enum: ['success', 'failure', 'partial'] },
                    duration: { type: 'number' },
                    startTime: { type: 'string', format: 'date-time' },
                    endTime: { type: 'string', format: 'date-time' },
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)('limit', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrchestratorMetricsV1Controller.prototype, "getRecentExecutions", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get orchestrator dashboard data',
        description: 'Retrieve comprehensive dashboard data for orchestrator monitoring',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Dashboard data retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                metrics: {
                    type: 'object',
                    properties: {
                        workflowsExecuted: { type: 'number' },
                        successfulWorkflows: { type: 'number' },
                        failedWorkflows: { type: 'number' },
                        averageExecutionTime: { type: 'number' },
                    },
                },
                topAgents: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            executions: { type: 'number' },
                            successRate: { type: 'number' },
                            averageResponseTime: { type: 'number' },
                        },
                    },
                },
                recentExecutions: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            workflowId: { type: 'string' },
                            status: { type: 'string' },
                            duration: { type: 'number' },
                            timestamp: { type: 'string', format: 'date-time' },
                        },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrchestratorMetricsV1Controller.prototype, "getDashboard", null);
exports.OrchestratorMetricsV1Controller = OrchestratorMetricsV1Controller = __decorate([
    (0, swagger_1.ApiTags)('orchestrator'),
    (0, common_1.Controller)('orchestrator/metrics'),
    __metadata("design:paramtypes", [orchestrator_metrics_service_1.OrchestratorMetricsService])
], OrchestratorMetricsV1Controller);
//# sourceMappingURL=orchestrator-metrics-v1.controller.js.map