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
exports.TrendAttackCoordinatorController = void 0;
const common_1 = require("@nestjs/common");
const trend_attack_coordinator_service_1 = require("../services/trend-attack-coordinator.service");
const swagger_1 = require("@nestjs/swagger");
let TrendAttackCoordinatorController = class TrendAttackCoordinatorController {
    constructor(service) {
        this.service = service;
    }
    async convocarCampana(campaignData) {
        return this.service.convocarCampanaViral(campaignData);
    }
};
exports.TrendAttackCoordinatorController = TrendAttackCoordinatorController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Convoca una campaa viral',
        description: 'Coordina el "ataque viral" cuando se detecta una oportunidad de tendencia',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Datos para la campaa viral',
        schema: {
            type: 'object',
            properties: {
                trend: {
                    type: 'object',
                    example: {
                        id: 'trend-123',
                        name: 'Nueva tendencia viral',
                        platform: 'tiktok',
                        potential: 'high',
                    },
                },
                context: {
                    type: 'object',
                    properties: {
                        sessionId: { type: 'string', example: 'user-session-123' },
                        businessInfo: {
                            type: 'object',
                            properties: {
                                name: { type: 'string', example: 'MisyBot' },
                                industry: { type: 'string', example: 'Tecnologa' },
                            },
                        },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Campaa viral convocada exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos invlidos' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TrendAttackCoordinatorController.prototype, "convocarCampana", null);
exports.TrendAttackCoordinatorController = TrendAttackCoordinatorController = __decorate([
    (0, swagger_1.ApiTags)('trend'),
    (0, common_1.Controller)('trend/attack'),
    __metadata("design:paramtypes", [trend_attack_coordinator_service_1.TrendAttackCoordinatorService])
], TrendAttackCoordinatorController);
//# sourceMappingURL=trend-attack-coordinator.controller.js.map