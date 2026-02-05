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
var DashboardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
let DashboardService = DashboardService_1 = class DashboardService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(DashboardService_1.name);
        this.misybotApiUrl = process.env.MISYBOT_API_URL || 'https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net';
        this.apiKey = process.env.MISYBOT_API_KEY || '';
    }
    async getDashboardSummary() {
        try {
            const summary = {
                leads: Math.floor(Math.random() * 1000) + 500,
                sales: Math.floor(Math.random() * 500) + 100,
                satisfaction: parseFloat((Math.random() * 0.5 + 0.5).toFixed(2)),
                activeConversations: Math.floor(Math.random() * 50) + 10,
                totalConversations: Math.floor(Math.random() * 500) + 200,
                conversionRate: parseFloat((Math.random() * 0.3 + 0.1).toFixed(2)),
                updatedAt: new Date(),
            };
            return summary;
        }
        catch (error) {
            this.logger.error('Failed to get dashboard summary:', error.message);
            throw error;
        }
    }
    async getConversationMetrics() {
        try {
            const metrics = {
                totalMessages: Math.floor(Math.random() * 10000) + 5000,
                avgResponseTime: parseFloat((Math.random() * 30 + 5).toFixed(1)),
                sentimentScores: {
                    positive: parseFloat((Math.random() * 0.4 + 0.4).toFixed(2)),
                    neutral: parseFloat((Math.random() * 0.3 + 0.1).toFixed(2)),
                    negative: parseFloat((Math.random() * 0.2).toFixed(2)),
                },
                emotionalTrends: [
                    { date: '2023-01-01', positive: 0.6, neutral: 0.3, negative: 0.1 },
                    { date: '2023-01-02', positive: 0.7, neutral: 0.2, negative: 0.1 },
                    { date: '2023-01-03', positive: 0.5, neutral: 0.4, negative: 0.1 },
                    { date: '2023-01-04', positive: 0.8, neutral: 0.1, negative: 0.1 },
                    { date: '2023-01-05', positive: 0.6, neutral: 0.3, negative: 0.1 },
                ],
                topTopics: [
                    { topic: 'Product Information', count: 120 },
                    { topic: 'Pricing', count: 95 },
                    { topic: 'Support', count: 80 },
                    { topic: 'Returns', count: 45 },
                    { topic: 'Shipping', count: 35 },
                ],
                updatedAt: new Date(),
            };
            return metrics;
        }
        catch (error) {
            this.logger.error('Failed to get conversation metrics:', error.message);
            throw error;
        }
    }
    async getSalesMetrics() {
        try {
            const metrics = {
                totalRevenue: parseFloat((Math.random() * 100000 + 50000).toFixed(2)),
                conversionRate: parseFloat((Math.random() * 0.2 + 0.05).toFixed(3)),
                avgDealSize: parseFloat((Math.random() * 1000 + 200).toFixed(2)),
                salesByChannel: [
                    { channel: 'Facebook', revenue: 25000, count: 45 },
                    { channel: 'WhatsApp', revenue: 35000, count: 62 },
                    { channel: 'Google Ads', revenue: 18000, count: 32 },
                    { channel: 'Instagram', revenue: 12000, count: 21 },
                ],
                salesTrends: [
                    { date: '2023-01-01', revenue: 12000 },
                    { date: '2023-01-02', revenue: 15000 },
                    { date: '2023-01-03', revenue: 18000 },
                    { date: '2023-01-04', revenue: 14000 },
                    { date: '2023-01-05', revenue: 21000 },
                ],
                updatedAt: new Date(),
            };
            return metrics;
        }
        catch (error) {
            this.logger.error('Failed to get sales metrics:', error.message);
            throw error;
        }
    }
    async getAdPerformanceMetrics() {
        try {
            const metrics = {
                totalSpend: parseFloat((Math.random() * 5000 + 1000).toFixed(2)),
                totalImpressions: Math.floor(Math.random() * 500000) + 100000,
                totalClicks: Math.floor(Math.random() * 10000) + 2000,
                ctr: parseFloat((Math.random() * 0.05 + 0.01).toFixed(4)),
                cpc: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
                roas: parseFloat((Math.random() * 5 + 2).toFixed(2)),
                performanceByPlatform: [
                    { platform: 'Facebook', spend: 1500, impressions: 150000, clicks: 3000, ctr: 0.02 },
                    { platform: 'Google Ads', spend: 2000, impressions: 200000, clicks: 4000, ctr: 0.02 },
                    { platform: 'Instagram', spend: 1000, impressions: 100000, clicks: 2000, ctr: 0.02 },
                ],
                updatedAt: new Date(),
            };
            return metrics;
        }
        catch (error) {
            this.logger.error('Failed to get ad performance metrics:', error.message);
            throw error;
        }
    }
    async getLearningInsights() {
        try {
            const insights = [
                {
                    id: 'insight_1',
                    title: 'Improved Response Time',
                    description: 'Average response time has decreased by 15% after implementing new AI models',
                    category: 'conversation',
                    confidence: 0.85,
                    actionItems: [
                        'Continue monitoring response times',
                        'Identify bottlenecks in conversation flow',
                        'Optimize AI model parameters'
                    ],
                    createdAt: new Date(),
                },
                {
                    id: 'insight_2',
                    title: 'Seasonal Sales Pattern',
                    description: 'Sales peak during weekends and holidays, with 30% higher conversion rates',
                    category: 'sales',
                    confidence: 0.92,
                    actionItems: [
                        'Increase marketing efforts on weekends',
                        'Prepare special weekend offers',
                        'Schedule additional support during peak times'
                    ],
                    createdAt: new Date(),
                },
                {
                    id: 'insight_3',
                    title: 'Customer Sentiment Shift',
                    description: 'Positive sentiment increased after product update announcement',
                    category: 'marketing',
                    confidence: 0.78,
                    actionItems: [
                        'Continue monitoring sentiment trends',
                        'Share positive feedback on social media',
                        'Address remaining negative feedback'
                    ],
                    createdAt: new Date(),
                },
            ];
            return insights;
        }
        catch (error) {
            this.logger.error('Failed to get learning insights:', error.message);
            throw error;
        }
    }
    async getCrossBusinessRecommendations() {
        try {
            const recommendations = [
                {
                    id: 'rec_1',
                    title: 'Expand to LinkedIn',
                    description: 'Based on your success with Facebook and Instagram, LinkedIn could be a valuable new channel for B2B leads',
                    businessArea: 'marketing',
                    confidence: 0.85,
                    potentialImpact: 'high',
                    implementationSteps: [
                        'Create LinkedIn business account',
                        'Develop B2B content strategy',
                        'Allocate 10% of current ad budget to LinkedIn',
                        'Monitor performance for 30 days'
                    ],
                    createdAt: new Date(),
                },
                {
                    id: 'rec_2',
                    title: 'Implement Chatbots for Support',
                    description: 'Automate 60% of common support queries to reduce response time and cost',
                    businessArea: 'support',
                    confidence: 0.91,
                    potentialImpact: 'medium',
                    implementationSteps: [
                        'Identify top 10 support queries',
                        'Develop chatbot responses',
                        'Test with small user group',
                        'Deploy to all channels'
                    ],
                    createdAt: new Date(),
                },
                {
                    id: 'rec_3',
                    title: 'Personalized Email Campaigns',
                    description: 'Segment customers based on conversation history for more targeted email marketing',
                    businessArea: 'marketing',
                    confidence: 0.76,
                    potentialImpact: 'high',
                    implementationSteps: [
                        'Analyze customer conversation data',
                        'Create customer segments',
                        'Design personalized email templates',
                        'Launch A/B testing'
                    ],
                    createdAt: new Date(),
                },
            ];
            return recommendations;
        }
        catch (error) {
            this.logger.error('Failed to get cross-business recommendations:', error.message);
            throw error;
        }
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = DashboardService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map