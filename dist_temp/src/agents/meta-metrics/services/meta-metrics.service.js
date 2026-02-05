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
var MetaMetricsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaMetricsService = void 0;
const common_1 = require("@nestjs/common");
const state_management_service_1 = require("../../../state/state-management.service");
const websocket_gateway_1 = require("../../../websocket/websocket.gateway");
const agent_analytics_reporter_service_1 = require("../../agent-analytics-reporter/services/agent-analytics-reporter.service");
let MetaMetricsService = MetaMetricsService_1 = class MetaMetricsService {
    constructor(stateManager, websocketGateway, analyticsReporter) {
        this.stateManager = stateManager;
        this.websocketGateway = websocketGateway;
        this.analyticsReporter = analyticsReporter;
        this.logger = new common_1.Logger(MetaMetricsService_1.name);
        this.agentesRegistrados = [
            'trend-scanner',
            'video-scriptor',
            'faq-responder',
            'post-scheduler',
            'analytics-reporter',
            'front-desk',
        ];
        this.historicoMetricas = [];
    }
    async getAggregateMetrics() {
        this.logger.log('Obteniendo m tricas agregadas de todos los agentes');
        const metricsCollection = {};
        for (const agent of this.agentesRegistrados) {
            metricsCollection[agent] = await this.getAgentMetrics(agent);
        }
        const compositeMetrics = this.generateCompositeMetrics(metricsCollection);
        const metricaHistorica = {
            timestamp: new Date().toISOString(),
            metrics: metricsCollection,
            compositeMetrics,
        };
        this.historicoMetricas.push(metricaHistorica);
        if (this.historicoMetricas.length > 100) {
            this.historicoMetricas.shift();
        }
        return metricaHistorica;
    }
    async getAgentMetrics(agent) {
        this.logger.log(`Obteniendo m tricas para el agente: ${agent}`);
        if (agent === 'analytics-reporter') {
            try {
                const reports = await this.analyticsReporter.findAll();
                return {
                    agent,
                    metrics: {
                        reportsGenerated: reports.length,
                        dataPoints: reports.reduce((sum, report) => sum + (report.reportData?.stats?.length || 0), 0),
                        lastReport: reports.length > 0 ? reports[reports.length - 1].createdAt : null,
                    },
                    reports,
                };
            }
            catch (error) {
                this.logger.error(`Error obteniendo m tricas de analytics-reporter: ${error.message}`);
            }
        }
        const metrics = {
            requestsProcessed: Math.floor(Math.random() * 1000),
            successRate: Math.random() * 100,
            avgResponseTime: Math.floor(Math.random() * 5000),
            errors: Math.floor(Math.random() * 50),
            lastActive: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString(),
        };
        return {
            agent,
            metrics,
        };
    }
    async generateInsights(params) {
        this.logger.log('Generando insights a partir de m tricas');
        const aggregateMetrics = await this.getAggregateMetrics();
        let comparacionHistorica = null;
        if (params.compareWithHistorical) {
            comparacionHistorica = this.compararConHistorico(aggregateMetrics);
        }
        const insights = this.calculateAdvancedMetrics(aggregateMetrics);
        this.websocketGateway.broadcastSystemNotification({
            type: 'metrics_insights',
            data: {
                ...insights,
                historicalComparison: comparacionHistorica,
            },
            timestamp: new Date().toISOString(),
        });
        return {
            status: 'success',
            insights,
            historicalComparison: comparacionHistorica,
            timestamp: new Date().toISOString(),
        };
    }
    compararConHistorico(metricasActuales) {
        this.logger.log('Comparando m tricas con hist rico');
        if (this.historicoMetricas.length === 0) {
            return {
                message: 'No hay datos hist ricos para comparar',
            };
        }
        const metricasHistoricas = this.historicoMetricas[this.historicoMetricas.length - 1];
        const comparacion = {
            viralResonanceIndex: {
                actual: metricasActuales.compositeMetrics.viralResonanceIndex,
                historico: metricasHistoricas.compositeMetrics.viralResonanceIndex,
                cambio: metricasActuales.compositeMetrics.viralResonanceIndex -
                    metricasHistoricas.compositeMetrics.viralResonanceIndex,
            },
            emotionalActivationRate: {
                actual: metricasActuales.compositeMetrics.emotionalActivationRate,
                historico: metricasHistoricas.compositeMetrics.emotionalActivationRate,
                cambio: metricasActuales.compositeMetrics.emotionalActivationRate -
                    metricasHistoricas.compositeMetrics.emotionalActivationRate,
            },
        };
        const result = {
            comparisonPeriod: metricasHistoricas.timestamp,
            metrics: comparacion,
            improvement: comparacion.viralResonanceIndex.cambio > 0 &&
                comparacion.emotionalActivationRate.cambio > 0,
        };
        return result;
    }
    generateCompositeMetrics(metricsCollection) {
        this.logger.log('Generando m tricas compuestas');
        const viralResonanceIndex = this.calculateViralResonanceIndex(metricsCollection);
        const emotionalActivationRate = this.calculateEmotionalActivationRate(metricsCollection);
        const contentScalabilityCurve = this.calculateContentScalabilityCurve(metricsCollection);
        return {
            viralResonanceIndex,
            emotionalActivationRate,
            contentScalabilityCurve,
        };
    }
    calculateViralResonanceIndex(metricsCollection) {
        let totalResonance = 0;
        let agentCount = 0;
        for (const agent in metricsCollection) {
            const metrics = metricsCollection[agent].metrics;
            if (metrics &&
                metrics.successRate !== undefined &&
                metrics.avgResponseTime !== undefined &&
                metrics.lastActive) {
                const resonance = (metrics.successRate / 100) * 0.5 +
                    (1 - metrics.avgResponseTime / 5000) * 0.3 +
                    ((new Date().getTime() - new Date(metrics.lastActive).getTime()) /
                        (24 * 3600 * 1000)) *
                        0.2;
                totalResonance += Math.max(0, resonance);
                agentCount++;
            }
        }
        return agentCount > 0 ? totalResonance / agentCount : 0;
    }
    calculateEmotionalActivationRate(metricsCollection) {
        const emotionalAgents = ['faq-responder', 'front-desk'];
        let totalActivation = 0;
        let count = 0;
        for (const agent of emotionalAgents) {
            if (metricsCollection[agent]) {
                const metrics = metricsCollection[agent].metrics;
                if (metrics &&
                    metrics.successRate !== undefined &&
                    metrics.avgResponseTime !== undefined) {
                    const activation = (metrics.successRate / 100) * 0.7 +
                        (1 - metrics.avgResponseTime / 5000) * 0.3;
                    totalActivation += Math.max(0, activation);
                    count++;
                }
            }
        }
        return count > 0 ? totalActivation / count : 0;
    }
    calculateContentScalabilityCurve(metricsCollection) {
        const contentAgents = ['trend-scanner', 'video-scriptor', 'post-scheduler'];
        const scalabilityMetrics = {};
        for (const agent of contentAgents) {
            if (metricsCollection[agent]) {
                const metrics = metricsCollection[agent].metrics;
                if (metrics &&
                    metrics.requestsProcessed !== undefined &&
                    metrics.successRate !== undefined) {
                    scalabilityMetrics[agent] = {
                        processingCapacity: metrics.requestsProcessed,
                        efficiency: metrics.successRate,
                        scalabilityScore: (metrics.requestsProcessed / 1000) * (metrics.successRate / 100),
                    };
                }
            }
        }
        return scalabilityMetrics;
    }
    calculateAdvancedMetrics(aggregateMetrics) {
        const insights = {
            systemHealth: this.calculateSystemHealth(aggregateMetrics),
            performanceTrends: this.calculatePerformanceTrends(aggregateMetrics),
            bottleneckDetection: this.detectBottlenecks(aggregateMetrics),
            optimizationRecommendations: this.generateOptimizationRecommendations(aggregateMetrics),
        };
        return insights;
    }
    calculateSystemHealth(aggregateMetrics) {
        const totalErrors = Object.values(aggregateMetrics.metrics).reduce((sum, agentMetrics) => sum + (agentMetrics.metrics?.errors || 0), 0);
        const totalRequests = Object.values(aggregateMetrics.metrics).reduce((sum, agentMetrics) => sum + (agentMetrics.metrics?.requestsProcessed || 0), 0);
        const errorRate = totalRequests > 0 ? totalErrors / totalRequests : 0;
        return {
            healthScore: Math.max(0, 100 - errorRate * 100),
            errorRate: errorRate * 100,
            totalErrors,
            totalRequests,
        };
    }
    calculatePerformanceTrends(aggregateMetrics) {
        const validMetrics = Object.values(aggregateMetrics.metrics).filter((agentMetrics) => agentMetrics.metrics?.avgResponseTime !== undefined);
        if (validMetrics.length === 0) {
            return {
                avgResponseTime: 0,
                trend: 'unknown',
            };
        }
        const avgResponseTime = validMetrics.reduce((sum, agentMetrics) => sum + agentMetrics.metrics.avgResponseTime, 0) / validMetrics.length;
        return {
            avgResponseTime,
            trend: avgResponseTime < 2000
                ? 'improving'
                : avgResponseTime < 4000
                    ? 'stable'
                    : 'degrading',
        };
    }
    detectBottlenecks(aggregateMetrics) {
        const bottlenecks = [];
        for (const [agent, metricsData] of Object.entries(aggregateMetrics.metrics)) {
            const metrics = metricsData;
            if (metrics.metrics?.avgResponseTime > 4000 ||
                metrics.metrics?.successRate < 80) {
                bottlenecks.push({
                    agent,
                    issue: metrics.metrics.avgResponseTime > 4000
                        ? 'high_response_time'
                        : 'low_success_rate',
                    value: metrics.metrics.avgResponseTime > 4000
                        ? metrics.metrics.avgResponseTime
                        : metrics.metrics.successRate,
                });
            }
        }
        return bottlenecks;
    }
    generateOptimizationRecommendations(aggregateMetrics) {
        const recommendations = [];
        const systemHealth = this.calculateSystemHealth(aggregateMetrics);
        if (systemHealth.errorRate > 5) {
            recommendations.push({
                type: 'error_reduction',
                priority: 'high',
                description: 'Tasa de error alta detectada. Revisar logs de agentes.',
            });
        }
        const performanceTrends = this.calculatePerformanceTrends(aggregateMetrics);
        if (performanceTrends.trend === 'degrading') {
            recommendations.push({
                type: 'performance_optimization',
                priority: 'medium',
                description: 'Tiempo de respuesta degrad ndose. Considerar escalado horizontal.',
            });
        }
        return recommendations;
    }
};
exports.MetaMetricsService = MetaMetricsService;
exports.MetaMetricsService = MetaMetricsService = MetaMetricsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService,
        agent_analytics_reporter_service_1.AgentAnalyticsReporterService])
], MetaMetricsService);
//# sourceMappingURL=meta-metrics.service.js.map