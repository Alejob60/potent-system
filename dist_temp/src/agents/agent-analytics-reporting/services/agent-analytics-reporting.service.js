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
exports.AgentAnalyticsReportingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_analytics_reporting_entity_1 = require("../entities/agent-analytics-reporting.entity");
const agent_base_1 = require("../../../common/agents/agent-base");
const redis_service_1 = require("../../../common/redis/redis.service");
const state_management_service_1 = require("../../../state/state-management.service");
const websocket_gateway_1 = require("../../../websocket/websocket.gateway");
let AgentAnalyticsReportingService = class AgentAnalyticsReportingService extends agent_base_1.AgentBase {
    constructor(repo, redisService, stateManager, websocketGateway) {
        super('analytics-reporting', 'Generate analytics reports with insights and recommendations', ['data_analysis', 'reporting', 'insights_generation', 'recommendations'], redisService, stateManager, websocketGateway);
        this.repo = repo;
    }
    async execute(payload) {
        const startTime = Date.now();
        try {
            if (!(await this.validate(payload))) {
                return this.handleError(new Error('Invalid payload'), 'execute.validate');
            }
            this.logActivity(payload.sessionId || 'unknown', 'Starting analytics report generation', payload);
            if (this.websocketGateway) {
                this.websocketGateway.broadcastSystemNotification({
                    type: 'agent_processing',
                    agent: this.config.name,
                    sessionId: payload.sessionId || 'unknown',
                    message: 'Generating analytics report',
                    timestamp: new Date().toISOString(),
                });
            }
            const result = await this.generateReport(payload);
            const savedResult = await this.saveToDatabase(payload, result);
            const processingTime = Date.now() - startTime;
            this.updateMetrics({
                avgResponseTime: processingTime,
            });
            this.logActivity(payload.sessionId || 'unknown', 'Analytics report generation completed', { processingTime, reportType: payload.reportType });
            return this.formatResponse({
                report: savedResult,
                metrics: result.metrics,
                insights: result.insights,
                recommendations: result.recommendations,
                visualizationData: result.visualizationData,
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
        if (!payload.reportType)
            return false;
        return true;
    }
    async generateReport(payload) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const reportType = payload.reportType.toLowerCase();
        const dateRange = payload.dateRange || 'Last 30 days';
        const metrics = this.generateMetrics(reportType);
        const insights = this.generateInsights(reportType, metrics);
        const recommendations = this.generateRecommendations(reportType, insights);
        const visualizationData = this.generateVisualizationData(reportType, metrics);
        const confidenceScore = Math.floor(Math.random() * 15) + 85;
        return {
            metrics,
            insights,
            recommendations,
            visualizationData,
            confidenceScore,
        };
    }
    generateMetrics(reportType) {
        switch (reportType) {
            case 'user_engagement':
                return {
                    totalUsers: 12540,
                    activeUsers: 8765,
                    sessionDuration: '4m 32s',
                    pagesPerSession: 3.2,
                    bounceRate: '42%',
                    returningUsers: '68%',
                    newUserConversion: '24%',
                };
            case 'revenue':
                return {
                    totalRevenue: '$125,430',
                    revenueGrowth: '+18.5%',
                    averageOrderValue: '$87.50',
                    conversionRate: '3.2%',
                    cartAbandonment: '68%',
                    customerLifetimeValue: '$420',
                    monthlyRecurringRevenue: '$85,200',
                };
            case 'marketing':
                return {
                    totalCampaigns: 24,
                    campaignROI: '3.2x',
                    costPerAcquisition: '$24.50',
                    emailOpenRate: '28.5%',
                    clickThroughRate: '4.2%',
                    socialEngagement: '15.8%',
                    leadConversion: '12.3%',
                };
            case 'product':
                return {
                    featureAdoption: '72%',
                    userSatisfaction: '4.3/5',
                    bugReports: 24,
                    featureRequests: 87,
                    retentionRate: '82%',
                    churnRate: '18%',
                    netPromoterScore: 74,
                };
            default:
                return {
                    keyMetric1: 'Value 1',
                    keyMetric2: 'Value 2',
                    keyMetric3: 'Value 3',
                    keyMetric4: 'Value 4',
                    keyMetric5: 'Value 5',
                };
        }
    }
    generateInsights(reportType, metrics) {
        switch (reportType) {
            case 'user_engagement':
                return [
                    'User engagement has increased by 12% compared to last month, indicating successful content strategy',
                    'Bounce rate has decreased to 42%, suggesting improved landing page relevance',
                    'Returning users account for 68% of traffic, showing strong user retention',
                    'Session duration of 4m 32s indicates high content quality and user interest',
                    'Mobile traffic represents 65% of total traffic, highlighting the importance of mobile optimization'
                ];
            case 'revenue':
                return [
                    'Revenue growth of 18.5% exceeds industry benchmarks, demonstrating strong market performance',
                    'Average order value increased by 8% through effective upselling strategies',
                    'Cart abandonment rate remains high at 68%, presenting an optimization opportunity',
                    'Customer lifetime value improved by 15% due to enhanced retention programs',
                    'Monthly recurring revenue growth of 12% indicates successful subscription model'
                ];
            case 'marketing':
                return [
                    'Campaign ROI of 3.2x demonstrates efficient marketing spend allocation',
                    'Email open rate of 28.5% exceeds industry average, showing strong list engagement',
                    'Cost per acquisition decreased by 15% through improved targeting',
                    'Social engagement increased by 22% with new content strategy',
                    'Lead conversion rate improved to 12.3% through better lead qualification'
                ];
            case 'product':
                return [
                    'Feature adoption rate of 72% indicates successful product-market fit',
                    'User satisfaction score of 4.3/5 reflects positive user experience',
                    'Bug reports decreased by 30% following recent quality improvements',
                    'Feature request volume suggests strong user engagement and product interest',
                    'Net Promoter Score of 74 indicates high customer loyalty and advocacy'
                ];
            default:
                return [
                    'Key trend identified in the data',
                    'Significant pattern detected',
                    'Notable change from previous period',
                    'Opportunity for improvement identified',
                    'Strong performance indicator observed'
                ];
        }
    }
    generateRecommendations(reportType, insights) {
        switch (reportType) {
            case 'user_engagement':
                return [
                    'Implement personalized content recommendations to further increase session duration',
                    'Optimize mobile experience with dedicated mobile-first design improvements',
                    'Launch a referral program to leverage high returning user base',
                    'Create more interactive content to reduce bounce rate further',
                    'Develop a loyalty program to enhance user retention strategies'
                ];
            case 'revenue':
                return [
                    'Implement cart recovery emails to reduce abandonment rate by 20-30%',
                    'Introduce product bundling strategies to increase average order value',
                    'Expand into new market segments to drive additional revenue streams',
                    'Enhance customer support to improve retention and lifetime value',
                    'Optimize pricing strategy based on competitor analysis and value perception'
                ];
            case 'marketing':
                return [
                    'Increase budget allocation to high-performing channels with ROI above 4x',
                    'Develop retargeting campaigns to re-engage website visitors',
                    'Create lookalike audiences based on high-value customer segments',
                    'Optimize email send times based on user engagement patterns',
                    'Expand content marketing to address frequently asked questions from support'
                ];
            case 'product':
                return [
                    'Prioritize development of top feature requests to enhance user satisfaction',
                    'Implement proactive bug detection to maintain quality standards',
                    'Develop advanced analytics features based on user behavior insights',
                    'Create in-app tutorials for underutilized features to improve adoption',
                    'Establish user feedback loop to guide future product development'
                ];
            default:
                return [
                    'Focus on key areas showing strongest performance',
                    'Address identified opportunities for improvement',
                    'Invest in strategies that align with positive trends',
                    'Monitor metrics closely to track impact of changes',
                    'Consider external factors that may influence results'
                ];
        }
    }
    generateVisualizationData(reportType, metrics) {
        const chartData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Performance',
                    data: [65, 72, 78, 82, 85, 88],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }
            ]
        };
        const tableData = [
            { metric: 'Metric 1', value: 'Value 1', change: '+12%' },
            { metric: 'Metric 2', value: 'Value 2', change: '-5%' },
            { metric: 'Metric 3', value: 'Value 3', change: '+8%' }
        ];
        return {
            chartData,
            tableData,
            reportType
        };
    }
    async saveToDatabase(payload, result) {
        const entity = this.repo.create({
            ...payload,
            metrics: JSON.stringify(result.metrics),
            insights: JSON.stringify(result.insights),
            recommendations: JSON.stringify(result.recommendations),
            visualizationData: JSON.stringify(result.visualizationData),
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
            totalReports: total,
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
exports.AgentAnalyticsReportingService = AgentAnalyticsReportingService;
exports.AgentAnalyticsReportingService = AgentAnalyticsReportingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_analytics_reporting_entity_1.AgentAnalyticsReporting)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        redis_service_1.RedisService,
        state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService])
], AgentAnalyticsReportingService);
//# sourceMappingURL=agent-analytics-reporting.service.js.map