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
exports.OrchestratorDashboardV1Controller = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const orchestrator_metrics_service_1 = require("../../../../common/orchestrator/orchestrator-metrics.service");
const swagger_1 = require("@nestjs/swagger");
let OrchestratorDashboardV1Controller = class OrchestratorDashboardV1Controller {
    constructor(metricsService) {
        this.metricsService = metricsService;
    }
    async getDashboard() {
        return this.getDashboardData();
    }
    sse() {
        return (0, rxjs_1.interval)(5000).pipe((0, rxjs_1.map)(async () => {
            const data = await this.getDashboardData();
            return { data };
        }));
    }
    async getDashboardData() {
        const metrics = await this.metricsService.getMetrics();
        const successRate = metrics.workflowsExecuted > 0
            ? (metrics.successfulWorkflows / metrics.workflowsExecuted) * 100
            : 0;
        const topAgents = Object.entries(metrics.agentMetrics)
            .sort(([, a], [, b]) => b.executions - a.executions)
            .slice(0, 5)
            .map(([name, agentMetrics]) => ({
            name,
            executions: agentMetrics.executions,
            successRate: agentMetrics.successRate,
            averageResponseTime: agentMetrics.averageResponseTime,
            errors: agentMetrics.errors,
        }));
        const agentHealthScore = topAgents.length > 0
            ? topAgents.reduce((sum, agent) => sum + agent.successRate, 0) / topAgents.length
            : 100;
        return {
            overview: {
                workflowsExecuted: metrics.workflowsExecuted,
                successfulWorkflows: metrics.successfulWorkflows,
                failedWorkflows: metrics.failedWorkflows,
                successRate: parseFloat(successRate.toFixed(2)),
                averageExecutionTime: metrics.averageExecutionTime,
                lastUpdated: metrics.lastUpdated,
            },
            agentPerformance: {
                healthScore: parseFloat(agentHealthScore.toFixed(2)),
                topPerformers: topAgents,
            },
            systemStatus: {
                status: metrics.failedWorkflows === 0 ? 'healthy' :
                    metrics.failedWorkflows < 5 ? 'degraded' : 'unhealthy',
                lastUpdated: metrics.lastUpdated,
            },
        };
    }
};
exports.OrchestratorDashboardV1Controller = OrchestratorDashboardV1Controller;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get orchestrator dashboard data',
        description: 'Retrieve comprehensive dashboard data for orchestrator monitoring',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Dashboard data retrieved successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrchestratorDashboardV1Controller.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Sse)('live'),
    (0, swagger_1.ApiOperation)({
        summary: 'Stream live orchestrator metrics',
        description: 'Stream real-time orchestrator metrics via Server-Sent Events',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Live metrics stream',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", rxjs_1.Observable)
], OrchestratorDashboardV1Controller.prototype, "sse", null);
exports.OrchestratorDashboardV1Controller = OrchestratorDashboardV1Controller = __decorate([
    (0, swagger_1.ApiTags)('orchestrator'),
    (0, common_1.Controller)('orchestrator/dashboard'),
    __metadata("design:paramtypes", [orchestrator_metrics_service_1.OrchestratorMetricsService])
], OrchestratorDashboardV1Controller);
//# sourceMappingURL=orchestrator-dashboard-v1.controller.js.map