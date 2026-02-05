"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentBase = void 0;
const common_1 = require("@nestjs/common");
class AgentBase {
    constructor(name, description, capabilities, redisService, stateManager, websocketGateway) {
        this.redisService = redisService;
        this.stateManager = stateManager;
        this.websocketGateway = websocketGateway;
        this.logger = new common_1.Logger(name);
        this.config = {
            name,
            version: '1.0.0',
            description,
            capabilities,
        };
        this.metrics = {
            requestsProcessed: 0,
            successRate: 100,
            avgResponseTime: 0,
            errors: 0,
            lastActive: new Date(),
        };
        setTimeout(() => {
            this.registerAgent();
        }, 1000);
    }
    async reportMetrics() {
        return this.metrics;
    }
    updateMetrics(updates) {
        this.metrics = { ...this.metrics, ...updates, lastActive: new Date() };
        this.reportMetricsToRedis();
    }
    handleError(error, context) {
        this.logger.error(`[${context}] ${error.message}`, error.stack);
        this.updateMetrics({
            errors: this.metrics.errors + 1,
            successRate: Math.max(0, this.metrics.successRate - 1),
        });
        if (this.websocketGateway) {
            this.websocketGateway.broadcastSystemNotification({
                type: 'agent_error',
                agent: this.config.name,
                error: error.message,
                context,
                timestamp: new Date().toISOString(),
            });
        }
        return {
            success: false,
            error: error.message,
            metrics: this.metrics,
        };
    }
    async retryWithBackoff(operation, maxRetries = 3, delay = 1000) {
        let lastError;
        for (let i = 0; i <= maxRetries; i++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                if (i < maxRetries) {
                    const jitter = Math.random() * 0.5 + 0.75;
                    const waitTime = Math.min(delay * Math.pow(2, i), 30000) * jitter;
                    this.logger.warn(`Operation failed, retrying in ${waitTime}ms... (${i + 1}/${maxRetries})`);
                    await new Promise((resolve) => setTimeout(resolve, waitTime));
                }
            }
        }
        if (lastError) {
            throw lastError;
        }
        throw new Error('Retry operation failed without specific error');
    }
    async cacheData(key, data, ttl = 3600) {
        if (this.redisService) {
            try {
                const cacheKey = `cache:${this.config.name}:${key}`;
                await this.redisService.set(cacheKey, JSON.stringify(data));
                await this.redisService.expire(cacheKey, ttl);
            }
            catch (error) {
                this.logger.error(`Failed to cache data: ${error.message}`);
            }
        }
    }
    async getCachedData(key) {
        if (this.redisService) {
            try {
                const cacheKey = `cache:${this.config.name}:${key}`;
                const cached = await this.redisService.get(cacheKey);
                return cached ? JSON.parse(cached) : null;
            }
            catch (error) {
                this.logger.error(`Failed to retrieve cached data: ${error.message}`);
                return null;
            }
        }
        return null;
    }
    async batchProcess(operations, concurrency = 5) {
        const results = [];
        for (let i = 0; i < operations.length; i += concurrency) {
            const batch = operations.slice(i, i + concurrency);
            const batchResults = await Promise.all(batch.map(op => this.retryWithBackoff(op, 2, 500)));
            results.push(...batchResults);
        }
        return results;
    }
    async scheduleTask(task, delay) {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    const result = await task();
                    resolve(result);
                }
                catch (error) {
                    reject(error);
                }
            }, delay);
        });
    }
    async registerAgent() {
        if (this.redisService) {
            try {
                const agentKey = `agent:${this.config.name}`;
                await this.redisService.set(agentKey, JSON.stringify({
                    ...this.config,
                    registeredAt: new Date().toISOString(),
                    status: 'active',
                }));
                await this.redisService.expire(agentKey, 300);
                this.logger.log(`Agent ${this.config.name} registered in Redis`);
            }
            catch (error) {
                this.logger.error(`Failed to register agent ${this.config.name} in Redis: ${error.message}`);
            }
        }
    }
    async reportMetricsToRedis() {
        if (this.redisService) {
            try {
                const metricsKey = `agent_metrics:${this.config.name}`;
                await this.redisService.set(metricsKey, JSON.stringify(this.metrics));
                await this.redisService.expire(metricsKey, 3600);
            }
            catch (error) {
                this.logger.error(`Failed to report metrics for agent ${this.config.name} to Redis: ${error.message}`);
            }
        }
    }
    formatResponse(data) {
        this.updateMetrics({
            requestsProcessed: this.metrics.requestsProcessed + 1,
            successRate: Math.min(100, this.metrics.successRate + 0.1),
        });
        return {
            success: true,
            data,
            metrics: this.metrics,
        };
    }
    logActivity(sessionId, activity, data) {
        if (this.stateManager) {
            this.stateManager.addConversationEntry(sessionId, {
                type: 'system_event',
                content: `[${this.config.name}] ${activity}`,
                metadata: data,
            });
        }
    }
}
exports.AgentBase = AgentBase;
//# sourceMappingURL=agent-base.js.map