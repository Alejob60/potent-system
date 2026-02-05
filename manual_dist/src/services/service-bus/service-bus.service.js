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
var ServiceBusService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceBusService = void 0;
const common_1 = require("@nestjs/common");
const service_bus_1 = require("@azure/service-bus");
let ServiceBusService = ServiceBusService_1 = class ServiceBusService {
    constructor() {
        this.logger = new common_1.Logger(ServiceBusService_1.name);
        const connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
        this.queueName = process.env.SERVICE_BUS_QUEUE_NAME || 'default-queue';
        if (!connectionString) {
            throw new Error('Azure Service Bus connection string is not configured');
        }
        this.client = new service_bus_1.ServiceBusClient(connectionString);
    }
    async sendMessage(messagePayload) {
        let sender;
        try {
            sender = this.client.createSender(this.queueName);
            const message = {
                body: messagePayload,
                contentType: 'application/json',
                correlationId: messagePayload.correlationId || messagePayload.id,
                messageId: messagePayload.id,
                applicationProperties: {
                    type: messagePayload.type,
                    timestamp: messagePayload.timestamp.toISOString(),
                }
            };
            await sender.sendMessages(message);
            this.logger.log(`Sent message ${messagePayload.id} of type ${messagePayload.type} to service bus`);
        }
        catch (error) {
            this.logger.error(`Failed to send message ${messagePayload.id}:`, error);
            throw error;
        }
        finally {
            if (sender) {
                await sender.close();
            }
        }
    }
    async receiveMessages(handler, maxMessages = 10) {
        let receiver;
        try {
            receiver = this.client.createReceiver(this.queueName, 'peekLock');
            const messages = await receiver.receiveMessages(maxMessages, {
                maxWaitTimeInMs: 5000
            });
            for (const message of messages) {
                try {
                    const payload = message.body;
                    if (!this.validateMessageSchema(payload)) {
                        this.logger.warn(`Invalid message schema for message ${message.messageId}`);
                        await receiver.deadLetterMessage(message, {
                            deadLetterReason: 'InvalidSchema',
                            deadLetterErrorDescription: 'Message does not conform to expected schema'
                        });
                        continue;
                    }
                    await handler(payload);
                    await receiver.completeMessage(message);
                    this.logger.log(`Processed message ${message.messageId} successfully`);
                }
                catch (error) {
                    this.logger.error(`Error processing message ${message.messageId}:`, error);
                    await receiver.deadLetterMessage(message, {
                        deadLetterReason: 'ProcessingError',
                        deadLetterErrorDescription: error.message
                    });
                }
            }
        }
        catch (error) {
            this.logger.error('Error receiving messages:', error);
            throw error;
        }
        finally {
            if (receiver) {
                await receiver.close();
            }
        }
    }
    validateMessageSchema(message) {
        if (!message.id || !message.type || !message.payload || !message.timestamp) {
            return false;
        }
        if (isNaN(new Date(message.timestamp).getTime())) {
            return false;
        }
        return true;
    }
    async close() {
        await this.client.close();
        this.logger.log('Service bus client closed');
    }
};
exports.ServiceBusService = ServiceBusService;
exports.ServiceBusService = ServiceBusService = ServiceBusService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ServiceBusService);
//# sourceMappingURL=service-bus.service.js.map