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
exports.FrontDeskController = void 0;
const common_1 = require("@nestjs/common");
const front_desk_service_1 = require("../services/front-desk.service");
const front_desk_request_dto_1 = require("../dto/front-desk-request.dto");
const integration_activation_dto_1 = require("../dto/integration-activation.dto");
const context_compression_service_1 = require("../services/context-compression.service");
const swagger_1 = require("@nestjs/swagger");
let FrontDeskController = class FrontDeskController {
    constructor(frontDeskService, contextCompressionService) {
        this.frontDeskService = frontDeskService;
        this.contextCompressionService = contextCompressionService;
    }
    async processMessage(body) {
        return this.frontDeskService.processMessage(body.message, body.context);
    }
    async activateIntegration(body) {
        try {
            const integrationId = `integration-${Date.now()}`;
            const platformResponse = await this.simulatePlatformIntegration(body.platform, body.action, body.payload);
            return {
                status: 'success',
                integrationId,
                platformResponse: {
                    message: `Integration with ${body.platform} for action ${body.action} has been initiated`,
                    sessionId: body.sessionId,
                    ...platformResponse,
                },
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: `Failed to activate integration: ${error.message}`,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAgentStatus() {
        return this.frontDeskService.getAgentStatus();
    }
    async getIntegrationStatus() {
        try {
            const integrations = [
                {
                    platform: 'google',
                    status: 'operational',
                    lastChecked: new Date().toISOString(),
                    connectedAccounts: 0,
                },
                {
                    platform: 'tiktok',
                    status: 'operational',
                    lastChecked: new Date().toISOString(),
                    connectedAccounts: 0,
                },
                {
                    platform: 'meta',
                    status: 'operational',
                    lastChecked: new Date().toISOString(),
                    connectedAccounts: 0,
                },
            ];
            return {
                timestamp: new Date().toISOString(),
                integrations,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: `Failed to retrieve integration status: ${error.message}`,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAllConversations() {
        return this.frontDeskService.findAll();
    }
    async getConversationById(id) {
        return this.frontDeskService.findOne(id);
    }
    async getConversationsBySession(sessionId) {
        return this.frontDeskService.findBySession(sessionId);
    }
    async getSessionContext(sessionId) {
        const conversations = await this.frontDeskService.findBySession(sessionId);
        const compressedHistory = this.contextCompressionService.compressConversationHistory(conversations);
        return {
            sessionId,
            contextSummary: this.contextCompressionService.generateContextSummary(compressedHistory),
            keyContext: this.contextCompressionService.extractKeyContext(compressedHistory),
        };
    }
    async getNextStepSuggestions(sessionId) {
        const conversations = await this.frontDeskService.findBySession(sessionId);
        const compressedHistory = this.contextCompressionService.compressConversationHistory(conversations);
        const keyContext = this.contextCompressionService.extractKeyContext(compressedHistory);
        const suggestions = this.generateContextualSuggestions(keyContext);
        const availableAgents = [
            'video-scriptor',
            'post-scheduler',
            'trend-scanner',
            'faq-responder',
            'analytics-reporter',
        ];
        return {
            sessionId,
            suggestions,
            availableAgents,
        };
    }
    generateContextualSuggestions(keyContext) {
        const suggestions = [];
        if (!keyContext.objective || keyContext.objective === 'unknown') {
            suggestions.push({
                action: 'identify_objective',
                description: 'Identify what you want to create or analyze',
                confidence: 0.9,
                requiredInfo: ['objective'],
            });
        }
        if (keyContext.objective && keyContext.objective !== 'unknown') {
            suggestions.push({
                action: 'collect_info',
                description: 'Collect more information about your request',
                confidence: 0.8,
                requiredInfo: ['details'],
            });
        }
        if (keyContext.targetAgent) {
            suggestions.push({
                action: 'route_to_agent',
                description: `Route to ${keyContext.targetAgent} agent for processing`,
                confidence: 0.95,
                requiredInfo: [],
            });
        }
        if (suggestions.length === 0) {
            suggestions.push({
                action: 'continue_conversation',
                description: 'Continue the conversation to gather more context',
                confidence: 0.5,
                requiredInfo: ['user_input'],
            });
        }
        return suggestions;
    }
    async simulatePlatformIntegration(platform, action, payload) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        switch (platform) {
            case 'google':
                return {
                    campaignId: `campaign-${Date.now()}`,
                    status: 'created',
                    message: `Google Ads campaign created successfully for action: ${action}`,
                };
            case 'tiktok':
                return {
                    videoId: `video-${Date.now()}`,
                    status: 'scheduled',
                    message: `TikTok video scheduled successfully for action: ${action}`,
                };
            case 'meta':
                return {
                    postId: `post-${Date.now()}`,
                    status: 'scheduled',
                    message: `Meta post scheduled successfully for action: ${action}`,
                };
            default:
                return {
                    status: 'unknown_platform',
                    message: `Unsupported platform: ${platform}`,
                };
        }
    }
};
exports.FrontDeskController = FrontDeskController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Process user message',
        description: 'Analyze user message and route to appropriate agent',
    }),
    (0, swagger_1.ApiBody)({
        description: 'User message and context',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Quiero un video corto para TikTok sobre mi producto nuevo',
                },
                context: {
                    type: 'object',
                    properties: {
                        sessionId: { type: 'string', example: 'user-session-123' },
                        language: { type: 'string', example: 'es' },
                    },
                },
            },
            required: ['message'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Successfully processed message',
        schema: {
            type: 'object',
            properties: {
                agent: { type: 'string', example: 'front-desk' },
                status: { type: 'string', example: 'ready' },
                conversation: {
                    type: 'object',
                    properties: {
                        userMessage: { type: 'string' },
                        agentResponse: { type: 'string' },
                        objective: { type: 'string' },
                        targetAgent: { type: 'string' },
                        collectedInfo: { type: 'object' },
                        missingInfo: { type: 'array', items: { type: 'string' } },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [front_desk_request_dto_1.FrontDeskRequestDto]),
    __metadata("design:returntype", Promise)
], FrontDeskController.prototype, "processMessage", null);
__decorate([
    (0, common_1.Post)('integrations'),
    (0, swagger_1.ApiOperation)({
        summary: 'Activate external platform integration',
        description: 'Activate connection with external platform based on user intent',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Integration activation parameters',
        type: integration_activation_dto_1.IntegrationActivationDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Integration activation result',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'success' },
                integrationId: { type: 'string', example: 'integration-123' },
                platformResponse: { type: 'object' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [integration_activation_dto_1.IntegrationActivationDto]),
    __metadata("design:returntype", Promise)
], FrontDeskController.prototype, "activateIntegration", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get agent status and metrics',
        description: 'Retrieve status information and metrics for all specialized agents',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Agent status and metrics',
        schema: {
            type: 'object',
            properties: {
                timestamp: { type: 'string', format: 'date-time' },
                agents: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            status: { type: 'string' },
                            activeTasks: { type: 'number' },
                            completedTasks: { type: 'number' },
                            failedTasks: { type: 'number' },
                            avgResponseTime: { type: 'number' },
                            uptime: { type: 'number' },
                        },
                    },
                },
                system: {
                    type: 'object',
                    properties: {
                        totalConversations: { type: 'number' },
                        activeConversations: { type: 'number' },
                        avgConversationLength: { type: 'number' },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FrontDeskController.prototype, "getAgentStatus", null);
__decorate([
    (0, common_1.Get)('integrations/status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get integration status',
        description: 'Check the status of external platform integrations',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Integration status information',
        schema: {
            type: 'object',
            properties: {
                timestamp: { type: 'string', format: 'date-time' },
                integrations: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            platform: { type: 'string' },
                            status: { type: 'string' },
                            lastChecked: { type: 'string', format: 'date-time' },
                            connectedAccounts: { type: 'number' },
                        },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FrontDeskController.prototype, "getIntegrationStatus", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all conversations',
        description: 'Retrieve all front desk conversations',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of conversations',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FrontDeskController.prototype, "getAllConversations", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get conversation by ID',
        description: 'Retrieve a specific conversation by its ID',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Conversation ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Conversation details',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FrontDeskController.prototype, "getConversationById", null);
__decorate([
    (0, common_1.Get)('session/:sessionId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get conversations by session',
        description: 'Retrieve all conversations for a specific session',
    }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'Session ID',
        example: 'user-session-123',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of session conversations',
    }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FrontDeskController.prototype, "getConversationsBySession", null);
__decorate([
    (0, common_1.Get)('context/:sessionId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get compressed context for a session',
        description: 'Retrieve compressed context and key information for a specific session',
    }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'Session ID',
        example: 'user-session-123',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Compressed context information',
        schema: {
            type: 'object',
            properties: {
                sessionId: { type: 'string' },
                contextSummary: {
                    type: 'object',
                    properties: {
                        summary: { type: 'string' },
                        keyPoints: { type: 'array', items: { type: 'string' } },
                        lastObjective: { type: 'string' },
                        completionStatus: {
                            type: 'string',
                            enum: ['complete', 'incomplete'],
                        },
                    },
                },
                keyContext: {
                    type: 'object',
                    properties: {
                        objective: { type: 'string' },
                        targetAgent: { type: 'string' },
                        collectedInfo: { type: 'object' },
                        confidence: { type: 'number' },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FrontDeskController.prototype, "getSessionContext", null);
__decorate([
    (0, common_1.Get)('suggestions/:sessionId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get next step suggestions',
        description: 'Suggest the next step in the conversation based on current context and available agents',
    }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'Session ID',
        example: 'user-session-123',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Next step suggestions',
        schema: {
            type: 'object',
            properties: {
                sessionId: { type: 'string' },
                suggestions: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            action: { type: 'string' },
                            description: { type: 'string' },
                            confidence: { type: 'number' },
                            requiredInfo: { type: 'array', items: { type: 'string' } },
                        },
                    },
                },
                availableAgents: {
                    type: 'array',
                    items: { type: 'string' },
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FrontDeskController.prototype, "getNextStepSuggestions", null);
exports.FrontDeskController = FrontDeskController = __decorate([
    (0, swagger_1.ApiTags)('front-desk'),
    (0, common_1.Controller)('agents/front-desk'),
    __metadata("design:paramtypes", [front_desk_service_1.FrontDeskService,
        context_compression_service_1.ContextCompressionService])
], FrontDeskController);
//# sourceMappingURL=front-desk.controller.js.map