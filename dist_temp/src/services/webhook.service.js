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
var WebhookService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
let WebhookService = WebhookService_1 = class WebhookService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(WebhookService_1.name);
        this.webhookEvents = [];
    }
    async processFacebookWebhook(payload) {
        try {
            this.logger.log('Processing Facebook webhook event');
            const event = {
                channel: 'facebook',
                eventType: payload.object || 'unknown',
                payload,
                timestamp: new Date(),
            };
            this.webhookEvents.push(event);
            return {
                success: true,
                message: 'Facebook webhook processed',
                eventId: `fb_${Date.now()}`,
            };
        }
        catch (error) {
            this.logger.error('Failed to process Facebook webhook:', error.message);
            throw error;
        }
    }
    async processWhatsAppWebhook(payload) {
        try {
            this.logger.log('Processing WhatsApp webhook event');
            const event = {
                channel: 'whatsapp',
                eventType: payload.type || 'unknown',
                payload,
                timestamp: new Date(),
            };
            this.webhookEvents.push(event);
            return {
                success: true,
                message: 'WhatsApp webhook processed',
                eventId: `wa_${Date.now()}`,
            };
        }
        catch (error) {
            this.logger.error('Failed to process WhatsApp webhook:', error.message);
            throw error;
        }
    }
    async processGoogleAdsWebhook(payload) {
        try {
            this.logger.log('Processing Google Ads webhook event');
            const event = {
                channel: 'google-ads',
                eventType: payload.eventType || 'unknown',
                payload,
                timestamp: new Date(),
            };
            this.webhookEvents.push(event);
            return {
                success: true,
                message: 'Google Ads webhook processed',
                eventId: `ga_${Date.now()}`,
            };
        }
        catch (error) {
            this.logger.error('Failed to process Google Ads webhook:', error.message);
            throw error;
        }
    }
    verifyFacebookWebhook(verifyToken, challenge) {
        this.logger.log('Verifying Facebook webhook subscription');
        return { challenge };
    }
    getRecentWebhookEvents(limit = 50) {
        return this.webhookEvents.slice(-limit);
    }
    getWebhookEventsByChannel(channel, limit = 50) {
        const filteredEvents = this.webhookEvents.filter(event => event.channel === channel);
        return filteredEvents.slice(-limit);
    }
};
exports.WebhookService = WebhookService;
exports.WebhookService = WebhookService = WebhookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], WebhookService);
//# sourceMappingURL=webhook.service.js.map