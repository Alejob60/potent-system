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
exports.WhatsappBusinessController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const whatsapp_business_service_1 = require("./whatsapp-business.service");
let WhatsappBusinessController = class WhatsappBusinessController {
    constructor(whatsappService) {
        this.whatsappService = whatsappService;
    }
    async sendTextMessage(to, message) {
        try {
            const result = await this.whatsappService.sendTextMessage(to, message);
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
    async sendTemplateMessage(to, templateName, language, components) {
        try {
            const result = await this.whatsappService.sendTemplateMessage(to, templateName, language, components);
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
    async handleWebhook(payload) {
        try {
            const result = await this.whatsappService.handleWebhookEvent(payload);
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
            return this.whatsappService.verifyWebhook(verifyToken, challenge);
        }
        else {
            throw new Error('Invalid mode');
        }
    }
};
exports.WhatsappBusinessController = WhatsappBusinessController;
__decorate([
    (0, common_1.Post)('send-text'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Send a text message via WhatsApp Business' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                to: { type: 'string', example: '+1234567890' },
                message: { type: 'string', example: 'Hello from MisyBot!' },
            },
            required: ['to', 'message'],
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
    __param(0, (0, common_1.Body)('to')),
    __param(1, (0, common_1.Body)('message')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WhatsappBusinessController.prototype, "sendTextMessage", null);
__decorate([
    (0, common_1.Post)('send-template'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Send a template message via WhatsApp Business' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                to: { type: 'string', example: '+1234567890' },
                templateName: { type: 'string', example: 'welcome_template' },
                language: { type: 'string', example: 'en_US' },
                components: {
                    type: 'array',
                    items: { type: 'object' },
                    example: [{ type: 'body', parameters: [{ type: 'text', text: 'John' }] }],
                },
            },
            required: ['to', 'templateName', 'language'],
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
    __param(0, (0, common_1.Body)('to')),
    __param(1, (0, common_1.Body)('templateName')),
    __param(2, (0, common_1.Body)('language')),
    __param(3, (0, common_1.Body)('components')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Array]),
    __metadata("design:returntype", Promise)
], WhatsappBusinessController.prototype, "sendTemplateMessage", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle WhatsApp Business webhook events' }),
    (0, swagger_1.ApiBody)({
        description: 'Webhook payload from WhatsApp Business API',
        schema: {
            type: 'object',
            example: {
                object: 'whatsapp_business_account',
                entry: [
                    {
                        id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
                        changes: [
                            {
                                value: {
                                    messaging_product: 'whatsapp',
                                    metadata: {
                                        display_phone_number: 'PHONE_NUMBER',
                                        phone_number_id: 'PHONE_NUMBER_ID',
                                    },
                                    contacts: [
                                        {
                                            profile: {
                                                name: 'NAME',
                                            },
                                            wa_id: 'PHONE_NUMBER',
                                        },
                                    ],
                                    messages: [
                                        {
                                            from: 'PHONE_NUMBER',
                                            id: 'wamid.ID',
                                            timestamp: 'TIMESTAMP',
                                            text: {
                                                body: 'MESSAGE_BODY',
                                            },
                                            type: 'text',
                                        },
                                    ],
                                },
                                field: 'messages',
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
], WhatsappBusinessController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify WhatsApp Business webhook subscription' }),
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
], WhatsappBusinessController.prototype, "verifyWebhook", null);
exports.WhatsappBusinessController = WhatsappBusinessController = __decorate([
    (0, swagger_1.ApiTags)('WhatsApp Business'),
    (0, common_1.Controller)('whatsapp'),
    __metadata("design:paramtypes", [whatsapp_business_service_1.WhatsappBusinessService])
], WhatsappBusinessController);
//# sourceMappingURL=whatsapp-business.controller.js.map