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
var WhatsappBusinessService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappBusinessService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let WhatsappBusinessService = WhatsappBusinessService_1 = class WhatsappBusinessService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(WhatsappBusinessService_1.name);
        this.baseUrl = process.env.WHATSAPP_BASE_URL || 'https://graph.facebook.com/v17.0';
        this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
        this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    }
    async sendTextMessage(to, message) {
        try {
            const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
            const payload = {
                messaging_product: 'whatsapp',
                to,
                text: {
                    body: message,
                },
            };
            const headers = {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
            };
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, payload, { headers }));
            this.logger.log(`Successfully sent message to ${to}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to send message to ${to}: ${error.message}`);
            throw new Error(`Failed to send WhatsApp message: ${error.message}`);
        }
    }
    async sendTemplateMessage(to, templateName, language, components) {
        try {
            const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
            const payload = {
                messaging_product: 'whatsapp',
                to,
                type: 'template',
                template: {
                    name: templateName,
                    language: {
                        code: language,
                    },
                    components,
                },
            };
            const headers = {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
            };
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, payload, { headers }));
            this.logger.log(`Successfully sent template message to ${to}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to send template message to ${to}: ${error.message}`);
            throw new Error(`Failed to send WhatsApp template message: ${error.message}`);
        }
    }
    async handleWebhookEvent(payload) {
        try {
            if (payload.entry && Array.isArray(payload.entry)) {
                for (const entry of payload.entry) {
                    if (entry.changes && Array.isArray(entry.changes)) {
                        for (const change of entry.changes) {
                            if (change.field === 'messages') {
                                await this.processMessageEvent(change.value);
                            }
                        }
                    }
                }
            }
            this.logger.log('Successfully processed webhook event');
            return { success: true, message: 'Webhook event processed' };
        }
        catch (error) {
            this.logger.error(`Failed to process webhook event: ${error.message}`);
            throw new Error(`Failed to process webhook event: ${error.message}`);
        }
    }
    async processMessageEvent(messageData) {
        try {
            const { messages, contacts, metadata } = messageData;
            if (messages && Array.isArray(messages) && messages.length > 0) {
                const message = messages[0];
                const contact = contacts && Array.isArray(contacts) && contacts.length > 0 ? contacts[0] : null;
                this.logger.log(`Processing message from ${contact?.profile?.name || message.from}`);
                this.logger.debug(`Received message: ${JSON.stringify(message)}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to process message event: ${error.message}`);
            throw error;
        }
    }
    verifyWebhook(verifyToken, challenge) {
        const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'default_verify_token';
        if (verifyToken === expectedToken) {
            this.logger.log('Webhook verification successful');
            return challenge;
        }
        else {
            this.logger.warn('Webhook verification failed');
            throw new Error('Verification failed');
        }
    }
};
exports.WhatsappBusinessService = WhatsappBusinessService;
exports.WhatsappBusinessService = WhatsappBusinessService = WhatsappBusinessService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], WhatsappBusinessService);
//# sourceMappingURL=whatsapp-business.service.js.map