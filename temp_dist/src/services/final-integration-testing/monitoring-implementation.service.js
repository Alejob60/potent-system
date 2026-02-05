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
var MonitoringImplementationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringImplementationService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let MonitoringImplementationService = MonitoringImplementationService_1 = class MonitoringImplementationService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(MonitoringImplementationService_1.name);
        this.metrics = new Map();
        this.alerts = new Map();
        this.dashboards = new Map();
    }
    configure(config) {
        this.config = config;
        this.logger.log(`Monitoring service configured with ${config.metrics.length} metrics, ${config.alerts.length} alerts, and ${config.dashboards.length} dashboards`);
    }
    async startMonitoring() {
        this.logger.log('Starting monitoring service');
        for (const metric of this.config.metrics) {
            this.startMetricCollection(metric);
        }
        setInterval(() => {
            this.checkAlerts();
        }, 10000);
        for (const dashboard of this.config.dashboards) {
            this.refreshDashboard(dashboard.name);
            setInterval(() => {
                this.refreshDashboard(dashboard.name);
            }, dashboard.refreshInterval * 1000);
        }
        this.logger.log('Monitoring service started');
    }
    startMetricCollection(metric) {
        this.logger.log(`Starting metric collection for ${metric.name}`);
        setInterval(async () => {
            try {
                const value = await this.collectMetric(metric);
                this.storeMetric(metric.name, value);
            }
            catch (error) {
                this.logger.error(`Failed to collect metric ${metric.name}: ${error.message}`);
            }
        }, metric.interval * 1000);
    }
    async collectMetric(metric) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(metric.endpoint, {
                timeout: 5000,
            }));
            let value;
            switch (metric.type) {
                case 'counter':
                    value = response.data.value || response.data.count || 0;
                    break;
                case 'gauge':
                    value = response.data.value || response.data.current || 0;
                    break;
                case 'histogram':
                    value = response.data.value || response.data.average || 0;
                    break;
                case 'summary':
                    value = response.data.value || response.data.quantile || 0;
                    break;
                default:
                    value = 0;
            }
            return value;
        }
        catch (error) {
            this.logger.error(`Failed to collect metric from ${metric.endpoint}: ${error.message}`);
            return 0;
        }
    }
    storeMetric(name, value) {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        const dataPoints = this.metrics.get(name) || [];
        dataPoints.push({
            name,
            value,
            timestamp: new Date(),
        });
        if (dataPoints.length > 1000) {
            dataPoints.shift();
        }
        this.metrics.set(name, dataPoints);
    }
    async checkAlerts() {
        for (const alertConfig of this.config.alerts) {
            try {
                const currentValue = await this.getCurrentMetricValue(alertConfig.metric);
                const conditionMet = this.evaluateCondition(currentValue, alertConfig.condition.operator, alertConfig.condition.threshold);
                if (conditionMet) {
                    const existingAlert = Array.from(this.alerts.values()).find(alert => alert.name === alertConfig.name && alert.status === 'triggered');
                    if (!existingAlert) {
                        const alert = {
                            id: this.generateAlertId(),
                            name: alertConfig.name,
                            description: alertConfig.description,
                            metric: alertConfig.metric,
                            currentValue,
                            threshold: alertConfig.condition.threshold,
                            severity: alertConfig.severity,
                            triggeredAt: new Date(),
                            status: 'triggered',
                            notificationsSent: false,
                        };
                        this.alerts.set(alert.id, alert);
                        this.logger.warn(`Alert triggered: ${alert.name} (${alert.severity})`);
                        await this.sendNotifications(alertConfig, alert);
                        alert.notificationsSent = true;
                        this.alerts.set(alert.id, alert);
                    }
                }
                else {
                    const existingAlert = Array.from(this.alerts.values()).find(alert => alert.name === alertConfig.name && alert.status === 'triggered');
                    if (existingAlert) {
                        existingAlert.resolvedAt = new Date();
                        existingAlert.status = 'resolved';
                        this.alerts.set(existingAlert.id, existingAlert);
                        this.logger.log(`Alert resolved: ${existingAlert.name}`);
                    }
                }
            }
            catch (error) {
                this.logger.error(`Failed to check alert ${alertConfig.name}: ${error.message}`);
            }
        }
    }
    async getCurrentMetricValue(metricName) {
        const dataPoints = this.metrics.get(metricName) || [];
        if (dataPoints.length === 0) {
            const metricConfig = this.config.metrics.find(m => m.name === metricName);
            if (metricConfig) {
                return await this.collectMetric(metricConfig);
            }
            return 0;
        }
        return dataPoints[dataPoints.length - 1].value;
    }
    evaluateCondition(value, operator, threshold) {
        switch (operator) {
            case '>':
                return value > threshold;
            case '<':
                return value < threshold;
            case '>=':
                return value >= threshold;
            case '<=':
                return value <= threshold;
            case '==':
                return value === threshold;
            case '!=':
                return value !== threshold;
            default:
                return false;
        }
    }
    async sendNotifications(alertConfig, alert) {
        for (const notification of alertConfig.notifications) {
            try {
                switch (notification.channel) {
                    case 'email':
                        await this.sendEmailNotification(notification.target, alert);
                        break;
                    case 'slack':
                        await this.sendSlackNotification(notification.target, alert);
                        break;
                    case 'webhook':
                        await this.sendWebhookNotification(notification.target, alert);
                        break;
                    case 'sms':
                        await this.sendSmsNotification(notification.target, alert);
                        break;
                }
            }
            catch (error) {
                this.logger.error(`Failed to send ${notification.channel} notification: ${error.message}`);
            }
        }
    }
    async sendEmailNotification(target, alert) {
        this.logger.log(`Sending email notification to ${target} for alert ${alert.name}`);
    }
    async sendSlackNotification(target, alert) {
        this.logger.log(`Sending Slack notification to ${target} for alert ${alert.name}`);
    }
    async sendWebhookNotification(target, alert) {
        this.logger.log(`Sending webhook notification to ${target} for alert ${alert.name}`);
    }
    async sendSmsNotification(target, alert) {
        this.logger.log(`Sending SMS notification to ${target} for alert ${alert.name}`);
    }
    async refreshDashboard(dashboardName) {
        const dashboardConfig = this.config.dashboards.find(d => d.name === dashboardName);
        if (!dashboardConfig) {
            this.logger.warn(`Dashboard ${dashboardName} not found`);
            return;
        }
        const startTime = Date.now();
        this.logger.log(`Refreshing dashboard ${dashboardName}`);
        try {
            const metricsData = [];
            for (const metricName of dashboardConfig.metrics) {
                const dataPoints = this.metrics.get(metricName) || [];
                let aggregatedValue = 0;
                if (dataPoints.length > 0) {
                    const metricConfig = this.config.metrics.find(m => m.name === metricName);
                    if (metricConfig) {
                        switch (metricConfig.aggregation) {
                            case 'avg':
                                aggregatedValue = dataPoints.reduce((sum, point) => sum + point.value, 0) / dataPoints.length;
                                break;
                            case 'sum':
                                aggregatedValue = dataPoints.reduce((sum, point) => sum + point.value, 0);
                                break;
                            case 'min':
                                aggregatedValue = Math.min(...dataPoints.map(point => point.value));
                                break;
                            case 'max':
                                aggregatedValue = Math.max(...dataPoints.map(point => point.value));
                                break;
                            case 'count':
                                aggregatedValue = dataPoints.length;
                                break;
                        }
                    }
                }
                metricsData.push({
                    name: metricName,
                    data: dataPoints,
                    aggregatedValue,
                });
            }
            const loadTime = Date.now() - startTime;
            const dashboardData = {
                name: dashboardName,
                metrics: metricsData,
                lastUpdated: new Date(),
                loadTime,
            };
            this.dashboards.set(dashboardName, dashboardData);
            this.logger.log(`Dashboard ${dashboardName} refreshed successfully in ${loadTime}ms`);
        }
        catch (error) {
            this.logger.error(`Failed to refresh dashboard ${dashboardName}: ${error.message}`);
        }
    }
    generateAlertId() {
        return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    async getMonitoringReport() {
        const startTime = Date.now();
        this.logger.log('Generating monitoring report');
        const totalMetrics = this.metrics.size;
        const activeAlerts = Array.from(this.alerts.values()).filter(alert => alert.status === 'triggered').length;
        const triggeredAlerts = this.alerts.size;
        const availableDashboards = this.dashboards.size;
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentAlerts = Array.from(this.alerts.values()).filter(alert => alert.triggeredAt >= twentyFourHoursAgo);
        const dashboardPerformance = [];
        this.dashboards.forEach((dashboard, name) => {
            dashboardPerformance.push({
                name,
                loadTime: dashboard.loadTime,
                status: dashboard.loadTime <= this.config.monitoringMetrics.maxDashboardLoadTime * 1000
                    ? 'success'
                    : 'failure',
            });
        });
        const duration = Date.now() - startTime;
        let overallStatus = 'healthy';
        const criticalAlerts = Array.from(this.alerts.values()).filter(alert => alert.status === 'triggered' && alert.severity === 'critical');
        if (criticalAlerts.length > 0) {
            overallStatus = 'unhealthy';
        }
        else if (activeAlerts > 0) {
            overallStatus = 'degraded';
        }
        const report = {
            overallStatus,
            metricsCollected: totalMetrics,
            alertsActive: activeAlerts,
            alertsTriggered: triggeredAlerts,
            dashboardsAvailable: availableDashboards,
            dashboardsLoaded: dashboardPerformance.filter(d => d.status === 'success').length,
            summary: {
                totalMetrics,
                activeAlerts: Array.from(this.alerts.values()).filter(alert => alert.status === 'triggered'),
                recentAlerts,
                dashboardPerformance,
            },
            timestamp: new Date(),
            duration,
        };
        this.logger.log(`Monitoring report generated: ${overallStatus}`);
        return report;
    }
    getMetricData(metricName, limit = 100) {
        const dataPoints = this.metrics.get(metricName) || [];
        return dataPoints.slice(-limit);
    }
    getAlertHistory(limit = 50) {
        const alerts = Array.from(this.alerts.values());
        return alerts.slice(-limit);
    }
    getDashboardData(dashboardName) {
        return this.dashboards.get(dashboardName);
    }
    acknowledgeAlert(alertId) {
        const alert = this.alerts.get(alertId);
        if (alert && alert.status === 'triggered') {
            alert.status = 'acknowledged';
            this.alerts.set(alertId, alert);
            this.logger.log(`Alert ${alert.name} acknowledged`);
        }
    }
    resolveAlert(alertId) {
        const alert = this.alerts.get(alertId);
        if (alert && alert.status === 'triggered') {
            alert.status = 'resolved';
            alert.resolvedAt = new Date();
            this.alerts.set(alertId, alert);
            this.logger.log(`Alert ${alert.name} resolved`);
        }
    }
    getConfiguration() {
        return { ...this.config };
    }
    updateConfiguration(config) {
        this.config = { ...this.config, ...config };
        this.logger.log('Monitoring configuration updated');
    }
    addMetric(metric) {
        this.config.metrics.push(metric);
        this.startMetricCollection(metric);
        this.logger.log(`Added metric ${metric.name}`);
    }
    addAlert(alert) {
        this.config.alerts.push(alert);
        this.logger.log(`Added alert ${alert.name}`);
    }
    addDashboard(dashboard) {
        this.config.dashboards.push(dashboard);
        this.refreshDashboard(dashboard.name);
        setInterval(() => {
            this.refreshDashboard(dashboard.name);
        }, dashboard.refreshInterval * 1000);
        this.logger.log(`Added dashboard ${dashboard.name}`);
    }
};
exports.MonitoringImplementationService = MonitoringImplementationService;
exports.MonitoringImplementationService = MonitoringImplementationService = MonitoringImplementationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], MonitoringImplementationService);
//# sourceMappingURL=monitoring-implementation.service.js.map