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
var PendingPurchaseController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingPurchaseController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const pending_purchase_service_1 = require("./pending-purchase.service");
let PendingPurchaseController = PendingPurchaseController_1 = class PendingPurchaseController {
    pendingPurchaseService;
    logger = new common_1.Logger(PendingPurchaseController_1.name);
    constructor(pendingPurchaseService) {
        this.pendingPurchaseService = pendingPurchaseService;
    }
    async savePendingPurchase(saveRequest) {
        this.logger.log(`Received save pending purchase request - Tenant: ${saveRequest.tenantId}, Session: ${saveRequest.sessionId}`);
        try {
            const result = await this.pendingPurchaseService.savePendingPurchase(saveRequest);
            return result;
        }
        catch (error) {
            this.logger.error(`Error saving pending purchase for session ${saveRequest.sessionId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async restorePendingPurchase(sessionId) {
        this.logger.log(`Restoring pending purchase context for session: ${sessionId}`);
        try {
            const result = await this.pendingPurchaseService.restorePendingPurchase(sessionId);
            return result;
        }
        catch (error) {
            this.logger.error(`Error restoring pending purchase for session ${sessionId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async clearPendingPurchase(sessionId) {
        this.logger.log(`Clearing pending purchase context for session: ${sessionId}`);
        try {
            const result = await this.pendingPurchaseService.clearPendingPurchase(sessionId);
            return result;
        }
        catch (error) {
            this.logger.error(`Error clearing pending purchase for session ${sessionId}: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.PendingPurchaseController = PendingPurchaseController;
__decorate([
    (0, common_1.Post)('save'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Save pending purchase context',
        description: 'Save the pending purchase context for unauthenticated users who express purchase intent'
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                sessionId: { type: 'string' },
                tenantId: { type: 'string' },
                context: {
                    type: 'object',
                    properties: {
                        selectedServiceId: { type: 'string' },
                        intent: { type: 'string' },
                        origin: { type: 'string' },
                        timestamp: { type: 'number' },
                        conversationSummary: { type: 'string' },
                        message: { type: 'string' }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Pending purchase context saved successfully'
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid input data'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PendingPurchaseController.prototype, "savePendingPurchase", null);
__decorate([
    (0, common_1.Get)('restore/:sessionId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Restore pending purchase context',
        description: 'Restore the pending purchase context after user authentication'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Pending purchase context restored successfully'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Pending purchase context not found'
    }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PendingPurchaseController.prototype, "restorePendingPurchase", null);
__decorate([
    (0, common_1.Post)('clear/:sessionId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Clear pending purchase context',
        description: 'Clear the pending purchase context after it has been restored'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Pending purchase context cleared successfully'
    }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PendingPurchaseController.prototype, "clearPendingPurchase", null);
exports.PendingPurchaseController = PendingPurchaseController = PendingPurchaseController_1 = __decorate([
    (0, swagger_1.ApiTags)('Pending Purchase'),
    (0, common_1.Controller)('api/pending-purchase'),
    __metadata("design:paramtypes", [pending_purchase_service_1.PendingPurchaseService])
], PendingPurchaseController);
