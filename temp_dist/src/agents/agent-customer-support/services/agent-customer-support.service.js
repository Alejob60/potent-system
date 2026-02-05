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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentCustomerSupportService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_customer_support_entity_1 = require("../entities/agent-customer-support.entity");
const agent_base_1 = require("../../../common/agents/agent-base");
const redis_service_1 = require("../../../common/redis/redis.service");
const state_management_service_1 = require("../../../state/state-management.service");
const websocket_gateway_1 = require("../../../websocket/websocket.gateway");
let AgentCustomerSupportService = class AgentCustomerSupportService extends agent_base_1.AgentBase {
    constructor(repo, redisService, stateManager, websocketGateway) {
        super('customer-support', 'Provide customer support with FAQ integration and ticket management', ['customer_support', 'faq_integration', 'ticket_management', 'knowledge_base'], redisService, stateManager, websocketGateway);
        this.repo = repo;
    }
    async execute(payload) {
        const startTime = Date.now();
        try {
            if (!(await this.validate(payload))) {
                return this.handleError(new Error('Invalid payload'), 'execute.validate');
            }
            this.logActivity(payload.sessionId || 'unknown', 'Starting customer support response generation', payload);
            if (this.websocketGateway) {
                this.websocketGateway.broadcastSystemNotification({
                    type: 'agent_processing',
                    agent: this.config.name,
                    sessionId: payload.sessionId || 'unknown',
                    message: 'Generating customer support response',
                    timestamp: new Date().toISOString(),
                });
            }
            const result = await this.generateSupportResponse(payload);
            const savedResult = await this.saveToDatabase(payload, result);
            const processingTime = Date.now() - startTime;
            this.updateMetrics({
                avgResponseTime: processingTime,
            });
            this.logActivity(payload.sessionId || 'unknown', 'Customer support response generation completed', { processingTime, category: result.category, priority: result.priority });
            return this.formatResponse({
                support: savedResult,
                response: result.response,
                category: result.category,
                priority: result.priority,
                suggestedArticles: result.suggestedArticles,
                confidenceScore: result.confidenceScore,
                escalationRequired: result.escalationRequired,
            });
        }
        catch (error) {
            return this.handleError(error, 'execute');
        }
    }
    async validate(payload) {
        if (!payload)
            return false;
        if (!payload.customerQuery)
            return false;
        return true;
    }
    async generateSupportResponse(payload) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const categories = {
            'account': ['account', 'login', 'password', 'signin', 'signup', 'profile'],
            'billing': ['billing', 'payment', 'charge', 'invoice', 'subscription', 'refund'],
            'technical': ['error', 'bug', 'crash', 'not working', 'broken', 'issue'],
            'feature': ['feature', 'request', 'suggestion', 'enhancement'],
            'general': ['help', 'support', 'question', 'how to']
        };
        let category = 'general';
        const query = payload.customerQuery.toLowerCase();
        for (const [cat, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => query.includes(keyword))) {
                category = cat;
                break;
            }
        }
        const priorityKeywords = {
            'high': ['urgent', 'emergency', 'immediately', 'critical', 'broken', 'down'],
            'medium': ['soon', 'asap', 'quick', 'fast'],
            'low': ['later', 'eventually', 'whenever']
        };
        let priority = 'medium';
        for (const [pri, keywords] of Object.entries(priorityKeywords)) {
            if (keywords.some(keyword => query.includes(keyword))) {
                priority = pri;
                break;
            }
        }
        const responses = {
            'account': `I understand you're having an issue with your account. To help you better, I'll need some additional information:

1. What exactly is happening when you try to access your account?
2. Have you tried resetting your password?
3. Are you seeing any specific error messages?

In the meantime, you can try these troubleshooting steps:
- Clear your browser cache and cookies
- Try accessing from a different browser
- Ensure your password meets our security requirements`,
            'billing': `I see you have a billing question. Here's what I can help with:\n\n- Checking your current subscription status\n- Explaining recent charges\n- Processing refunds for eligible items\n- Updating payment methods\n\nTo assist you better, could you please provide:\n1. Your account email\n2. The date of the charge in question\n3. Any error messages you've received\n\nFor immediate billing assistance, you can also contact our billing team at billing@company.com`,
            'technical': `I understand you're experiencing a technical issue. Let's get this resolved for you:

First, let's try some basic troubleshooting:
1. Refresh the page or restart the application
2. Check your internet connection
3. Clear your browser cache
4. Try a different browser

If the issue persists, please provide:
- Screenshots of any error messages
- Steps to reproduce the issue
- Your device and browser information

Our technical team will review your case and respond within 24 hours.`,
            'feature': `Thank you for your feature suggestion! We're always looking to improve our product.\n\nTo help our development team understand your request:\n1. What problem would this feature solve?\n2. How would you use this feature?\n3. Are there any similar features in other products you like?\n\nWe review all feature requests and prioritize them based on customer demand. You'll receive an update on your request within 5 business days.`,
            'general': `Thank you for reaching out to our support team. I'm here to help with your question.\n\nTo provide the most accurate assistance:\n1. Please describe the issue in detail\n2. Let me know what you were trying to accomplish\n3. Include any relevant screenshots or error messages\n\nOur support team typically responds within 24 hours. For urgent matters, please indicate the urgency in your message.`
        };
        const escalationKeywords = ['manager', 'supervisor', 'urgent', 'immediate', 'critical', 'emergency'];
        const escalationRequired = escalationKeywords.some(keyword => query.includes(keyword));
        const suggestedArticles = [
            `${category}-troubleshooting-guide`,
            `faq-${category}-common-issues`,
            `how-to-${category}-best-practices`
        ];
        const confidenceScore = Math.floor(Math.random() * 30) + 70;
        return {
            response: responses[category] || responses.general,
            category,
            priority,
            suggestedArticles,
            confidenceScore,
            escalationRequired,
        };
    }
    async saveToDatabase(payload, result) {
        const entity = this.repo.create({
            ...payload,
            response: result.response,
            category: result.category,
            priority: result.priority,
            suggestedArticles: JSON.stringify(result.suggestedArticles),
            confidenceScore: result.confidenceScore,
            escalationRequired: result.escalationRequired ? 'true' : 'false',
            status: 'completed',
        });
        return this.repo.save(entity);
    }
    async findAll() {
        return this.repo.find();
    }
    async findOne(id) {
        return this.repo.findOneBy({ id });
    }
    async findBySessionId(sessionId) {
        return this.repo.find({ where: { sessionId } });
    }
    async getMetrics() {
        const total = await this.repo.count();
        const completed = await this.repo.count({ where: { status: 'completed' } });
        const failed = await this.repo.count({ where: { status: 'failed' } });
        const dbMetrics = {
            totalSupportRequests: total,
            dbSuccessRate: total > 0 ? (completed / total) * 100 : 0,
            dbFailureRate: total > 0 ? (failed / total) * 100 : 0,
            databaseMetrics: true,
        };
        return {
            ...dbMetrics,
            ...this.metrics,
        };
    }
};
exports.AgentCustomerSupportService = AgentCustomerSupportService;
exports.AgentCustomerSupportService = AgentCustomerSupportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_customer_support_entity_1.AgentCustomerSupport)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        redis_service_1.RedisService,
        state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService])
], AgentCustomerSupportService);
//# sourceMappingURL=agent-customer-support.service.js.map