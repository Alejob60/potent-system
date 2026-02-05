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
var ScalabilityHaController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScalabilityHaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const load_balancing_service_1 = require("./load-balancing.service");
const health_monitoring_service_1 = require("./health-monitoring.service");
const auto_scaling_service_1 = require("./auto-scaling.service");
const caching_strategy_service_1 = require("./caching-strategy.service");
const database_optimization_service_1 = require("./database-optimization.service");
const failover_mechanisms_service_1 = require("./failover-mechanisms.service");
const performance_monitoring_service_1 = require("./performance-monitoring.service");
let ScalabilityHaController = ScalabilityHaController_1 = class ScalabilityHaController {
    constructor(loadBalancingService, healthMonitoringService, autoScalingService, cachingStrategyService, databaseOptimizationService, failoverMechanismsService, performanceMonitoringService) {
        this.loadBalancingService = loadBalancingService;
        this.healthMonitoringService = healthMonitoringService;
        this.autoScalingService = autoScalingService;
        this.cachingStrategyService = cachingStrategyService;
        this.databaseOptimizationService = databaseOptimizationService;
        this.failoverMechanismsService = failoverMechanismsService;
        this.performanceMonitoringService = performanceMonitoringService;
        this.logger = new common_1.Logger(ScalabilityHaController_1.name);
    }
    async configureLoadBalancer(body) {
        try {
            if (!body.strategy || !body.servers || !body.healthCheckInterval || !body.timeout) {
                throw new common_1.BadRequestException('Missing required fields: strategy, servers, healthCheckInterval, timeout');
            }
            this.loadBalancingService.configure(body);
            return {
                success: true,
                message: 'Load balancer configured successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to configure load balancer: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getNextServer() {
        try {
            const server = this.loadBalancingService.getNextServer();
            return {
                success: true,
                data: server,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get next server: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getServerHealth() {
        try {
            const health = this.loadBalancingService.getServerHealth();
            return {
                success: true,
                data: health,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get server health: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async configureHealthMonitoring(body) {
        try {
            if (!body.services || !body.checkInterval || !body.alertThreshold) {
                throw new common_1.BadRequestException('Missing required fields: services, checkInterval, alertThreshold');
            }
            this.healthMonitoringService.configure(body);
            this.healthMonitoringService.startMonitoring();
            return {
                success: true,
                message: 'Health monitoring configured and started successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to configure health monitoring: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getHealthStatus() {
        try {
            const status = this.healthMonitoringService.getHealthStatus();
            return {
                success: true,
                data: status,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get health status: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getHealthAlerts(limit) {
        try {
            const limitNum = limit ? parseInt(limit, 10) : 20;
            const alerts = this.healthMonitoringService.getAlerts(limitNum);
            return {
                success: true,
                data: alerts,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get health alerts: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async configureAutoScaling(body) {
        try {
            const requiredFields = [
                'serviceName', 'minReplicas', 'maxReplicas', 'targetCPUUtilization',
                'targetMemoryUtilization', 'scaleUpThreshold', 'scaleDownThreshold',
                'scaleUpFactor', 'scaleDownFactor', 'cooldownPeriod', 'metricsCheckInterval'
            ];
            for (const field of requiredFields) {
                if (body[field] === undefined) {
                    throw new common_1.BadRequestException(`Missing required field: ${field}`);
                }
            }
            this.autoScalingService.configure(body);
            this.autoScalingService.startAutoScaling();
            return {
                success: true,
                message: 'Auto-scaling configured and started successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to configure auto-scaling: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getCurrentReplicas() {
        try {
            const replicas = this.autoScalingService.getCurrentReplicas();
            return {
                success: true,
                data: replicas,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get current replicas: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getScalingEvents(limit) {
        try {
            const limitNum = limit ? parseInt(limit, 10) : 20;
            const events = this.autoScalingService.getScalingEvents(limitNum);
            return {
                success: true,
                data: events,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get scaling events: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async configureCaching(body) {
        try {
            const requiredFields = ['defaultTTL', 'maxMemory', 'evictionPolicy', 'compressionEnabled', 'compressionThreshold', 'namespace'];
            for (const field of requiredFields) {
                if (body[field] === undefined) {
                    throw new common_1.BadRequestException(`Missing required field: ${field}`);
                }
            }
            this.cachingStrategyService.configure(body);
            return {
                success: true,
                message: 'Caching strategy configured successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to configure caching strategy: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async setCacheValue(body) {
        try {
            if (!body.key || body.value === undefined) {
                throw new common_1.BadRequestException('Missing required fields: key, value');
            }
            const success = await this.cachingStrategyService.set(body.key, body.value, body.ttl);
            return {
                success,
                message: success ? 'Value set in cache successfully' : 'Failed to set value in cache',
            };
        }
        catch (error) {
            this.logger.error(`Failed to set cache value: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getCacheValue(key) {
        try {
            const value = await this.cachingStrategyService.get(key);
            return {
                success: true,
                data: value,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get cache value: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getCacheStats() {
        try {
            const stats = this.cachingStrategyService.getStats();
            return {
                success: true,
                data: stats,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get cache stats: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async configureDatabaseOptimization(body) {
        try {
            const requiredSections = ['connectionPooling', 'queryOptimization', 'indexing', 'connectionRetry'];
            for (const section of requiredSections) {
                if (!body[section]) {
                    throw new common_1.BadRequestException(`Missing required section: ${section}`);
                }
            }
            this.databaseOptimizationService.configure(body);
            this.databaseOptimizationService.startMonitoring();
            return {
                success: true,
                message: 'Database optimization configured and monitoring started successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to configure database optimization: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getDatabaseStats() {
        try {
            const stats = this.databaseOptimizationService.getStats();
            return {
                success: true,
                data: stats,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get database stats: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getSlowQueries(limit) {
        try {
            const limitNum = limit ? parseInt(limit, 10) : 20;
            const queries = this.databaseOptimizationService.getSlowQueries(limitNum);
            return {
                success: true,
                data: queries,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get slow queries: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async configureFailover(body) {
        try {
            const requiredFields = [
                'primaryService', 'backupServices', 'failoverThreshold',
                'healthCheckInterval', 'recoveryCheckInterval', 'enableAutoRecovery'
            ];
            for (const field of requiredFields) {
                if (body[field] === undefined) {
                    throw new common_1.BadRequestException(`Missing required field: ${field}`);
                }
            }
            this.failoverMechanismsService.configure(body);
            this.failoverMechanismsService.startFailoverMonitoring();
            return {
                success: true,
                message: 'Failover mechanisms configured and monitoring started successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to configure failover mechanisms: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getActiveService() {
        try {
            const service = this.failoverMechanismsService.getCurrentActiveService();
            return {
                success: true,
                data: service,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get active service: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getServiceStatus() {
        try {
            const status = this.failoverMechanismsService.getAllServiceStatuses();
            return {
                success: true,
                data: status,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get service status: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getFailoverEvents(limit) {
        try {
            const limitNum = limit ? parseInt(limit, 10) : 20;
            const events = this.failoverMechanismsService.getFailoverEvents(limitNum);
            return {
                success: true,
                data: events,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get failover events: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async configurePerformanceMonitoring(body) {
        try {
            const requiredSections = ['metricsCollection', 'alerting', 'sampling'];
            for (const section of requiredSections) {
                if (!body[section]) {
                    throw new common_1.BadRequestException(`Missing required section: ${section}`);
                }
            }
            this.performanceMonitoringService.configure(body);
            this.performanceMonitoringService.startMonitoring();
            return {
                success: true,
                message: 'Performance monitoring configured and monitoring started successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to configure performance monitoring: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getSystemMetrics(limit) {
        try {
            const limitNum = limit ? parseInt(limit, 10) : 100;
            const metrics = this.performanceMonitoringService.getSystemMetrics(limitNum);
            return {
                success: true,
                data: metrics,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get system metrics: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getApplicationMetrics(limit) {
        try {
            const limitNum = limit ? parseInt(limit, 10) : 100;
            const metrics = this.performanceMonitoringService.getApplicationMetrics(limitNum);
            return {
                success: true,
                data: metrics,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get application metrics: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getPerformanceAlerts(limit, includeResolved) {
        try {
            const limitNum = limit ? parseInt(limit, 10) : 50;
            const includeResolvedBool = includeResolved === 'true';
            const alerts = this.performanceMonitoringService.getAlerts(limitNum, includeResolvedBool);
            return {
                success: true,
                data: alerts,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get performance alerts: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getPerformanceSummary() {
        try {
            const summary = this.performanceMonitoringService.getPerformanceSummary();
            return {
                success: true,
                data: summary,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get performance summary: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
};
exports.ScalabilityHaController = ScalabilityHaController;
__decorate([
    (0, common_1.Post)('load-balancer/configure'),
    (0, swagger_1.ApiOperation)({
        summary: 'Configure load balancer',
        description: 'Configure the load balancer with specified settings',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Load balancer configuration',
        schema: {
            type: 'object',
            properties: {
                strategy: { type: 'string', enum: ['round-robin', 'least-connections', 'weighted-round-robin'] },
                servers: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            url: { type: 'string' },
                            weight: { type: 'number' },
                            active: { type: 'boolean' },
                        },
                        required: ['url', 'active'],
                    },
                },
                healthCheckInterval: { type: 'number' },
                timeout: { type: 'number' },
            },
            required: ['strategy', 'servers', 'healthCheckInterval', 'timeout'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Load balancer configured successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScalabilityHaController.prototype, "configureLoadBalancer", null);
__decorate([
    (0, common_1.Get)('load-balancer/next-server'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get next server',
        description: 'Get the next server based on the load balancing strategy',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Next server retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'string' },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScalabilityHaController.prototype, "getNextServer", null);
__decorate([
    (0, common_1.Get)('load-balancer/health'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get server health',
        description: 'Get health status of all servers',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Server health retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            url: { type: 'string' },
                            healthy: { type: 'boolean' },
                            responseTime: { type: 'number' },
                            lastChecked: { type: 'string', format: 'date-time' },
                        },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScalabilityHaController.prototype, "getServerHealth", null);
__decorate([
    (0, common_1.Post)('health-monitoring/configure'),
    (0, swagger_1.ApiOperation)({
        summary: 'Configure health monitoring',
        description: 'Configure health monitoring for services',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Health monitoring configuration',
        schema: {
            type: 'object',
            properties: {
                services: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            url: { type: 'string' },
                            critical: { type: 'boolean' },
                            expectedStatusCode: { type: 'number' },
                            timeout: { type: 'number' },
                        },
                        required: ['name', 'url', 'critical', 'expectedStatusCode', 'timeout'],
                    },
                },
                checkInterval: { type: 'number' },
                alertThreshold: { type: 'number' },
            },
            required: ['services', 'checkInterval', 'alertThreshold'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Health monitoring configured successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScalabilityHaController.prototype, "configureHealthMonitoring", null);
__decorate([
    (0, common_1.Get)('health-monitoring/status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get health status',
        description: 'Get health status of all monitored services',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Health status retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            url: { type: 'string' },
                            status: { type: 'string', enum: ['healthy', 'unhealthy', 'degraded'] },
                            lastChecked: { type: 'string', format: 'date-time' },
                            responseTime: { type: 'number' },
                            statusCode: { type: 'number' },
                            failureCount: { type: 'number' },
                            lastFailureReason: { type: 'string' },
                        },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScalabilityHaController.prototype, "getHealthStatus", null);
__decorate([
    (0, common_1.Get)('health-monitoring/alerts'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get health alerts',
        description: 'Get recent health alerts',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        description: 'Number of alerts to return (default: 20)',
        required: false,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Health alerts retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            service: { type: 'string' },
                            level: { type: 'string', enum: ['warning', 'critical'] },
                            message: { type: 'string' },
                            timestamp: { type: 'string', format: 'date-time' },
                        },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScalabilityHaController.prototype, "getHealthAlerts", null);
__decorate([
    (0, common_1.Post)('auto-scaling/configure'),
    (0, swagger_1.ApiOperation)({
        summary: 'Configure auto-scaling',
        description: 'Configure auto-scaling for a service',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Auto-scaling configuration',
        schema: {
            type: 'object',
            properties: {
                serviceName: { type: 'string' },
                minReplicas: { type: 'number' },
                maxReplicas: { type: 'number' },
                targetCPUUtilization: { type: 'number' },
                targetMemoryUtilization: { type: 'number' },
                scaleUpThreshold: { type: 'number' },
                scaleDownThreshold: { type: 'number' },
                scaleUpFactor: { type: 'number' },
                scaleDownFactor: { type: 'number' },
                cooldownPeriod: { type: 'number' },
                metricsCheckInterval: { type: 'number' },
            },
            required: [
                'serviceName', 'minReplicas', 'maxReplicas', 'targetCPUUtilization',
                'targetMemoryUtilization', 'scaleUpThreshold', 'scaleDownThreshold',
                'scaleUpFactor', 'scaleDownFactor', 'cooldownPeriod', 'metricsCheckInterval'
            ],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Auto-scaling configured successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScalabilityHaController.prototype, "configureAutoScaling", null);
__decorate([
    (0, common_1.Get)('auto-scaling/replicas'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get current replicas',
        description: 'Get current number of replicas',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Current replicas retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'number' },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScalabilityHaController.prototype, "getCurrentReplicas", null);
__decorate([
    (0, common_1.Get)('auto-scaling/events'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get scaling events',
        description: 'Get recent scaling events',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        description: 'Number of events to return (default: 20)',
        required: false,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Scaling events retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            timestamp: { type: 'string', format: 'date-time' },
                            action: { type: 'string', enum: ['scale_up', 'scale_down', 'scale_to'] },
                            fromReplicas: { type: 'number' },
                            toReplicas: { type: 'number' },
                            reason: { type: 'string' },
                        },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScalabilityHaController.prototype, "getScalingEvents", null);
__decorate([
    (0, common_1.Post)('caching/configure'),
    (0, swagger_1.ApiOperation)({
        summary: 'Configure caching strategy',
        description: 'Configure caching strategy with specified settings',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Caching configuration',
        schema: {
            type: 'object',
            properties: {
                defaultTTL: { type: 'number' },
                maxMemory: { type: 'string' },
                evictionPolicy: { type: 'string' },
                compressionEnabled: { type: 'boolean' },
                compressionThreshold: { type: 'number' },
                namespace: { type: 'string' },
            },
            required: ['defaultTTL', 'maxMemory', 'evictionPolicy', 'compressionEnabled', 'compressionThreshold', 'namespace'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Caching strategy configured successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScalabilityHaController.prototype, "configureCaching", null);
__decorate([
    (0, common_1.Post)('caching/set'),
    (0, swagger_1.ApiOperation)({
        summary: 'Set cache value',
        description: 'Set a value in the cache',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Cache set parameters',
        schema: {
            type: 'object',
            properties: {
                key: { type: 'string' },
                value: { type: 'object' },
                ttl: { type: 'number' },
            },
            required: ['key', 'value'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Value set in cache successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScalabilityHaController.prototype, "setCacheValue", null);
__decorate([
    (0, common_1.Get)('caching/get/:key'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get cache value',
        description: 'Get a value from the cache',
    }),
    (0, swagger_1.ApiParam)({
        name: 'key',
        description: 'Cache key',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Value retrieved from cache successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScalabilityHaController.prototype, "getCacheValue", null);
__decorate([
    (0, common_1.Get)('caching/stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get cache statistics',
        description: 'Get cache statistics',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Cache statistics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        hits: { type: 'number' },
                        misses: { type: 'number' },
                        hitRate: { type: 'number' },
                        evictions: { type: 'number' },
                        memoryUsage: { type: 'number' },
                        keys: { type: 'number' },
                        maxSize: { type: 'number' },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScalabilityHaController.prototype, "getCacheStats", null);
__decorate([
    (0, common_1.Post)('database/configure'),
    (0, swagger_1.ApiOperation)({
        summary: 'Configure database optimization',
        description: 'Configure database optimization settings',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Database optimization configuration',
        schema: {
            type: 'object',
            properties: {
                connectionPooling: {
                    type: 'object',
                    properties: {
                        min: { type: 'number' },
                        max: { type: 'number' },
                        acquireTimeoutMillis: { type: 'number' },
                        createTimeoutMillis: { type: 'number' },
                        destroyTimeoutMillis: { type: 'number' },
                        idleTimeoutMillis: { type: 'number' },
                        createRetryIntervalMillis: { type: 'number' },
                    },
                },
                queryOptimization: {
                    type: 'object',
                    properties: {
                        maxExecutionTime: { type: 'number' },
                        slowQueryThreshold: { type: 'number' },
                        logSlowQueries: { type: 'boolean' },
                    },
                },
                indexing: {
                    type: 'object',
                    properties: {
                        autoIndex: { type: 'boolean' },
                        indexMaintenanceInterval: { type: 'number' },
                    },
                },
                connectionRetry: {
                    type: 'object',
                    properties: {
                        maxRetries: { type: 'number' },
                        retryDelay: { type: 'number' },
                        exponentialBackoff: { type: 'boolean' },
                    },
                },
            },
            required: ['connectionPooling', 'queryOptimization', 'indexing', 'connectionRetry'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Database optimization configured successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScalabilityHaController.prototype, "configureDatabaseOptimization", null);
__decorate([
    (0, common_1.Get)('database/stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get database statistics',
        description: 'Get database statistics',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Database statistics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        connections: {
                            type: 'object',
                            properties: {
                                active: { type: 'number' },
                                idle: { type: 'number' },
                                total: { type: 'number' },
                            },
                        },
                        performance: {
                            type: 'object',
                            properties: {
                                avgQueryTime: { type: 'number' },
                                slowQueries: { type: 'number' },
                                totalQueries: { type: 'number' },
                            },
                        },
                        maintenance: {
                            type: 'object',
                            properties: {
                                lastIndexMaintenance: { type: 'string', format: 'date-time' },
                                pendingIndexOperations: { type: 'number' },
                            },
                        },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScalabilityHaController.prototype, "getDatabaseStats", null);
__decorate([
    (0, common_1.Get)('database/slow-queries'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get slow queries',
        description: 'Get recent slow queries',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        description: 'Number of queries to return (default: 20)',
        required: false,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Slow queries retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            query: { type: 'string' },
                            executionTime: { type: 'number' },
                            timestamp: { type: 'string', format: 'date-time' },
                            rowsAffected: { type: 'number' },
                            hasIndex: { type: 'boolean' },
                        },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScalabilityHaController.prototype, "getSlowQueries", null);
__decorate([
    (0, common_1.Post)('failover/configure'),
    (0, swagger_1.ApiOperation)({
        summary: 'Configure failover mechanisms',
        description: 'Configure failover mechanisms with specified settings',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Failover configuration',
        schema: {
            type: 'object',
            properties: {
                primaryService: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        url: { type: 'string' },
                        healthCheckPath: { type: 'string' },
                        timeout: { type: 'number' },
                    },
                    required: ['name', 'url', 'healthCheckPath', 'timeout'],
                },
                backupServices: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            url: { type: 'string' },
                            priority: { type: 'number' },
                            healthCheckPath: { type: 'string' },
                            timeout: { type: 'number' },
                        },
                        required: ['name', 'url', 'priority', 'healthCheckPath', 'timeout'],
                    },
                },
                failoverThreshold: { type: 'number' },
                healthCheckInterval: { type: 'number' },
                recoveryCheckInterval: { type: 'number' },
                enableAutoRecovery: { type: 'boolean' },
            },
            required: [
                'primaryService', 'backupServices', 'failoverThreshold',
                'healthCheckInterval', 'recoveryCheckInterval', 'enableAutoRecovery'
            ],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Failover mechanisms configured successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScalabilityHaController.prototype, "configureFailover", null);
__decorate([
    (0, common_1.Get)('failover/active-service'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get active service',
        description: 'Get currently active service',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Active service retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'string' },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScalabilityHaController.prototype, "getActiveService", null);
__decorate([
    (0, common_1.Get)('failover/status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get service status',
        description: 'Get status of all services',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service status retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            url: { type: 'string' },
                            status: { type: 'string', enum: ['healthy', 'unhealthy', 'degraded'] },
                            lastChecked: { type: 'string', format: 'date-time' },
                            responseTime: { type: 'number' },
                            failureCount: { type: 'number' },
                            lastFailureReason: { type: 'string' },
                        },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScalabilityHaController.prototype, "getServiceStatus", null);
__decorate([
    (0, common_1.Get)('failover/events'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get failover events',
        description: 'Get recent failover events',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        description: 'Number of events to return (default: 20)',
        required: false,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Failover events retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            timestamp: { type: 'string', format: 'date-time' },
                            fromService: { type: 'string' },
                            toService: { type: 'string' },
                            reason: { type: 'string' },
                            duration: { type: 'number' },
                        },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScalabilityHaController.prototype, "getFailoverEvents", null);
__decorate([
    (0, common_1.Post)('performance/configure'),
    (0, swagger_1.ApiOperation)({
        summary: 'Configure performance monitoring',
        description: 'Configure performance monitoring with specified settings',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Performance monitoring configuration',
        schema: {
            type: 'object',
            properties: {
                metricsCollection: {
                    type: 'object',
                    properties: {
                        interval: { type: 'number' },
                        retentionPeriod: { type: 'number' },
                    },
                    required: ['interval', 'retentionPeriod'],
                },
                alerting: {
                    type: 'object',
                    properties: {
                        enableAlerts: { type: 'boolean' },
                        thresholds: {
                            type: 'object',
                            properties: {
                                cpuUtilization: { type: 'number' },
                                memoryUtilization: { type: 'number' },
                                responseTime: { type: 'number' },
                                errorRate: { type: 'number' },
                                throughput: { type: 'number' },
                            },
                        },
                        notificationChannels: {
                            type: 'array',
                            items: { type: 'string' },
                        },
                    },
                    required: ['enableAlerts', 'thresholds', 'notificationChannels'],
                },
                sampling: {
                    type: 'object',
                    properties: {
                        requestSamplingRate: { type: 'number' },
                        traceSamplingRate: { type: 'number' },
                    },
                    required: ['requestSamplingRate', 'traceSamplingRate'],
                },
            },
            required: ['metricsCollection', 'alerting', 'sampling'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Performance monitoring configured successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScalabilityHaController.prototype, "configurePerformanceMonitoring", null);
__decorate([
    (0, common_1.Get)('performance/system-metrics'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get system metrics',
        description: 'Get recent system metrics',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        description: 'Number of metrics to return (default: 100)',
        required: false,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'System metrics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            timestamp: { type: 'string', format: 'date-time' },
                            cpu: {
                                type: 'object',
                                properties: {
                                    utilization: { type: 'number' },
                                    loadAverage: { type: 'number' },
                                    cores: { type: 'number' },
                                },
                            },
                            memory: {
                                type: 'object',
                                properties: {
                                    used: { type: 'number' },
                                    total: { type: 'number' },
                                    utilization: { type: 'number' },
                                },
                            },
                            disk: {
                                type: 'object',
                                properties: {
                                    used: { type: 'number' },
                                    total: { type: 'number' },
                                    utilization: { type: 'number' },
                                },
                            },
                            network: {
                                type: 'object',
                                properties: {
                                    in: { type: 'number' },
                                    out: { type: 'number' },
                                },
                            },
                        },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScalabilityHaController.prototype, "getSystemMetrics", null);
__decorate([
    (0, common_1.Get)('performance/application-metrics'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get application metrics',
        description: 'Get recent application metrics',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        description: 'Number of metrics to return (default: 100)',
        required: false,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Application metrics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            timestamp: { type: 'string', format: 'date-time' },
                            requests: {
                                type: 'object',
                                properties: {
                                    total: { type: 'number' },
                                    successful: { type: 'number' },
                                    failed: { type: 'number' },
                                    errorRate: { type: 'number' },
                                },
                            },
                            responseTimes: {
                                type: 'object',
                                properties: {
                                    avg: { type: 'number' },
                                    p50: { type: 'number' },
                                    p90: { type: 'number' },
                                    p95: { type: 'number' },
                                    p99: { type: 'number' },
                                },
                            },
                            throughput: {
                                type: 'object',
                                properties: {
                                    requestsPerSecond: { type: 'number' },
                                    currentRPS: { type: 'number' },
                                },
                            },
                        },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScalabilityHaController.prototype, "getApplicationMetrics", null);
__decorate([
    (0, common_1.Get)('performance/alerts'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get performance alerts',
        description: 'Get recent performance alerts',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        description: 'Number of alerts to return (default: 50)',
        required: false,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'includeResolved',
        description: 'Include resolved alerts (default: false)',
        required: false,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Performance alerts retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            level: { type: 'string', enum: ['info', 'warning', 'critical'] },
                            metric: { type: 'string' },
                            currentValue: { type: 'number' },
                            threshold: { type: 'number' },
                            message: { type: 'string' },
                            timestamp: { type: 'string', format: 'date-time' },
                            resolved: { type: 'boolean' },
                            resolvedAt: { type: 'string', format: 'date-time' },
                        },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('includeResolved')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ScalabilityHaController.prototype, "getPerformanceAlerts", null);
__decorate([
    (0, common_1.Get)('performance/summary'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get performance summary',
        description: 'Get performance summary',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Performance summary retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        timestamp: { type: 'string', format: 'date-time' },
                        system: {
                            type: 'object',
                            properties: {
                                cpu: {
                                    type: 'object',
                                    properties: {
                                        utilization: { type: 'string' },
                                        loadAverage: { type: 'string' },
                                    },
                                },
                                memory: {
                                    type: 'object',
                                    properties: {
                                        utilization: { type: 'string' },
                                        used: { type: 'string' },
                                        total: { type: 'string' },
                                    },
                                },
                            },
                        },
                        application: {
                            type: 'object',
                            properties: {
                                requests: {
                                    type: 'object',
                                    properties: {
                                        total: { type: 'number' },
                                        errorRate: { type: 'string' },
                                    },
                                },
                                responseTime: {
                                    type: 'object',
                                    properties: {
                                        average: { type: 'string' },
                                    },
                                },
                                throughput: {
                                    type: 'object',
                                    properties: {
                                        rps: { type: 'string' },
                                    },
                                },
                            },
                        },
                        alerts: {
                            type: 'object',
                            properties: {
                                total: { type: 'number' },
                                critical: { type: 'number' },
                            },
                        },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScalabilityHaController.prototype, "getPerformanceSummary", null);
exports.ScalabilityHaController = ScalabilityHaController = ScalabilityHaController_1 = __decorate([
    (0, swagger_1.ApiTags)('scalability-ha'),
    (0, common_1.Controller)('scalability-ha'),
    __metadata("design:paramtypes", [load_balancing_service_1.LoadBalancingService,
        health_monitoring_service_1.HealthMonitoringService,
        auto_scaling_service_1.AutoScalingService,
        caching_strategy_service_1.CachingStrategyService,
        database_optimization_service_1.DatabaseOptimizationService,
        failover_mechanisms_service_1.FailoverMechanismsService,
        performance_monitoring_service_1.PerformanceMonitoringService])
], ScalabilityHaController);
//# sourceMappingURL=scalability-ha.controller.js.map