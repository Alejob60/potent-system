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
var PerformanceMonitoringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceMonitoringService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
let PerformanceMonitoringService = PerformanceMonitoringService_1 = class PerformanceMonitoringService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(PerformanceMonitoringService_1.name);
        this.systemMetrics = [];
        this.applicationMetrics = [];
        this.alerts = [];
        this.isMonitoring = false;
        this.sampledRequests = new Map();
        this.endpointMetrics = new Map();
    }
    configure(config) {
        this.config = config;
        this.logger.log('Performance monitoring configured');
    }
    startMonitoring() {
        if (this.isMonitoring) {
            this.logger.warn('Performance monitoring is already running');
            return;
        }
        this.isMonitoring = true;
        this.logger.log('Starting performance monitoring');
        setInterval(async () => {
            if (this.isMonitoring) {
                await this.collectMetrics();
            }
        }, this.config.metricsCollection.interval * 1000);
        setInterval(() => {
            this.cleanupOldMetrics();
        }, 60000);
    }
    stopMonitoring() {
        this.isMonitoring = false;
        this.logger.log('Stopped performance monitoring');
    }
    async collectMetrics() {
        try {
            const systemMetrics = await this.collectSystemMetrics();
            this.systemMetrics.push(systemMetrics);
            const applicationMetrics = await this.collectApplicationMetrics();
            this.applicationMetrics.push(applicationMetrics);
            if (this.config.alerting.enableAlerts) {
                await this.checkForAlerts(systemMetrics, applicationMetrics);
            }
            this.logger.debug('Collected performance metrics');
        }
        catch (error) {
            this.logger.error(`Error collecting performance metrics: ${error.message}`);
        }
    }
    async collectSystemMetrics() {
        return {
            timestamp: new Date(),
            cpu: {
                utilization: Math.random() * 100,
                loadAverage: Math.random() * 4,
                cores: 4,
            },
            memory: {
                used: Math.random() * 8000,
                total: 8192,
                utilization: Math.random() * 100,
            },
            disk: {
                used: Math.random() * 50000,
                total: 100000,
                utilization: Math.random() * 100,
            },
            network: {
                in: Math.random() * 100,
                out: Math.random() * 100,
            },
        };
    }
    async collectApplicationMetrics() {
        const totalRequests = Array.from(this.endpointMetrics.values()).reduce((sum, e) => sum + e.requests, 0);
        const failedRequests = Array.from(this.endpointMetrics.values()).reduce((sum, e) => sum + e.errors, 0);
        const errorRate = totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0;
        const endpointCount = this.endpointMetrics.size;
        const totalResponseTime = Array.from(this.endpointMetrics.values()).reduce((sum, e) => sum + e.avgResponseTime, 0);
        const avgResponseTime = endpointCount > 0 ? totalResponseTime / endpointCount : 0;
        return {
            timestamp: new Date(),
            requests: {
                total: totalRequests,
                successful: totalRequests - failedRequests,
                failed: failedRequests,
                errorRate,
            },
            responseTimes: {
                avg: avgResponseTime,
                p50: avgResponseTime * 0.9,
                p90: avgResponseTime * 1.2,
                p95: avgResponseTime * 1.5,
                p99: avgResponseTime * 2.0,
            },
            throughput: {
                requestsPerSecond: totalRequests / this.config.metricsCollection.interval,
                currentRPS: totalRequests / this.config.metricsCollection.interval,
            },
            endpoints: new Map(this.endpointMetrics),
        };
    }
    async checkForAlerts(systemMetrics, applicationMetrics) {
        const thresholds = this.config.alerting.thresholds;
        if (systemMetrics.cpu.utilization > thresholds.cpuUtilization) {
            this.createAlert('critical', 'cpu.utilization', systemMetrics.cpu.utilization, thresholds.cpuUtilization, `CPU utilization is above threshold: ${systemMetrics.cpu.utilization.toFixed(2)}% > ${thresholds.cpuUtilization}%`);
        }
        if (systemMetrics.memory.utilization > thresholds.memoryUtilization) {
            this.createAlert('critical', 'memory.utilization', systemMetrics.memory.utilization, thresholds.memoryUtilization, `Memory utilization is above threshold: ${systemMetrics.memory.utilization.toFixed(2)}% > ${thresholds.memoryUtilization}%`);
        }
        if (applicationMetrics.responseTimes.avg > thresholds.responseTime) {
            this.createAlert('warning', 'response.time', applicationMetrics.responseTimes.avg, thresholds.responseTime, `Average response time is above threshold: ${applicationMetrics.responseTimes.avg.toFixed(2)}ms > ${thresholds.responseTime}ms`);
        }
        if (applicationMetrics.requests.errorRate > thresholds.errorRate) {
            this.createAlert('critical', 'error.rate', applicationMetrics.requests.errorRate, thresholds.errorRate, `Error rate is above threshold: ${applicationMetrics.requests.errorRate.toFixed(2)}% > ${thresholds.errorRate}%`);
        }
        if (applicationMetrics.throughput.requestsPerSecond > thresholds.throughput) {
            this.createAlert('info', 'throughput', applicationMetrics.throughput.requestsPerSecond, thresholds.throughput, `Throughput is above threshold: ${applicationMetrics.throughput.requestsPerSecond.toFixed(2)} RPS > ${thresholds.throughput} RPS`);
        }
    }
    createAlert(level, metric, currentValue, threshold, message) {
        const alert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            level,
            metric,
            currentValue,
            threshold,
            message,
            timestamp: new Date(),
            resolved: false,
        };
        this.alerts.push(alert);
        if (this.alerts.length > 1000) {
            this.alerts.shift();
        }
        this.logger.log(`Performance alert created: ${level} - ${message}`);
        if (this.config.alerting.notificationChannels.length > 0) {
            this.sendNotifications(alert);
        }
    }
    async sendNotifications(alert) {
        this.logger.log(`Sending notification for alert ${alert.id} to channels: ${this.config.alerting.notificationChannels.join(', ')}`);
    }
    resolveAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.resolved = true;
            alert.resolvedAt = new Date();
            this.logger.log(`Resolved alert: ${alertId}`);
        }
    }
    getSystemMetrics(limit = 100) {
        return this.systemMetrics.slice(-limit);
    }
    getApplicationMetrics(limit = 100) {
        return this.applicationMetrics.slice(-limit);
    }
    getAlerts(limit = 50, includeResolved = false) {
        let alerts = [...this.alerts];
        if (!includeResolved) {
            alerts = alerts.filter(alert => !alert.resolved);
        }
        return alerts.slice(-limit);
    }
    getCriticalAlerts() {
        return this.alerts.filter(alert => !alert.resolved && alert.level === 'critical');
    }
    cleanupOldMetrics() {
        const retentionCutoff = new Date(Date.now() - this.config.metricsCollection.retentionPeriod * 60 * 60 * 1000);
        this.systemMetrics = this.systemMetrics.filter(metric => metric.timestamp > retentionCutoff);
        this.applicationMetrics = this.applicationMetrics.filter(metric => metric.timestamp > retentionCutoff);
        const alertCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
        this.alerts = this.alerts.filter(alert => {
            if (alert.resolved && alert.resolvedAt) {
                return alert.resolvedAt > alertCutoff;
            }
            return true;
        });
        this.logger.debug('Cleaned up old metrics');
    }
    recordEndpointMetrics(path, method, responseTime, success) {
        const key = `${method}:${path}`;
        let metrics = this.endpointMetrics.get(key);
        if (!metrics) {
            metrics = {
                path,
                method,
                requests: 0,
                errors: 0,
                avgResponseTime: 0,
                minResponseTime: Infinity,
                maxResponseTime: 0,
            };
            this.endpointMetrics.set(key, metrics);
        }
        metrics.requests++;
        if (!success) {
            metrics.errors++;
        }
        metrics.avgResponseTime = ((metrics.avgResponseTime * (metrics.requests - 1)) + responseTime) / metrics.requests;
        metrics.minResponseTime = Math.min(metrics.minResponseTime, responseTime);
        metrics.maxResponseTime = Math.max(metrics.maxResponseTime, responseTime);
    }
    getEndpointMetrics() {
        return new Map(this.endpointMetrics);
    }
    getPerformanceSummary() {
        const latestSystemMetrics = this.systemMetrics[this.systemMetrics.length - 1];
        const latestAppMetrics = this.applicationMetrics[this.applicationMetrics.length - 1];
        if (!latestSystemMetrics || !latestAppMetrics) {
            return {
                status: 'no_data',
                message: 'No metrics collected yet',
            };
        }
        return {
            timestamp: new Date(),
            system: {
                cpu: {
                    utilization: latestSystemMetrics.cpu.utilization.toFixed(2) + '%',
                    loadAverage: latestSystemMetrics.cpu.loadAverage.toFixed(2),
                },
                memory: {
                    utilization: latestSystemMetrics.memory.utilization.toFixed(2) + '%',
                    used: Math.round(latestSystemMetrics.memory.used) + 'MB',
                    total: latestSystemMetrics.memory.total + 'MB',
                },
            },
            application: {
                requests: {
                    total: latestAppMetrics.requests.total,
                    errorRate: latestAppMetrics.requests.errorRate.toFixed(2) + '%',
                },
                responseTime: {
                    average: latestAppMetrics.responseTimes.avg.toFixed(2) + 'ms',
                },
                throughput: {
                    rps: latestAppMetrics.throughput.requestsPerSecond.toFixed(2),
                },
            },
            alerts: {
                total: this.alerts.filter(a => !a.resolved).length,
                critical: this.alerts.filter(a => !a.resolved && a.level === 'critical').length,
            },
        };
    }
    sampleRequest(requestId, requestDetails) {
        if (Math.random() * 100 > this.config.sampling.requestSamplingRate) {
            return;
        }
        this.sampledRequests.set(requestId, {
            ...requestDetails,
            sampledAt: new Date(),
        });
        if (this.sampledRequests.size > 1000) {
            const firstKey = this.sampledRequests.keys().next().value;
            if (firstKey) {
                this.sampledRequests.delete(firstKey);
            }
        }
    }
    getSampledRequests(limit = 50) {
        const entries = Array.from(this.sampledRequests.entries());
        const limitedEntries = entries.slice(-limit);
        return new Map(limitedEntries);
    }
};
exports.PerformanceMonitoringService = PerformanceMonitoringService;
exports.PerformanceMonitoringService = PerformanceMonitoringService = PerformanceMonitoringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], PerformanceMonitoringService);
//# sourceMappingURL=performance-monitoring.service.js.map