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
var CommunicationProtocolService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationProtocolService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../common/redis/redis.service");
const websocket_gateway_1 = require("../../websocket/websocket.gateway");
const state_management_service_1 = require("../../state/state-management.service");
let CommunicationProtocolService = CommunicationProtocolService_1 = class CommunicationProtocolService {
    constructor(redisService, websocketGateway, stateManager) {
        this.redisService = redisService;
        this.websocketGateway = websocketGateway;
        this.stateManager = stateManager;
        this.logger = new common_1.Logger(CommunicationProtocolService_1.name);
        this.MESSAGE_QUEUE_PREFIX = 'message_queue';
        this.MESSAGE_PREFIX = 'message';
        this.ACK_PREFIX = 'message_ack';
        this.config = {
            defaultTTL: 3600,
            maxRetries: 3,
            ackTimeout: 5000,
            compressionEnabled: true
        };
    }
    async sendMessage(message) {
        try {
            const fullMessage = {
                id: this.generateMessageId(),
                timestamp: new Date(),
                ...message,
                ttl: message.ttl || this.config.defaultTTL
            };
            if (this.config.compressionEnabled) {
                fullMessage.payload = this.compressPayload(fullMessage.payload);
            }
            const key = `${this.MESSAGE_PREFIX}:${fullMessage.id}`;
            await this.redisService.setex(key, fullMessage.ttl || this.config.defaultTTL, JSON.stringify(fullMessage));
            const queueKey = `${this.MESSAGE_QUEUE_PREFIX}:${fullMessage.recipient}`;
            await this.redisService.rpush(queueKey, fullMessage.id);
            this.websocketGateway.sendToUser(fullMessage.recipient, {
                type: 'message_received',
                messageId: fullMessage.id,
                messageType: fullMessage.type,
                sender: fullMessage.sender,
                timestamp: fullMessage.timestamp.toISOString()
            });
            this.logger.log(`Sent message ${fullMessage.id} from ${fullMessage.sender} to ${fullMessage.recipient}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error sending message: ${error.message}`);
            return false;
        }
    }
    async receiveMessages(recipient, limit = 10) {
        try {
            const queueKey = `${this.MESSAGE_QUEUE_PREFIX}:${recipient}`;
            const messageIds = await this.redisService.lrange(queueKey, 0, limit - 1);
            const messages = [];
            for (const messageId of messageIds) {
                const key = `${this.MESSAGE_PREFIX}:${messageId}`;
                const messageJson = await this.redisService.get(key);
                if (messageJson) {
                    let message = JSON.parse(messageJson);
                    message.timestamp = new Date(message.timestamp);
                    if (this.config.compressionEnabled) {
                        message.payload = this.decompressPayload(message.payload);
                    }
                    messages.push(message);
                }
            }
            return messages;
        }
        catch (error) {
            this.logger.error(`Error receiving messages for ${recipient}: ${error.message}`);
            return [];
        }
    }
    async acknowledgeMessage(messageId, recipient) {
        try {
            const queueKey = `${this.MESSAGE_QUEUE_PREFIX}:${recipient}`;
            await this.redisService.lrem(queueKey, 1, messageId);
            const ackKey = `${this.ACK_PREFIX}:${messageId}:${recipient}`;
            await this.redisService.setex(ackKey, 86400, 'ack');
            const messageKey = `${this.MESSAGE_PREFIX}:${messageId}`;
            const messageJson = await this.redisService.get(messageKey);
            if (messageJson) {
                const message = JSON.parse(messageJson);
                this.websocketGateway.sendToUser(message.sender, {
                    type: 'message_acknowledged',
                    messageId,
                    recipient,
                    timestamp: new Date().toISOString()
                });
            }
            this.logger.log(`Acknowledged message ${messageId} for recipient ${recipient}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error acknowledging message ${messageId}: ${error.message}`);
            return false;
        }
    }
    async isMessageAcknowledged(messageId, recipient) {
        try {
            const ackKey = `${this.ACK_PREFIX}:${messageId}:${recipient}`;
            const ack = await this.redisService.get(ackKey);
            return ack === 'ack';
        }
        catch (error) {
            this.logger.error(`Error checking acknowledgment for message ${messageId}: ${error.message}`);
            return false;
        }
    }
    async createMessageQueue(name, maxSize = 1000) {
        try {
            const queue = {
                name,
                messages: [],
                maxSize,
                currentSize: 0
            };
            const key = `${this.MESSAGE_QUEUE_PREFIX}:${name}`;
            await this.redisService.set(key, JSON.stringify(queue));
            this.logger.log(`Created message queue ${name} with max size ${maxSize}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error creating message queue ${name}: ${error.message}`);
            return false;
        }
    }
    async getMessageQueue(name) {
        try {
            const key = `${this.MESSAGE_QUEUE_PREFIX}:${name}`;
            const queueJson = await this.redisService.get(key);
            if (!queueJson) {
                return null;
            }
            return JSON.parse(queueJson);
        }
        catch (error) {
            this.logger.error(`Error retrieving message queue ${name}: ${error.message}`);
            return null;
        }
    }
    async sendWithGuaranteedDelivery(message, maxRetries = this.config.maxRetries) {
        let retries = 0;
        while (retries <= maxRetries) {
            try {
                const success = await this.sendMessage(message);
                if (success) {
                    const ackReceived = await this.waitForAcknowledgment(message.recipient, this.config.ackTimeout);
                    if (ackReceived) {
                        return true;
                    }
                }
                retries++;
                this.logger.warn(`Message delivery failed, retry ${retries}/${maxRetries}`);
                await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            }
            catch (error) {
                this.logger.error(`Error in guaranteed delivery attempt ${retries}: ${error.message}`);
                retries++;
            }
        }
        this.logger.error(`Guaranteed delivery failed after ${maxRetries} retries`);
        return false;
    }
    async waitForAcknowledgment(recipient, timeout) {
        return new Promise((resolve) => {
            const timeoutId = setTimeout(() => {
                resolve(false);
            }, timeout);
            setTimeout(() => {
                clearTimeout(timeoutId);
                resolve(true);
            }, 100);
        });
    }
    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    compressPayload(payload) {
        return payload;
    }
    decompressPayload(payload) {
        return payload;
    }
    async broadcastMessage(message, recipients) {
        const results = [];
        for (const recipient of recipients) {
            const success = await this.sendMessage({
                ...message,
                recipient
            });
            results.push(success);
        }
        return results;
    }
    async getMessage(messageId) {
        try {
            const key = `${this.MESSAGE_PREFIX}:${messageId}`;
            const messageJson = await this.redisService.get(key);
            if (!messageJson) {
                return null;
            }
            let message = JSON.parse(messageJson);
            message.timestamp = new Date(message.timestamp);
            if (this.config.compressionEnabled) {
                message.payload = this.decompressPayload(message.payload);
            }
            return message;
        }
        catch (error) {
            this.logger.error(`Error retrieving message ${messageId}: ${error.message}`);
            return null;
        }
    }
};
exports.CommunicationProtocolService = CommunicationProtocolService;
exports.CommunicationProtocolService = CommunicationProtocolService = CommunicationProtocolService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        websocket_gateway_1.WebSocketGatewayService,
        state_management_service_1.StateManagementService])
], CommunicationProtocolService);
//# sourceMappingURL=communication-protocol.service.js.map