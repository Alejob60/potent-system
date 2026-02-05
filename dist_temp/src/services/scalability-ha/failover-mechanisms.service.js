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
var FailoverMechanismsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FailoverMechanismsService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let FailoverMechanismsService = FailoverMechanismsService_1 = class FailoverMechanismsService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(FailoverMechanismsService_1.name);
        this.serviceStatus = new Map();
        this.failoverEvents = [];
        this.consecutiveFailures = 0;
        this.isFailoverEnabled = false;
        this.lastFailover = new Date(0);
    }
    configure(config) {
        this.config = config;
        this.currentActiveService = config.primaryService.name;
        this.initializeServiceStatus();
        this.logger.log(`Failover mechanisms configured. Primary service: ${config.primaryService.name}`);
    }
    initializeServiceStatus() {
        this.serviceStatus.set(this.config.primaryService.name, {
            name: this.config.primaryService.name,
            url: this.config.primaryService.url,
            status: 'healthy',
            lastChecked: new Date(0),
            responseTime: 0,
            failureCount: 0,
        });
        this.config.backupServices.forEach(service => {
            this.serviceStatus.set(service.name, {
                name: service.name,
                url: service.url,
                status: 'healthy',
                lastChecked: new Date(0),
                responseTime: 0,
                failureCount: 0,
            });
        });
    }
    startFailoverMonitoring() {
        if (this.isFailoverEnabled) {
            this.logger.warn('Failover monitoring is already enabled');
            return;
        }
        this.isFailoverEnabled = true;
        this.logger.log('Starting failover monitoring');
        setInterval(async () => {
            if (this.isFailoverEnabled) {
                await this.performHealthChecks();
            }
        }, this.config.healthCheckInterval);
        if (this.config.enableAutoRecovery) {
            setInterval(async () => {
                if (this.isFailoverEnabled && this.currentActiveService !== this.config.primaryService.name) {
                    await this.checkForRecovery();
                }
            }, this.config.recoveryCheckInterval);
        }
    }
    stopFailoverMonitoring() {
        this.isFailoverEnabled = false;
        this.logger.log('Stopped failover monitoring');
    }
    async performHealthChecks() {
        if (!this.isFailoverEnabled)
            return;
        if (this.currentActiveService === this.config.primaryService.name) {
            const isHealthy = await this.checkServiceHealth(this.config.primaryService.name, this.config.primaryService.url, this.config.primaryService.healthCheckPath, this.config.primaryService.timeout);
            if (!isHealthy) {
                this.consecutiveFailures++;
                this.logger.warn(`Primary service failed health check (${this.consecutiveFailures}/${this.config.failoverThreshold})`);
                if (this.consecutiveFailures >= this.config.failoverThreshold) {
                    await this.triggerFailover('Primary service unavailable');
                }
            }
            else {
                if (this.consecutiveFailures > 0) {
                    this.logger.log('Primary service is healthy again');
                    this.consecutiveFailures = 0;
                }
            }
        }
        else {
            if (this.config.enableAutoRecovery) {
                await this.checkForRecovery();
            }
        }
    }
    async checkServiceHealth(serviceName, serviceUrl, healthCheckPath, timeout) {
        try {
            const startTime = Date.now();
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${serviceUrl}${healthCheckPath}`, {
                timeout,
            }));
            const responseTime = Date.now() - startTime;
            const status = {
                name: serviceName,
                url: serviceUrl,
                status: response.status === 200 ? 'healthy' : 'degraded',
                lastChecked: new Date(),
                responseTime,
                failureCount: 0,
            };
            this.serviceStatus.set(serviceName, status);
            return response.status === 200;
        }
        catch (error) {
            const currentStatus = this.serviceStatus.get(serviceName) || {
                name: serviceName,
                url: serviceUrl,
                status: 'unhealthy',
                lastChecked: new Date(),
                responseTime: 0,
                failureCount: 0,
            };
            currentStatus.failureCount += 1;
            currentStatus.lastChecked = new Date();
            currentStatus.status = 'unhealthy';
            currentStatus.lastFailureReason = error.message;
            this.serviceStatus.set(serviceName, currentStatus);
            this.logger.error(`Service ${serviceName} health check failed: ${error.message}`);
            return false;
        }
    }
    async triggerFailover(reason) {
        this.logger.warn(`Triggering failover: ${reason}`);
        const sortedBackups = [...this.config.backupServices].sort((a, b) => a.priority - b.priority);
        let backupService = null;
        for (const service of sortedBackups) {
            const status = this.serviceStatus.get(service.name);
            if (status && status.status === 'healthy') {
                backupService = service;
                break;
            }
        }
        if (!backupService) {
            this.logger.error('No healthy backup services available for failover');
            return;
        }
        const event = {
            timestamp: new Date(),
            fromService: this.currentActiveService,
            toService: backupService.name,
            reason,
            duration: Date.now() - this.lastFailover.getTime(),
        };
        this.failoverEvents.push(event);
        this.lastFailover = new Date();
        if (this.failoverEvents.length > 100) {
            this.failoverEvents.shift();
        }
        const previousService = this.currentActiveService;
        this.currentActiveService = backupService.name;
        this.consecutiveFailures = 0;
        this.logger.log(`Failover completed: ${previousService} -> ${backupService.name}`);
    }
    async checkForRecovery() {
        const isPrimaryHealthy = await this.checkServiceHealth(this.config.primaryService.name, this.config.primaryService.url, this.config.primaryService.healthCheckPath, this.config.primaryService.timeout);
        if (isPrimaryHealthy) {
            this.logger.log('Primary service has recovered');
            if (this.config.enableAutoRecovery) {
                this.logger.log('Switching back to primary service due to auto-recovery');
                await this.switchToPrimary();
            }
        }
    }
    async switchToPrimary() {
        const event = {
            timestamp: new Date(),
            fromService: this.currentActiveService,
            toService: this.config.primaryService.name,
            reason: 'Primary service recovery',
            duration: Date.now() - this.lastFailover.getTime(),
        };
        this.failoverEvents.push(event);
        this.lastFailover = new Date();
        const previousService = this.currentActiveService;
        this.currentActiveService = this.config.primaryService.name;
        this.logger.log(`Switched back to primary service: ${previousService} -> ${this.config.primaryService.name}`);
    }
    getCurrentActiveService() {
        return this.currentActiveService;
    }
    getServiceStatus(serviceName) {
        return this.serviceStatus.get(serviceName);
    }
    getAllServiceStatuses() {
        return Array.from(this.serviceStatus.values());
    }
    getFailoverEvents(limit = 20) {
        return this.failoverEvents.slice(-limit);
    }
    async manualFailover(reason) {
        this.logger.warn(`Manual failover triggered: ${reason}`);
        await this.triggerFailover(`Manual failover: ${reason}`);
    }
    forceSwitchToService(serviceName, reason) {
        if (!this.serviceStatus.has(serviceName)) {
            this.logger.error(`Cannot switch to unknown service: ${serviceName}`);
            return;
        }
        const status = this.serviceStatus.get(serviceName);
        if (status && status.status !== 'healthy') {
            this.logger.warn(`Switching to unhealthy service: ${serviceName}`);
        }
        const event = {
            timestamp: new Date(),
            fromService: this.currentActiveService,
            toService: serviceName,
            reason: `Force switch: ${reason}`,
            duration: Date.now() - this.lastFailover.getTime(),
        };
        this.failoverEvents.push(event);
        this.lastFailover = new Date();
        const previousService = this.currentActiveService;
        this.currentActiveService = serviceName;
        this.logger.log(`Force switched service: ${previousService} -> ${serviceName}`);
    }
    addBackupService(service) {
        this.config.backupServices.push(service);
        this.serviceStatus.set(service.name, {
            name: service.name,
            url: service.url,
            status: 'healthy',
            lastChecked: new Date(0),
            responseTime: 0,
            failureCount: 0,
        });
        this.logger.log(`Added backup service: ${service.name}`);
    }
    removeBackupService(serviceName) {
        this.config.backupServices = this.config.backupServices.filter(service => service.name !== serviceName);
        this.serviceStatus.delete(serviceName);
        this.logger.log(`Removed backup service: ${serviceName}`);
    }
    updateServiceConfig(serviceName, updates) {
        if (serviceName === this.config.primaryService.name) {
            Object.assign(this.config.primaryService, updates);
        }
        else {
            const service = this.config.backupServices.find(s => s.name === serviceName);
            if (service) {
                Object.assign(service, updates);
            }
        }
        this.logger.log(`Updated configuration for service: ${serviceName}`);
    }
};
exports.FailoverMechanismsService = FailoverMechanismsService;
exports.FailoverMechanismsService = FailoverMechanismsService = FailoverMechanismsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], FailoverMechanismsService);
//# sourceMappingURL=failover-mechanisms.service.js.map