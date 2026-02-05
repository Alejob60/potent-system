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
exports.AgentFaqResponderV2Service = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_faq_responder_entity_1 = require("../entities/agent-faq-responder.entity");
const agent_base_1 = require("../../../common/agents/agent-base");
const redis_service_1 = require("../../../common/redis/redis.service");
const state_management_service_1 = require("../../../state/state-management.service");
const websocket_gateway_1 = require("../../../websocket/websocket.gateway");
let AgentFaqResponderV2Service = class AgentFaqResponderV2Service extends agent_base_1.AgentBase {
    constructor(repo, redisService, stateManager, websocketGateway) {
        super('faq-responder-v2', 'Generate comprehensive FAQ responses based on topics with enhanced capabilities', ['faq_generation', 'question_answering', 'content_organization', 'audience_adaptation'], redisService, stateManager, websocketGateway);
        this.repo = repo;
    }
    async execute(payload) {
        const startTime = Date.now();
        try {
            if (!(await this.validate(payload))) {
                return this.handleError(new Error('Invalid payload'), 'execute.validate');
            }
            this.logActivity(payload.sessionId || 'unknown', 'Starting FAQ response generation', payload);
            if (this.websocketGateway) {
                this.websocketGateway.broadcastSystemNotification({
                    type: 'agent_processing',
                    agent: this.config.name,
                    sessionId: payload.sessionId || 'unknown',
                    message: 'Generating FAQ responses',
                    timestamp: new Date().toISOString(),
                });
            }
            const result = await this.generateFaqResponses(payload);
            const savedResult = await this.saveToDatabase(payload, result);
            const processingTime = Date.now() - startTime;
            this.updateMetrics({
                avgResponseTime: processingTime,
            });
            this.logActivity(payload.sessionId || 'unknown', 'FAQ response generation completed', { processingTime, questionCount: result.questions.length });
            return this.formatResponse({
                faq: savedResult,
                questions: result.questions,
                topic: result.topic,
                audience: result.audience,
                format: result.format,
            });
        }
        catch (error) {
            return this.handleError(error, 'execute');
        }
    }
    async validate(payload) {
        if (!payload)
            return false;
        if (!payload.question)
            return false;
        if (payload.audience) {
            const validAudiences = ['customers', 'developers', 'business', 'general'];
            if (!validAudiences.includes(payload.audience))
                return false;
        }
        if (payload.detailLevel) {
            const validDetailLevels = ['basic', 'standard', 'comprehensive'];
            if (!validDetailLevels.includes(payload.detailLevel))
                return false;
        }
        if (payload.format) {
            const validFormats = ['list', 'categorized', 'structured'];
            if (!validFormats.includes(payload.format))
                return false;
        }
        return true;
    }
    async generateFaqResponses(payload) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const baseQuestions = [
            {
                question: `What is ${payload.topic || 'the topic'}?`,
                answer: `This is a comprehensive explanation of ${payload.topic || 'the topic'} tailored for ${payload.audience || 'general users'}.`,
                confidence: 0.95,
                category: 'basics',
            },
            {
                question: `How does ${payload.topic || 'the topic'} work?`,
                answer: `The mechanism of ${payload.topic || 'the topic'} involves several key components that interact in specific ways.`,
                confidence: 0.92,
                category: 'functionality',
            },
            {
                question: `Why should I use ${payload.topic || 'the topic'}?`,
                answer: `Using ${payload.topic || 'the topic'} provides significant benefits including efficiency, reliability, and scalability.`,
                confidence: 0.88,
                category: 'benefits',
            },
        ];
        let audienceQuestions = [];
        switch (payload.audience) {
            case 'customers':
                audienceQuestions = [
                    {
                        question: `Is ${payload.topic || 'the topic'} easy to use?`,
                        answer: `Yes, ${payload.topic || 'the topic'} is designed with user experience in mind, featuring an intuitive interface.`,
                        confidence: 0.90,
                        category: 'usability',
                    },
                    {
                        question: `What support is available for ${payload.topic || 'the topic'}?`,
                        answer: `We offer 24/7 customer support, comprehensive documentation, and community forums.`,
                        confidence: 0.85,
                        category: 'support',
                    },
                ];
                break;
            case 'developers':
                audienceQuestions = [
                    {
                        question: `Can I integrate ${payload.topic || 'the topic'} with my existing systems?`,
                        answer: `Yes, ${payload.topic || 'the topic'} provides robust APIs and SDKs for popular platforms and languages.`,
                        confidence: 0.93,
                        category: 'integration',
                    },
                    {
                        question: `What are the technical requirements for ${payload.topic || 'the topic'}?`,
                        answer: `${payload.topic || 'the topic'} requires minimal system resources and supports multiple environments.`,
                        confidence: 0.89,
                        category: 'requirements',
                    },
                ];
                break;
            case 'business':
                audienceQuestions = [
                    {
                        question: `What is the ROI of implementing ${payload.topic || 'the topic'}?`,
                        answer: `Organizations typically see a 30-50% improvement in efficiency within the first quarter.`,
                        confidence: 0.87,
                        category: 'roi',
                    },
                    {
                        question: `How does ${payload.topic || 'the topic'} scale with my business?`,
                        answer: `${payload.topic || 'the topic'} is built for scalability, supporting growth from startup to enterprise.`,
                        confidence: 0.91,
                        category: 'scalability',
                    },
                ];
                break;
            default:
                audienceQuestions = [
                    {
                        question: `Where can I learn more about ${payload.topic || 'the topic'}?`,
                        answer: `Visit our comprehensive documentation center for detailed guides and tutorials.`,
                        confidence: 0.86,
                        category: 'learning',
                    },
                ];
        }
        let questions = [...baseQuestions, ...audienceQuestions];
        if (payload.detailLevel === 'comprehensive') {
            questions = questions.map(q => ({
                ...q,
                answer: `${q.answer} This includes detailed technical specifications, best practices, and troubleshooting guidance.`
            }));
        }
        else if (payload.detailLevel === 'basic') {
            questions = questions.map(q => ({
                ...q,
                answer: q.answer.split('.')[0] + '.'
            }));
        }
        return {
            questions,
            topic: payload.topic || '',
            audience: payload.audience || 'general',
            format: payload.format || 'list',
        };
    }
    async saveToDatabase(payload, result) {
        const firstQuestion = result.questions[0] || { question: '', answer: '' };
        const entity = this.repo.create({
            ...payload,
            question: firstQuestion.question,
            answer: firstQuestion.answer,
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
            totalFaqs: total,
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
exports.AgentFaqResponderV2Service = AgentFaqResponderV2Service;
exports.AgentFaqResponderV2Service = AgentFaqResponderV2Service = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_faq_responder_entity_1.AgentFaqResponder)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        redis_service_1.RedisService,
        state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService])
], AgentFaqResponderV2Service);
//# sourceMappingURL=agent-faq-responder-v2.service.js.map