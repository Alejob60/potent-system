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
var ErrorHandlingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandlingService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../common/redis/redis.service");
const websocket_gateway_1 = require("../../websocket/websocket.gateway");
const state_management_service_1 = require("../../state/state-management.service");
let ErrorHandlingService = ErrorHandlingService_1 = class ErrorHandlingService {
    constructor(redisService, websocketGateway, stateManager) {
        this.redisService = redisService;
        this.websocketGateway = websocketGateway;
        this.stateManager = stateManager;
        this.logger = new common_1.Logger(ErrorHandlingService_1.name);
        this.ERROR_PREFIX = 'error';
        this.ERROR_POLICY_PREFIX = 'error_policy';
        this.RECOVERY_STRATEGY_PREFIX = 'recovery_strategy';
        this.ERROR_STATS_PREFIX = 'error_stats';
    }
    async recordError(errorInfo) {
        try {
            const fullErrorInfo = {
                id: this.generateErrorId(),
                timestamp: new Date(),
                resolved: false,
                ...errorInfo
            };
            const key = `${this.ERROR_PREFIX}:${fullErrorInfo.id}`;
            await this.redisService.setex(key, 2592000, JSON.stringify(fullErrorInfo));
            await this.updateErrorStats(fullErrorInfo);
            await this.notifyOnError(fullErrorInfo);
            if (fullErrorInfo.sessionId) {
                await this.stateManager.addConversationEntry(fullErrorInfo.sessionId, {
                    type: 'system_event',
                    content: fullErrorInfo.message,
                    metadata: {
                        errorId: fullErrorInfo.id,
                        type: fullErrorInfo.type,
                        severity: fullErrorInfo.severity,
                        component: fullErrorInfo.component
                    }
                });
            }
            this.logger.log(`Recorded error ${fullErrorInfo.id} in component ${fullErrorInfo.component}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error recording error: ${error.message}`);
            return false;
        }
    }
    async getError(errorId) {
        try {
            const key = `${this.ERROR_PREFIX}:${errorId}`;
            const errorJson = await this.redisService.get(key);
            if (!errorJson) {
                return null;
            }
            const errorInfo = JSON.parse(errorJson);
            errorInfo.timestamp = new Date(errorInfo.timestamp);
            return errorInfo;
        }
        catch (error) {
            this.logger.error(`Error retrieving error ${errorId}: ${error.message}`);
            return null;
        }
    }
    async listErrors(component, severity, resolved, limit = 50) {
        try {
            return [];
        }
        catch (error) {
            this.logger.error(`Error listing errors: ${error.message}`);
            return [];
        }
    }
    async resolveError(errorId, resolution) {
        try {
            const errorInfo = await this.getError(errorId);
            if (!errorInfo) {
                return false;
            }
            errorInfo.resolved = true;
            errorInfo.resolution = resolution;
            const key = `${this.ERROR_PREFIX}:${errorId}`;
            await this.redisService.setex(key, 2592000, JSON.stringify(errorInfo));
            await this.notifyOnResolution(errorInfo);
            this.logger.log(`Resolved error ${errorId}: ${resolution}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error resolving error ${errorId}: ${error.message}`);
            return false;
        }
    }
    async handleError(error) {
        try {
            const policy = await this.getErrorPolicy(error.component, error.type);
            if (!policy) {
                this.logger.warn(`No policy found for error ${error.type} in component ${error.component}`);
                return await this.defaultErrorHandling(error);
            }
            switch (policy.action) {
                case 'retry':
                    return await this.handleRetry(error, policy);
                case 'failover':
                    return await this.handleFailover(error, policy);
                case 'ignore':
                    return await this.handleIgnore(error);
                case 'notify':
                    return await this.handleNotify(error, policy);
                case 'escalate':
                    return await this.handleEscalate(error, policy);
                default:
                    return await this.defaultErrorHandling(error);
            }
        }
        catch (handlingError) {
            this.logger.error(`Error handling error ${error.id}: ${handlingError.message}`);
            return false;
        }
    }
    async createErrorPolicy(policy) {
        try {
            const key = `${this.ERROR_POLICY_PREFIX}:${policy.component}:${policy.errorType}`;
            await this.redisService.set(key, JSON.stringify(policy));
            this.logger.log(`Created error policy for ${policy.component}:${policy.errorType}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error creating error policy: ${error.message}`);
            return false;
        }
    }
    async getErrorPolicy(component, errorType) {
        try {
            const key = `${this.ERROR_POLICY_PREFIX}:${component}:${errorType}`;
            const policyJson = await this.redisService.get(key);
            if (!policyJson) {
                return null;
            }
            return JSON.parse(policyJson);
        }
        catch (error) {
            this.logger.error(`Error retrieving error policy for ${component}:${errorType}: ${error.message}`);
            return null;
        }
    }
    async createRecoveryStrategy(strategy) {
        try {
            const key = `${this.RECOVERY_STRATEGY_PREFIX}:${strategy.id}`;
            await this.redisService.setex(key, 2592000, JSON.stringify(strategy));
            this.logger.log(`Created recovery strategy ${strategy.id}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error creating recovery strategy ${strategy.id}: ${error.message}`);
            return false;
        }
    }
    async getRecoveryStrategy(strategyId) {
        try {
            const key = `${this.RECOVERY_STRATEGY_PREFIX}:${strategyId}`;
            const strategyJson = await this.redisService.get(key);
            if (!strategyJson) {
                return null;
            }
            return JSON.parse(strategyJson);
        }
        catch (error) {
            this.logger.error(`Error retrieving recovery strategy ${strategyId}: ${error.message}`);
            return null;
        }
    }
    async executeRecoveryStrategy(strategyId, context) {
        try {
            const strategy = await this.getRecoveryStrategy(strategyId);
            if (!strategy) {
                this.logger.error(`Recovery strategy ${strategyId} not found`);
                return false;
            }
            this.logger.log(`Executing recovery strategy ${strategyId}: ${strategy.name}`);
            for (const step of strategy.steps) {
                this.logger.log(`Executing recovery step: ${step}`);
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            this.logger.log(`Recovery strategy ${strategyId} completed successfully`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error executing recovery strategy ${strategyId}: ${error.message}`);
            return false;
        }
    }
    async getErrorStats(component) {
        try {
            const key = component
                ? `${this.ERROR_STATS_PREFIX}:${component}`
                : this.ERROR_STATS_PREFIX;
            const statsJson = await this.redisService.get(key);
            if (!statsJson) {
                return {};
            }
            return JSON.parse(statsJson);
        }
        catch (error) {
            this.logger.error(`Error retrieving error stats: ${error.message}`);
            return {};
        }
    }
    async updateErrorStats(errorInfo) {
        try {
            const key = `${this.ERROR_STATS_PREFIX}:${errorInfo.component}`;
            const statsJson = await this.redisService.get(key);
            const stats = statsJson ? JSON.parse(statsJson) : {};
            stats.total = (stats.total || 0) + 1;
            stats[errorInfo.type] = (stats[errorInfo.type] || 0) + 1;
            stats[errorInfo.severity] = (stats[errorInfo.severity] || 0) + 1;
            await this.redisService.setex(key, 86400, JSON.stringify(stats));
            return true;
        }
        catch (error) {
            this.logger.error(`Error updating error stats: ${error.message}`);
            return false;
        }
    }
    async notifyOnError(errorInfo) {
        try {
            this.websocketGateway.broadcastSystemNotification({
                type: 'error_occurred',
                errorId: errorInfo.id,
                component: errorInfo.component,
                errorType: errorInfo.type,
                severity: errorInfo.severity,
                message: errorInfo.message,
                timestamp: errorInfo.timestamp.toISOString()
            });
            return true;
        }
        catch (error) {
            this.logger.error(`Error notifying on error ${errorInfo.id}: ${error.message}`);
            return false;
        }
    }
    async notifyOnResolution(errorInfo) {
        try {
            this.websocketGateway.broadcastSystemNotification({
                type: 'error_resolved',
                errorId: errorInfo.id,
                component: errorInfo.component,
                errorType: errorInfo.type,
                message: errorInfo.message,
                resolution: errorInfo.resolution,
                timestamp: new Date().toISOString()
            });
            return true;
        }
        catch (error) {
            this.logger.error(`Error notifying on resolution of error ${errorInfo.id}: ${error.message}`);
            return false;
        }
    }
    async handleRetry(error, policy) {
        try {
            const maxRetries = policy.maxRetries || 3;
            const retryDelay = policy.retryDelay || 1000;
            this.logger.log(`Retrying error ${error.id} (max ${maxRetries} retries, ${retryDelay}ms delay)`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return true;
        }
        catch (error) {
            this.logger.error(`Error handling retry for error ${error.id}: ${error.message}`);
            return false;
        }
    }
    async handleFailover(error, policy) {
        try {
            const failoverTarget = policy.failoverTarget;
            if (!failoverTarget) {
                this.logger.error(`No failover target specified for error ${error.id}`);
                return false;
            }
            this.logger.log(`Failing over error ${error.id} to ${failoverTarget}`);
            await new Promise(resolve => setTimeout(resolve, 500));
            return true;
        }
        catch (error) {
            this.logger.error(`Error handling failover for error ${error.id}: ${error.message}`);
            return false;
        }
    }
    async handleIgnore(error) {
        try {
            this.logger.log(`Ignoring error ${error.id}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error handling ignore for error ${error.id}: ${error.message}`);
            return false;
        }
    }
    async handleNotify(error, policy) {
        try {
            const channels = policy.notificationChannels || ['system'];
            this.logger.log(`Notifying on error ${error.id} via channels: ${channels.join(', ')}`);
            for (const channel of channels) {
                this.websocketGateway.broadcastSystemNotification({
                    type: 'error_notification',
                    errorId: error.id,
                    component: error.component,
                    errorType: error.type,
                    severity: error.severity,
                    message: error.message,
                    channel,
                    timestamp: error.timestamp.toISOString()
                });
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Error handling notify for error ${error.id}: ${error.message}`);
            return false;
        }
    }
    async handleEscalate(error, policy) {
        try {
            const escalationLevel = policy.escalationLevel || 'level1';
            this.logger.log(`Escalating error ${error.id} to ${escalationLevel}`);
            this.websocketGateway.broadcastSystemNotification({
                type: 'error_escalation',
                errorId: error.id,
                component: error.component,
                errorType: error.type,
                severity: error.severity,
                message: error.message,
                escalationLevel,
                timestamp: new Date().toISOString()
            });
            return true;
        }
        catch (error) {
            this.logger.error(`Error handling escalation for error ${error.id}: ${error.message}`);
            return false;
        }
    }
    async defaultErrorHandling(error) {
        try {
            this.logger.log(`Applying default error handling for error ${error.id}`);
            if (error.severity === 'critical') {
                return await this.handleEscalate(error, {
                    component: error.component,
                    errorType: error.type,
                    action: 'escalate',
                    escalationLevel: 'level3'
                });
            }
            if (error.severity === 'high') {
                return await this.handleNotify(error, {
                    component: error.component,
                    errorType: error.type,
                    action: 'notify',
                    notificationChannels: ['system', 'admin']
                });
            }
            this.logger.warn(`Logged error ${error.id}: ${error.message}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error in default error handling for error ${error.id}: ${error.message}`);
            return false;
        }
    }
    generateErrorId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};
exports.ErrorHandlingService = ErrorHandlingService;
exports.ErrorHandlingService = ErrorHandlingService = ErrorHandlingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        websocket_gateway_1.WebSocketGatewayService,
        state_management_service_1.StateManagementService])
], ErrorHandlingService);
//# sourceMappingURL=error-handling.service.js.map