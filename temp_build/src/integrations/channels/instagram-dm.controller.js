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
exports.InstagramDmController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const instagram_dm_service_1 = require("./instagram-dm.service");
let InstagramDmController = class InstagramDmController {
    constructor(instagramService) {
        this.instagramService = instagramService;
    }
    async sendTextMessage(recipientId, message) {
        try {
            const result = await this.instagramService.sendTextMessage(recipientId, message);
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
    async sendMediaMessage(recipientId, mediaType, mediaUrl, caption) {
        try {
            const result = await this.instagramService.sendMediaMessage(recipientId, mediaType, mediaUrl, caption);
            return {
                success: true,
                data: result,
                message: 'Media message sent successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to send media message',
            };
        }
    }
    async handleWebhook(payload) {
        try {
            const result = await this.instagramService.handleWebhookEvent(payload);
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
            return this.instagramService.verifyWebhook(verifyToken, challenge);
        }
        else {
            throw new Error('Invalid mode');
        }
    }
};
exports.InstagramDmController = InstagramDmController;
__decorate([
    (0, common_1.Post)('send-text'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Send a text message via Instagram DM' }),
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
], InstagramDmController.prototype, "sendTextMessage", null);
__decorate([
    (0, common_1.Post)('send-media'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Send a media message via Instagram DM' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                recipientId: { type: 'string', example: '1234567890' },
                mediaType: { type: 'string', example: 'image' },
                mediaUrl: { type: 'string', example: 'https://example.com/image.jpg' },
                caption: { type: 'string', example: 'Check out this image!' },
            },
            required: ['recipientId', 'mediaType', 'mediaUrl'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Media message sent successfully',
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
    __param(1, (0, common_1.Body)('mediaType')),
    __param(2, (0, common_1.Body)('mediaUrl')),
    __param(3, (0, common_1.Body)('caption')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], InstagramDmController.prototype, "sendMediaMessage", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Instagram DM webhook events' }),
    (0, swagger_1.ApiBody)({
        description: 'Webhook payload from Instagram DM API',
        schema: {
            type: 'object',
            example: {
                object: 'instagram',
                entry: [
                    {
                        id: 'INSTAGRAM_BUSINESS_ACCOUNT_ID',
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
], InstagramDmController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify Instagram DM webhook subscription' }),
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
], InstagramDmController.prototype, "verifyWebhook", null);
exports.InstagramDmController = InstagramDmController = __decorate([
    (0, swagger_1.ApiTags)('Instagram DM'),
    (0, common_1.Controller)('instagram'),
    __metadata("design:paramtypes", [instagram_dm_service_1.InstagramDmService])
], InstagramDmController);
//# sourceMappingURL=instagram-dm.controller.js.map