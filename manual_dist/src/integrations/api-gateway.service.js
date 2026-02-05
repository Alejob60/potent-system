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
var ApiGatewayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiGatewayService = void 0;
const common_1 = require("@nestjs/common");
const whatsapp_business_service_1 = require("./channels/whatsapp-business.service");
const instagram_dm_service_1 = require("./channels/instagram-dm.service");
const facebook_messenger_service_1 = require("./channels/facebook-messenger.service");
const email_service_1 = require("./channels/email.service");
let ApiGatewayService = ApiGatewayService_1 = class ApiGatewayService {
    constructor(whatsappService, instagramService, facebookService, emailService) {
        this.whatsappService = whatsappService;
        this.instagramService = instagramService;
        this.facebookService = facebookService;
        this.emailService = emailService;
        this.logger = new common_1.Logger(ApiGatewayService_1.name);
        this.rateLimitStore = new Map();
    }
    async sendMessage(channel, recipient, message, options) {
        try {
            if (this.isRateLimited(channel, recipient)) {
                throw new Error(`Rate limit exceeded for ${channel} channel`);
            }
            let result;
            switch (channel.toLowerCase()) {
                case 'whatsapp':
                    if (options?.template) {
                        result = await this.whatsappService.sendTemplateMessage(recipient, options.template.name, options.template.language, options.template.components);
                    }
                    else {
                        result = await this.whatsappService.sendTextMessage(recipient, message);
                    }
                    break;
                case 'instagram':
                    if (options?.media) {
                        result = await this.instagramService.sendMediaMessage(recipient, options.media.type, options.media.url, message);
                    }
                    else {
                        result = await this.instagramService.sendTextMessage(recipient, message);
                    }
                    break;
                case 'facebook':
                    if (options?.template) {
                        result = await this.facebookService.sendTemplateMessage(recipient, options.template);
                    }
                    else if (options?.quickReplies) {
                        result = await this.facebookService.sendQuickReplyMessage(recipient, message, options.quickReplies);
                    }
                    else {
                        result = await this.facebookService.sendTextMessage(recipient, message);
                    }
                    break;
                case 'email':
                    if (options?.html) {
                        result = await this.emailService.sendHtmlEmail(recipient, options.subject, options.html);
                    }
                    else if (options?.template) {
                        result = await this.emailService.sendTemplatedEmail(recipient, options.subject, options.template.name, options.template.context);
                    }
                    else {
                        result = await this.emailService.sendTextEmail(recipient, options?.subject || 'Message', message);
                    }
                    break;
                default:
                    throw new Error(`Unsupported channel: ${channel}`);
            }
            this.updateRateLimit(channel, recipient);
            this.logger.log(`Successfully sent message through ${channel} to ${recipient}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to send message through ${channel} to ${recipient}: ${error.message}`);
            throw new Error(`Failed to send message: ${error.message}`);
        }
    }
    async sendBulkMessage(recipients, message, options) {
        try {
            const results = [];
            for (const { channel, recipient } of recipients) {
                try {
                    const result = await this.sendMessage(channel, recipient, message, options);
                    results.push({
                        channel,
                        recipient,
                        success: true,
                        result,
                    });
                }
                catch (error) {
                    results.push({
                        channel,
                        recipient,
                        success: false,
                        error: error.message,
                    });
                    this.logger.error(`Failed to send bulk message to ${recipient} via ${channel}: ${error.message}`);
                }
            }
            return results;
        }
        catch (error) {
            this.logger.error(`Failed to send bulk messages: ${error.message}`);
            throw new Error(`Failed to send bulk messages: ${error.message}`);
        }
    }
    async handleWebhookEvent(channel, payload) {
        try {
            let result;
            switch (channel.toLowerCase()) {
                case 'whatsapp':
                    result = await this.whatsappService.handleWebhookEvent(payload);
                    break;
                case 'instagram':
                    result = await this.instagramService.handleWebhookEvent(payload);
                    break;
                case 'facebook':
                    result = await this.facebookService.handleWebhookEvent(payload);
                    break;
                default:
                    throw new Error(`Unsupported channel for webhook: ${channel}`);
            }
            this.logger.log(`Successfully processed webhook event from ${channel}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to process webhook event from ${channel}: ${error.message}`);
            throw new Error(`Failed to process webhook event: ${error.message}`);
        }
    }
    verifyWebhook(channel, verifyToken, challenge) {
        try {
            switch (channel.toLowerCase()) {
                case 'whatsapp':
                    return this.whatsappService.verifyWebhook(verifyToken, challenge);
                case 'instagram':
                    return this.instagramService.verifyWebhook(verifyToken, challenge);
                case 'facebook':
                    return this.facebookService.verifyWebhook(verifyToken, challenge);
                default:
                    throw new Error(`Unsupported channel for webhook verification: ${channel}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to verify webhook for ${channel}: ${error.message}`);
            throw new Error(`Failed to verify webhook: ${error.message}`);
        }
    }
    isRateLimited(channel, recipient) {
        const key = `${channel}:${recipient}`;
        const rateLimit = this.rateLimitStore.get(key);
        if (!rateLimit) {
            return false;
        }
        const now = Date.now();
        if (now > rateLimit.resetTime) {
            this.rateLimitStore.delete(key);
            return false;
        }
        return rateLimit.count >= 10;
    }
    updateRateLimit(channel, recipient) {
        const key = `${channel}:${recipient}`;
        const rateLimit = this.rateLimitStore.get(key);
        const now = Date.now();
        const resetTime = now + 60000;
        if (!rateLimit) {
            this.rateLimitStore.set(key, { count: 1, resetTime });
        }
        else {
            this.rateLimitStore.set(key, { count: rateLimit.count + 1, resetTime });
        }
    }
    getRateLimitInfo(channel, recipient) {
        const key = `${channel}:${recipient}`;
        return this.rateLimitStore.get(key) || null;
    }
};
exports.ApiGatewayService = ApiGatewayService;
exports.ApiGatewayService = ApiGatewayService = ApiGatewayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [whatsapp_business_service_1.WhatsappBusinessService,
        instagram_dm_service_1.InstagramDmService,
        facebook_messenger_service_1.FacebookMessengerService,
        email_service_1.EmailService])
], ApiGatewayService);
//# sourceMappingURL=api-gateway.service.js.map