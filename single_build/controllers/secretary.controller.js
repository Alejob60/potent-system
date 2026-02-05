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
exports.SecretaryController = void 0;
const common_1 = require("@nestjs/common");
const secretary_service_1 = require("../services/secretary/secretary.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let SecretaryController = class SecretaryController {
    secretaryService;
    constructor(secretaryService) {
        this.secretaryService = secretaryService;
    }
    async processCommand(req, payload) {
        const { id: userId, tenantId } = req.user;
        const { input } = payload;
        // Validar que el input tenga el texto requerido
        if (!input.text) {
            return {
                success: false,
                error: 'Texto de entrada requerido'
            };
        }
        try {
            const response = await this.secretaryService.processUserRequest(userId, tenantId, input);
            return {
                success: true,
                response,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
};
exports.SecretaryController = SecretaryController;
__decorate([
    (0, common_1.Post)('command'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SecretaryController.prototype, "processCommand", null);
exports.SecretaryController = SecretaryController = __decorate([
    (0, common_1.Controller)('api/secretary'),
    __metadata("design:paramtypes", [secretary_service_1.SecretaryService])
], SecretaryController);
