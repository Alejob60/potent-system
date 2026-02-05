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
exports.AgentSalesAssistantService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_sales_assistant_entity_1 = require("../entities/agent-sales-assistant.entity");
const agent_base_1 = require("../../../common/agents/agent-base");
const redis_service_1 = require("../../../common/redis/redis.service");
const state_management_service_1 = require("../../../state/state-management.service");
const websocket_gateway_1 = require("../../../websocket/websocket.gateway");
let AgentSalesAssistantService = class AgentSalesAssistantService extends agent_base_1.AgentBase {
    constructor(repo, redisService, stateManager, websocketGateway) {
        super('sales-assistant', 'Qualify leads and provide sales recommendations', ['lead_qualification', 'sales_recommendations', 'customer_profiling', 'next_steps'], redisService, stateManager, websocketGateway);
        this.repo = repo;
    }
    async execute(payload) {
        const startTime = Date.now();
        try {
            if (!(await this.validate(payload))) {
                return this.handleError(new Error('Invalid payload'), 'execute.validate');
            }
            this.logActivity(payload.sessionId || 'unknown', 'Starting sales qualification', payload);
            if (this.websocketGateway) {
                this.websocketGateway.broadcastSystemNotification({
                    type: 'agent_processing',
                    agent: this.config.name,
                    sessionId: payload.sessionId || 'unknown',
                    message: 'Qualifying lead',
                    timestamp: new Date().toISOString(),
                });
            }
            const result = await this.generateQualification(payload);
            const savedResult = await this.saveToDatabase(payload, result);
            const processingTime = Date.now() - startTime;
            this.updateMetrics({
                avgResponseTime: processingTime,
            });
            this.logActivity(payload.sessionId || 'unknown', 'Sales qualification completed', { processingTime, qualificationScore: result.qualificationScore });
            return this.formatResponse({
                qualification: savedResult,
                qualificationScore: result.qualificationScore,
                qualificationReasoning: result.qualificationReasoning,
                nextSteps: result.nextSteps,
                productRecommendation: result.productRecommendation,
                confidenceScore: result.confidenceScore,
                followUpRequired: result.followUpRequired,
            });
        }
        catch (error) {
            return this.handleError(error, 'execute');
        }
    }
    async validate(payload) {
        if (!payload)
            return false;
        if (!payload.leadInformation)
            return false;
        return true;
    }
    async generateQualification(payload) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const leadInfo = payload.leadInformation.toLowerCase();
        const industries = {
            'technology': ['tech', 'software', 'saas', 'startup', 'it', 'developer'],
            'finance': ['bank', 'financial', 'investment', 'insurance', 'fintech'],
            'healthcare': ['hospital', 'clinic', 'medical', 'health', 'pharma'],
            'retail': ['store', 'shop', 'ecommerce', 'retail', 'commerce'],
            'education': ['school', 'university', 'education', 'learning', 'academic'],
            'manufacturing': ['factory', 'manufacturing', 'production', 'industrial'],
            'other': ['general', 'miscellaneous', 'various']
        };
        let industry = 'other';
        for (const [ind, keywords] of Object.entries(industries)) {
            if (keywords.some(keyword => leadInfo.includes(keyword))) {
                industry = ind;
                break;
            }
        }
        const sizeIndicators = {
            'enterprise': ['large', 'thousands', 'multinational', 'fortune'],
            'mid_market': ['medium', 'hundreds', 'regional', 'established'],
            'smb': ['small', 'dozen', 'local', 'startup', 'new']
        };
        let companySize = 'smb';
        for (const [size, keywords] of Object.entries(sizeIndicators)) {
            if (keywords.some(keyword => leadInfo.includes(keyword))) {
                companySize = size;
                break;
            }
        }
        const budgetKeywords = ['budget', 'price', 'cost', 'afford', 'expensive', 'cheap'];
        const budgetMentioned = budgetKeywords.some(keyword => leadInfo.includes(keyword));
        const timelineKeywords = {
            'immediate': ['now', 'immediately', 'urgent', 'asap', 'today'],
            'short_term': ['week', 'month', 'soon', 'next'],
            'long_term': ['quarter', 'year', 'later', 'future']
        };
        let timeline = 'short_term';
        for (const [term, keywords] of Object.entries(timelineKeywords)) {
            if (keywords.some(keyword => leadInfo.includes(keyword))) {
                timeline = term;
                break;
            }
        }
        let score = 50;
        if (companySize === 'enterprise')
            score += 20;
        else if (companySize === 'mid_market')
            score += 10;
        if (timeline === 'immediate')
            score += 15;
        else if (timeline === 'short_term')
            score += 10;
        if (budgetMentioned)
            score += 5;
        score = Math.min(100, score);
        let qualificationScore;
        let qualificationReasoning;
        if (score >= 80) {
            qualificationScore = 'A - High Priority';
            qualificationReasoning = `This is a high-priority lead with strong indicators of readiness to purchase. The lead represents a ${companySize} company in the ${industry} industry with an ${timeline} timeline.`;
        }
        else if (score >= 60) {
            qualificationScore = 'B - Medium Priority';
            qualificationReasoning = `This is a medium-priority lead showing moderate interest. The lead represents a ${companySize} company in the ${industry} industry with a ${timeline} timeline.`;
        }
        else if (score >= 40) {
            qualificationScore = 'C - Low Priority';
            qualificationReasoning = `This is a low-priority lead that may need nurturing. The lead represents a ${companySize} company in the ${industry} industry with a ${timeline} timeline.`;
        }
        else {
            qualificationScore = 'D - Not Qualified';
            qualificationReasoning = `This lead is not currently qualified for immediate follow-up. The lead represents a ${companySize} company in the ${industry} industry with a ${timeline} timeline.`;
        }
        let nextSteps;
        if (score >= 80) {
            nextSteps = 'Schedule a demo call within 24 hours. Prepare customized presentation based on industry needs.';
        }
        else if (score >= 60) {
            nextSteps = 'Send personalized email with relevant case studies. Follow up in 3 business days.';
        }
        else if (score >= 40) {
            nextSteps = 'Add to nurturing campaign. Send educational content monthly for 3 months.';
        }
        else {
            nextSteps = 'Archive for future outreach. Re-evaluate in 6 months.';
        }
        const productRecommendations = {
            'technology': 'Enterprise SaaS Platform with advanced analytics and integration capabilities',
            'finance': 'Compliance-focused solution with security and audit trail features',
            'healthcare': 'HIPAA-compliant platform with patient data management',
            'retail': 'E-commerce integration with inventory management and customer analytics',
            'education': 'Learning management system with student progress tracking',
            'manufacturing': 'Supply chain optimization with real-time production monitoring',
            'other': 'Custom solution tailored to specific business requirements'
        };
        const productRecommendation = productRecommendations[industry] || productRecommendations.other;
        const followUpRequired = score >= 40;
        const confidenceScore = Math.floor(Math.random() * 20) + 80;
        return {
            qualificationScore,
            qualificationReasoning,
            nextSteps,
            productRecommendation,
            confidenceScore,
            followUpRequired,
        };
    }
    async saveToDatabase(payload, result) {
        const entity = this.repo.create({
            ...payload,
            qualificationScore: result.qualificationScore,
            qualificationReasoning: result.qualificationReasoning,
            nextSteps: result.nextSteps,
            productRecommendation: result.productRecommendation,
            confidenceScore: result.confidenceScore,
            followUpRequired: result.followUpRequired ? 'true' : 'false',
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
            totalQualifications: total,
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
exports.AgentSalesAssistantService = AgentSalesAssistantService;
exports.AgentSalesAssistantService = AgentSalesAssistantService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_sales_assistant_entity_1.AgentSalesAssistant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        redis_service_1.RedisService,
        state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService])
], AgentSalesAssistantService);
//# sourceMappingURL=agent-sales-assistant.service.js.map