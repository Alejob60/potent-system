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
var ColombiaTICOrchestratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColombiaTICOrchestratorService = void 0;
const common_1 = require("@nestjs/common");
const colombiatic_agent_service_1 = require("./colombiatic-agent.service");
const webhook_service_1 = require("./webhook.service");
const ia_orchestrator_service_1 = require("./ia-orchestrator.service");
let ColombiaTICOrchestratorService = ColombiaTICOrchestratorService_1 = class ColombiaTICOrchestratorService {
    constructor(agentService, webhookService, iaOrchestrator) {
        this.agentService = agentService;
        this.webhookService = webhookService;
        this.iaOrchestrator = iaOrchestrator;
        this.logger = new common_1.Logger(ColombiaTICOrchestratorService_1.name);
        this.webhookEvents = [];
        this.channelMessages = [];
    }
    async processWebhookEvent(channel, eventType, payload, agentId) {
        try {
            this.logger.log(`Processing webhook event from ${channel}: ${eventType}`);
            const webhookEvent = {
                id: `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                agentId: agentId || 'unknown',
                channel,
                eventType,
                payload,
                processed: false,
                timestamp: new Date(),
            };
            this.webhookEvents.push(webhookEvent);
            let response;
            switch (channel) {
                case 'facebook':
                    response = await this.processFacebookEvent(eventType, payload, agentId);
                    break;
                case 'whatsapp':
                    response = await this.processWhatsAppEvent(eventType, payload, agentId);
                    break;
                case 'google-ads':
                    response = await this.processGoogleAdsEvent(eventType, payload, agentId);
                    break;
                default:
                    response = await this.processGenericEvent(eventType, payload, agentId);
            }
            webhookEvent.processed = true;
            webhookEvent.response = response;
            return {
                success: true,
                eventId: webhookEvent.id,
                response,
            };
        }
        catch (error) {
            this.logger.error(`Failed to process webhook event from ${channel}:`, error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async processFacebookEvent(eventType, payload, agentId) {
        try {
            if (eventType === 'message' && payload.entry) {
                for (const entry of payload.entry) {
                    if (entry.messaging) {
                        for (const messageEvent of entry.messaging) {
                            if (messageEvent.message && messageEvent.message.text) {
                                const sessionId = `fb_${entry.id}_${messageEvent.sender?.id || 'unknown'}`;
                                const response = await this.iaOrchestrator.processMessage(messageEvent.message.text, sessionId, entry.id, 'facebook');
                                const channelMessage = {
                                    id: `msg_${Date.now()}`,
                                    agentId: agentId || 'unknown',
                                    channel: 'facebook',
                                    content: messageEvent.message.text,
                                    sender: 'user',
                                    timestamp: new Date(),
                                    processed: true,
                                    response,
                                };
                                this.channelMessages.push(channelMessage);
                                return response;
                            }
                        }
                    }
                }
            }
            this.logger.log(`Processed Facebook ${eventType} event`);
            return { message: `Facebook ${eventType} event processed` };
        }
        catch (error) {
            this.logger.error('Failed to process Facebook event:', error.message);
            throw error;
        }
    }
    async processWhatsAppEvent(eventType, payload, agentId) {
        try {
            if (payload.messages) {
                for (const message of payload.messages) {
                    if (message.text && message.text.body) {
                        const sessionId = `wa_${payload.contacts?.[0]?.wa_id || 'unknown'}_${message.from}`;
                        const response = await this.iaOrchestrator.processMessage(message.text.body, sessionId, payload.contacts?.[0]?.wa_id, 'whatsapp');
                        const channelMessage = {
                            id: `msg_${Date.now()}`,
                            agentId: agentId || 'unknown',
                            channel: 'whatsapp',
                            content: message.text.body,
                            sender: 'user',
                            timestamp: new Date(),
                            processed: true,
                            response,
                        };
                        this.channelMessages.push(channelMessage);
                        return response;
                    }
                }
            }
            this.logger.log(`Processed WhatsApp ${eventType} event`);
            return { message: `WhatsApp ${eventType} event processed` };
        }
        catch (error) {
            this.logger.error('Failed to process WhatsApp event:', error.message);
            throw error;
        }
    }
    async processGoogleAdsEvent(eventType, payload, agentId) {
        try {
            this.logger.log(`Processed Google Ads ${eventType} event`);
            const channelMessage = {
                id: `msg_${Date.now()}`,
                agentId: agentId || 'unknown',
                channel: 'google-ads',
                content: JSON.stringify(payload),
                sender: 'system',
                timestamp: new Date(),
                processed: true,
            };
            this.channelMessages.push(channelMessage);
            return { message: `Google Ads ${eventType} event processed` };
        }
        catch (error) {
            this.logger.error('Failed to process Google Ads event:', error.message);
            throw error;
        }
    }
    async processGenericEvent(eventType, payload, agentId) {
        try {
            this.logger.log(`Processed generic ${eventType} event`);
            const channelMessage = {
                id: `msg_${Date.now()}`,
                agentId: agentId || 'unknown',
                channel: 'generic',
                content: JSON.stringify(payload),
                sender: 'system',
                timestamp: new Date(),
                processed: true,
            };
            this.channelMessages.push(channelMessage);
            return { message: `Generic ${eventType} event processed` };
        }
        catch (error) {
            this.logger.error('Failed to process generic event:', error.message);
            throw error;
        }
    }
    getRecentWebhookEvents(limit = 50) {
        return this.webhookEvents.slice(-limit);
    }
    getWebhookEventsByChannel(channel, limit = 50) {
        const filteredEvents = this.webhookEvents.filter(event => event.channel === channel);
        return filteredEvents.slice(-limit);
    }
    getRecentChannelMessages(limit = 50) {
        return this.channelMessages.slice(-limit);
    }
    getChannelMessagesByChannel(channel, limit = 50) {
        const filteredMessages = this.channelMessages.filter(msg => msg.channel === channel);
        return filteredMessages.slice(-limit);
    }
    getChannelMessagesByAgent(agentId, limit = 50) {
        const filteredMessages = this.channelMessages.filter(msg => msg.agentId === agentId);
        return filteredMessages.slice(-limit);
    }
};
exports.ColombiaTICOrchestratorService = ColombiaTICOrchestratorService;
exports.ColombiaTICOrchestratorService = ColombiaTICOrchestratorService = ColombiaTICOrchestratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [colombiatic_agent_service_1.ColombiaTICAgentService,
        webhook_service_1.WebhookService,
        ia_orchestrator_service_1.IAOrchestratorService])
], ColombiaTICOrchestratorService);
//# sourceMappingURL=colombiatic-orchestrator.service.js.map