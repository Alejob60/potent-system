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
var FacebookMessengerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacebookMessengerService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let FacebookMessengerService = FacebookMessengerService_1 = class FacebookMessengerService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(FacebookMessengerService_1.name);
        this.baseUrl = process.env.FACEBOOK_BASE_URL || 'https://graph.facebook.com/v17.0';
        this.pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '';
    }
    async sendTextMessage(recipientId, message) {
        try {
            const url = `${this.baseUrl}/me/messages`;
            const payload = {
                recipient: {
                    id: recipientId,
                },
                message: {
                    text: message,
                },
            };
            const params = {
                access_token: this.pageAccessToken,
            };
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, payload, { params }));
            this.logger.log(`Successfully sent message to user ${recipientId}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to send message to user ${recipientId}: ${error.message}`);
            throw new Error(`Failed to send Facebook Messenger message: ${error.message}`);
        }
    }
    async sendTemplateMessage(recipientId, templatePayload) {
        try {
            const url = `${this.baseUrl}/me/messages`;
            const payload = {
                recipient: {
                    id: recipientId,
                },
                message: templatePayload,
            };
            const params = {
                access_token: this.pageAccessToken,
            };
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, payload, { params }));
            this.logger.log(`Successfully sent template message to user ${recipientId}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to send template message to user ${recipientId}: ${error.message}`);
            throw new Error(`Failed to send Facebook Messenger template message: ${error.message}`);
        }
    }
    async sendQuickReplyMessage(recipientId, text, quickReplies) {
        try {
            const url = `${this.baseUrl}/me/messages`;
            const payload = {
                recipient: {
                    id: recipientId,
                },
                message: {
                    text: text,
                    quick_replies: quickReplies,
                },
            };
            const params = {
                access_token: this.pageAccessToken,
            };
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, payload, { params }));
            this.logger.log(`Successfully sent quick reply message to user ${recipientId}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to send quick reply message to user ${recipientId}: ${error.message}`);
            throw new Error(`Failed to send Facebook Messenger quick reply message: ${error.message}`);
        }
    }
    async handleWebhookEvent(payload) {
        try {
            if (payload.entry && Array.isArray(payload.entry)) {
                for (const entry of payload.entry) {
                    if (entry.messaging && Array.isArray(entry.messaging)) {
                        for (const message of entry.messaging) {
                            await this.processMessageEvent(message);
                        }
                    }
                }
            }
            this.logger.log('Successfully processed Facebook Messenger webhook event');
            return { success: true, message: 'Webhook event processed' };
        }
        catch (error) {
            this.logger.error(`Failed to process Facebook Messenger webhook event: ${error.message}`);
            throw new Error(`Failed to process Facebook Messenger webhook event: ${error.message}`);
        }
    }
    async processMessageEvent(messageData) {
        try {
            if (messageData.message) {
                const senderId = messageData.sender?.id;
                const message = messageData.message;
                this.logger.log(`Processing message from user ${senderId}`);
                this.logger.debug(`Received message: ${JSON.stringify(message)}`);
            }
            else if (messageData.delivery) {
                this.logger.log('Processing delivery confirmation');
            }
            else if (messageData.read) {
                this.logger.log('Processing read confirmation');
            }
            else if (messageData.postback) {
                this.logger.log('Processing postback event');
                await this.processPostbackEvent(messageData.postback);
            }
        }
        catch (error) {
            this.logger.error(`Failed to process message event: ${error.message}`);
            throw error;
        }
    }
    async processPostbackEvent(postbackData) {
        try {
            const payload = postbackData.payload;
            this.logger.log(`Processing postback with payload: ${payload}`);
            this.logger.debug(`Received postback: ${JSON.stringify(postbackData)}`);
        }
        catch (error) {
            this.logger.error(`Failed to process postback event: ${error.message}`);
            throw error;
        }
    }
    verifyWebhook(verifyToken, challenge) {
        const expectedToken = process.env.FACEBOOK_VERIFY_TOKEN || 'default_verify_token';
        if (verifyToken === expectedToken) {
            this.logger.log('Facebook Messenger webhook verification successful');
            return challenge;
        }
        else {
            this.logger.warn('Facebook Messenger webhook verification failed');
            throw new Error('Verification failed');
        }
    }
    async markSeen(recipientId) {
        try {
            const url = `${this.baseUrl}/me/messages`;
            const payload = {
                recipient: {
                    id: recipientId,
                },
                sender_action: 'MARK_SEEN',
            };
            const params = {
                access_token: this.pageAccessToken,
            };
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, payload, { params }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to mark message as seen for user ${recipientId}: ${error.message}`);
            throw new Error(`Failed to mark message as seen: ${error.message}`);
        }
    }
    async sendSenderAction(recipientId, action) {
        try {
            const url = `${this.baseUrl}/me/messages`;
            const payload = {
                recipient: {
                    id: recipientId,
                },
                sender_action: action,
            };
            const params = {
                access_token: this.pageAccessToken,
            };
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, payload, { params }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to send sender action ${action} for user ${recipientId}: ${error.message}`);
            throw new Error(`Failed to send sender action: ${error.message}`);
        }
    }
};
exports.FacebookMessengerService = FacebookMessengerService;
exports.FacebookMessengerService = FacebookMessengerService = FacebookMessengerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], FacebookMessengerService);
//# sourceMappingURL=facebook-messenger.service.js.map