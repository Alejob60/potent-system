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
exports.WebhookManagementController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const webhook_management_service_1 = require("./webhook-management.service");
let WebhookManagementController = class WebhookManagementController {
    constructor(webhookService) {
        this.webhookService = webhookService;
    }
    async registerWebhook(channelId, webhookUrl, events, secret) {
        try {
            const result = await this.webhookService.registerWebhook(channelId, webhookUrl, events, secret);
            return result;
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to register webhook',
            };
        }
    }
    async unregisterWebhook(channelId) {
        try {
            const result = await this.webhookService.unregisterWebhook(channelId);
            return result;
        }
        catch (error) {
            if (error.message.includes('not found')) {
                return {
                    success: false,
                    error: error.message,
                    message: 'Webhook not found',
                };
            }
            return {
                success: false,
                error: error.message,
                message: 'Failed to unregister webhook',
            };
        }
    }
    async processWebhookEvent(channelId, event) {
        try {
            const result = await this.webhookService.processWebhookEvent(channelId, event);
            return result;
        }
        catch (error) {
            if (error.message.includes('not found')) {
                return {
                    success: false,
                    error: error.message,
                    message: 'Webhook not found',
                };
            }
            return {
                success: false,
                error: error.message,
                message: 'Failed to process webhook event',
            };
        }
    }
    async replayWebhookEvent(channelId, eventId) {
        try {
            const result = await this.webhookService.replayWebhookEvent(channelId, eventId);
            return result;
        }
        catch (error) {
            if (error.message.includes('not found')) {
                return {
                    success: false,
                    error: error.message,
                    message: 'Event not found',
                };
            }
            return {
                success: false,
                error: error.message,
                message: 'Failed to replay webhook event',
            };
        }
    }
    async getWebhookSubscription(channelId) {
        try {
            const data = this.webhookService.getWebhookSubscription(channelId);
            if (data) {
                return {
                    success: true,
                    data,
                    message: 'Webhook subscription information retrieved successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Webhook subscription not found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve webhook subscription information',
            };
        }
    }
    async getRecentWebhookEvents(channelId, limit) {
        try {
            const data = this.webhookService.getRecentWebhookEvents(channelId, limit);
            return {
                success: true,
                data,
                message: 'Webhook events retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve webhook events',
            };
        }
    }
};
exports.WebhookManagementController = WebhookManagementController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Register a webhook subscription' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                channelId: { type: 'string', example: 'whatsapp-business-123' },
                webhookUrl: { type: 'string', example: 'https://your-app.com/webhook' },
                events: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['message', 'delivery', 'read']
                },
                secret: { type: 'string', example: 'webhook-secret-key' },
            },
            required: ['channelId', 'webhookUrl', 'events'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Webhook registered successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                channelId: { type: 'string' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)('channelId')),
    __param(1, (0, common_1.Body)('webhookUrl')),
    __param(2, (0, common_1.Body)('events')),
    __param(3, (0, common_1.Body)('secret')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array, String]),
    __metadata("design:returntype", Promise)
], WebhookManagementController.prototype, "registerWebhook", null);
__decorate([
    (0, common_1.Post)('unregister/:channelId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Unregister a webhook subscription' }),
    (0, swagger_1.ApiParam)({
        name: 'channelId',
        required: true,
        type: 'string',
        example: 'whatsapp-business-123',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook unregistered successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                channelId: { type: 'string' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Webhook not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebhookManagementController.prototype, "unregisterWebhook", null);
__decorate([
    (0, common_1.Post)('process/:channelId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Process an incoming webhook event' }),
    (0, swagger_1.ApiParam)({
        name: 'channelId',
        required: true,
        type: 'string',
        example: 'whatsapp-business-123',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Webhook event payload',
        schema: {
            type: 'object',
            example: {
                type: 'message',
                timestamp: 1234567890,
                data: {
                    from: '+1234567890',
                    message: 'Hello World',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook event processed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                result: { type: 'object' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Webhook not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('channelId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WebhookManagementController.prototype, "processWebhookEvent", null);
__decorate([
    (0, common_1.Post)('replay/:channelId/:eventId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Replay a webhook event' }),
    (0, swagger_1.ApiParam)({
        name: 'channelId',
        required: true,
        type: 'string',
        example: 'whatsapp-business-123',
    }),
    (0, swagger_1.ApiParam)({
        name: 'eventId',
        required: true,
        type: 'string',
        example: 'event-123',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook event replayed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                result: { type: 'object' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('channelId')),
    __param(1, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WebhookManagementController.prototype, "replayWebhookEvent", null);
__decorate([
    (0, common_1.Get)('subscription/:channelId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get webhook subscription information' }),
    (0, swagger_1.ApiParam)({
        name: 'channelId',
        required: true,
        type: 'string',
        example: 'whatsapp-business-123',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook subscription information retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Webhook not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebhookManagementController.prototype, "getWebhookSubscription", null);
__decorate([
    (0, common_1.Get)('events/:channelId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get recent webhook events for a channel' }),
    (0, swagger_1.ApiParam)({
        name: 'channelId',
        required: true,
        type: 'string',
        example: 'whatsapp-business-123',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: 'number',
        example: 10,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook events retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: { type: 'object' }
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('channelId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], WebhookManagementController.prototype, "getRecentWebhookEvents", null);
exports.WebhookManagementController = WebhookManagementController = __decorate([
    (0, swagger_1.ApiTags)('Webhook Management'),
    (0, common_1.Controller)('webhooks'),
    __metadata("design:paramtypes", [webhook_management_service_1.WebhookManagementService])
], WebhookManagementController);
//# sourceMappingURL=webhook-management.controller.js.map