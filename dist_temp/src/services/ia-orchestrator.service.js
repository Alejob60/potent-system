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
var IAOrchestratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IAOrchestratorService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let IAOrchestratorService = IAOrchestratorService_1 = class IAOrchestratorService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(IAOrchestratorService_1.name);
        this.chatHistory = new Map();
        this.config = {
            baseUrl: process.env.MISYBOT_ORCHESTRATOR_URL || 'https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net',
            apiKey: process.env.MISYBOT_ORCHESTRATOR_API_KEY,
            clientId: process.env.MISYBOT_ORCHESTRATOR_CLIENT_ID,
        };
    }
    async processMessage(message, sessionId, channelId, channelType) {
        try {
            this.logger.log(`Processing message for session ${sessionId}: ${message}`);
            const chatMessages = this.chatHistory.get(sessionId) || [];
            const userMessage = {
                id: `msg_${Date.now()}`,
                content: message,
                sender: 'user',
                timestamp: new Date(),
                channelId,
                channelType,
            };
            chatMessages.push(userMessage);
            this.chatHistory.set(sessionId, chatMessages);
            const payload = {
                message,
                sessionId,
                context: {
                    channelId,
                    channelType,
                    history: chatMessages.slice(-10),
                },
            };
            const headers = {
                'Content-Type': 'application/json',
            };
            if (this.config.apiKey) {
                headers['Authorization'] = `Bearer ${this.config.apiKey}`;
            }
            if (this.config.clientId) {
                headers['X-Client-ID'] = this.config.clientId;
            }
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.config.baseUrl}/api/orchestrator/process`, payload, { headers }));
            const agentResponse = {
                id: `resp_${Date.now()}`,
                response: response.data.response || response.data.message || 'No response from orchestrator',
                agentId: response.data.agentId || 'unknown',
                confidence: response.data.confidence || 0.8,
                timestamp: new Date(),
                suggestedActions: response.data.suggestedActions,
            };
            chatMessages.push({
                id: agentResponse.id,
                content: agentResponse.response,
                sender: 'agent',
                timestamp: agentResponse.timestamp,
                channelId,
                channelType,
            });
            this.chatHistory.set(sessionId, chatMessages);
            this.logger.log(`Processed message for session ${sessionId} with agent ${agentResponse.agentId}`);
            return agentResponse;
        }
        catch (error) {
            this.logger.error(`Failed to process message for session ${sessionId}:`, error.message);
            return {
                id: `error_${Date.now()}`,
                response: 'Lo siento, estoy teniendo dificultades para procesar tu solicitud en este momento. Por favor intenta de nuevo.',
                agentId: 'error-handler',
                confidence: 0.1,
                timestamp: new Date(),
            };
        }
    }
    getChatHistory(sessionId) {
        return this.chatHistory.get(sessionId) || [];
    }
    clearChatHistory(sessionId) {
        this.chatHistory.delete(sessionId);
    }
    async getAnalytics(sessionId) {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            if (this.config.apiKey) {
                headers['Authorization'] = `Bearer ${this.config.apiKey}`;
            }
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.config.baseUrl}/api/analytics/${sessionId}`, { headers }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to get analytics for session ${sessionId}:`, error.message);
            throw error;
        }
    }
    async sendFeedback(sessionId, messageId, feedback, comment) {
        try {
            const payload = {
                sessionId,
                messageId,
                feedback,
                comment,
            };
            const headers = {
                'Content-Type': 'application/json',
            };
            if (this.config.apiKey) {
                headers['Authorization'] = `Bearer ${this.config.apiKey}`;
            }
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.config.baseUrl}/api/feedback`, payload, { headers }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to send feedback for session ${sessionId}:`, error.message);
            throw error;
        }
    }
};
exports.IAOrchestratorService = IAOrchestratorService;
exports.IAOrchestratorService = IAOrchestratorService = IAOrchestratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], IAOrchestratorService);
//# sourceMappingURL=ia-orchestrator.service.js.map