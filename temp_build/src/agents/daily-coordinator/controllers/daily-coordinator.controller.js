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
exports.DailyCoordinatorController = void 0;
const common_1 = require("@nestjs/common");
const daily_coordinator_service_1 = require("../services/daily-coordinator.service");
const swagger_1 = require("@nestjs/swagger");
let DailyCoordinatorController = class DailyCoordinatorController {
    constructor(service) {
        this.service = service;
    }
    async convocarReunion() {
        return this.service.convocarReunionDiaria();
    }
    async consultarEstado() {
        return this.service.consultarEstadoAgentes();
    }
    async publicarResumen(datos) {
        return this.service.publicarResumenDiario(datos);
    }
};
exports.DailyCoordinatorController = DailyCoordinatorController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Convoca reuni n diaria entre agentes',
        description: 'Coordina una reuni n interna entre todos los agentes cada 15 minutos',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reuni n convocada exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Error al convocar la reuni n' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DailyCoordinatorController.prototype, "convocarReunion", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Consulta el estado de cada agente',
        description: 'Obtiene el estado actual de todos los agentes en el sistema',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estados de agentes recuperados' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DailyCoordinatorController.prototype, "consultarEstado", null);
__decorate([
    (0, common_1.Post)('brief'),
    (0, swagger_1.ApiOperation)({
        summary: 'Publica resumen diario',
        description: 'Publica un resumen diario de las actividades de los agentes',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Datos del resumen diario',
        schema: {
            type: 'object',
            properties: {
                date: { type: 'string', example: '2023-05-15' },
                summary: { type: 'string', example: 'Resumen de actividades del d a' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Resumen publicado exitosamente' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DailyCoordinatorController.prototype, "publicarResumen", null);
exports.DailyCoordinatorController = DailyCoordinatorController = __decorate([
    (0, swagger_1.ApiTags)('agents'),
    (0, common_1.Controller)('agents/daily-sync'),
    __metadata("design:paramtypes", [daily_coordinator_service_1.DailyCoordinatorService])
], DailyCoordinatorController);
//# sourceMappingURL=daily-coordinator.controller.js.map