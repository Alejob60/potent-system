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
var ColombiaTICOrchestratorController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColombiaTICOrchestratorController = void 0;
const common_1 = require("@nestjs/common");
const colombiatic_orchestrator_service_1 = require("./colombiatic-orchestrator.service");
const swagger_1 = require("@nestjs/swagger");
let ColombiaTICOrchestratorController = ColombiaTICOrchestratorController_1 = class ColombiaTICOrchestratorController {
    constructor(orchestratorService) {
        this.orchestratorService = orchestratorService;
        this.logger = new common_1.Logger(ColombiaTICOrchestratorController_1.name);
    }
    async processWebhookEvent(channel, eventType, agentId, payload) {
        try {
            const result = await this.orchestratorService.processWebhookEvent(channel, eventType, payload, agentId);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to process webhook event from ${channel}:`, error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getRecentWebhookEvents(limit) {
        try {
            const events = this.orchestratorService.getRecentWebhookEvents(limit || 50);
            return {
                success: true,
                events,
            };
        }
        catch (error) {
            this.logger.error('Failed to retrieve webhook events:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getWebhookEventsByChannel(channel, limit) {
        try {
            const events = this.orchestratorService.getWebhookEventsByChannel(channel, limit || 50);
            return {
                success: true,
                events,
            };
        }
        catch (error) {
            this.logger.error(`Failed to retrieve webhook events for channel ${channel}:`, error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getRecentChannelMessages(limit) {
        try {
            const messages = this.orchestratorService.getRecentChannelMessages(limit || 50);
            return {
                success: true,
                messages,
            };
        }
        catch (error) {
            this.logger.error('Failed to retrieve channel messages:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getChannelMessagesByChannel(channel, limit) {
        try {
            const messages = this.orchestratorService.getChannelMessagesByChannel(channel, limit || 50);
            return {
                success: true,
                messages,
            };
        }
        catch (error) {
            this.logger.error(`Failed to retrieve channel messages for channel ${channel}:`, error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getChannelMessagesByAgent(agentId, limit) {
        try {
            const messages = this.orchestratorService.getChannelMessagesByAgent(agentId, limit || 50);
            return {
                success: true,
                messages,
            };
        }
        catch (error) {
            this.logger.error(`Failed to retrieve channel messages for agent ${agentId}:`, error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
};
exports.ColombiaTICOrchestratorController = ColombiaTICOrchestratorController;
__decorate([
    (0, common_1.Post)('webhook/:channel'),
    (0, swagger_1.ApiOperation)({
        summary: 'Process webhook event',
        description: 'Process webhook event from a specific channel',
    }),
    (0, swagger_1.ApiParam)({
        name: 'channel',
        description: 'Channel name',
        example: 'facebook',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Webhook event payload',
        schema: {
            type: 'object',
        },
    }),
    (0, swagger_1.ApiQuery)({
        name: 'eventType',
        description: 'Event type',
        required: false,
        example: 'message',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'agentId',
        description: 'Associated agent ID',
        required: false,
        example: 'agent_1234567890_abcde',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook event processed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                eventId: { type: 'string' },
                response: { type: 'object' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('channel')),
    __param(1, (0, common_1.Query)('eventType')),
    __param(2, (0, common_1.Query)('agentId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ColombiaTICOrchestratorController.prototype, "processWebhookEvent", null);
__decorate([
    (0, common_1.Get)('webhooks/events'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get recent webhook events',
        description: 'Retrieve recent webhook events for monitoring',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        description: 'Number of events to return',
        required: false,
        example: 50,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook events retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    agentId: { type: 'string' },
                    channel: { type: 'string' },
                    eventType: { type: 'string' },
                    payload: { type: 'object' },
                    processed: { type: 'boolean' },
                    response: { type: 'object' },
                    timestamp: { type: 'string', format: 'date-time' },
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ColombiaTICOrchestratorController.prototype, "getRecentWebhookEvents", null);
__decorate([
    (0, common_1.Get)('webhooks/events/channel/:channel'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get webhook events by channel',
        description: 'Retrieve webhook events for a specific channel',
    }),
    (0, swagger_1.ApiParam)({
        name: 'channel',
        description: 'Channel name',
        example: 'facebook',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        description: 'Number of events to return',
        required: false,
        example: 50,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook events retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    agentId: { type: 'string' },
                    channel: { type: 'string' },
                    eventType: { type: 'string' },
                    payload: { type: 'object' },
                    processed: { type: 'boolean' },
                    response: { type: 'object' },
                    timestamp: { type: 'string', format: 'date-time' },
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('channel')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ColombiaTICOrchestratorController.prototype, "getWebhookEventsByChannel", null);
__decorate([
    (0, common_1.Get)('messages'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get recent channel messages',
        description: 'Retrieve recent channel messages',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        description: 'Number of messages to return',
        required: false,
        example: 50,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Channel messages retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    agentId: { type: 'string' },
                    channel: { type: 'string' },
                    content: { type: 'string' },
                    sender: { type: 'string', enum: ['user', 'agent', 'system'] },
                    timestamp: { type: 'string', format: 'date-time' },
                    processed: { type: 'boolean' },
                    response: { type: 'object' },
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ColombiaTICOrchestratorController.prototype, "getRecentChannelMessages", null);
__decorate([
    (0, common_1.Get)('messages/channel/:channel'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get channel messages by channel',
        description: 'Retrieve channel messages for a specific channel',
    }),
    (0, swagger_1.ApiParam)({
        name: 'channel',
        description: 'Channel name',
        example: 'facebook',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        description: 'Number of messages to return',
        required: false,
        example: 50,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Channel messages retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    agentId: { type: 'string' },
                    channel: { type: 'string' },
                    content: { type: 'string' },
                    sender: { type: 'string', enum: ['user', 'agent', 'system'] },
                    timestamp: { type: 'string', format: 'date-time' },
                    processed: { type: 'boolean' },
                    response: { type: 'object' },
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('channel')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ColombiaTICOrchestratorController.prototype, "getChannelMessagesByChannel", null);
__decorate([
    (0, common_1.Get)('messages/agent/:agentId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get channel messages by agent',
        description: 'Retrieve channel messages for a specific agent',
    }),
    (0, swagger_1.ApiParam)({
        name: 'agentId',
        description: 'Agent ID',
        example: 'agent_1234567890_abcde',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        description: 'Number of messages to return',
        required: false,
        example: 50,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Channel messages retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    agentId: { type: 'string' },
                    channel: { type: 'string' },
                    content: { type: 'string' },
                    sender: { type: 'string', enum: ['user', 'agent', 'system'] },
                    timestamp: { type: 'string', format: 'date-time' },
                    processed: { type: 'boolean' },
                    response: { type: 'object' },
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('agentId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ColombiaTICOrchestratorController.prototype, "getChannelMessagesByAgent", null);
exports.ColombiaTICOrchestratorController = ColombiaTICOrchestratorController = ColombiaTICOrchestratorController_1 = __decorate([
    (0, swagger_1.ApiTags)('colombiatic-orchestrator'),
    (0, common_1.Controller)('colombiatic-orchestrator'),
    __metadata("design:paramtypes", [colombiatic_orchestrator_service_1.ColombiaTICOrchestratorService])
], ColombiaTICOrchestratorController);
//# sourceMappingURL=colombiatic-orchestrator.controller.js.map