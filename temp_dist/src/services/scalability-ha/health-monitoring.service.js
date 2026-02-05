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
var HealthMonitoringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthMonitoringService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let HealthMonitoringService = HealthMonitoringService_1 = class HealthMonitoringService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(HealthMonitoringService_1.name);
        this.serviceHealth = new Map();
        this.alerts = [];
        this.isMonitoring = false;
    }
    configure(config) {
        this.config = config;
        this.config.services.forEach(service => {
            this.serviceHealth.set(service.name, {
                name: service.name,
                url: service.url,
                status: 'healthy',
                lastChecked: new Date(0),
                responseTime: 0,
                statusCode: 0,
                failureCount: 0,
            });
        });
        this.logger.log(`Health monitoring configured for ${config.services.length} services`);
    }
    startMonitoring() {
        if (this.isMonitoring) {
            this.logger.warn('Health monitoring is already running');
            return;
        }
        this.isMonitoring = true;
        this.logger.log('Starting health monitoring');
        setInterval(async () => {
            await this.performHealthChecks();
        }, this.config.checkInterval);
    }
    stopMonitoring() {
        this.isMonitoring = false;
        this.logger.log('Stopped health monitoring');
    }
    async performHealthChecks() {
        if (!this.isMonitoring)
            return;
        for (const service of this.config.services) {
            try {
                const startTime = Date.now();
                const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(service.url, {
                    timeout: service.timeout,
                }));
                const responseTime = Date.now() - startTime;
                const health = {
                    name: service.name,
                    url: service.url,
                    status: response.status === service.expectedStatusCode ? 'healthy' : 'degraded',
                    lastChecked: new Date(),
                    responseTime,
                    statusCode: response.status,
                    failureCount: 0,
                };
                this.serviceHealth.set(service.name, health);
                const currentHealth = this.serviceHealth.get(service.name);
                if (currentHealth) {
                    currentHealth.failureCount = 0;
                }
                if (health.status === 'degraded') {
                    this.logger.warn(`Service ${service.name} is degraded (status: ${response.status})`);
                    this.createAlert(service.name, 'warning', `Service ${service.name} returned unexpected status code ${response.status}`);
                }
            }
            catch (error) {
                const currentHealth = this.serviceHealth.get(service.name) || {
                    name: service.name,
                    url: service.url,
                    status: 'unhealthy',
                    lastChecked: new Date(),
                    responseTime: 0,
                    statusCode: 0,
                    failureCount: 0,
                };
                currentHealth.failureCount += 1;
                currentHealth.lastChecked = new Date();
                currentHealth.status = 'unhealthy';
                currentHealth.lastFailureReason = error.message;
                this.serviceHealth.set(service.name, currentHealth);
                this.logger.error(`Service ${service.name} health check failed: ${error.message}`);
                if (currentHealth.failureCount >= this.config.alertThreshold) {
                    const level = service.critical ? 'critical' : 'warning';
                    this.createAlert(service.name, level, `Service ${service.name} has failed ${currentHealth.failureCount} consecutive health checks: ${error.message}`);
                }
            }
        }
    }
    createAlert(service, level, message) {
        const alert = {
            service,
            level,
            message,
            timestamp: new Date(),
        };
        this.alerts.push(alert);
        if (this.alerts.length > 100) {
            this.alerts.shift();
        }
        this.logger.log(`Health alert created: ${level} - ${message}`);
    }
    getHealthStatus() {
        return Array.from(this.serviceHealth.values());
    }
    getServiceHealth(serviceName) {
        return this.serviceHealth.get(serviceName);
    }
    getAlerts(limit = 20) {
        return this.alerts.slice(-limit);
    }
    getHealthSummary() {
        const healthStatus = this.getHealthStatus();
        const healthyCount = healthStatus.filter(s => s.status === 'healthy').length;
        const degradedCount = healthStatus.filter(s => s.status === 'degraded').length;
        const unhealthyCount = healthStatus.filter(s => s.status === 'unhealthy').length;
        const criticalServices = this.config.services.filter(s => s.critical).map(s => s.name);
        const criticalUnhealthy = criticalServices.filter(name => {
            const health = this.serviceHealth.get(name);
            return health && health.status === 'unhealthy';
        });
        return {
            totalServices: healthStatus.length,
            healthy: healthyCount,
            degraded: degradedCount,
            unhealthy: unhealthyCount,
            overallStatus: unhealthyCount > 0 ? 'unhealthy' : degradedCount > 0 ? 'degraded' : 'healthy',
            criticalServicesUnhealthy: criticalUnhealthy,
            lastChecked: new Date(),
        };
    }
    addService(service) {
        this.config.services.push(service);
        this.serviceHealth.set(service.name, {
            name: service.name,
            url: service.url,
            status: 'healthy',
            lastChecked: new Date(0),
            responseTime: 0,
            statusCode: 0,
            failureCount: 0,
        });
        this.logger.log(`Added service ${service.name} to health monitoring`);
    }
    removeService(serviceName) {
        this.config.services = this.config.services.filter(service => service.name !== serviceName);
        this.serviceHealth.delete(serviceName);
        this.logger.log(`Removed service ${serviceName} from health monitoring`);
    }
};
exports.HealthMonitoringService = HealthMonitoringService;
exports.HealthMonitoringService = HealthMonitoringService = HealthMonitoringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], HealthMonitoringService);
//# sourceMappingURL=health-monitoring.service.js.map