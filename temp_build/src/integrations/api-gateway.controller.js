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
exports.ApiGatewayController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_gateway_service_1 = require("./api-gateway.service");
let ApiGatewayController = class ApiGatewayController {
    constructor(apiGatewayService) {
        this.apiGatewayService = apiGatewayService;
    }
    async sendMessage(channel, recipient, message, options) {
        try {
            const result = await this.apiGatewayService.sendMessage(channel, recipient, message, options);
            return {
                success: true,
                data: result,
                message: 'Message sent successfully',
            };
        }
        catch (error) {
            if (error.message.includes('Rate limit exceeded')) {
                return {
                    success: false,
                    error: error.message,
                    message: 'Rate limit exceeded',
                };
            }
            return {
                success: false,
                error: error.message,
                message: 'Failed to send message',
            };
        }
    }
    async sendBulkMessage(recipients, message, options) {
        try {
            const result = await this.apiGatewayService.sendBulkMessage(recipients, message, options);
            return {
                success: true,
                data: result,
                message: 'Bulk messages sent successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to send bulk messages',
            };
        }
    }
    async handleWebhook(channel, payload) {
        try {
            const result = await this.apiGatewayService.handleWebhookEvent(channel, payload);
            return {
                success: true,
                data: result,
                message: 'Webhook processed successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to process webhook',
            };
        }
    }
    async verifyWebhook(channel, mode, verifyToken, challenge) {
        if (mode === 'subscribe') {
            return this.apiGatewayService.verifyWebhook(channel, verifyToken, challenge);
        }
        else {
            throw new Error('Invalid mode');
        }
    }
    async getRateLimitInfo(channel, recipient) {
        try {
            const data = this.apiGatewayService.getRateLimitInfo(channel, recipient);
            if (data) {
                return {
                    success: true,
                    data,
                    message: 'Rate limit information retrieved successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'No rate limit information found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve rate limit information',
            };
        }
    }
};
exports.ApiGatewayController = ApiGatewayController;
__decorate([
    (0, common_1.Post)('send'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Send a message through the unified API gateway' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                channel: {
                    type: 'string',
                    example: 'whatsapp',
                    enum: ['whatsapp', 'instagram', 'facebook', 'email']
                },
                recipient: { type: 'string', example: '+1234567890' },
                message: { type: 'string', example: 'Hello from MisyBot!' },
                options: {
                    type: 'object',
                    example: {
                        subject: 'Email Subject',
                        template: {
                            name: 'welcome',
                            language: 'en_US',
                            components: []
                        }
                    }
                }
            },
            required: ['channel', 'recipient', 'message'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Message sent successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Rate limit exceeded' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)('channel')),
    __param(1, (0, common_1.Body)('recipient')),
    __param(2, (0, common_1.Body)('message')),
    __param(3, (0, common_1.Body)('options')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)('send-bulk'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Send a bulk message to multiple recipients across channels' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                recipients: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            channel: {
                                type: 'string',
                                example: 'whatsapp',
                                enum: ['whatsapp', 'instagram', 'facebook', 'email']
                            },
                            recipient: { type: 'string', example: '+1234567890' }
                        },
                        required: ['channel', 'recipient']
                    },
                    example: [
                        { channel: 'whatsapp', recipient: '+1234567890' },
                        { channel: 'email', recipient: 'user@example.com' }
                    ]
                },
                message: { type: 'string', example: 'Hello from MisyBot!' },
                options: {
                    type: 'object',
                    example: {
                        subject: 'Email Subject',
                        template: {
                            name: 'welcome',
                            language: 'en_US',
                            components: []
                        }
                    }
                }
            },
            required: ['recipients', 'message'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Bulk messages sent successfully',
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
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)('recipients')),
    __param(1, (0, common_1.Body)('message')),
    __param(2, (0, common_1.Body)('options')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String, Object]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "sendBulkMessage", null);
__decorate([
    (0, common_1.Post)('webhook/:channel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle webhook events from any channel' }),
    (0, swagger_1.ApiParam)({
        name: 'channel',
        required: true,
        type: 'string',
        example: 'whatsapp',
        enum: ['whatsapp', 'instagram', 'facebook']
    }),
    (0, swagger_1.ApiBody)({
        description: 'Webhook payload from the channel',
        schema: {
            type: 'object',
            example: {
                object: 'whatsapp_business_account',
                entry: []
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('channel')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('webhook/:channel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify webhook subscription for a channel' }),
    (0, swagger_1.ApiParam)({
        name: 'channel',
        required: true,
        type: 'string',
        example: 'whatsapp',
        enum: ['whatsapp', 'instagram', 'facebook']
    }),
    (0, swagger_1.ApiQuery)({
        name: 'hub.mode',
        required: true,
        type: 'string',
        example: 'subscribe',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'hub.verify_token',
        required: true,
        type: 'string',
        example: 'VERIFY_TOKEN',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'hub.challenge',
        required: true,
        type: 'string',
        example: 'CHALLENGE_STRING',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook verification successful',
        type: String,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - verification failed' }),
    __param(0, (0, common_1.Param)('channel')),
    __param(1, (0, common_1.Query)('hub.mode')),
    __param(2, (0, common_1.Query)('hub.verify_token')),
    __param(3, (0, common_1.Query)('hub.challenge')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "verifyWebhook", null);
__decorate([
    (0, common_1.Get)('rate-limit/:channel/:recipient'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get rate limit information for a recipient on a channel' }),
    (0, swagger_1.ApiParam)({
        name: 'channel',
        required: true,
        type: 'string',
        example: 'whatsapp',
    }),
    (0, swagger_1.ApiParam)({
        name: 'recipient',
        required: true,
        type: 'string',
        example: '+1234567890',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Rate limit information retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        count: { type: 'number' },
                        resetTime: { type: 'number' }
                    }
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'No rate limit information found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('channel')),
    __param(1, (0, common_1.Param)('recipient')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "getRateLimitInfo", null);
exports.ApiGatewayController = ApiGatewayController = __decorate([
    (0, swagger_1.ApiTags)('API Gateway'),
    (0, common_1.Controller)('gateway'),
    __metadata("design:paramtypes", [api_gateway_service_1.ApiGatewayService])
], ApiGatewayController);
//# sourceMappingURL=api-gateway.controller.js.map