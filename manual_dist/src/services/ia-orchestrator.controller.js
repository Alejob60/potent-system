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
var IAOrchestratorController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IAOrchestratorController = void 0;
const common_1 = require("@nestjs/common");
const ia_orchestrator_service_1 = require("./ia-orchestrator.service");
const swagger_1 = require("@nestjs/swagger");
let IAOrchestratorController = IAOrchestratorController_1 = class IAOrchestratorController {
    constructor(orchestratorService) {
        this.orchestratorService = orchestratorService;
        this.logger = new common_1.Logger(IAOrchestratorController_1.name);
    }
    async processMessage(payload) {
        try {
            const response = await this.orchestratorService.processMessage(payload.message, payload.sessionId, payload.channelId, payload.channelType);
            return {
                success: true,
                response,
            };
        }
        catch (error) {
            this.logger.error(`Failed to process message for session ${payload.sessionId}:`, error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getChatHistory(sessionId) {
        try {
            const history = this.orchestratorService.getChatHistory(sessionId);
            return {
                success: true,
                history,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get chat history for session ${sessionId}:`, error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async clearChatHistory(sessionId) {
        try {
            this.orchestratorService.clearChatHistory(sessionId);
            return {
                success: true,
                message: 'Chat history cleared successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to clear chat history for session ${sessionId}:`, error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getAnalytics(sessionId) {
        try {
            const analytics = await this.orchestratorService.getAnalytics(sessionId);
            return {
                success: true,
                analytics,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get analytics for session ${sessionId}:`, error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async sendFeedback(payload) {
        try {
            const result = await this.orchestratorService.sendFeedback(payload.sessionId, payload.messageId, payload.feedback, payload.comment);
            return {
                success: true,
                result,
            };
        }
        catch (error) {
            this.logger.error(`Failed to send feedback for session ${payload.sessionId}:`, error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
};
exports.IAOrchestratorController = IAOrchestratorController;
__decorate([
    (0, common_1.Post)('process-message'),
    (0, swagger_1.ApiOperation)({
        summary: 'Process message through IA Orchestrator',
        description: 'Send a message to the IA Orchestrator for processing and get AI response',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Message processing parameters',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Hello, how can you help me?' },
                sessionId: { type: 'string', example: 'session_1234567890' },
                channelId: { type: 'string', example: 'facebook_12345' },
                channelType: { type: 'string', example: 'facebook' },
            },
            required: ['message', 'sessionId'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Message processed successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                response: { type: 'string' },
                agentId: { type: 'string' },
                confidence: { type: 'number' },
                timestamp: { type: 'string', format: 'date-time' },
                suggestedActions: { type: 'array', items: { type: 'string' } },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid parameters provided' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IAOrchestratorController.prototype, "processMessage", null);
__decorate([
    (0, common_1.Get)('chat-history/:sessionId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get chat history',
        description: 'Retrieve chat history for a specific session',
    }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'Session identifier',
        example: 'session_1234567890',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Chat history retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    content: { type: 'string' },
                    sender: { type: 'string', enum: ['user', 'agent'] },
                    timestamp: { type: 'string', format: 'date-time' },
                    channelId: { type: 'string' },
                    channelType: { type: 'string' },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IAOrchestratorController.prototype, "getChatHistory", null);
__decorate([
    (0, common_1.Post)('clear-history/:sessionId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Clear chat history',
        description: 'Clear chat history for a specific session',
    }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'Session identifier',
        example: 'session_1234567890',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Chat history cleared successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IAOrchestratorController.prototype, "clearChatHistory", null);
__decorate([
    (0, common_1.Get)('analytics/:sessionId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get analytics data',
        description: 'Retrieve analytics data for a specific session',
    }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'Session identifier',
        example: 'session_1234567890',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Analytics data retrieved successfully',
        schema: {
            type: 'object',
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IAOrchestratorController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Post)('feedback'),
    (0, swagger_1.ApiOperation)({
        summary: 'Send feedback',
        description: 'Send feedback for a specific message',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Feedback parameters',
        schema: {
            type: 'object',
            properties: {
                sessionId: { type: 'string', example: 'session_1234567890' },
                messageId: { type: 'string', example: 'msg_1234567890' },
                feedback: { type: 'string', enum: ['positive', 'negative'], example: 'positive' },
                comment: { type: 'string', example: 'This response was very helpful' },
            },
            required: ['sessionId', 'messageId', 'feedback'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Feedback sent successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid parameters provided' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IAOrchestratorController.prototype, "sendFeedback", null);
exports.IAOrchestratorController = IAOrchestratorController = IAOrchestratorController_1 = __decorate([
    (0, swagger_1.ApiTags)('ia-orchestrator'),
    (0, common_1.Controller)('ia-orchestrator'),
    __metadata("design:paramtypes", [ia_orchestrator_service_1.IAOrchestratorService])
], IAOrchestratorController);
//# sourceMappingURL=ia-orchestrator.controller.js.map