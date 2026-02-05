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
var ColombiaTICAgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColombiaTICAgentService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
let ColombiaTICAgentService = ColombiaTICAgentService_1 = class ColombiaTICAgentService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(ColombiaTICAgentService_1.name);
        this.agents = new Map();
    }
    async createAgent(config) {
        try {
            const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            const agent = {
                id: agentId,
                config,
                createdAt: new Date(),
                updatedAt: new Date(),
                status: 'pending',
                clientId,
            };
            this.agents.set(agentId, agent);
            this.logger.log(`Created new ColombiaTIC agent: ${agentId}`);
            await this.configureWebhooks(agentId, config.connectChannels);
            agent.status = 'active';
            agent.updatedAt = new Date();
            this.agents.set(agentId, agent);
            return agent;
        }
        catch (error) {
            this.logger.error('Failed to create ColombiaTIC agent:', error.message);
            throw error;
        }
    }
    getAgent(id) {
        return this.agents.get(id) || null;
    }
    async updateAgent(id, config) {
        const agent = this.agents.get(id);
        if (!agent) {
            throw new Error('Agent not found');
        }
        agent.config = { ...agent.config, ...config };
        agent.updatedAt = new Date();
        this.agents.set(id, agent);
        if (config.connectChannels) {
            await this.configureWebhooks(id, config.connectChannels);
        }
        this.logger.log(`Updated ColombiaTIC agent: ${id}`);
        return agent;
    }
    async configureWebhooks(agentId, channels) {
        for (const channel of channels) {
            try {
                switch (channel) {
                    case 'facebook':
                        await this.configureFacebookWebhook(agentId);
                        break;
                    case 'whatsapp':
                        await this.configureWhatsAppWebhook(agentId);
                        break;
                    case 'google-ads':
                        await this.configureGoogleAdsWebhook(agentId);
                        break;
                    default:
                        this.logger.warn(`Unsupported channel for webhook configuration: ${channel}`);
                }
            }
            catch (error) {
                this.logger.error(`Failed to configure webhook for ${channel}:`, error.message);
            }
        }
    }
    async configureFacebookWebhook(agentId) {
        this.logger.log(`Configured Facebook webhook for agent: ${agentId}`);
    }
    async configureWhatsAppWebhook(agentId) {
        this.logger.log(`Configured WhatsApp webhook for agent: ${agentId}`);
    }
    async configureGoogleAdsWebhook(agentId) {
        this.logger.log(`Configured Google Ads webhook for agent: ${agentId}`);
    }
    getWebhookConfiguration(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error('Agent not found');
        }
        return {
            agentId,
            channels: agent.config.connectChannels,
            endpoints: agent.config.connectChannels.map(channel => {
                switch (channel) {
                    case 'facebook':
                        return {
                            channel,
                            endpoint: `/meta/facebook/webhook`,
                            verificationToken: `fb_verify_${agentId}`,
                        };
                    case 'whatsapp':
                        return {
                            channel,
                            endpoint: `/meta/whatsapp/webhook`,
                            verificationToken: `wa_verify_${agentId}`,
                        };
                    case 'google-ads':
                        return {
                            channel,
                            endpoint: `/google/ads/webhook`,
                            verificationToken: `ga_verify_${agentId}`,
                        };
                    default:
                        return {
                            channel,
                            endpoint: `/webhook/${channel}`,
                            verificationToken: `verify_${agentId}_${channel}`,
                        };
                }
            }),
        };
    }
    generateChatWidgetScript(clientId) {
        return `<script src="https://cdn.colombiatic.ai/widget.js" data-client="${clientId}" async></script>`;
    }
};
exports.ColombiaTICAgentService = ColombiaTICAgentService;
exports.ColombiaTICAgentService = ColombiaTICAgentService = ColombiaTICAgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], ColombiaTICAgentService);
//# sourceMappingURL=colombiatic-agent.service.js.map