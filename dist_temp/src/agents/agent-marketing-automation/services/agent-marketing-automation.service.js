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
exports.AgentMarketingAutomationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_marketing_automation_entity_1 = require("../entities/agent-marketing-automation.entity");
const agent_base_1 = require("../../../common/agents/agent-base");
const redis_service_1 = require("../../../common/redis/redis.service");
const state_management_service_1 = require("../../../state/state-management.service");
const websocket_gateway_1 = require("../../../websocket/websocket.gateway");
let AgentMarketingAutomationService = class AgentMarketingAutomationService extends agent_base_1.AgentBase {
    constructor(repo, redisService, stateManager, websocketGateway) {
        super('marketing-automation', 'Design marketing campaigns with automation capabilities', ['campaign_management', 'content_creation', 'channel_optimization', 'budget_planning'], redisService, stateManager, websocketGateway);
        this.repo = repo;
    }
    async execute(payload) {
        const startTime = Date.now();
        try {
            if (!(await this.validate(payload))) {
                return this.handleError(new Error('Invalid payload'), 'execute.validate');
            }
            this.logActivity(payload.sessionId || 'unknown', 'Starting marketing campaign design', payload);
            if (this.websocketGateway) {
                this.websocketGateway.broadcastSystemNotification({
                    type: 'agent_processing',
                    agent: this.config.name,
                    sessionId: payload.sessionId || 'unknown',
                    message: 'Designing marketing campaign',
                    timestamp: new Date().toISOString(),
                });
            }
            const result = await this.generateCampaign(payload);
            const savedResult = await this.saveToDatabase(payload, result);
            const processingTime = Date.now() - startTime;
            this.updateMetrics({
                avgResponseTime: processingTime,
            });
            this.logActivity(payload.sessionId || 'unknown', 'Marketing campaign design completed', { processingTime, objective: payload.campaignObjective });
            return this.formatResponse({
                campaign: savedResult,
                campaignStrategy: result.campaignStrategy,
                contentIdeas: result.contentIdeas,
                channels: result.channels,
                timeline: result.timeline,
                budgetEstimate: result.budgetEstimate,
                successMetrics: result.successMetrics,
                confidenceScore: result.confidenceScore,
            });
        }
        catch (error) {
            return this.handleError(error, 'execute');
        }
    }
    async validate(payload) {
        if (!payload)
            return false;
        if (!payload.campaignObjective)
            return false;
        return true;
    }
    async generateCampaign(payload) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const objective = payload.campaignObjective.toLowerCase();
        const campaignTypes = {
            'awareness': ['awareness', 'branding', 'visibility', 'exposure'],
            'lead_generation': ['lead', 'contact', 'prospect', 'signup'],
            'conversion': ['conversion', 'sale', 'purchase', 'buy'],
            'retention': ['retain', 'loyalty', 'keep', 'engagement'],
            'revenue': ['revenue', 'income', 'profit', 'monetization']
        };
        let campaignType = 'awareness';
        for (const [type, keywords] of Object.entries(campaignTypes)) {
            if (keywords.some(keyword => objective.includes(keyword))) {
                campaignType = type;
                break;
            }
        }
        const targetAudience = payload.targetAudience || 'General audience';
        const industry = payload.industry || 'General business';
        const strategies = {
            'awareness': `Brand Awareness Campaign Strategy:
1. Content Marketing: Create educational blog posts and infographics about ${industry} trends
2. Social Media: Launch targeted ads on LinkedIn and Twitter to increase visibility
3. Influencer Partnerships: Collaborate with industry thought leaders for authentic endorsements
4. PR Outreach: Secure media coverage in relevant publications and blogs
5. Events: Sponsor or participate in industry conferences and webinars`,
            'lead_generation': `Lead Generation Campaign Strategy:
1. gated Content: Offer valuable resources (e.g., whitepapers, ebooks) in exchange for contact information
2. Webinars: Host educational webinars with registration forms to capture leads
3. Free Trials: Provide free access to premium features to demonstrate value
4. Landing Pages: Create optimized landing pages with clear calls-to-action
5. Retargeting: Use pixel tracking to re-engage website visitors with personalized ads`,
            'conversion': `Conversion Optimization Campaign Strategy:
1. Email Sequences: Develop nurturing email workflows based on user behavior
2. Personalization: Customize website content and offers based on user segments
3. A/B Testing: Continuously test different versions of key pages and elements
4. Urgency Tactics: Implement limited-time offers and scarcity messaging
5. Social Proof: Showcase testimonials, reviews, and case studies prominently`,
            'retention': `Customer Retention Campaign Strategy:
1. Loyalty Programs: Create point-based reward systems for repeat customers
2. Personalized Communication: Send customized emails based on user preferences and history
3. Exclusive Access: Provide early access to new features or products for loyal customers
4. Feedback Loops: Regularly survey customers and implement their suggestions
5. Community Building: Foster user communities through forums and social groups`,
            'revenue': `Revenue Growth Campaign Strategy:
1. Upselling/Cross-selling: Recommend complementary products based on purchase history
2. Subscription Models: Convert one-time purchases to recurring revenue streams
3. Premium Features: Introduce tiered pricing with enhanced functionality
4. Account Expansion: Identify opportunities to sell additional services to existing clients
5. Partnership Revenue: Create affiliate or reseller programs to expand market reach`
        };
        const campaignStrategy = strategies[campaignType] || strategies.awareness;
        const contentIdeas = {
            'awareness': [
                'Industry trend analysis reports',
                'Infographics on market statistics',
                'Thought leadership articles',
                'Behind-the-scenes company videos',
                'Employee spotlight interviews'
            ],
            'lead_generation': [
                'How-to guides and tutorials',
                'Checklist templates and tools',
                'Case studies and success stories',
                'Comparison charts and buying guides',
                'Free consultation or audit offers'
            ],
            'conversion': [
                'Product demo videos',
                'Customer testimonial videos',
                'FAQ sections addressing objections',
                'Limited-time discount announcements',
                'Social proof displays (trust badges, reviews)'
            ],
            'retention': [
                'Personalized product recommendations',
                'Exclusive tips and insider content',
                'Birthday and anniversary messages',
                'Referral program incentives',
                'User-generated content campaigns'
            ],
            'revenue': [
                'Premium feature highlight videos',
                'ROI calculators and value estimators',
                'Enterprise solution case studies',
                'Partner integration showcases',
                'Success story deep-dives'
            ]
        };
        const contentIdeasList = contentIdeas[campaignType] || contentIdeas.awareness;
        const channels = [
            'Email Marketing',
            'Social Media (LinkedIn, Twitter)',
            'Content Marketing (Blog)',
            'Paid Advertising (Google Ads)',
            'SEO/SEM'
        ];
        if (industry.toLowerCase().includes('technology')) {
            channels.push('Tech Forums', 'Developer Communities');
        }
        else if (industry.toLowerCase().includes('healthcare')) {
            channels.push('Medical Journals', 'Healthcare Conferences');
        }
        else if (industry.toLowerCase().includes('finance')) {
            channels.push('Financial News Sites', 'Investment Forums');
        }
        const timeline = payload.timeline || '3-month campaign with weekly content and monthly strategy reviews';
        const budgetEstimates = {
            'awareness': '$15,000 - $25,000 per month',
            'lead_generation': '$10,000 - $20,000 per month',
            'conversion': '$8,000 - $15,000 per month',
            'retention': '$5,000 - $10,000 per month',
            'revenue': '$12,000 - $22,000 per month'
        };
        const budgetEstimate = budgetEstimates[campaignType] || budgetEstimates.awareness;
        const successMetrics = {
            'awareness': [
                'Brand mentions and sentiment analysis',
                'Website traffic growth (20% increase)',
                'Social media followers growth (15% increase)',
                'Content engagement rates (8% average)',
                'Media coverage secured (5+ placements)'
            ],
            'lead_generation': [
                'Lead volume (500+ qualified leads)',
                'Lead quality score (7+ out of 10)',
                'Conversion rate from lead to customer (5%)',
                'Cost per lead ($25 target)',
                'Email signup rates (12% average)'
            ],
            'conversion': [
                'Conversion rate improvement (15% increase)',
                'Average order value growth (10%)',
                'Cart abandonment reduction (25%)',
                'Customer lifetime value increase (20%)',
                'Return on ad spend (3:1 ratio)'
            ],
            'retention': [
                'Customer retention rate (85%+)',
                'Churn rate reduction (50%)',
                'Net Promoter Score (70+)',
                'Customer satisfaction score (4.5+ stars)',
                'Repeat purchase rate (40%+)'
            ],
            'revenue': [
                'Monthly recurring revenue growth (25%)',
                'Average revenue per user increase (15%)',
                'Customer acquisition cost reduction (20%)',
                'Gross margin improvement (10%)',
                'Annual contract value growth (30%)'
            ]
        };
        const successMetricsList = successMetrics[campaignType] || successMetrics.awareness;
        const confidenceScore = Math.floor(Math.random() * 20) + 80;
        return {
            campaignStrategy,
            contentIdeas: contentIdeasList,
            channels,
            timeline,
            budgetEstimate,
            successMetrics: successMetricsList,
            confidenceScore,
        };
    }
    async saveToDatabase(payload, result) {
        const entity = this.repo.create({
            ...payload,
            campaignStrategy: result.campaignStrategy,
            contentIdeas: JSON.stringify(result.contentIdeas),
            channels: JSON.stringify(result.channels),
            timeline: result.timeline,
            budgetEstimate: result.budgetEstimate,
            successMetrics: JSON.stringify(result.successMetrics),
            confidenceScore: result.confidenceScore,
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
            totalCampaigns: total,
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
exports.AgentMarketingAutomationService = AgentMarketingAutomationService;
exports.AgentMarketingAutomationService = AgentMarketingAutomationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_marketing_automation_entity_1.AgentMarketingAutomation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        redis_service_1.RedisService,
        state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService])
], AgentMarketingAutomationService);
//# sourceMappingURL=agent-marketing-automation.service.js.map