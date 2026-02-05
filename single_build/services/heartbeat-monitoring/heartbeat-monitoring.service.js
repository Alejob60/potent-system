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
    eventEmitter;
    logger = new common_1.Logger(HeartbeatMonitoringService_1.name);
    agents = new Map();
    alerts = [];
    HEALTH_CHECK_INTERVAL = 30000; // 30 segundos
    ALERT_CLEANUP_INTERVAL = 300000; // 5 minutos
    monitoringInterval;
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this.initializeMonitoring();
    }
    /**
     * Inicializa el sistema de monitoreo
     */
    initializeMonitoring() {
        this.logger.log('Iniciando sistema de monitoreo de heartbeat');
        // Iniciar intervalo de health checks
        this.monitoringInterval = setInterval(() => this.performHealthChecks(), this.HEALTH_CHECK_INTERVAL);
        // Iniciar limpieza de alertas antiguas
        setInterval(() => this.cleanupResolvedAlerts(), this.ALERT_CLEANUP_INTERVAL);
        // Registrar listeners para eventos de sistema
        this.registerEventListeners();
    }
    /**
     * Registra listeners para eventos del sistema
     */
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
    /**
     * Procesa un heartbeat recibido de un agente
     */
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
            // Generar alertas si es necesario
            await this.evaluateAndGenerateAlerts(agentStatus);
            // Emitir evento de actualización
            this.eventEmitter.emit('agent.health.updated', agentStatus);
            this.logger.debug(`Heartbeat procesado para agente ${agentId}: ${agentStatus.status}`);
        }
        catch (error) {
            this.logger.error(`Error procesando heartbeat para agente ${agentId}: ${error.message}`);
        }
    }
    /**
     * Procesa un error de agente
     */
    async processAgentError(agentId, error) {
        const agent = this.agents.get(agentId);
        if (agent) {
            agent.errorCount++;
            agent.lastError = error.message;
            agent.status = 'degraded';
            this.agents.set(agentId, agent);
            // Generar alerta de error
            await this.createAlert('critical', `Error en agente ${agentId}: ${error.message}`, agentId);
        }
    }
    /**
     * Procesa eventos del pipeline
     */
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
    /**
     * Determina el estado de un agente basado en sus métricas
     */
    determineAgentStatus(heartbeatData) {
        const responseTime = heartbeatData.responseTime || 0;
        const errorRate = heartbeatData.metrics?.errorRate || 0;
        const successRate = heartbeatData.metrics?.successRate || 100;
        // Offline si no hay respuesta en 2 minutos
        if (Date.now() - (heartbeatData.timestamp || Date.now()) > 120000) {
            return 'offline';
        }
        // Unhealthy si tiempo de respuesta > 5 segundos o tasa de error > 10%
        if (responseTime > 5000 || errorRate > 10) {
            return 'unhealthy';
        }
        // Degradado si tiempo de respuesta > 2 segundos o tasa de éxito < 95%
        if (responseTime > 2000 || successRate < 95) {
            return 'degraded';
        }
        return 'healthy';
    }
    /**
     * Actualiza las métricas de un agente
     */
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
    /**
     * Calcula el promedio ponderado del tiempo de respuesta
     */
    calculateAverageResponseTime(currentAvg, currentCount, newResponseTime) {
        if (currentCount === 0)
            return newResponseTime;
        return ((currentAvg * currentCount) + newResponseTime) / (currentCount + 1);
    }
    /**
     * Realiza health checks sistemáticos a todos los agentes
     */
    async performHealthChecks() {
        this.logger.debug('Realizando health checks sistemáticos');
        const currentTime = new Date();
        const offlineThreshold = 120000; // 2 minutos
        for (const [agentId, agent] of this.agents.entries()) {
            const timeSinceLastPing = currentTime.getTime() - agent.lastPing.getTime();
            // Marcar como offline si no hay ping en 2 minutos
            if (timeSinceLastPing > offlineThreshold && agent.status !== 'offline') {
                agent.status = 'offline';
                this.agents.set(agentId, agent);
                await this.createAlert('warning', `Agente ${agent.agentName} está offline por más de 2 minutos`, agentId);
            }
            // Limpiar métricas antiguas
            if (timeSinceLastPing > 3600000) { // 1 hora
                agent.metrics.lastHourRequests = 0;
                this.agents.set(agentId, agent);
            }
        }
        // Emitir estado del sistema
        const systemHealth = await this.getSystemHealth();
        this.eventEmitter.emit('system.health.updated', systemHealth);
    }
    /**
     * Evalúa y genera alertas basadas en el estado de los agentes
     */
    async evaluateAndGenerateAlerts(agent) {
        const now = new Date();
        // Alerta crítica: agente unhealthy
        if (agent.status === 'unhealthy') {
            await this.createAlert('critical', `Agente ${agent.agentName} en estado unhealthy`, agent.agentId);
        }
        // Alerta warning: agente degraded
        else if (agent.status === 'degraded') {
            await this.createAlert('warning', `Agente ${agent.agentName} en estado degradado`, agent.agentId);
        }
        // Alerta info: alta tasa de errores
        if (agent.errorCount > 10 && agent.status !== 'unhealthy') {
            await this.createAlert('info', `Agente ${agent.agentName} tiene alta tasa de errores (${agent.errorCount})`, agent.agentId);
        }
        // Alerta warning: tiempo de respuesta alto
        if (agent.responseTime > 3000) {
            await this.createAlert('warning', `Agente ${agent.agentName} tiene tiempo de respuesta alto (${agent.responseTime}ms)`, agent.agentId);
        }
    }
    /**
     * Crea una nueva alerta
     */
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
        // Emitir evento de alerta
        this.eventEmitter.emit('health.alert.created', alert);
        this.logger.log(`Alerta creada [${severity.toUpperCase()}]: ${message}`);
    }
    /**
     * Resuelve una alerta
     */
    async resolveAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert && !alert.resolved) {
            alert.resolved = true;
            this.eventEmitter.emit('health.alert.resolved', alert);
            return true;
        }
        return false;
    }
    /**
     * Limpia alertas resueltas antiguas
     */
    cleanupResolvedAlerts() {
        const cutoffTime = new Date(Date.now() - 86400000); // 24 horas atrás
        const initialLength = this.alerts.length;
        const filteredAlerts = this.alerts.filter(alert => {
            return !alert.resolved || alert.timestamp > cutoffTime;
        });
        if (filteredAlerts.length < initialLength) {
            this.alerts.splice(0, this.alerts.length, ...filteredAlerts);
            this.logger.debug(`Limpiadas ${initialLength - filteredAlerts.length} alertas antiguas`);
        }
    }
    /**
     * Obtiene el estado de salud completo del sistema
     */
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
    /**
     * Calcula el estado general del sistema
     */
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
    /**
     * Calcula métricas del sistema agregadas
     */
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
            diskUsage: 0 // Implementar si se necesita monitoreo de disco
        };
    }
    /**
     * Obtiene alertas activas (no resueltas)
     */
    getActiveAlerts() {
        return this.alerts.filter(alert => !alert.resolved);
    }
    /**
     * Obtiene métricas históricas de un agente
     */
    async getAgentHistory(agentId, hours = 24) {
        // Esta sería la implementación para obtener datos históricos
        // En una implementación real, estos datos se almacenarían en una base de datos de series temporales
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
    /**
     * Obtiene estadísticas de alertas
     */
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
            recentAlerts: activeAlerts.slice(0, 10) // Últimas 10 alertas
        };
    }
    /**
     * Cierra el servicio de monitoreo
     */
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
