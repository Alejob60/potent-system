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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaMetricsController = void 0;
const common_1 = require("@nestjs/common");
const meta_metrics_service_1 = require("../services/meta-metrics.service");
const swagger_1 = require("@nestjs/swagger");
let MetaMetricsController = class MetaMetricsController {
    constructor(service) {
        this.service = service;
    }
    async getAggregateMetrics() {
        return this.service.getAggregateMetrics();
    }
    async getAgentMetrics(agent) {
        return this.service.getAgentMetrics(agent);
    }
    async generateInsights(params) {
        return this.service.generateInsights(params);
    }
};
exports.MetaMetricsController = MetaMetricsController;
__decorate([
    (0, common_1.Get)('aggregate'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener m tricas cruzadas',
        description: 'Recoge m tricas de todos los agentes y las relaciona para generar m tricas compuestas',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'M tricas agregadas recuperadas exitosamente',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetaMetricsController.prototype, "getAggregateMetrics", null);
__decorate([
    (0, common_1.Get)(':agent'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener m tricas individuales de un agente',
        description: 'Recoge m tricas espec ficas de un agente particular',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'M tricas individuales recuperadas exitosamente',
    }),
    __param(0, (0, common_1.Param)('agent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MetaMetricsController.prototype, "getAgentMetrics", null);
__decorate([
    (0, common_1.Post)('insights'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generar nuevas m tricas e insights',
        description: 'Genera nuevas m tricas compuestas a partir de los datos existentes',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Par metros para generaci n de insights',
        schema: {
            type: 'object',
            properties: {
                timeframe: { type: 'string', example: 'last_30_days' },
                agents: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['trend-scanner', 'video-scriptor'],
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Insights generados exitosamente' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MetaMetricsController.prototype, "generateInsights", null);
exports.MetaMetricsController = MetaMetricsController = __decorate([
    (0, swagger_1.ApiTags)('metrics'),
    (0, common_1.Controller)('metrics'),
    __metadata("design:paramtypes", [meta_metrics_service_1.MetaMetricsService])
], MetaMetricsController);
//# sourceMappingURL=meta-metrics.controller.js.map