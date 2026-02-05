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
exports.ConversationContinuityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const conversation_continuity_service_1 = require("./conversation-continuity.service");
let ConversationContinuityController = class ConversationContinuityController {
    constructor(continuityService) {
        this.continuityService = continuityService;
    }
    async startCrossChannelConversation(recipientId, initialChannel, initialConversationId, tenantId, contextId) {
        try {
            const data = this.continuityService.startCrossChannelConversation(recipientId, initialChannel, initialConversationId, tenantId, contextId);
            return {
                success: true,
                data,
                message: 'Cross-channel conversation started successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to start cross-channel conversation',
            };
        }
    }
    async addChannelToConversation(conversationId, channelId, conversationIdInChannel) {
        try {
            const data = this.continuityService.addChannelToConversation(conversationId, channelId, conversationIdInChannel);
            return {
                success: true,
                data,
                message: 'Channel added to cross-channel conversation successfully',
            };
        }
        catch (error) {
            if (error.message.includes('not found')) {
                return {
                    success: false,
                    error: error.message,
                    message: 'Conversation not found',
                };
            }
            return {
                success: false,
                error: error.message,
                message: 'Failed to add channel to cross-channel conversation',
            };
        }
    }
    async getCrossChannelConversation(conversationId) {
        try {
            const data = this.continuityService.getCrossChannelConversation(conversationId);
            if (data) {
                return {
                    success: true,
                    data,
                    message: 'Cross-channel conversation retrieved successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Conversation not found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve cross-channel conversation',
            };
        }
    }
    async getConversationsForRecipient(recipientId) {
        try {
            const data = this.continuityService.getConversationsForRecipient(recipientId);
            return {
                success: true,
                data,
                message: 'Cross-channel conversations retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve cross-channel conversations',
            };
        }
    }
    async endCrossChannelConversation(conversationId) {
        try {
            const result = this.continuityService.endCrossChannelConversation(conversationId);
            if (result) {
                return {
                    success: true,
                    message: 'Cross-channel conversation ended successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Conversation not found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to end cross-channel conversation',
            };
        }
    }
    async getTransitions(conversationId) {
        try {
            const data = this.continuityService.getTransitions(conversationId);
            return {
                success: true,
                data,
                message: 'Conversation transitions retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve conversation transitions',
            };
        }
    }
    async findActiveConversationForRecipient(recipientId) {
        try {
            const data = this.continuityService.findActiveConversationForRecipient(recipientId);
            if (data) {
                return {
                    success: true,
                    data,
                    message: 'Active cross-channel conversation retrieved successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'No active conversation found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve active cross-channel conversation',
            };
        }
    }
};
exports.ConversationContinuityController = ConversationContinuityController;
__decorate([
    (0, common_1.Post)('start'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Start a cross-channel conversation' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                recipientId: { type: 'string', example: '+1234567890' },
                initialChannel: { type: 'string', example: 'whatsapp' },
                initialConversationId: { type: 'string', example: 'conv-123' },
                tenantId: { type: 'string', example: 'tenant-456' },
                contextId: { type: 'string', example: 'ctx-789' },
            },
            required: ['recipientId', 'initialChannel', 'initialConversationId'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Cross-channel conversation started successfully',
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
    __param(0, (0, common_1.Body)('recipientId')),
    __param(1, (0, common_1.Body)('initialChannel')),
    __param(2, (0, common_1.Body)('initialConversationId')),
    __param(3, (0, common_1.Body)('tenantId')),
    __param(4, (0, common_1.Body)('contextId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ConversationContinuityController.prototype, "startCrossChannelConversation", null);
__decorate([
    (0, common_1.Post)('add-channel/:conversationId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Add a channel to an existing cross-channel conversation' }),
    (0, swagger_1.ApiParam)({
        name: 'conversationId',
        required: true,
        type: 'string',
        example: 'cc-1234567890-1234567890123-abc123def456',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                channelId: { type: 'string', example: 'facebook' },
                conversationIdInChannel: { type: 'string', example: 'conv-456' },
            },
            required: ['channelId', 'conversationIdInChannel'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Channel added to cross-channel conversation successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Conversation not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('conversationId')),
    __param(1, (0, common_1.Body)('channelId')),
    __param(2, (0, common_1.Body)('conversationIdInChannel')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ConversationContinuityController.prototype, "addChannelToConversation", null);
__decorate([
    (0, common_1.Get)(':conversationId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get a cross-channel conversation' }),
    (0, swagger_1.ApiParam)({
        name: 'conversationId',
        required: true,
        type: 'string',
        example: 'cc-1234567890-1234567890123-abc123def456',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Cross-channel conversation retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Conversation not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConversationContinuityController.prototype, "getCrossChannelConversation", null);
__decorate([
    (0, common_1.Get)('recipient/:recipientId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get all cross-channel conversations for a recipient' }),
    (0, swagger_1.ApiParam)({
        name: 'recipientId',
        required: true,
        type: 'string',
        example: '+1234567890',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Cross-channel conversations retrieved successfully',
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
], ConversationContinuityController.prototype, "getConversationsForRecipient", null);
__decorate([
    (0, common_1.Post)('end/:conversationId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'End a cross-channel conversation' }),
    (0, swagger_1.ApiParam)({
        name: 'conversationId',
        required: true,
        type: 'string',
        example: 'cc-1234567890-1234567890123-abc123def456',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Cross-channel conversation ended successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Conversation not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConversationContinuityController.prototype, "endCrossChannelConversation", null);
__decorate([
    (0, common_1.Get)('transitions/:conversationId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get conversation transitions' }),
    (0, swagger_1.ApiParam)({
        name: 'conversationId',
        required: true,
        type: 'string',
        example: 'cc-1234567890-1234567890123-abc123def456',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Conversation transitions retrieved successfully',
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
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Conversation not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConversationContinuityController.prototype, "getTransitions", null);
__decorate([
    (0, common_1.Get)('active/:recipientId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Find an active cross-channel conversation for a recipient' }),
    (0, swagger_1.ApiParam)({
        name: 'recipientId',
        required: true,
        type: 'string',
        example: '+1234567890',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Active cross-channel conversation retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'No active conversation found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('recipientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConversationContinuityController.prototype, "findActiveConversationForRecipient", null);
exports.ConversationContinuityController = ConversationContinuityController = __decorate([
    (0, swagger_1.ApiTags)('Conversation Continuity'),
    (0, common_1.Controller)('continuity'),
    __metadata("design:paramtypes", [conversation_continuity_service_1.ConversationContinuityService])
], ConversationContinuityController);
//# sourceMappingURL=conversation-continuity.controller.js.map