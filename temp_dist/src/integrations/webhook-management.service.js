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
var WebhookManagementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookManagementService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let WebhookManagementService = WebhookManagementService_1 = class WebhookManagementService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(WebhookManagementService_1.name);
        this.webhookSubscriptions = new Map();
        this.webhookEvents = new Map();
    }
    async registerWebhook(channelId, webhookUrl, events, secret) {
        try {
            const subscription = {
                channelId,
                webhookUrl,
                events,
                secret,
                createdAt: new Date(),
                active: true,
            };
            this.webhookSubscriptions.set(channelId, subscription);
            if (!this.webhookEvents.has(channelId)) {
                this.webhookEvents.set(channelId, []);
            }
            this.logger.log(`Registered webhook for channel ${channelId}`);
            return {
                success: true,
                channelId,
                message: 'Webhook registered successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to register webhook for channel ${channelId}: ${error.message}`);
            throw new Error(`Failed to register webhook: ${error.message}`);
        }
    }
    async unregisterWebhook(channelId) {
        try {
            const subscription = this.webhookSubscriptions.get(channelId);
            if (!subscription) {
                throw new Error(`No webhook subscription found for channel ${channelId}`);
            }
            subscription.active = false;
            this.webhookSubscriptions.set(channelId, subscription);
            this.logger.log(`Unregistered webhook for channel ${channelId}`);
            return {
                success: true,
                channelId,
                message: 'Webhook unregistered successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to unregister webhook for channel ${channelId}: ${error.message}`);
            throw new Error(`Failed to unregister webhook: ${error.message}`);
        }
    }
    async processWebhookEvent(channelId, event) {
        try {
            const subscription = this.webhookSubscriptions.get(channelId);
            if (!subscription || !subscription.active) {
                throw new Error(`No active webhook subscription found for channel ${channelId}`);
            }
            if (!subscription.events.includes(event.type) && !subscription.events.includes('*')) {
                this.logger.log(`Event type ${event.type} not subscribed for channel ${channelId}`);
                return {
                    success: true,
                    message: 'Event not subscribed, ignoring',
                };
            }
            const events = this.webhookEvents.get(channelId) || [];
            events.push({
                ...event,
                processedAt: new Date(),
                id: this.generateEventId(),
            });
            this.webhookEvents.set(channelId, events);
            const result = await this.sendWebhook(subscription.webhookUrl, event, subscription.secret);
            this.logger.log(`Processed webhook event for channel ${channelId}`);
            return {
                success: true,
                result,
                message: 'Webhook event processed successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to process webhook event for channel ${channelId}: ${error.message}`);
            const events = this.webhookEvents.get(channelId) || [];
            events.push({
                ...event,
                processedAt: new Date(),
                id: this.generateEventId(),
                failed: true,
                error: error.message,
            });
            this.webhookEvents.set(channelId, events);
            throw new Error(`Failed to process webhook event: ${error.message}`);
        }
    }
    async replayWebhookEvent(channelId, eventId) {
        try {
            const events = this.webhookEvents.get(channelId) || [];
            const event = events.find(e => e.id === eventId);
            if (!event) {
                throw new Error(`Event ${eventId} not found for channel ${channelId}`);
            }
            const subscription = this.webhookSubscriptions.get(channelId);
            if (!subscription || !subscription.active) {
                throw new Error(`No active webhook subscription found for channel ${channelId}`);
            }
            const result = await this.sendWebhook(subscription.webhookUrl, event, subscription.secret);
            this.logger.log(`Replayed webhook event ${eventId} for channel ${channelId}`);
            return {
                success: true,
                result,
                message: 'Webhook event replayed successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to replay webhook event ${eventId} for channel ${channelId}: ${error.message}`);
            throw new Error(`Failed to replay webhook event: ${error.message}`);
        }
    }
    getWebhookSubscription(channelId) {
        const subscription = this.webhookSubscriptions.get(channelId);
        if (!subscription) {
            return null;
        }
        return {
            ...subscription,
            eventsCount: (this.webhookEvents.get(channelId) || []).length,
        };
    }
    getRecentWebhookEvents(channelId, limit = 10) {
        const events = this.webhookEvents.get(channelId) || [];
        return events.slice(-limit).reverse();
    }
    async sendWebhook(url, payload, secret) {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            if (secret) {
                const signature = this.generateSignature(payload, secret);
                headers['X-Hub-Signature'] = `sha256=${signature}`;
            }
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, payload, { headers }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to send webhook to ${url}: ${error.message}`);
            throw error;
        }
    }
    generateSignature(payload, secret) {
        const crypto = require('crypto');
        const payloadString = JSON.stringify(payload);
        return crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
    }
    generateEventId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};
exports.WebhookManagementService = WebhookManagementService;
exports.WebhookManagementService = WebhookManagementService = WebhookManagementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], WebhookManagementService);
//# sourceMappingURL=webhook-management.service.js.map