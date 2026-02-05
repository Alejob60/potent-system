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
exports.Sprint3Controller = void 0;
const common_1 = require("@nestjs/common");
const viralization_pipeline_service_1 = require("../services/viralization-pipeline/viralization-pipeline.service");
const heartbeat_monitoring_service_1 = require("../services/heartbeat-monitoring/heartbeat-monitoring.service");
let Sprint3Controller = class Sprint3Controller {
    constructor(pipelineService, monitoringService) {
        this.pipelineService = pipelineService;
        this.monitoringService = monitoringService;
    }
    async executeViralizationPipeline(body) {
        const { tenantId = 'default-tenant', sessionId = `session-${Date.now()}`, userId, inputData } = body;
        try {
            const result = await this.pipelineService.executeViralizationPipeline(tenantId, sessionId, inputData, userId);
            return {
                success: true,
                message: 'Pipeline de viralización ejecutado exitosamente',
                result
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error ejecutando pipeline de viralización'
            };
        }
    }
    async getPipelineExecution(executionId) {
        try {
            const execution = await this.pipelineService.getPipelineExecution(executionId);
            if (!execution) {
                return {
                    success: false,
                    message: 'Ejecución no encontrada'
                };
            }
            return {
                success: true,
                execution
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getTenantExecutions(tenantId) {
        try {
            const executions = await this.pipelineService.getTenantExecutions(tenantId);
            return {
                success: true,
                executions,
                count: executions.length
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getPipelineMetrics() {
        try {
            const metrics = await this.pipelineService.getPipelineMetrics();
            return {
                success: true,
                metrics
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getSystemHealth() {
        try {
            const health = await this.monitoringService.getSystemHealth();
            return {
                success: true,
                health
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getAlertStats() {
        try {
            const stats = await this.monitoringService.getAlertStats();
            return {
                success: true,
                stats
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getAgentHistory(agentId, hours = '24') {
        try {
            const history = await this.monitoringService.getAgentHistory(agentId, parseInt(hours));
            if (!history) {
                return {
                    success: false,
                    message: 'Agente no encontrado'
                };
            }
            return {
                success: true,
                history
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    async simulateAgentHeartbeat(agentId, body) {
        try {
            const heartbeatData = {
                agentName: body.agentName || agentId,
                responseTime: body.responseTime || Math.floor(Math.random() * 1000),
                timestamp: Date.now(),
                metrics: body.metrics || {
                    requestsProcessed: 1,
                    successRate: 99.5,
                    avgResponseTime: 150,
                    errorRate: 0.5,
                    memoryUsage: Math.floor(Math.random() * 500) + 100,
                    cpuUsage: Math.floor(Math.random() * 50) + 10
                }
            };
            await this.monitoringService.processHeartbeat(agentId, heartbeatData);
            return {
                success: true,
                message: `Heartbeat procesado para agente ${agentId}`
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    async simulateAgentError(agentId, body) {
        try {
            const error = new Error(body.message || 'Error simulado del agente');
            await this.monitoringService.processAgentError(agentId, error);
            return {
                success: true,
                message: `Error procesado para agente ${agentId}`
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    async testSimplePipeline(body) {
        const testData = {
            tenantId: body.tenantId || 'test-tenant',
            sessionId: body.sessionId || `test-session-${Date.now()}`,
            inputData: {
                topics: ['technology', 'innovation'],
                platforms: ['instagram', 'tiktok'],
                style: 'educational',
                duration: 60
            }
        };
        try {
            const result = await this.pipelineService.executeViralizationPipeline(testData.tenantId, testData.sessionId, testData.inputData);
            return {
                success: true,
                message: 'Pipeline de prueba ejecutado exitosamente',
                testData,
                result
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                testData
            };
        }
    }
    async getDemoStatus() {
        try {
            const pipelineMetrics = await this.pipelineService.getPipelineMetrics();
            const systemHealth = await this.monitoringService.getSystemHealth();
            const alertStats = await this.monitoringService.getAlertStats();
            return {
                success: true,
                timestamp: new Date().toISOString(),
                services: {
                    pipeline: {
                        status: 'operational',
                        metrics: pipelineMetrics
                    },
                    monitoring: {
                        status: 'operational',
                        health: systemHealth.overallStatus,
                        alerts: alertStats.activeAlerts
                    }
                },
                message: 'Todos los servicios del Sprint 3 están operativos'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
};
exports.Sprint3Controller = Sprint3Controller;
__decorate([
    (0, common_1.Post)('pipeline/execute'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], Sprint3Controller.prototype, "executeViralizationPipeline", null);
__decorate([
    (0, common_1.Get)('pipeline/execution/:executionId'),
    __param(0, (0, common_1.Param)('executionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], Sprint3Controller.prototype, "getPipelineExecution", null);
__decorate([
    (0, common_1.Get)('pipeline/executions/tenant/:tenantId'),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], Sprint3Controller.prototype, "getTenantExecutions", null);
__decorate([
    (0, common_1.Get)('pipeline/metrics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Sprint3Controller.prototype, "getPipelineMetrics", null);
__decorate([
    (0, common_1.Get)('monitoring/health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Sprint3Controller.prototype, "getSystemHealth", null);
__decorate([
    (0, common_1.Get)('monitoring/alerts/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Sprint3Controller.prototype, "getAlertStats", null);
__decorate([
    (0, common_1.Get)('monitoring/agent/:agentId/history'),
    __param(0, (0, common_1.Param)('agentId')),
    __param(1, (0, common_1.Query)('hours')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], Sprint3Controller.prototype, "getAgentHistory", null);
__decorate([
    (0, common_1.Post)('monitoring/agent/:agentId/heartbeat'),
    __param(0, (0, common_1.Param)('agentId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], Sprint3Controller.prototype, "simulateAgentHeartbeat", null);
__decorate([
    (0, common_1.Post)('monitoring/agent/:agentId/error'),
    __param(0, (0, common_1.Param)('agentId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], Sprint3Controller.prototype, "simulateAgentError", null);
__decorate([
    (0, common_1.Post)('pipeline/test'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], Sprint3Controller.prototype, "testSimplePipeline", null);
__decorate([
    (0, common_1.Get)('demo/status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Sprint3Controller.prototype, "getDemoStatus", null);
exports.Sprint3Controller = Sprint3Controller = __decorate([
    (0, common_1.Controller)('sprint3'),
    __metadata("design:paramtypes", [viralization_pipeline_service_1.ViralizationPipelineService,
        heartbeat_monitoring_service_1.HeartbeatMonitoringService])
], Sprint3Controller);
//# sourceMappingURL=sprint3.controller.js.map