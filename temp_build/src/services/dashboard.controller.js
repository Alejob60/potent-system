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
var DashboardController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const dashboard_service_1 = require("./dashboard.service");
const swagger_1 = require("@nestjs/swagger");
let DashboardController = DashboardController_1 = class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
        this.logger = new common_1.Logger(DashboardController_1.name);
    }
    async getDashboardSummary() {
        try {
            const data = await this.dashboardService.getDashboardSummary();
            return {
                success: true,
                data,
            };
        }
        catch (error) {
            this.logger.error('Failed to get dashboard summary:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getConversationMetrics() {
        try {
            const data = await this.dashboardService.getConversationMetrics();
            return {
                success: true,
                data,
            };
        }
        catch (error) {
            this.logger.error('Failed to get conversation metrics:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getSalesMetrics() {
        try {
            const data = await this.dashboardService.getSalesMetrics();
            return {
                success: true,
                data,
            };
        }
        catch (error) {
            this.logger.error('Failed to get sales metrics:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getAdPerformanceMetrics() {
        try {
            const data = await this.dashboardService.getAdPerformanceMetrics();
            return {
                success: true,
                data,
            };
        }
        catch (error) {
            this.logger.error('Failed to get ad performance metrics:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getLearningInsights() {
        try {
            const data = await this.dashboardService.getLearningInsights();
            return {
                success: true,
                data,
            };
        }
        catch (error) {
            this.logger.error('Failed to get learning insights:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getCrossBusinessRecommendations() {
        try {
            const data = await this.dashboardService.getCrossBusinessRecommendations();
            return {
                success: true,
                data,
            };
        }
        catch (error) {
            this.logger.error('Failed to get cross-business recommendations:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('dashboard/summary'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get dashboard summary',
        description: 'Retrieve summary data for the ColombiaTIC dashboard',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Dashboard summary retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        leads: { type: 'number' },
                        sales: { type: 'number' },
                        satisfaction: { type: 'number' },
                        activeConversations: { type: 'number' },
                        totalConversations: { type: 'number' },
                        conversionRate: { type: 'number' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getDashboardSummary", null);
__decorate([
    (0, common_1.Get)('analytics/conversations'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get conversation metrics',
        description: 'Retrieve conversation analytics and metrics',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Conversation metrics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        totalMessages: { type: 'number' },
                        avgResponseTime: { type: 'number' },
                        sentimentScores: {
                            type: 'object',
                            properties: {
                                positive: { type: 'number' },
                                neutral: { type: 'number' },
                                negative: { type: 'number' },
                            },
                        },
                        emotionalTrends: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    date: { type: 'string' },
                                    positive: { type: 'number' },
                                    neutral: { type: 'number' },
                                    negative: { type: 'number' },
                                },
                            },
                        },
                        topTopics: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    topic: { type: 'string' },
                                    count: { type: 'number' },
                                },
                            },
                        },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getConversationMetrics", null);
__decorate([
    (0, common_1.Get)('analytics/sales'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get sales metrics',
        description: 'Retrieve sales analytics and metrics',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Sales metrics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        totalRevenue: { type: 'number' },
                        conversionRate: { type: 'number' },
                        avgDealSize: { type: 'number' },
                        salesByChannel: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    channel: { type: 'string' },
                                    revenue: { type: 'number' },
                                    count: { type: 'number' },
                                },
                            },
                        },
                        salesTrends: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    date: { type: 'string' },
                                    revenue: { type: 'number' },
                                },
                            },
                        },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getSalesMetrics", null);
__decorate([
    (0, common_1.Get)('analytics/ads'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get ad performance metrics',
        description: 'Retrieve advertising performance analytics and metrics',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Ad performance metrics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        totalSpend: { type: 'number' },
                        totalImpressions: { type: 'number' },
                        totalClicks: { type: 'number' },
                        ctr: { type: 'number' },
                        cpc: { type: 'number' },
                        roas: { type: 'number' },
                        performanceByPlatform: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    platform: { type: 'string' },
                                    spend: { type: 'number' },
                                    impressions: { type: 'number' },
                                    clicks: { type: 'number' },
                                    ctr: { type: 'number' },
                                },
                            },
                        },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getAdPerformanceMetrics", null);
__decorate([
    (0, common_1.Get)('learning/insights'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get learning insights',
        description: 'Retrieve AI learning insights and recommendations',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Learning insights retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            title: { type: 'string' },
                            description: { type: 'string' },
                            category: { type: 'string' },
                            confidence: { type: 'number' },
                            actionItems: { type: 'array', items: { type: 'string' } },
                            createdAt: { type: 'string', format: 'date-time' },
                        },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getLearningInsights", null);
__decorate([
    (0, common_1.Get)('recommendations/cross-business'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get cross-business recommendations',
        description: 'Retrieve cross-business recommendations based on AI analysis',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Cross-business recommendations retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            title: { type: 'string' },
                            description: { type: 'string' },
                            businessArea: { type: 'string' },
                            confidence: { type: 'number' },
                            potentialImpact: { type: 'string' },
                            implementationSteps: { type: 'array', items: { type: 'string' } },
                            createdAt: { type: 'string', format: 'date-time' },
                        },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getCrossBusinessRecommendations", null);
exports.DashboardController = DashboardController = DashboardController_1 = __decorate([
    (0, swagger_1.ApiTags)('colombiatic-dashboard'),
    (0, common_1.Controller)('colombiatic'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map