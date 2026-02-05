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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatV2Service = void 0;
const common_1 = require("@nestjs/common");
const agent_base_1 = require("../../../common/agents/agent-base");
const redis_service_1 = require("../../../common/redis/redis.service");
const state_management_service_1 = require("../../../state/state-management.service");
const websocket_gateway_1 = require("../../../websocket/websocket.gateway");
let ChatV2Service = class ChatV2Service extends agent_base_1.AgentBase {
    constructor(redisService, stateManager, websocketGateway) {
        super('chat-v2', 'Process chat messages and generate appropriate responses with enhanced capabilities', ['chat_processing', 'response_generation', 'sentiment_analysis', 'conversation_management'], redisService, stateManager, websocketGateway);
    }
    async execute(payload) {
        const startTime = Date.now();
        try {
            if (!(await this.validate(payload))) {
                return this.handleError(new Error('Invalid payload'), 'execute.validate');
            }
            this.logActivity(payload.sessionId, 'Starting chat response generation', payload);
            if (this.websocketGateway) {
                this.websocketGateway.broadcastSystemNotification({
                    type: 'agent_processing',
                    agent: this.config.name,
                    sessionId: payload.sessionId,
                    message: 'Generating chat response',
                    timestamp: new Date().toISOString(),
                });
            }
            const result = await this.generateChatResponse(payload);
            const processingTime = Date.now() - startTime;
            this.updateMetrics({
                avgResponseTime: processingTime,
            });
            this.logActivity(payload.sessionId, 'Chat response generation completed', { processingTime, responseType: result.responseType });
            return this.formatResponse({
                response: result,
                responseId: result.responseId,
                text: result.response,
                responseType: result.responseType,
                sentiment: result.sentiment,
                suggestedActions: result.suggestedActions,
            });
        }
        catch (error) {
            return this.handleError(error, 'execute');
        }
    }
    async validate(payload) {
        if (!payload)
            return false;
        if (!payload.sessionId)
            return false;
        if (!payload.message)
            return false;
        return true;
    }
    async generateChatResponse(payload) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const message = payload.message.toLowerCase();
        let sentiment = 'neutral';
        if (message.includes('happy') || message.includes('great') || message.includes('good')) {
            sentiment = 'positive';
        }
        else if (message.includes('sad') || message.includes('bad') || message.includes('angry')) {
            sentiment = 'negative';
        }
        let responseType = 'informational';
        let response = 'I understand your request. How can I assist you further?';
        let suggestedActions = [];
        if (message.includes('help')) {
            responseType = 'help';
            response = 'I\'m here to help! What specific assistance do you need?';
            suggestedActions = ['Provide more details', 'Ask about features', 'Request demo'];
        }
        else if (message.includes('question') || message.includes('?')) {
            responseType = 'question';
            response = 'That\'s a great question. Let me provide you with the information you need.';
            suggestedActions = ['Clarify question', 'Provide examples', 'Offer related topics'];
        }
        else if (message.includes('thank')) {
            responseType = 'acknowledgement';
            response = 'You\'re welcome! Is there anything else I can help you with?';
            suggestedActions = ['Ask for feedback', 'Suggest next steps', 'End conversation'];
        }
        return {
            responseId: `response-${Date.now()}`,
            response,
            responseType,
            sentiment,
            suggestedActions,
        };
    }
    async getMetrics() {
        return {
            ...this.metrics,
        };
    }
};
exports.ChatV2Service = ChatV2Service;
exports.ChatV2Service = ChatV2Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService])
], ChatV2Service);
//# sourceMappingURL=chat-v2.service.js.map