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
var ColombiaTICAgentController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColombiaTICAgentController = void 0;
const common_1 = require("@nestjs/common");
const colombiatic_agent_service_1 = require("./colombiatic-agent.service");
const swagger_1 = require("@nestjs/swagger");
let ColombiaTICAgentController = ColombiaTICAgentController_1 = class ColombiaTICAgentController {
    constructor(agentService) {
        this.agentService = agentService;
        this.logger = new common_1.Logger(ColombiaTICAgentController_1.name);
    }
    async createAgent(config) {
        try {
            const agent = await this.agentService.createAgent(config);
            return {
                success: true,
                agent,
                chatWidgetScript: this.agentService.generateChatWidgetScript(agent.clientId),
            };
        }
        catch (error) {
            this.logger.error('Failed to create agent:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getAgent(id) {
        try {
            const agent = this.agentService.getAgent(id);
            if (!agent) {
                return {
                    success: false,
                    error: 'Agent not found',
                };
            }
            return {
                success: true,
                agent,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get agent ${id}:`, error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async updateAgent(id, config) {
        try {
            const agent = await this.agentService.updateAgent(id, config);
            return {
                success: true,
                agent,
            };
        }
        catch (error) {
            this.logger.error(`Failed to update agent ${id}:`, error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async configureWebhooks(id) {
        try {
            const agent = this.agentService.getAgent(id);
            if (!agent) {
                return {
                    success: false,
                    error: 'Agent not found',
                };
            }
            const webhookConfig = this.agentService.getWebhookConfiguration(id);
            return {
                success: true,
                webhooks: webhookConfig,
            };
        }
        catch (error) {
            this.logger.error(`Failed to configure webhooks for agent ${id}:`, error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getWebhookConfiguration(id) {
        try {
            const agent = this.agentService.getAgent(id);
            if (!agent) {
                return {
                    success: false,
                    error: 'Agent not found',
                };
            }
            const webhookConfig = this.agentService.getWebhookConfiguration(id);
            return {
                success: true,
                webhooks: webhookConfig,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get webhook configuration for agent ${id}:`, error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
};
exports.ColombiaTICAgentController = ColombiaTICAgentController;
__decorate([
    (0, common_1.Post)('agent/create'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create new ColombiaTIC AI Agent',
        description: 'Create a new AI agent for ColombiaTIC with specified configuration',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Agent configuration parameters',
        schema: {
            type: 'object',
            properties: {
                siteUrl: { type: 'string', example: 'https://example.com' },
                industry: { type: 'string', example: 'technology' },
                language: { type: 'string', example: 'es' },
                tone: { type: 'string', example: 'professional' },
                connectChannels: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['facebook', 'whatsapp', 'google-ads'],
                },
            },
            required: ['siteUrl', 'industry', 'language', 'tone', 'connectChannels'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Agent created successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                config: {
                    type: 'object',
                    properties: {
                        siteUrl: { type: 'string' },
                        industry: { type: 'string' },
                        language: { type: 'string' },
                        tone: { type: 'string' },
                        connectChannels: { type: 'array', items: { type: 'string' } },
                    },
                },
                clientId: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                status: { type: 'string', enum: ['active', 'inactive', 'pending'] },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid parameters provided' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ColombiaTICAgentController.prototype, "createAgent", null);
__decorate([
    (0, common_1.Get)('agent/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get agent configuration',
        description: 'Retrieve configuration and details for a specific ColombiaTIC agent',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Agent ID',
        example: 'agent_1234567890_abcde',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Agent details retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                config: {
                    type: 'object',
                    properties: {
                        siteUrl: { type: 'string' },
                        industry: { type: 'string' },
                        language: { type: 'string' },
                        tone: { type: 'string' },
                        connectChannels: { type: 'array', items: { type: 'string' } },
                    },
                },
                clientId: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                status: { type: 'string', enum: ['active', 'inactive', 'pending'] },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Agent not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ColombiaTICAgentController.prototype, "getAgent", null);
__decorate([
    (0, common_1.Put)('agent/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update agent configuration',
        description: 'Update configuration for a specific ColombiaTIC agent',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Agent ID',
        example: 'agent_1234567890_abcde',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Partial agent configuration parameters',
        schema: {
            type: 'object',
            properties: {
                siteUrl: { type: 'string', example: 'https://example.com' },
                industry: { type: 'string', example: 'technology' },
                language: { type: 'string', example: 'es' },
                tone: { type: 'string', example: 'professional' },
                connectChannels: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['facebook', 'whatsapp', 'google-ads'],
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Agent updated successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                config: {
                    type: 'object',
                    properties: {
                        siteUrl: { type: 'string' },
                        industry: { type: 'string' },
                        language: { type: 'string' },
                        tone: { type: 'string' },
                        connectChannels: { type: 'array', items: { type: 'string' } },
                    },
                },
                clientId: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                status: { type: 'string', enum: ['active', 'inactive', 'pending'] },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Agent not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ColombiaTICAgentController.prototype, "updateAgent", null);
__decorate([
    (0, common_1.Post)('agent/:id/webhooks'),
    (0, swagger_1.ApiOperation)({
        summary: 'Configure webhooks',
        description: 'Configure webhooks for a specific ColombiaTIC agent',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Agent ID',
        example: 'agent_1234567890_abcde',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhooks configured successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                webhooks: { type: 'array', items: { type: 'object' } },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Agent not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ColombiaTICAgentController.prototype, "configureWebhooks", null);
__decorate([
    (0, common_1.Get)('agent/:id/webhooks'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get webhook configuration',
        description: 'Retrieve webhook configuration for a specific ColombiaTIC agent',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Agent ID',
        example: 'agent_1234567890_abcde',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook configuration retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                webhooks: { type: 'array', items: { type: 'object' } },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Agent not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ColombiaTICAgentController.prototype, "getWebhookConfiguration", null);
exports.ColombiaTICAgentController = ColombiaTICAgentController = ColombiaTICAgentController_1 = __decorate([
    (0, swagger_1.ApiTags)('colombiatic'),
    (0, common_1.Controller)('colombiatic'),
    __metadata("design:paramtypes", [colombiatic_agent_service_1.ColombiaTICAgentService])
], ColombiaTICAgentController);
//# sourceMappingURL=colombiatic-agent.controller.js.map