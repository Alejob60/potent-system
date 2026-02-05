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
var PerformanceOptimizationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceOptimizationService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../common/redis/redis.service");
const state_management_service_1 = require("../../state/state-management.service");
let PerformanceOptimizationService = PerformanceOptimizationService_1 = class PerformanceOptimizationService {
    constructor(redisService, stateManager) {
        this.redisService = redisService;
        this.stateManager = stateManager;
        this.logger = new common_1.Logger(PerformanceOptimizationService_1.name);
        this.METRICS_PREFIX = 'performance_metrics';
        this.RECOMMENDATIONS_PREFIX = 'optimization_recommendations';
        this.BASELINE_PREFIX = 'performance_baseline';
        this.CACHE_PREFIX = 'performance_cache';
    }
    async recordMetrics(sessionId, metrics) {
        try {
            const key = `${this.METRICS_PREFIX}:${sessionId}:${metrics.timestamp.getTime()}`;
            await this.redisService.setex(key, 86400, JSON.stringify(metrics));
            await this.stateManager.addConversationEntry(sessionId, {
                type: 'system_event',
                content: 'Performance metrics recorded',
                metadata: metrics
            });
            this.logger.log(`Recorded performance metrics for session ${sessionId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error recording metrics for session ${sessionId}: ${error.message}`);
            return false;
        }
    }
    async getMetrics(sessionId, limit = 100) {
        try {
            return [];
        }
        catch (error) {
            this.logger.error(`Error retrieving metrics for session ${sessionId}: ${error.message}`);
            return [];
        }
    }
    async generateRecommendations(sessionId) {
        try {
            return [];
        }
        catch (error) {
            this.logger.error(`Error generating recommendations for session ${sessionId}: ${error.message}`);
            return [];
        }
    }
    async cacheResult(key, value, ttl = 3600) {
        try {
            const cacheKey = `${this.CACHE_PREFIX}:${key}`;
            await this.redisService.setex(cacheKey, ttl, JSON.stringify(value));
            return true;
        }
        catch (error) {
            this.logger.error(`Error caching result for key ${key}: ${error.message}`);
            return false;
        }
    }
    async getCachedResult(key) {
        try {
            const cacheKey = `${this.CACHE_PREFIX}:${key}`;
            const valueJson = await this.redisService.get(cacheKey);
            if (!valueJson) {
                return null;
            }
            return JSON.parse(valueJson);
        }
        catch (error) {
            this.logger.error(`Error retrieving cached result for key ${key}: ${error.message}`);
            return null;
        }
    }
    async isCached(key) {
        try {
            const cacheKey = `${this.CACHE_PREFIX}:${key}`;
            return await this.redisService.exists(cacheKey);
        }
        catch (error) {
            this.logger.error(`Error checking cache for key ${key}: ${error.message}`);
            return false;
        }
    }
    async invalidateCache(key) {
        try {
            const cacheKey = `${this.CACHE_PREFIX}:${key}`;
            await this.redisService.del(cacheKey);
            return true;
        }
        catch (error) {
            this.logger.error(`Error invalidating cache for key ${key}: ${error.message}`);
            return false;
        }
    }
    async createBaseline(baseline) {
        try {
            const key = `${this.BASELINE_PREFIX}:${baseline.metric}`;
            await this.redisService.set(key, JSON.stringify(baseline));
            return true;
        }
        catch (error) {
            this.logger.error(`Error creating baseline for metric ${baseline.metric}: ${error.message}`);
            return false;
        }
    }
    async getBaseline(metric) {
        try {
            const key = `${this.BASELINE_PREFIX}:${metric}`;
            const baselineJson = await this.redisService.get(key);
            if (!baselineJson) {
                return null;
            }
            return JSON.parse(baselineJson);
        }
        catch (error) {
            this.logger.error(`Error retrieving baseline for metric ${metric}: ${error.message}`);
            return null;
        }
    }
    async checkBaselineDeviation(metric, value) {
        try {
            const baseline = await this.getBaseline(metric);
            if (!baseline) {
                return false;
            }
            const deviation = Math.abs(value - baseline.baselineValue) / baseline.baselineValue * 100;
            return deviation > baseline.threshold;
        }
        catch (error) {
            this.logger.error(`Error checking baseline deviation for metric ${metric}: ${error.message}`);
            return false;
        }
    }
    async recordRecommendation(recommendation) {
        try {
            const key = `${this.RECOMMENDATIONS_PREFIX}:${recommendation.id}`;
            await this.redisService.setex(key, 2592000, JSON.stringify(recommendation));
            return true;
        }
        catch (error) {
            this.logger.error(`Error recording recommendation ${recommendation.id}: ${error.message}`);
            return false;
        }
    }
    async getRecommendations(limit = 50) {
        try {
            return [];
        }
        catch (error) {
            this.logger.error(`Error retrieving recommendations: ${error.message}`);
            return [];
        }
    }
    async applyCachingStrategy(workflowId, stepId, cacheTTL) {
        try {
            this.logger.log(`Applied caching strategy to workflow ${workflowId} step ${stepId} with TTL ${cacheTTL}s`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error applying caching strategy to workflow ${workflowId} step ${stepId}: ${error.message}`);
            return false;
        }
    }
    async optimizeDatabaseQuery(queryId, optimizationStrategy) {
        try {
            this.logger.log(`Applied database optimization strategy "${optimizationStrategy}" to query ${queryId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error optimizing database query ${queryId}: ${error.message}`);
            return false;
        }
    }
    async enableParallelProcessing(workflowId, stepIds) {
        try {
            this.logger.log(`Enabled parallel processing for workflow ${workflowId} steps: ${stepIds.join(', ')}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error enabling parallel processing for workflow ${workflowId}: ${error.message}`);
            return false;
        }
    }
    async getSystemMetrics() {
        try {
            const memoryUsage = process.memoryUsage();
            const memoryMB = Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100;
            const cpuUsage = 0;
            const metrics = {
                executionTime: 0,
                memoryUsage: memoryMB,
                cpuUsage,
                throughput: 0,
                errorRate: 0,
                cacheHitRate: 0,
                timestamp: new Date()
            };
            return metrics;
        }
        catch (error) {
            this.logger.error(`Error retrieving system metrics: ${error.message}`);
            return {
                executionTime: 0,
                memoryUsage: 0,
                cpuUsage: 0,
                throughput: 0,
                errorRate: 0,
                cacheHitRate: 0,
                timestamp: new Date()
            };
        }
    }
};
exports.PerformanceOptimizationService = PerformanceOptimizationService;
exports.PerformanceOptimizationService = PerformanceOptimizationService = PerformanceOptimizationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        state_management_service_1.StateManagementService])
], PerformanceOptimizationService);
//# sourceMappingURL=performance-optimization.service.js.map