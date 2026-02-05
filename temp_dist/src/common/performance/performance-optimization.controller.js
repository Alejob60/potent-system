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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PerformanceOptimizationController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceOptimizationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const performance_optimization_service_1 = require("./performance-optimization.service");
let PerformanceOptimizationController = PerformanceOptimizationController_1 = class PerformanceOptimizationController {
    constructor(performanceOptimizationService) {
        this.performanceOptimizationService = performanceOptimizationService;
        this.logger = new common_1.Logger(PerformanceOptimizationController_1.name);
    }
    async getStatus() {
        this.logger.log('Retrieving performance optimization status');
        try {
            const poolStatus = this.performanceOptimizationService.getPoolStatus();
            return {
                success: true,
                data: {
                    poolStatus,
                    timestamp: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            this.logger.error('Failed to retrieve performance optimization status', error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve performance optimization status',
            };
        }
    }
    async analyzeQuery(body) {
        this.logger.log('Analyzing query performance', { body });
        try {
            const result = await this.performanceOptimizationService.analyzeQueryPerformance(body.tableName, body.columns);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            this.logger.error('Failed to analyze query performance', error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to analyze query performance',
            };
        }
    }
    async executeOptimizedQuery(body) {
        this.logger.log('Executing optimized query', {
            query: body.query.substring(0, 100) + '...',
            hasParams: !!body.params,
            hasCacheKey: !!body.cacheKey,
        });
        try {
            const result = await this.performanceOptimizationService.optimizedQuery(body.query, body.params, body.cacheKey);
            return {
                success: true,
                data: result,
                message: 'Query executed successfully',
            };
        }
        catch (error) {
            this.logger.error('Failed to execute optimized query', error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to execute optimized query',
            };
        }
    }
    async batchRedisOperations(body) {
        this.logger.log('Executing batch Redis operations', {
            operationCount: body.operations.length,
        });
        try {
            await this.performanceOptimizationService.batchRedisOperations(body.operations);
            return {
                success: true,
                message: `Executed ${body.operations.length} Redis operations successfully`,
            };
        }
        catch (error) {
            this.logger.error('Failed to execute batch Redis operations', error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to execute batch Redis operations',
            };
        }
    }
};
exports.PerformanceOptimizationController = PerformanceOptimizationController;
__decorate([
    (0, common_1.Get)('status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get performance optimization status' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Performance optimization status retrieved successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceOptimizationController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('analyze-query'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Analyze query performance and provide recommendations' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Query performance analysis completed successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PerformanceOptimizationController.prototype, "analyzeQuery", null);
__decorate([
    (0, common_1.Post)('optimized-query'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Execute an optimized query with caching' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Optimized query executed successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PerformanceOptimizationController.prototype, "executeOptimizedQuery", null);
__decorate([
    (0, common_1.Post)('batch-redis'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Execute batch Redis operations' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Batch Redis operations executed successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PerformanceOptimizationController.prototype, "batchRedisOperations", null);
exports.PerformanceOptimizationController = PerformanceOptimizationController = PerformanceOptimizationController_1 = __decorate([
    (0, swagger_1.ApiTags)('Performance Optimization'),
    (0, common_1.Controller)('api/performance'),
    __metadata("design:paramtypes", [performance_optimization_service_1.PerformanceOptimizationService])
], PerformanceOptimizationController);
//# sourceMappingURL=performance-optimization.controller.js.map