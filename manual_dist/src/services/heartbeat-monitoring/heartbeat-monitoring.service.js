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
var HeartbeatMonitoringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatMonitoringService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const uuid_1 = require("uuid");
let HeartbeatMonitoringService = HeartbeatMonitoringService_1 = class HeartbeatMonitoringService {
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(HeartbeatMonitoringService_1.name);
        this.agents = new Map();
        this.alerts = [];
        this.HEALTH_CHECK_INTERVAL = 30000;
        this.ALERT_CLEANUP_INTERVAL = 300000;
        this.initializeMonitoring();
    }
    initializeMonitoring() {
        this.logger.log('Iniciando sistema de monitoreo de heartbeat');
        this.monitoringInterval = setInterval(() => this.performHealthChecks(), this.HEALTH_CHECK_INTERVAL);
        setInterval(() => this.cleanupResolvedAlerts(), this.ALERT_CLEANUP_INTERVAL);
        this.registerEventListeners();
    }
    registerEventListeners() {
        this.eventEmitter.on('agent.heartbeat', (agentId, data) => {
            this.processHeartbeat(agentId, data);
        });
        this.eventEmitter.on('agent.error', (agentId, error) => {
            this.processAgentError(agentId, error);
        });
        this.eventEmitter.on('pipeline.stage.completed', (stageData) => {
            this.processPipelineEvent('completed', stageData);
        });
        this.eventEmitter.on('pipeline.stage.failed', (stageData) => {
            this.processPipelineEvent('failed', stageData);
        });
    }
    async processHeartbeat(agentId, heartbeatData) {
        try {
            const currentTime = new Date();
            const existingAgent = this.agents.get(agentId);
            const agentStatus = {
                agentId,
                agentName: heartbeatData.agentName || agentId,
                status: this.determineAgentStatus(heartbeatData),
                lastPing: currentTime,
                responseTime: heartbeatData.responseTime || 0,
                uptime: existingAgent ? existingAgent.uptime + (this.HEALTH_CHECK_INTERVAL / 1000) : 0,
                errorCount: existingAgent ? existingAgent.errorCount : 0,
                metrics: this.updateAgentMetrics(existingAgent?.metrics, heartbeatData.metrics),
            };
            this.agents.set(agentId, agentStatus);
            await this.evaluateAndGenerateAlerts(agentStatus);
            this.eventEmitter.emit('agent.health.updated', agentStatus);
            this.logger.debug(`Heartbeat procesado para agente ${agentId}: ${agentStatus.status}`);
        }
        catch (error) {
            this.logger.error(`Error procesando heartbeat para agente ${agentId}: ${error.message}`);
        }
    }
    async processAgentError(agentId, error) {
        const agent = this.agents.get(agentId);
        if (agent) {
            agent.errorCount++;
            agent.lastError = error.message;
            agent.status = 'degraded';
            this.agents.set(agentId, agent);
            await this.createAlert('critical', `Error en agente ${agentId}: ${error.message}`, agentId);
        }
    }
    processPipelineEvent(eventType, stageData) {
        const agentId = `pipeline-${stageData.stageId}`;
        if (eventType === 'completed') {
            this.processHeartbeat(agentId, {
                agentName: `Pipeline Stage ${stageData.stageName}`,
                responseTime: stageData.duration,
                metrics: {
                    requestsProcessed: 1,
                    successRate: 100,
                    avgResponseTime: stageData.duration
                }
            });
        }
        else if (eventType === 'failed') {
            this.processAgentError(agentId, new Error(stageData.error));
        }
    }
    determineAgentStatus(heartbeatData) {
        const responseTime = heartbeatData.responseTime || 0;
        const errorRate = heartbeatData.metrics?.errorRate || 0;
        const successRate = heartbeatData.metrics?.successRate || 100;
        if (Date.now() - (heartbeatData.timestamp || Date.now()) > 120000) {
            return 'offline';
        }
        if (responseTime > 5000 || errorRate > 10) {
            return 'unhealthy';
        }
        if (responseTime > 2000 || successRate < 95) {
            return 'degraded';
        }
        return 'healthy';
    }
    updateAgentMetrics(currentMetrics, newMetrics) {
        const baseMetrics = currentMetrics || {
            requestsProcessed: 0,
            successRate: 100,
            avgResponseTime: 0,
            errorRate: 0,
            lastHourRequests: 0,
            memoryUsage: 0,
            cpuUsage: 0
        };
        return {
            requestsProcessed: baseMetrics.requestsProcessed + (newMetrics?.requestsProcessed || 1),
            successRate: newMetrics?.successRate ?? baseMetrics.successRate,
            avgResponseTime: this.calculateAverageResponseTime(baseMetrics.avgResponseTime, baseMetrics.requestsProcessed, newMetrics?.avgResponseTime || 0),
            errorRate: newMetrics?.errorRate ?? baseMetrics.errorRate,
            lastHourRequests: baseMetrics.lastHourRequests + (newMetrics?.requestsProcessed || 1),
            memoryUsage: newMetrics?.memoryUsage ?? baseMetrics.memoryUsage,
            cpuUsage: newMetrics?.cpuUsage ?? baseMetrics.cpuUsage
        };
    }
    calculateAverageResponseTime(currentAvg, currentCount, newResponseTime) {
        if (currentCount === 0)
            return newResponseTime;
        return ((currentAvg * currentCount) + newResponseTime) / (currentCount + 1);
    }
    async performHealthChecks() {
        this.logger.debug('Realizando health checks sistemáticos');
        const currentTime = new Date();
        const offlineThreshold = 120000;
        for (const [agentId, agent] of this.agents.entries()) {
            const timeSinceLastPing = currentTime.getTime() - agent.lastPing.getTime();
            if (timeSinceLastPing > offlineThreshold && agent.status !== 'offline') {
                agent.status = 'offline';
                this.agents.set(agentId, agent);
                await this.createAlert('warning', `Agente ${agent.agentName} está offline por más de 2 minutos`, agentId);
            }
            if (timeSinceLastPing > 3600000) {
                agent.metrics.lastHourRequests = 0;
                this.agents.set(agentId, agent);
            }
        }
        const systemHealth = await this.getSystemHealth();
        this.eventEmitter.emit('system.health.updated', systemHealth);
    }
    async evaluateAndGenerateAlerts(agent) {
        const now = new Date();
        if (agent.status === 'unhealthy') {
            await this.createAlert('critical', `Agente ${agent.agentName} en estado unhealthy`, agent.agentId);
        }
        else if (agent.status === 'degraded') {
            await this.createAlert('warning', `Agente ${agent.agentName} en estado degradado`, agent.agentId);
        }
        if (agent.errorCount > 10 && agent.status !== 'unhealthy') {
            await this.createAlert('info', `Agente ${agent.agentName} tiene alta tasa de errores (${agent.errorCount})`, agent.agentId);
        }
        if (agent.responseTime > 3000) {
            await this.createAlert('warning', `Agente ${agent.agentName} tiene tiempo de respuesta alto (${agent.responseTime}ms)`, agent.agentId);
        }
    }
    async createAlert(severity, message, agentId) {
        const alert = {
            id: `alert_${(0, uuid_1.v4)()}`,
            severity,
            message,
            agentId,
            timestamp: new Date(),
            resolved: false
        };
        this.alerts.push(alert);
        this.eventEmitter.emit('health.alert.created', alert);
        this.logger.log(`Alerta creada [${severity.toUpperCase()}]: ${message}`);
    }
    async resolveAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert && !alert.resolved) {
            alert.resolved = true;
            this.eventEmitter.emit('health.alert.resolved', alert);
            return true;
        }
        return false;
    }
    cleanupResolvedAlerts() {
        const cutoffTime = new Date(Date.now() - 86400000);
        const initialLength = this.alerts.length;
        const filteredAlerts = this.alerts.filter(alert => {
            return !alert.resolved || alert.timestamp > cutoffTime;
        });
        if (filteredAlerts.length < initialLength) {
            this.alerts.splice(0, this.alerts.length, ...filteredAlerts);
            this.logger.debug(`Limpiadas ${initialLength - filteredAlerts.length} alertas antiguas`);
        }
    }
    async getSystemHealth() {
        const agents = Array.from(this.agents.values());
        const healthyAgents = agents.filter(a => a.status === 'healthy').length;
        const totalAgents = agents.length;
        const overallStatus = this.calculateOverallSystemStatus(agents);
        return {
            overallStatus,
            timestamp: new Date(),
            agents,
            systemMetrics: this.calculateSystemMetrics(agents),
            alerts: this.getActiveAlerts()
        };
    }
    calculateOverallSystemStatus(agents) {
        if (agents.length === 0)
            return 'healthy';
        const unhealthyCount = agents.filter(a => a.status === 'unhealthy' || a.status === 'offline').length;
        const degradedCount = agents.filter(a => a.status === 'degraded').length;
        if (unhealthyCount > agents.length * 0.3)
            return 'unhealthy';
        if (degradedCount > agents.length * 0.5)
            return 'degraded';
        return 'healthy';
    }
    calculateSystemMetrics(agents) {
        if (agents.length === 0) {
            return {
                totalRequests: 0,
                avgResponseTime: 0,
                errorRate: 0,
                activeConnections: 0,
                memoryUsage: 0,
                cpuUsage: 0,
                diskUsage: 0
            };
        }
        const totalRequests = agents.reduce((sum, agent) => sum + agent.metrics.requestsProcessed, 0);
        const avgResponseTime = agents.reduce((sum, agent) => sum + agent.responseTime, 0) / agents.length;
        const errorRates = agents.map(agent => agent.metrics.errorRate);
        const avgErrorRate = errorRates.reduce((sum, rate) => sum + rate, 0) / errorRates.length;
        return {
            totalRequests,
            avgResponseTime: Math.round(avgResponseTime),
            errorRate: Math.round(avgErrorRate * 100) / 100,
            activeConnections: agents.length,
            memoryUsage: agents.reduce((sum, agent) => sum + agent.metrics.memoryUsage, 0),
            cpuUsage: agents.reduce((sum, agent) => sum + agent.metrics.cpuUsage, 0) / agents.length,
            diskUsage: 0
        };
    }
    getActiveAlerts() {
        return this.alerts.filter(alert => !alert.resolved);
    }
    async getAgentHistory(agentId, hours = 24) {
        const agent = this.agents.get(agentId);
        if (!agent)
            return null;
        return {
            agentId,
            agentName: agent.agentName,
            history: [
                {
                    timestamp: new Date(Date.now() - (hours * 3600000)),
                    status: agent.status,
                    responseTime: agent.responseTime,
                    metrics: { ...agent.metrics }
                }
            ]
        };
    }
    async getAlertStats() {
        const activeAlerts = this.getActiveAlerts();
        const resolvedAlerts = this.alerts.filter(a => a.resolved);
        const severityCounts = {
            critical: activeAlerts.filter(a => a.severity === 'critical').length,
            warning: activeAlerts.filter(a => a.severity === 'warning').length,
            info: activeAlerts.filter(a => a.severity === 'info').length
        };
        return {
            totalAlerts: this.alerts.length,
            activeAlerts: activeAlerts.length,
            resolvedAlerts: resolvedAlerts.length,
            severityCounts,
            recentAlerts: activeAlerts.slice(0, 10)
        };
    }
    async shutdown() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        this.logger.log('Servicio de monitoreo detenido');
    }
};
exports.HeartbeatMonitoringService = HeartbeatMonitoringService;
exports.HeartbeatMonitoringService = HeartbeatMonitoringService = HeartbeatMonitoringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2])
], HeartbeatMonitoringService);
//# sourceMappingURL=heartbeat-monitoring.service.js.map