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
const swagger_1 = require("@nestjs/swagger");
const secretary_service_1 = require("./secretary.service");
const tenant_guard_1 = require("../../common/guards/tenant.guard");
let SecretaryController = class SecretaryController {
    constructor(secretaryService) {
        this.secretaryService = secretaryService;
    }
    async handleRequest(request, payload) {
        return await this.secretaryService.handleUserRequest(request.userId || 'anonymous', request.tenantId, request.sessionId, payload.input);
    }
};
exports.SecretaryController = SecretaryController;
__decorate([
    (0, common_1.Post)('command'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle user request via Secretary' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Request processed' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SecretaryController.prototype, "handleRequest", null);
exports.SecretaryController = SecretaryController = __decorate([
    (0, swagger_1.ApiTags)('Secretary - Universal Orchestrator'),
    (0, common_1.Controller)('api/secretary'),
    (0, common_1.UseGuards)(tenant_guard_1.TenantGuard),
    __metadata("design:paramtypes", [secretary_service_1.SecretaryService])
], SecretaryController);
//# sourceMappingURL=secretary.controller.js.map