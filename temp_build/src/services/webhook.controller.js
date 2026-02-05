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
var WebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const common_1 = require("@nestjs/common");
const webhook_service_1 = require("./webhook.service");
const swagger_1 = require("@nestjs/swagger");
let WebhookController = WebhookController_1 = class WebhookController {
    constructor(webhookService) {
        this.webhookService = webhookService;
        this.logger = new common_1.Logger(WebhookController_1.name);
    }
    verifyFacebookWebhook(mode, verifyToken, challenge) {
        try {
            if (mode === 'subscribe' && verifyToken) {
                this.logger.log('Facebook webhook verification requested');
                return this.webhookService.verifyFacebookWebhook(verifyToken, challenge);
            }
            else {
                return { error: 'Invalid verification request' };
            }
        }
        catch (error) {
            this.logger.error('Facebook webhook verification failed:', error.message);
            return { error: error.message };
        }
    }
    async processFacebookWebhook(payload) {
        try {
            this.logger.log('Facebook webhook event received');
            const result = await this.webhookService.processFacebookWebhook(payload);
            return result;
        }
        catch (error) {
            this.logger.error('Failed to process Facebook webhook:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async processWhatsAppWebhook(payload) {
        try {
            this.logger.log('WhatsApp webhook event received');
            const result = await this.webhookService.processWhatsAppWebhook(payload);
            return result;
        }
        catch (error) {
            this.logger.error('Failed to process WhatsApp webhook:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async processGoogleAdsWebhook(payload) {
        try {
            this.logger.log('Google Ads webhook event received');
            const result = await this.webhookService.processGoogleAdsWebhook(payload);
            return result;
        }
        catch (error) {
            this.logger.error('Failed to process Google Ads webhook:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    getRecentWebhookEvents() {
        try {
            const events = this.webhookService.getRecentWebhookEvents();
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
    getWebhookEventsByChannel(channel) {
        try {
            const events = this.webhookService.getWebhookEventsByChannel(channel);
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
};
exports.WebhookController = WebhookController;
__decorate([
    (0, common_1.Get)('meta/facebook/webhook'),
    (0, swagger_1.ApiOperation)({
        summary: 'Facebook webhook verification',
        description: 'Verify Facebook webhook subscription',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'hub.mode',
        description: 'Subscription mode',
        required: true,
        example: 'subscribe',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'hub.verify_token',
        description: 'Verification token',
        required: true,
        example: 'your_verify_token',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'hub.challenge',
        description: 'Challenge string',
        required: true,
        example: 'challenge_string',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook verified successfully',
        schema: {
            type: 'object',
            properties: {
                challenge: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Query)('hub.mode')),
    __param(1, (0, common_1.Query)('hub.verify_token')),
    __param(2, (0, common_1.Query)('hub.challenge')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], WebhookController.prototype, "verifyFacebookWebhook", null);
__decorate([
    (0, common_1.Post)('meta/facebook/webhook'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Process Facebook webhook events',
        description: 'Handle incoming Facebook webhook events',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Facebook webhook payload',
        schema: {
            type: 'object',
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook processed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                eventId: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "processFacebookWebhook", null);
__decorate([
    (0, common_1.Post)('meta/whatsapp/webhook'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Process WhatsApp webhook events',
        description: 'Handle incoming WhatsApp webhook events',
    }),
    (0, swagger_1.ApiBody)({
        description: 'WhatsApp webhook payload',
        schema: {
            type: 'object',
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook processed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                eventId: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "processWhatsAppWebhook", null);
__decorate([
    (0, common_1.Post)('google/ads/webhook'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Process Google Ads webhook events',
        description: 'Handle incoming Google Ads webhook events',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Google Ads webhook payload',
        schema: {
            type: 'object',
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook processed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                eventId: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "processGoogleAdsWebhook", null);
__decorate([
    (0, common_1.Get)('webhooks/events'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get recent webhook events',
        description: 'Retrieve recent webhook events for monitoring',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook events retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    channel: { type: 'string' },
                    eventType: { type: 'string' },
                    payload: { type: 'object' },
                    timestamp: { type: 'string', format: 'date-time' },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WebhookController.prototype, "getRecentWebhookEvents", null);
__decorate([
    (0, common_1.Get)('webhooks/events/:channel'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get webhook events by channel',
        description: 'Retrieve webhook events for a specific channel',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook events retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    channel: { type: 'string' },
                    eventType: { type: 'string' },
                    payload: { type: 'object' },
                    timestamp: { type: 'string', format: 'date-time' },
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('channel')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WebhookController.prototype, "getWebhookEventsByChannel", null);
exports.WebhookController = WebhookController = WebhookController_1 = __decorate([
    (0, swagger_1.ApiTags)('webhooks'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [webhook_service_1.WebhookService])
], WebhookController);
//# sourceMappingURL=webhook.controller.js.map