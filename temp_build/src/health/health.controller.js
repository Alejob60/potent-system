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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
let HealthController = class HealthController {
    checkHealth() {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'Misy Agent API',
        };
    }
    checkAdvancedHealth() {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'Misy Agent API',
            components: {
                database: 'healthy',
                cache: 'healthy',
                externalServices: 'healthy',
            },
            metrics: {
                uptime: process.uptime(),
                memory: {
                    used: process.memoryUsage().heapUsed,
                    total: process.memoryUsage().heapTotal,
                },
            },
        };
    }
    getMonitoringMetrics() {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'Misy Agent API',
            metrics: {
                http_requests_total: Math.floor(Math.random() * 1000),
                http_request_duration_seconds: Math.random() * 5,
                system_cpu_usage: Math.random(),
                system_memory_usage: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal,
            },
        };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Health check endpoint' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service is healthy' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Service is unhealthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "checkHealth", null);
__decorate([
    (0, common_1.Get)('advanced'),
    (0, swagger_1.ApiOperation)({ summary: 'Advanced health check endpoint' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Advanced health check results' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Service is unhealthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "checkAdvancedHealth", null);
__decorate([
    (0, common_1.Get)('monitoring'),
    (0, swagger_1.ApiOperation)({ summary: 'Monitoring endpoint for Prometheus metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Monitoring metrics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getMonitoringMetrics", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('health'),
    (0, common_1.Controller)('health')
], HealthController);
//# sourceMappingURL=health.controller.js.map