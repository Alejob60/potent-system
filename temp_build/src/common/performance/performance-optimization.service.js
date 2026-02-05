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
const typeorm_1 = require("typeorm");
const redis_service_1 = require("../redis/redis.service");
let PerformanceOptimizationService = PerformanceOptimizationService_1 = class PerformanceOptimizationService {
    constructor(dataSource, redisService) {
        this.dataSource = dataSource;
        this.redisService = redisService;
        this.logger = new common_1.Logger(PerformanceOptimizationService_1.name);
        this.QUERY_CACHE_TTL = 300;
    }
    async optimizedQuery(query, params = [], cacheKey) {
        try {
            if (cacheKey) {
                const cachedResult = await this.redisService.get(`query:${cacheKey}`);
                if (cachedResult) {
                    this.logger.debug(`Cache hit for query: ${cacheKey}`);
                    return JSON.parse(cachedResult);
                }
            }
            const result = await this.dataSource.query(query, params);
            if (cacheKey && result) {
                await this.redisService.setex(`query:${cacheKey}`, this.QUERY_CACHE_TTL, JSON.stringify(result));
                this.logger.debug(`Cached result for query: ${cacheKey}`);
            }
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to execute optimized query: ${error.message}`, error.stack);
            throw error;
        }
    }
    async createOptimizedQueryRunner() {
        const queryRunner = this.dataSource.createQueryRunner();
        return queryRunner;
    }
    async batchRedisOperations(operations) {
        try {
            const batchSize = 10;
            for (let i = 0; i < operations.length; i += batchSize) {
                const batch = operations.slice(i, i + batchSize);
                const promises = batch.map(op => this.redisService.set(op.key, op.value, op.ttl));
                await Promise.all(promises);
            }
            this.logger.debug(`Executed ${operations.length} Redis operations in batches`);
        }
        catch (error) {
            this.logger.error(`Failed to execute batch Redis operations: ${error.message}`, error.stack);
            throw error;
        }
    }
    getPoolStatus() {
        return {
            status: 'active',
            message: 'Connection pooling is managed by TypeORM',
        };
    }
    async analyzeQueryPerformance(tableName, columns) {
        try {
            const query = `
        SELECT 
          schemaname,
          tablename,
          attname AS column_name,
          n_distinct,
          correlation
        FROM pg_stats 
        WHERE tablename = $1 AND attname = ANY($2)
      `;
            const result = await this.dataSource.query(query, [tableName, columns]);
            const recommendations = result.map((row) => {
                const recommendation = {
                    table: row.tablename,
                    column: row.column_name,
                    distinctValues: row.n_distinct,
                    correlation: row.correlation,
                    indexRecommended: false,
                    reason: '',
                };
                if (Math.abs(row.correlation) > 0.7 || Math.abs(row.n_distinct) > 100) {
                    recommendation.indexRecommended = true;
                    recommendation.reason = 'High cardinality or good correlation detected';
                }
                return recommendation;
            });
            return {
                tableName,
                columns,
                statistics: result,
                recommendations,
            };
        }
        catch (error) {
            this.logger.error(`Failed to analyze query performance: ${error.message}`, error.stack);
            return {
                error: error.message,
                recommendations: [],
            };
        }
    }
    async optimizedNetworkRequest(url, options = {}) {
        try {
            return {
                message: 'Network optimization would be implemented here',
                url,
                options,
            };
        }
        catch (error) {
            this.logger.error(`Failed to execute optimized network request: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.PerformanceOptimizationService = PerformanceOptimizationService;
exports.PerformanceOptimizationService = PerformanceOptimizationService = PerformanceOptimizationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        redis_service_1.RedisService])
], PerformanceOptimizationService);
//# sourceMappingURL=performance-optimization.service.js.map