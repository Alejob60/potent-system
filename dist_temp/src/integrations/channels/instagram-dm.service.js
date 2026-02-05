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
var InstagramDmService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramDmService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let InstagramDmService = InstagramDmService_1 = class InstagramDmService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(InstagramDmService_1.name);
        this.baseUrl = process.env.INSTAGRAM_BASE_URL || 'https://graph.facebook.com/v17.0';
        this.accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || '';
        this.instagramBusinessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || '';
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
            const headers = {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
            };
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, payload, { headers }));
            this.logger.log(`Successfully sent DM to user ${recipientId}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to send DM to user ${recipientId}: ${error.message}`);
            throw new Error(`Failed to send Instagram DM: ${error.message}`);
        }
    }
    async sendMediaMessage(recipientId, mediaType, mediaUrl, caption) {
        try {
            const url = `${this.baseUrl}/me/messages`;
            const payload = {
                recipient: {
                    id: recipientId,
                },
                message: {
                    attachment: {
                        type: mediaType,
                        payload: {
                            url: mediaUrl,
                            is_reusable: true,
                        },
                    },
                },
            };
            if (caption) {
                payload.message.attachment.payload['caption'] = caption;
            }
            const headers = {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
            };
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, payload, { headers }));
            this.logger.log(`Successfully sent media DM to user ${recipientId}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to send media DM to user ${recipientId}: ${error.message}`);
            throw new Error(`Failed to send Instagram media DM: ${error.message}`);
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
            this.logger.log('Successfully processed Instagram webhook event');
            return { success: true, message: 'Webhook event processed' };
        }
        catch (error) {
            this.logger.error(`Failed to process Instagram webhook event: ${error.message}`);
            throw new Error(`Failed to process Instagram webhook event: ${error.message}`);
        }
    }
    async processMessageEvent(messageData) {
        try {
            if (messageData.message) {
                const senderId = messageData.sender?.id;
                const message = messageData.message;
                this.logger.log(`Processing DM from user ${senderId}`);
                this.logger.debug(`Received DM: ${JSON.stringify(message)}`);
            }
            else if (messageData.delivery) {
                this.logger.log('Processing delivery confirmation');
            }
            else if (messageData.read) {
                this.logger.log('Processing read confirmation');
            }
        }
        catch (error) {
            this.logger.error(`Failed to process message event: ${error.message}`);
            throw error;
        }
    }
    verifyWebhook(verifyToken, challenge) {
        const expectedToken = process.env.INSTAGRAM_VERIFY_TOKEN || 'default_verify_token';
        if (verifyToken === expectedToken) {
            this.logger.log('Instagram webhook verification successful');
            return challenge;
        }
        else {
            this.logger.warn('Instagram webhook verification failed');
            throw new Error('Verification failed');
        }
    }
    async getUserProfile(userId) {
        try {
            const url = `${this.baseUrl}/${userId}`;
            const params = {
                access_token: this.accessToken,
                fields: 'id,name,profile_pic',
            };
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { params }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to get user profile for ${userId}: ${error.message}`);
            throw new Error(`Failed to get user profile: ${error.message}`);
        }
    }
};
exports.InstagramDmService = InstagramDmService;
exports.InstagramDmService = InstagramDmService = InstagramDmService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], InstagramDmService);
//# sourceMappingURL=instagram-dm.service.js.map