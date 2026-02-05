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
var ServiceBusPublisherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceBusPublisherService = void 0;
const common_1 = require("@nestjs/common");
const service_bus_1 = require("@azure/service-bus");
let ServiceBusPublisherService = ServiceBusPublisherService_1 = class ServiceBusPublisherService {
    constructor() {
        this.logger = new common_1.Logger(ServiceBusPublisherService_1.name);
        this.maxRetries = 3;
        this.retryDelay = 1000;
        const connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
        this.topicName = process.env.SERVICE_BUS_TOPIC_ACTIONS || 'meta-agent-actions';
        if (!connectionString) {
            this.logger.warn('Azure Service Bus connection string not configured');
            return;
        }
        try {
            this.serviceBusClient = new service_bus_1.ServiceBusClient(connectionString);
            this.logger.log('Service Bus client initialized');
        }
        catch (error) {
            this.logger.error('Failed to initialize Service Bus client:', error);
        }
    }
    async onModuleInit() {
        if (this.serviceBusClient) {
            try {
                this.sender = this.serviceBusClient.createSender(this.topicName);
                this.logger.log(`Service Bus sender created for topic: ${this.topicName}`);
            }
            catch (error) {
                this.logger.error('Failed to create Service Bus sender:', error);
            }
        }
    }
    async onModuleDestroy() {
        try {
            if (this.sender) {
                await this.sender.close();
                this.logger.log('Service Bus sender closed');
            }
            if (this.serviceBusClient) {
                await this.serviceBusClient.close();
                this.logger.log('Service Bus client closed');
            }
        }
        catch (error) {
            this.logger.error('Error closing Service Bus connections:', error);
        }
    }
    async publishAction(action) {
        if (!this.sender) {
            this.logger.warn('Service Bus sender not available, action not published');
            return 'skipped';
        }
        const messageId = this.generateMessageId();
        this.logger.debug(`Publishing action to Service Bus - Type: ${action.type}, Correlation: ${action.correlationId}`);
        try {
            await this.sendWithRetry({
                body: action,
                messageId,
                correlationId: action.correlationId,
                subject: action.type,
                applicationProperties: {
                    tenantId: action.tenantId,
                    sessionId: action.sessionId,
                    actionType: action.type,
                    target: action.target || 'default',
                    timestamp: new Date().toISOString()
                }
            });
            this.logger.log(`Action published successfully - Message ID: ${messageId}, Type: ${action.type}`);
            return messageId;
        }
        catch (error) {
            this.logger.error(`Failed to publish action after ${this.maxRetries} retries: ${error.message}`, error.stack);
            throw error;
        }
    }
    async publishActions(actions) {
        if (actions.length === 0) {
            return [];
        }
        if (!this.sender) {
            this.logger.warn('Service Bus sender not available, actions not published');
            return new Array(actions.length).fill('skipped');
        }
        this.logger.debug(`Publishing batch of ${actions.length} actions`);
        const messageIds = [];
        const messages = actions.map(action => {
            const messageId = this.generateMessageId();
            messageIds.push(messageId);
            return {
                body: action,
                messageId,
                correlationId: action.correlationId,
                subject: action.type,
                applicationProperties: {
                    tenantId: action.tenantId,
                    sessionId: action.sessionId,
                    actionType: action.type,
                    target: action.target || 'default',
                    timestamp: new Date().toISOString()
                }
            };
        });
        try {
            await this.sendBatchWithRetry(messages);
            this.logger.log(`Batch of ${actions.length} actions published successfully`);
            return messageIds;
        }
        catch (error) {
            this.logger.error(`Failed to publish action batch: ${error.message}`, error.stack);
            throw error;
        }
    }
    async sendWithRetry(message, retryCount = 0) {
        try {
            await this.sender.sendMessages(message);
        }
        catch (error) {
            if (retryCount >= this.maxRetries) {
                throw error;
            }
            if (this.isRetriableError(error)) {
                const delay = this.retryDelay * Math.pow(2, retryCount);
                this.logger.warn(`Send failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})...`);
                await this.sleep(delay);
                return this.sendWithRetry(message, retryCount + 1);
            }
            throw error;
        }
    }
    async sendBatchWithRetry(messages, retryCount = 0) {
        try {
            await this.sender.sendMessages(messages);
        }
        catch (error) {
            if (retryCount >= this.maxRetries) {
                throw error;
            }
            if (this.isRetriableError(error)) {
                const delay = this.retryDelay * Math.pow(2, retryCount);
                this.logger.warn(`Batch send failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})...`);
                await this.sleep(delay);
                return this.sendBatchWithRetry(messages, retryCount + 1);
            }
            throw error;
        }
    }
    isRetriableError(error) {
        const retriableErrors = [
            'ServerBusyError',
            'ServiceUnavailableError',
            'TimeoutError'
        ];
        return retriableErrors.some(errorType => error.constructor.name === errorType || error.code === errorType);
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
    async healthCheck() {
        if (!this.sender) {
            return {
                status: 'unhealthy',
                message: 'Service Bus sender not initialized'
            };
        }
        try {
            return {
                status: 'healthy'
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                message: error.message
            };
        }
    }
};
exports.ServiceBusPublisherService = ServiceBusPublisherService;
exports.ServiceBusPublisherService = ServiceBusPublisherService = ServiceBusPublisherService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ServiceBusPublisherService);
//# sourceMappingURL=service-bus-publisher.service.js.map