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
exports.FacebookMessengerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const facebook_messenger_service_1 = require("./facebook-messenger.service");
let FacebookMessengerController = class FacebookMessengerController {
    constructor(facebookService) {
        this.facebookService = facebookService;
    }
    async sendTextMessage(recipientId, message) {
        try {
            const result = await this.facebookService.sendTextMessage(recipientId, message);
            return {
                success: true,
                data: result,
                message: 'Message sent successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to send message',
            };
        }
    }
    async sendTemplateMessage(recipientId, templatePayload) {
        try {
            const result = await this.facebookService.sendTemplateMessage(recipientId, templatePayload);
            return {
                success: true,
                data: result,
                message: 'Template message sent successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to send template message',
            };
        }
    }
    async sendQuickReplyMessage(recipientId, text, quickReplies) {
        try {
            const result = await this.facebookService.sendQuickReplyMessage(recipientId, text, quickReplies);
            return {
                success: true,
                data: result,
                message: 'Quick reply message sent successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to send quick reply message',
            };
        }
    }
    async handleWebhook(payload) {
        try {
            const result = await this.facebookService.handleWebhookEvent(payload);
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
    async verifyWebhook(mode, verifyToken, challenge) {
        if (mode === 'subscribe') {
            return this.facebookService.verifyWebhook(verifyToken, challenge);
        }
        else {
            throw new Error('Invalid mode');
        }
    }
};
exports.FacebookMessengerController = FacebookMessengerController;
__decorate([
    (0, common_1.Post)('send-text'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Send a text message via Facebook Messenger' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                recipientId: { type: 'string', example: '1234567890' },
                message: { type: 'string', example: 'Hello from MisyBot!' },
            },
            required: ['recipientId', 'message'],
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
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)('recipientId')),
    __param(1, (0, common_1.Body)('message')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FacebookMessengerController.prototype, "sendTextMessage", null);
__decorate([
    (0, common_1.Post)('send-template'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Send a template message via Facebook Messenger' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                recipientId: { type: 'string', example: '1234567890' },
                templatePayload: {
                    type: 'object',
                    example: {
                        attachment: {
                            type: 'template',
                            payload: {
                                template_type: 'generic',
                                elements: [
                                    {
                                        title: 'Welcome to MisyBot',
                                        image_url: 'https://example.com/image.jpg',
                                        subtitle: 'We have the right hat for everyone.',
                                        default_action: {
                                            type: 'web_url',
                                            url: 'https://example.com',
                                        },
                                        buttons: [
                                            {
                                                type: 'web_url',
                                                url: 'https://example.com',
                                                title: 'View Website',
                                            },
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                },
            },
            required: ['recipientId', 'templatePayload'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Template message sent successfully',
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
    __param(1, (0, common_1.Body)('templatePayload')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FacebookMessengerController.prototype, "sendTemplateMessage", null);
__decorate([
    (0, common_1.Post)('send-quick-reply'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Send a quick reply message via Facebook Messenger' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                recipientId: { type: 'string', example: '1234567890' },
                text: { type: 'string', example: 'What are your favorite colors?' },
                quickReplies: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            content_type: { type: 'string', example: 'text' },
                            title: { type: 'string', example: 'Red' },
                            payload: { type: 'string', example: 'RED_PAYLOAD' },
                        },
                    },
                    example: [
                        {
                            content_type: 'text',
                            title: 'Red',
                            payload: 'RED_PAYLOAD',
                        },
                        {
                            content_type: 'text',
                            title: 'Green',
                            payload: 'GREEN_PAYLOAD',
                        },
                    ],
                },
            },
            required: ['recipientId', 'text', 'quickReplies'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Quick reply message sent successfully',
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
    __param(1, (0, common_1.Body)('text')),
    __param(2, (0, common_1.Body)('quickReplies')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array]),
    __metadata("design:returntype", Promise)
], FacebookMessengerController.prototype, "sendQuickReplyMessage", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Facebook Messenger webhook events' }),
    (0, swagger_1.ApiBody)({
        description: 'Webhook payload from Facebook Messenger API',
        schema: {
            type: 'object',
            example: {
                object: 'page',
                entry: [
                    {
                        id: 'PAGE_ID',
                        time: 1234567890,
                        messaging: [
                            {
                                sender: {
                                    id: 'SENDER_ID',
                                },
                                recipient: {
                                    id: 'RECIPIENT_ID',
                                },
                                timestamp: 1234567890,
                                message: {
                                    mid: 'MESSAGE_ID',
                                    text: 'Hello, world!',
                                },
                            },
                        ],
                    },
                ],
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FacebookMessengerController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify Facebook Messenger webhook subscription' }),
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
    __param(0, (0, common_1.Query)('hub.mode')),
    __param(1, (0, common_1.Query)('hub.verify_token')),
    __param(2, (0, common_1.Query)('hub.challenge')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], FacebookMessengerController.prototype, "verifyWebhook", null);
exports.FacebookMessengerController = FacebookMessengerController = __decorate([
    (0, swagger_1.ApiTags)('Facebook Messenger'),
    (0, common_1.Controller)('facebook'),
    __metadata("design:paramtypes", [facebook_messenger_service_1.FacebookMessengerService])
], FacebookMessengerController);
//# sourceMappingURL=facebook-messenger.controller.js.map