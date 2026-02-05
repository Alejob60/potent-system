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
var CampaignAgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignAgentService = void 0;
const common_1 = require("@nestjs/common");
const state_management_service_1 = require("../../state/state-management.service");
const websocket_gateway_1 = require("../../websocket/websocket.gateway");
const token_management_service_1 = require("../../services/token-management.service");
let CampaignAgentService = CampaignAgentService_1 = class CampaignAgentService {
    constructor(stateManager, websocketGateway, tokenManager) {
        this.stateManager = stateManager;
        this.websocketGateway = websocketGateway;
        this.tokenManager = tokenManager;
        this.logger = new common_1.Logger(CampaignAgentService_1.name);
    }
    async createCampaign(request) {
        this.logger.log(`Creating campaign: ${request.title} for session ${request.sessionId}`);
        try {
            this.stateManager.updateContext(request.sessionId, {
                campaignType: 'campaign',
                currentObjective: request.objective,
                targetChannels: request.targetChannels,
            });
            this.websocketGateway.emitToSession(request.sessionId, 'campaign_creation_started', {
                title: request.title,
                message: 'Starting campaign creation process...',
            });
            const strategy = await this.createCampaignStrategy(request);
            this.websocketGateway.emitCampaignUpdate(request.sessionId, {
                step: 'strategy_created',
                strategy,
                message: 'Campaign strategy developed',
            });
            const contentCalendar = await this.generateContentCalendar(request, strategy);
            this.websocketGateway.emitCampaignUpdate(request.sessionId, {
                step: 'content_calendar_created',
                contentCount: contentCalendar.length,
                message: 'Content calendar generated',
            });
            const metrics = this.calculateCampaignMetrics(request, contentCalendar);
            const campaignPlan = {
                id: `campaign_${Date.now()}`,
                title: request.title,
                objective: request.objective,
                strategy,
                contentCalendar,
                metrics,
                status: 'draft',
            };
            await this.scheduleContentItems(campaignPlan, request.sessionId);
            this.stateManager.addTask(request.sessionId, {
                type: 'campaign_creation',
                status: 'completed',
                data: campaignPlan,
                result: campaignPlan,
            });
            this.websocketGateway.emitCampaignUpdate(request.sessionId, {
                step: 'campaign_completed',
                campaign: campaignPlan,
                message: 'Campaign successfully created and scheduled!',
            });
            this.logger.log(`Campaign created successfully: ${campaignPlan.id}`);
            return campaignPlan;
        }
        catch (error) {
            this.logger.error(`Failed to create campaign: ${error.message}`, error.stack);
            this.websocketGateway.emitToSession(request.sessionId, 'campaign_creation_error', {
                error: error.message,
                message: 'Failed to create campaign',
            });
            throw error;
        }
    }
    async createCampaignStrategy(request) {
        const strategies = {
            brand_awareness: {
                approach: 'Multi-touchpoint brand visibility campaign',
                keyMessages: [
                    'Brand values',
                    'Unique selling proposition',
                    'Social proof',
                ],
                targetAudience: 'Broad demographic with interest in ' + request.objective,
                postingFrequency: 'Daily posts with 2x engagement windows',
                engagementTactics: [
                    'User-generated content',
                    'Interactive polls',
                    'Behind-the-scenes',
                ],
                trendAlignment: [
                    'Current viral formats',
                    'Platform-specific trends',
                    'Seasonal relevance',
                ],
            },
            lead_generation: {
                approach: 'Conversion-focused content funnel',
                keyMessages: [
                    'Problem identification',
                    'Solution demonstration',
                    'Clear call-to-action',
                ],
                targetAudience: 'Qualified prospects in target market',
                postingFrequency: '3-4 strategic posts per week',
                engagementTactics: [
                    'Educational content',
                    'Free resources',
                    'Social proof',
                ],
                trendAlignment: [
                    'Educational trends',
                    'Problem-solving content',
                    'Industry insights',
                ],
            },
            engagement: {
                approach: 'Community-building and interaction focus',
                keyMessages: [
                    'Community values',
                    'Shared experiences',
                    'Interactive elements',
                ],
                targetAudience: 'Existing followers and community members',
                postingFrequency: 'Daily with emphasis on real-time interaction',
                engagementTactics: [
                    'Live sessions',
                    'Q&A content',
                    'Community challenges',
                ],
                trendAlignment: [
                    'Interactive trends',
                    'Community-driven content',
                    'Real-time events',
                ],
            },
        };
        const objectiveLower = request.objective.toLowerCase();
        let strategyType = 'engagement';
        if (objectiveLower.includes('brand') ||
            objectiveLower.includes('awareness')) {
            strategyType = 'brand_awareness';
        }
        else if (objectiveLower.includes('lead') ||
            objectiveLower.includes('sales') ||
            objectiveLower.includes('conversion')) {
            strategyType = 'lead_generation';
        }
        return strategies[strategyType];
    }
    async generateContentCalendar(request, strategy) {
        const contentCalendar = [];
        const startDate = request.startDate || new Date();
        const postsPerWeek = this.getPostsPerWeek(strategy.postingFrequency);
        const totalPosts = Math.ceil((request.duration / 7) * postsPerWeek);
        for (let i = 0; i < totalPosts; i++) {
            const daysOffset = Math.floor((i / postsPerWeek) * 7) + (i % postsPerWeek);
            const scheduledDate = new Date(startDate);
            scheduledDate.setDate(scheduledDate.getDate() + daysOffset);
            const contentType = this.selectContentType(request.contentTypes, i);
            const contentItem = {
                id: `content_${Date.now()}_${i}`,
                type: contentType,
                title: this.generateContentTitle(contentType, strategy, i),
                content: this.generateContentText(contentType, strategy, request),
                channels: request.targetChannels,
                scheduledDate,
                status: 'planned',
                hashtags: this.generateHashtags(request.objective, contentType),
                mentions: [],
            };
            contentCalendar.push(contentItem);
        }
        return contentCalendar;
    }
    getPostsPerWeek(frequency) {
        const frequencyMap = {
            daily: 7,
            'daily with 2x engagement windows': 10,
            '3-4 strategic posts per week': 3.5,
            'daily with emphasis on real-time interaction': 8,
        };
        return frequencyMap[frequency] || 5;
    }
    selectContentType(allowedTypes, index) {
        if (allowedTypes.includes('video') && index % 4 === 0)
            return 'video';
        if (allowedTypes.includes('image') && index % 3 === 0)
            return 'image';
        if (allowedTypes.includes('story') && index % 5 === 0)
            return 'story';
        return 'post';
    }
    generateContentTitle(type, strategy, index) {
        const titleTemplates = {
            post: [
                `${strategy.keyMessages[index % strategy.keyMessages.length]} - Day ${index + 1}`,
                `Sharing insights: ${strategy.keyMessages[index % strategy.keyMessages.length]}`,
                `Community update: ${strategy.keyMessages[index % strategy.keyMessages.length]}`,
            ],
            video: [
                `Video: ${strategy.keyMessages[index % strategy.keyMessages.length]}`,
                `Behind the scenes: ${strategy.keyMessages[index % strategy.keyMessages.length]}`,
                `Tutorial: ${strategy.keyMessages[index % strategy.keyMessages.length]}`,
            ],
            image: [
                `Visual story: ${strategy.keyMessages[index % strategy.keyMessages.length]}`,
                `Infographic: ${strategy.keyMessages[index % strategy.keyMessages.length]}`,
                `Photo series: ${strategy.keyMessages[index % strategy.keyMessages.length]}`,
            ],
            story: [
                `Quick update: ${strategy.keyMessages[index % strategy.keyMessages.length]}`,
                `Daily moment: ${strategy.keyMessages[index % strategy.keyMessages.length]}`,
                `Behind scenes: ${strategy.keyMessages[index % strategy.keyMessages.length]}`,
            ],
        };
        const templates = titleTemplates[type];
        return templates[index % templates.length];
    }
    generateContentText(type, strategy, request) {
        const baseContent = `Creating engaging ${type} content focused on ${request.objective}. `;
        const strategyContent = `Our approach: ${strategy.approach}. `;
        const audienceContent = `Targeting: ${strategy.targetAudience}. `;
        return (baseContent +
            strategyContent +
            audienceContent +
            'What do you think? Let us know in the comments!');
    }
    generateHashtags(objective, contentType) {
        const baseHashtags = ['#socialmedia', '#content', '#marketing'];
        const objectiveHashtags = objective
            .toLowerCase()
            .split(' ')
            .map((word) => `#${word}`);
        const typeHashtags = [`#${contentType}`, `#${contentType}content`];
        return [
            ...baseHashtags,
            ...objectiveHashtags.slice(0, 2),
            ...typeHashtags,
        ].slice(0, 8);
    }
    calculateCampaignMetrics(request, contentCalendar) {
        const channelMultiplier = request.targetChannels.length;
        const contentCount = contentCalendar.length;
        return {
            targetReach: contentCount * channelMultiplier * 1000,
            expectedEngagement: contentCount * channelMultiplier * 50,
            estimatedBudget: request.budget || contentCount * 25,
            contentCount,
            channelsCount: channelMultiplier,
        };
    }
    async scheduleContentItems(campaign, sessionId) {
        this.logger.log(`Would schedule ${campaign.contentCalendar.length} content items`);
        this.websocketGateway.emitToSession(sessionId, 'content_scheduled', {
            campaignId: campaign.id,
            itemsScheduled: campaign.contentCalendar.length,
            message: 'Content items have been prepared for scheduling',
        });
    }
    async getCampaignStatus(campaignId, sessionId) {
        const tasks = this.stateManager.getTasks(sessionId);
        const campaignTask = tasks.find((task) => task.type === 'campaign_creation' && task.result?.id === campaignId);
        if (!campaignTask) {
            throw new Error('Campaign not found');
        }
        return campaignTask.result;
    }
    async updateCampaignStatus(campaignId, status, sessionId) {
        const tasks = this.stateManager.getTasks(sessionId);
        const campaignTask = tasks.find((task) => task.type === 'campaign_creation' && task.result?.id === campaignId);
        if (campaignTask && campaignTask.result) {
            campaignTask.result.status = status;
            this.websocketGateway.emitCampaignUpdate(sessionId, {
                campaignId,
                status,
                message: `Campaign status updated to ${status}`,
            });
        }
    }
};
exports.CampaignAgentService = CampaignAgentService;
exports.CampaignAgentService = CampaignAgentService = CampaignAgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService,
        token_management_service_1.TokenManagementService])
], CampaignAgentService);
//# sourceMappingURL=campaign-agent.service.js.map