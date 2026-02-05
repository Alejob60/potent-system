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
exports.SocialAuthMonitorController = void 0;
const common_1 = require("@nestjs/common");
const social_auth_monitor_service_1 = require("../services/social-auth-monitor.service");
const swagger_1 = require("@nestjs/swagger");
let SocialAuthMonitorController = class SocialAuthMonitorController {
    constructor(service) {
        this.service = service;
    }
    async getSocialAuthStatus() {
        return this.service.getSocialAuthStatus();
    }
    async getPlatformStatus(platform) {
        return this.service.getPlatformStatus(platform);
    }
    async refreshTokens(refreshData) {
        return this.service.refreshTokens(refreshData);
    }
};
exports.SocialAuthMonitorController = SocialAuthMonitorController;
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtiene el estado de conexi n con redes sociales',
        description: 'Verifica el estado de conexi n con todas las redes sociales configuradas',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Estado de conexiones recuperado exitosamente',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SocialAuthMonitorController.prototype, "getSocialAuthStatus", null);
__decorate([
    (0, common_1.Get)('status/:platform'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtiene el estado de conexi n con una red social espec fica',
        description: 'Verifica el estado de conexi n con una red social espec fica',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Estado de conexi n recuperado exitosamente',
    }),
    __param(0, (0, common_1.Param)('platform')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SocialAuthMonitorController.prototype, "getPlatformStatus", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, swagger_1.ApiOperation)({
        summary: 'Renueva tokens de acceso',
        description: 'Renueva autom ticamente los tokens de acceso para todas las plataformas',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Datos para renovaci n de tokens',
        schema: {
            type: 'object',
            properties: {
                platform: { type: 'string', example: 'instagram' },
                accountId: { type: 'string', example: 'account-123' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tokens renovados exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inv lidos' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocialAuthMonitorController.prototype, "refreshTokens", null);
exports.SocialAuthMonitorController = SocialAuthMonitorController = __decorate([
    (0, swagger_1.ApiTags)('oauth'),
    (0, common_1.Controller)('oauth'),
    __metadata("design:paramtypes", [social_auth_monitor_service_1.SocialAuthMonitorService])
], SocialAuthMonitorController);
//# sourceMappingURL=social-auth-monitor.controller.js.map