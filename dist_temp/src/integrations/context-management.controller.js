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
exports.ContextManagementController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const context_management_service_1 = require("./context-management.service");
let ContextManagementController = class ContextManagementController {
    constructor(contextService) {
        this.contextService = contextService;
    }
    async createContext(channelId, recipientId, tenantId, sessionId) {
        try {
            const data = this.contextService.createContext(channelId, recipientId, tenantId, sessionId);
            return {
                success: true,
                data,
                message: 'Conversation context created successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to create conversation context',
            };
        }
    }
    async getContext(channelId, recipientId) {
        try {
            const data = this.contextService.getContext(channelId, recipientId);
            return {
                success: true,
                data,
                message: 'Conversation context retrieved successfully',
            };
        }
        catch (error) {
            if (error.message.includes('not found')) {
                return {
                    success: false,
                    error: error.message,
                    message: 'Context not found',
                };
            }
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve conversation context',
            };
        }
    }
    async updateContext(channelId, recipientId, updates) {
        try {
            const data = this.contextService.updateContext(channelId, recipientId, updates);
            return {
                success: true,
                data,
                message: 'Conversation context updated successfully',
            };
        }
        catch (error) {
            if (error.message.includes('not found')) {
                return {
                    success: false,
                    error: error.message,
                    message: 'Context not found',
                };
            }
            return {
                success: false,
                error: error.message,
                message: 'Failed to update conversation context',
            };
        }
    }
    async deleteContext(channelId, recipientId) {
        try {
            const result = this.contextService.deleteContext(channelId, recipientId);
            if (result) {
                return {
                    success: true,
                    message: 'Conversation context deleted successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Context not found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to delete conversation context',
            };
        }
    }
    async getContextsForRecipient(recipientId) {
        try {
            const data = this.contextService.getContextsForRecipient(recipientId);
            return {
                success: true,
                data,
                message: 'Conversation contexts retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve conversation contexts',
            };
        }
    }
    async clearExpiredContexts(maxAge) {
        try {
            const data = this.contextService.clearExpiredContexts(maxAge);
            return {
                success: true,
                data,
                message: `Cleared ${data} expired contexts`,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to clear expired contexts',
            };
        }
    }
};
exports.ContextManagementController = ContextManagementController;
__decorate([
    (0, common_1.Post)('create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new conversation context' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                channelId: { type: 'string', example: 'whatsapp' },
                recipientId: { type: 'string', example: '+1234567890' },
                tenantId: { type: 'string', example: 'tenant-123' },
                sessionId: { type: 'string', example: 'session-456' },
            },
            required: ['channelId', 'recipientId'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Conversation context created successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)('channelId')),
    __param(1, (0, common_1.Body)('recipientId')),
    __param(2, (0, common_1.Body)('tenantId')),
    __param(3, (0, common_1.Body)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ContextManagementController.prototype, "createContext", null);
__decorate([
    (0, common_1.Get)(':channelId/:recipientId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get an existing conversation context' }),
    (0, swagger_1.ApiParam)({
        name: 'channelId',
        required: true,
        type: 'string',
        example: 'whatsapp',
    }),
    (0, swagger_1.ApiParam)({
        name: 'recipientId',
        required: true,
        type: 'string',
        example: '+1234567890',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Conversation context retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Context not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('channelId')),
    __param(1, (0, common_1.Param)('recipientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ContextManagementController.prototype, "getContext", null);
__decorate([
    (0, common_1.Post)('update/:channelId/:recipientId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update an existing conversation context' }),
    (0, swagger_1.ApiParam)({
        name: 'channelId',
        required: true,
        type: 'string',
        example: 'whatsapp',
    }),
    (0, swagger_1.ApiParam)({
        name: 'recipientId',
        required: true,
        type: 'string',
        example: '+1234567890',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                variables: {
                    type: 'object',
                    example: { name: 'John', orderNumber: '12345' },
                },
                language: { type: 'string', example: 'en' },
                timezone: { type: 'string', example: 'UTC' },
                appendToHistory: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'msg-123' },
                        timestamp: { type: 'string', example: '2023-01-01T00:00:00Z' },
                        direction: { type: 'string', example: 'outbound' },
                        content: { type: 'string', example: 'Hello John!' },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Conversation context updated successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Context not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('channelId')),
    __param(1, (0, common_1.Param)('recipientId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ContextManagementController.prototype, "updateContext", null);
__decorate([
    (0, common_1.Delete)(':channelId/:recipientId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a conversation context' }),
    (0, swagger_1.ApiParam)({
        name: 'channelId',
        required: true,
        type: 'string',
        example: 'whatsapp',
    }),
    (0, swagger_1.ApiParam)({
        name: 'recipientId',
        required: true,
        type: 'string',
        example: '+1234567890',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Conversation context deleted successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Context not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('channelId')),
    __param(1, (0, common_1.Param)('recipientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ContextManagementController.prototype, "deleteContext", null);
__decorate([
    (0, common_1.Get)('recipient/:recipientId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get all contexts for a recipient across all channels' }),
    (0, swagger_1.ApiParam)({
        name: 'recipientId',
        required: true,
        type: 'string',
        example: '+1234567890',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Conversation contexts retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: { type: 'object' },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('recipientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContextManagementController.prototype, "getContextsForRecipient", null);
__decorate([
    (0, common_1.Post)('clear-expired'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Clear expired contexts' }),
    (0, swagger_1.ApiQuery)({
        name: 'maxAge',
        required: false,
        type: 'number',
        example: 86400000,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Expired contexts cleared successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'number' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Query)('maxAge')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ContextManagementController.prototype, "clearExpiredContexts", null);
exports.ContextManagementController = ContextManagementController = __decorate([
    (0, swagger_1.ApiTags)('Context Management'),
    (0, common_1.Controller)('context'),
    __metadata("design:paramtypes", [context_management_service_1.ContextManagementService])
], ContextManagementController);
//# sourceMappingURL=context-management.controller.js.map