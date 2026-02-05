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
var FaultToleranceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaultToleranceService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../common/redis/redis.service");
const websocket_gateway_1 = require("../../websocket/websocket.gateway");
const state_management_service_1 = require("../../state/state-management.service");
let FaultToleranceService = FaultToleranceService_1 = class FaultToleranceService {
    constructor(redisService, websocketGateway, stateManager) {
        this.redisService = redisService;
        this.websocketGateway = websocketGateway;
        this.stateManager = stateManager;
        this.logger = new common_1.Logger(FaultToleranceService_1.name);
        this.CIRCUIT_BREAKER_PREFIX = 'circuit_breaker';
        this.RETRY_POLICY_PREFIX = 'retry_policy';
        this.FAILURE_LOG_PREFIX = 'failure_log';
    }
    async createCircuitBreaker(id, config) {
        try {
            const state = {
                id,
                status: 'closed',
                failureCount: 0,
                lastFailure: null,
                nextAttempt: null,
                config
            };
            const key = `${this.CIRCUIT_BREAKER_PREFIX}:${id}`;
            await this.redisService.set(key, JSON.stringify(state));
            this.logger.log(`Created circuit breaker ${id}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error creating circuit breaker ${id}: ${error.message}`);
            return false;
        }
    }
    async canExecute(id) {
        try {
            const key = `${this.CIRCUIT_BREAKER_PREFIX}:${id}`;
            const stateJson = await this.redisService.get(key);
            if (!stateJson) {
                return true;
            }
            const state = JSON.parse(stateJson);
            if (state.lastFailure) {
                state.lastFailure = new Date(state.lastFailure);
            }
            if (state.nextAttempt) {
                state.nextAttempt = new Date(state.nextAttempt);
            }
            switch (state.status) {
                case 'closed':
                    return true;
                case 'open':
                    const now = new Date();
                    if (state.nextAttempt && now >= state.nextAttempt) {
                        state.status = 'half-open';
                        state.nextAttempt = null;
                        await this.redisService.set(key, JSON.stringify(state));
                        return true;
                    }
                    return false;
                case 'half-open':
                    return true;
                default:
                    return true;
            }
        }
        catch (error) {
            this.logger.error(`Error checking circuit breaker ${id}: ${error.message}`);
            return true;
        }
    }
    async reportSuccess(id) {
        try {
            const key = `${this.CIRCUIT_BREAKER_PREFIX}:${id}`;
            const stateJson = await this.redisService.get(key);
            if (!stateJson) {
                return true;
            }
            const state = JSON.parse(stateJson);
            state.failureCount = 0;
            state.lastFailure = null;
            state.nextAttempt = null;
            state.status = 'closed';
            await this.redisService.set(key, JSON.stringify(state));
            this.websocketGateway.broadcastSystemNotification({
                type: 'circuit_breaker_reset',
                circuitBreakerId: id,
                status: 'closed',
                timestamp: new Date().toISOString(),
            });
            return true;
        }
        catch (error) {
            this.logger.error(`Error reporting success for circuit breaker ${id}: ${error.message}`);
            return false;
        }
    }
    async reportFailure(id, error) {
        try {
            const key = `${this.CIRCUIT_BREAKER_PREFIX}:${id}`;
            const stateJson = await this.redisService.get(key);
            if (!stateJson) {
                return true;
            }
            const state = JSON.parse(stateJson);
            if (state.lastFailure) {
                state.lastFailure = new Date(state.lastFailure);
            }
            if (state.nextAttempt) {
                state.nextAttempt = new Date(state.nextAttempt);
            }
            state.failureCount += 1;
            state.lastFailure = new Date();
            if (state.failureCount >= state.config.failureThreshold) {
                state.status = 'open';
                const nextAttempt = new Date();
                nextAttempt.setTime(nextAttempt.getTime() + state.config.timeout);
                state.nextAttempt = nextAttempt;
                await this.logFailure(id, error);
                this.websocketGateway.broadcastSystemNotification({
                    type: 'circuit_breaker_opened',
                    circuitBreakerId: id,
                    status: 'open',
                    failureCount: state.failureCount,
                    timestamp: new Date().toISOString(),
                });
            }
            await this.redisService.set(key, JSON.stringify(state));
            return true;
        }
        catch (e) {
            this.logger.error(`Error reporting failure for circuit breaker ${id}: ${e.message}`);
            return false;
        }
    }
    async logFailure(id, error) {
        try {
            const logEntry = {
                id,
                timestamp: new Date(),
                error: JSON.stringify(error)
            };
            const key = `${this.FAILURE_LOG_PREFIX}:${id}`;
            const logsJson = await this.redisService.lrange(key, 0, 99);
            const logs = logsJson.map(log => JSON.parse(log));
            logs.push(logEntry);
            if (logs.length > 100) {
                logs.splice(0, logs.length - 100);
            }
            await this.redisService.del(key);
            for (const log of logs) {
                await this.redisService.rpush(key, JSON.stringify(log));
            }
            return true;
        }
        catch (e) {
            this.logger.error(`Error logging failure for circuit breaker ${id}: ${e.message}`);
            return false;
        }
    }
    async getCircuitBreakerState(id) {
        try {
            const key = `${this.CIRCUIT_BREAKER_PREFIX}:${id}`;
            const stateJson = await this.redisService.get(key);
            if (!stateJson) {
                return null;
            }
            const state = JSON.parse(stateJson);
            if (state.lastFailure) {
                state.lastFailure = new Date(state.lastFailure);
            }
            if (state.nextAttempt) {
                state.nextAttempt = new Date(state.nextAttempt);
            }
            return state;
        }
        catch (error) {
            this.logger.error(`Error retrieving circuit breaker state for ${id}: ${error.message}`);
            return null;
        }
    }
    async executeWithRetry(id, fn, policy = {
        maxAttempts: 3,
        delay: 1000,
        backoffMultiplier: 2,
        maxDelay: 30000
    }) {
        let lastError;
        for (let attempt = 1; attempt <= policy.maxAttempts; attempt++) {
            try {
                const canExecute = await this.canExecute(id);
                if (!canExecute) {
                    throw new Error(`Circuit breaker ${id} is open`);
                }
                const result = await fn();
                await this.reportSuccess(id);
                return result;
            }
            catch (error) {
                lastError = error;
                await this.reportFailure(id, {
                    message: error.message,
                    stack: error.stack,
                    attempt
                });
                if (attempt === policy.maxAttempts) {
                    throw error;
                }
                const delay = Math.min(policy.delay * Math.pow(policy.backoffMultiplier, attempt - 1), policy.maxDelay);
                this.logger.warn(`Attempt ${attempt} failed for ${id}, retrying in ${delay}ms: ${error.message}`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw lastError || new Error(`Failed after ${policy.maxAttempts} attempts`);
    }
    async createRetryPolicy(id, policy) {
        try {
            const key = `${this.RETRY_POLICY_PREFIX}:${id}`;
            await this.redisService.set(key, JSON.stringify(policy));
            this.logger.log(`Created retry policy ${id}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error creating retry policy ${id}: ${error.message}`);
            return false;
        }
    }
    async getRetryPolicy(id) {
        try {
            const key = `${this.RETRY_POLICY_PREFIX}:${id}`;
            const policyJson = await this.redisService.get(key);
            if (!policyJson) {
                return null;
            }
            return JSON.parse(policyJson);
        }
        catch (error) {
            this.logger.error(`Error retrieving retry policy ${id}: ${error.message}`);
            return null;
        }
    }
};
exports.FaultToleranceService = FaultToleranceService;
exports.FaultToleranceService = FaultToleranceService = FaultToleranceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        websocket_gateway_1.WebSocketGatewayService,
        state_management_service_1.StateManagementService])
], FaultToleranceService);
//# sourceMappingURL=fault-tolerance.service.js.map