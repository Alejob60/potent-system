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
var RealTimeAnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealTimeAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const data_warehouse_service_1 = require("./data-warehouse.service");
const websocket_gateway_1 = require("../../websocket/websocket.gateway");
let RealTimeAnalyticsService = RealTimeAnalyticsService_1 = class RealTimeAnalyticsService {
    constructor(dataWarehouseService, websocketGateway) {
        this.dataWarehouseService = dataWarehouseService;
        this.websocketGateway = websocketGateway;
        this.logger = new common_1.Logger(RealTimeAnalyticsService_1.name);
        this.alertStream = new rxjs_1.Subject();
        this.metricsStream = new rxjs_1.Subject();
        this.alerts = [];
        this.metrics = [];
        this.alertThresholds = new Map();
        this.destroy$ = new rxjs_1.Subject();
        this.startDataSimulation();
    }
    startDataSimulation() {
        (0, rxjs_1.interval)(2000)
            .pipe((0, operators_1.takeUntil)(this.destroy$))
            .subscribe(() => {
            const metrics = [
                {
                    name: 'active_users',
                    value: Math.floor(Math.random() * 1000) + 500,
                    timestamp: new Date(),
                    dimensions: { source: 'web' }
                },
                {
                    name: 'revenue',
                    value: Math.random() * 5000 + 1000,
                    timestamp: new Date(),
                    dimensions: { currency: 'USD' }
                },
                {
                    name: 'conversion_rate',
                    value: Math.random() * 0.1 + 0.02,
                    timestamp: new Date(),
                    dimensions: { channel: 'web' }
                }
            ];
            metrics.forEach(metric => {
                this.emitMetric(metric);
            });
        });
    }
    emitMetric(metric) {
        this.metricsStream.next(metric);
        this.metrics.push(metric);
        if (this.metrics.length > 1000) {
            this.metrics.shift();
        }
        this.checkAlerts(metric);
        this.dataWarehouseService.emitRealTimeData({
            timestamp: metric.timestamp,
            metric: metric.name,
            value: metric.value,
            dimensions: metric.dimensions
        });
        this.websocketGateway.server.emit('real_time_metric', metric);
    }
    getMetricsStream() {
        return this.metricsStream.asObservable();
    }
    getRecentMetrics(limit = 50) {
        return this.metrics.slice(-limit);
    }
    getCurrentMetrics(names) {
        const currentMetrics = [];
        names.forEach(name => {
            const recentMetric = [...this.metrics]
                .reverse()
                .find(metric => metric.name === name);
            if (recentMetric) {
                currentMetrics.push(recentMetric);
            }
        });
        return currentMetrics;
    }
    setAlertThreshold(metricName, threshold) {
        this.alertThresholds.set(metricName, threshold);
    }
    checkAlerts(metric) {
        const threshold = this.alertThresholds.get(metric.name);
        if (threshold && metric.value > threshold) {
            const alert = {
                metric: metric.name,
                threshold,
                currentValue: metric.value,
                timestamp: metric.timestamp,
                severity: metric.value > threshold * 1.5 ? 'high' :
                    metric.value > threshold * 1.2 ? 'medium' : 'low'
            };
            this.alertStream.next(alert);
            this.alerts.push(alert);
            if (this.alerts.length > 100) {
                this.alerts.shift();
            }
            this.websocketGateway.server.emit('real_time_alert', alert);
        }
    }
    getAlertStream() {
        return this.alertStream.asObservable();
    }
    getRecentAlerts(limit = 20) {
        return this.alerts.slice(-limit);
    }
    getActiveAlerts() {
        return this.getRecentAlerts(20);
    }
    getAggregatedMetrics(metricName, windowMinutes = 5) {
        const windowMs = windowMinutes * 60 * 1000;
        const now = new Date().getTime();
        const windowStart = new Date(now - windowMs);
        const relevantMetrics = this.metrics.filter(m => m.name === metricName && m.timestamp >= windowStart);
        if (relevantMetrics.length === 0) {
            return [];
        }
        const sum = relevantMetrics.reduce((acc, m) => acc + m.value, 0);
        const avg = sum / relevantMetrics.length;
        const min = Math.min(...relevantMetrics.map(m => m.value));
        const max = Math.max(...relevantMetrics.map(m => m.value));
        return [{
                metric: metricName,
                count: relevantMetrics.length,
                sum,
                average: avg,
                min,
                max,
                windowStart,
                windowEnd: now
            }];
    }
    onModuleDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
};
exports.RealTimeAnalyticsService = RealTimeAnalyticsService;
exports.RealTimeAnalyticsService = RealTimeAnalyticsService = RealTimeAnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_warehouse_service_1.DataWarehouseService,
        websocket_gateway_1.WebSocketGatewayService])
], RealTimeAnalyticsService);
//# sourceMappingURL=real-time-analytics.service.js.map