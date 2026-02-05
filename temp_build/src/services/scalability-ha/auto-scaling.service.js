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
var AutoScalingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoScalingService = void 0;
const common_1 = require("@nestjs/common");
let AutoScalingService = AutoScalingService_1 = class AutoScalingService {
    constructor() {
        this.logger = new common_1.Logger(AutoScalingService_1.name);
        this.scalingEvents = [];
        this.customPolicies = [];
        this.isScalingEnabled = false;
        this.currentReplicas = 1;
        this.lastScalingEvent = new Date(0);
    }
    configure(config) {
        this.config = config;
        this.currentReplicas = config.minReplicas;
        this.logger.log(`Auto-scaling configured for service ${config.serviceName}`);
    }
    startAutoScaling() {
        if (this.isScalingEnabled) {
            this.logger.warn('Auto-scaling is already enabled');
            return;
        }
        this.isScalingEnabled = true;
        this.logger.log(`Starting auto-scaling for service ${this.config.serviceName}`);
        setInterval(async () => {
            if (this.isScalingEnabled) {
                await this.checkAndScale();
            }
        }, this.config.metricsCheckInterval * 1000);
    }
    stopAutoScaling() {
        this.isScalingEnabled = false;
        this.logger.log(`Stopped auto-scaling for service ${this.config.serviceName}`);
    }
    async checkAndScale() {
        if (!this.isScalingEnabled)
            return;
        const timeSinceLastScale = (Date.now() - this.lastScalingEvent.getTime()) / 1000;
        if (timeSinceLastScale < this.config.cooldownPeriod) {
            return;
        }
        const metrics = await this.getCurrentMetrics();
        for (const policy of this.customPolicies) {
            const shouldScale = this.evaluatePolicy(policy, metrics);
            if (shouldScale) {
                return;
            }
        }
        await this.evaluateDefaultScalingRules(metrics);
    }
    async getCurrentMetrics() {
        return {
            cpuUtilization: Math.random() * 100,
            memoryUtilization: Math.random() * 100,
            requestRate: Math.random() * 1000,
            errorRate: Math.random() * 5,
            responseTime: Math.random() * 200,
        };
    }
    evaluatePolicy(policy, metrics) {
        for (const condition of policy.conditions) {
            let metricValue;
            switch (condition.metric) {
                case 'cpu':
                    metricValue = metrics.cpuUtilization;
                    break;
                case 'memory':
                    metricValue = metrics.memoryUtilization;
                    break;
                case 'requests':
                    metricValue = metrics.requestRate;
                    break;
                case 'errors':
                    metricValue = metrics.errorRate;
                    break;
                case 'response_time':
                    metricValue = metrics.responseTime;
                    break;
                default:
                    continue;
            }
            let conditionMet = false;
            switch (condition.operator) {
                case '>':
                    conditionMet = metricValue > condition.threshold;
                    break;
                case '<':
                    conditionMet = metricValue < condition.threshold;
                    break;
                case '>=':
                    conditionMet = metricValue >= condition.threshold;
                    break;
                case '<=':
                    conditionMet = metricValue <= condition.threshold;
                    break;
                case '==':
                    conditionMet = metricValue === condition.threshold;
                    break;
            }
            if (conditionMet) {
                switch (condition.action) {
                    case 'scale_up':
                        this.scaleUp(condition.factor || 1.2, `${policy.name}: ${condition.metric} ${condition.operator} ${condition.threshold}`);
                        return true;
                    case 'scale_down':
                        this.scaleDown(condition.factor || 0.8, `${policy.name}: ${condition.metric} ${condition.operator} ${condition.threshold}`);
                        return true;
                    case 'scale_to':
                        if (condition.targetReplicas !== undefined) {
                            this.scaleTo(condition.targetReplicas, `${policy.name}: ${condition.metric} ${condition.operator} ${condition.threshold}`);
                            return true;
                        }
                        break;
                }
            }
        }
        return false;
    }
    async evaluateDefaultScalingRules(metrics) {
        if (metrics.cpuUtilization > this.config.targetCPUUtilization * (1 + this.config.scaleUpThreshold / 100)) {
            this.scaleUp(this.config.scaleUpFactor, `CPU utilization ${metrics.cpuUtilization.toFixed(2)}% above target ${this.config.targetCPUUtilization}%`);
        }
        else if (metrics.cpuUtilization < this.config.targetCPUUtilization * (1 - this.config.scaleDownThreshold / 100)) {
            this.scaleDown(this.config.scaleDownFactor, `CPU utilization ${metrics.cpuUtilization.toFixed(2)}% below target ${this.config.targetCPUUtilization}%`);
        }
        if (metrics.memoryUtilization > this.config.targetMemoryUtilization * (1 + this.config.scaleUpThreshold / 100)) {
            this.scaleUp(this.config.scaleUpFactor, `Memory utilization ${metrics.memoryUtilization.toFixed(2)}% above target ${this.config.targetMemoryUtilization}%`);
        }
        else if (metrics.memoryUtilization < this.config.targetMemoryUtilization * (1 - this.config.scaleDownThreshold / 100)) {
            this.scaleDown(this.config.scaleDownFactor, `Memory utilization ${metrics.memoryUtilization.toFixed(2)}% below target ${this.config.targetMemoryUtilization}%`);
        }
    }
    scaleUp(factor, reason) {
        const newReplicas = Math.min(Math.ceil(this.currentReplicas * factor), this.config.maxReplicas);
        if (newReplicas > this.currentReplicas) {
            this.executeScaling('scale_up', newReplicas, reason);
        }
    }
    scaleDown(factor, reason) {
        const newReplicas = Math.max(Math.floor(this.currentReplicas * factor), this.config.minReplicas);
        if (newReplicas < this.currentReplicas) {
            this.executeScaling('scale_down', newReplicas, reason);
        }
    }
    scaleTo(replicas, reason) {
        const newReplicas = Math.max(this.config.minReplicas, Math.min(replicas, this.config.maxReplicas));
        if (newReplicas !== this.currentReplicas) {
            const action = newReplicas > this.currentReplicas ? 'scale_up' : 'scale_down';
            this.executeScaling(action, newReplicas, reason);
        }
    }
    executeScaling(action, newReplicas, reason) {
        const event = {
            timestamp: new Date(),
            action,
            fromReplicas: this.currentReplicas,
            toReplicas: newReplicas,
            reason,
            metrics: { cpuUtilization: 0, memoryUtilization: 0, requestRate: 0, errorRate: 0, responseTime: 0 },
        };
        this.scalingEvents.push(event);
        this.currentReplicas = newReplicas;
        this.lastScalingEvent = new Date();
        if (this.scalingEvents.length > 100) {
            this.scalingEvents.shift();
        }
        this.logger.log(`Scaled ${this.config.serviceName} ${action} from ${event.fromReplicas} to ${event.toReplicas} replicas: ${reason}`);
    }
    getCurrentReplicas() {
        return this.currentReplicas;
    }
    getScalingEvents(limit = 20) {
        return this.scalingEvents.slice(-limit);
    }
    addScalingPolicy(policy) {
        this.customPolicies.push(policy);
        this.logger.log(`Added scaling policy: ${policy.name}`);
    }
    removeScalingPolicy(policyName) {
        this.customPolicies = this.customPolicies.filter(policy => policy.name !== policyName);
        this.logger.log(`Removed scaling policy: ${policyName}`);
    }
    getConfiguration() {
        return this.config;
    }
    updateConfiguration(config) {
        this.config = { ...this.config, ...config };
        this.logger.log(`Updated auto-scaling configuration for service ${this.config.serviceName}`);
    }
};
exports.AutoScalingService = AutoScalingService;
exports.AutoScalingService = AutoScalingService = AutoScalingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AutoScalingService);
//# sourceMappingURL=auto-scaling.service.js.map