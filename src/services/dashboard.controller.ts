import { Controller, Get, Logger } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
// Swagger imports
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('colombiatic-dashboard')
@Controller('colombiatic')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly dashboardService: DashboardService) {}

  @Get('dashboard/summary')
  @ApiOperation({
    summary: 'Get dashboard summary',
    description: 'Retrieve summary data for the ColombiaTIC dashboard',
  })
  @ApiResponse({ 
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
  })
  async getDashboardSummary() {
    try {
      const data = await this.dashboardService.getDashboardSummary();
      return {
        success: true,
        data,
      };
    } catch (error) {
      this.logger.error('Failed to get dashboard summary:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('analytics/conversations')
  @ApiOperation({
    summary: 'Get conversation metrics',
    description: 'Retrieve conversation analytics and metrics',
  })
  @ApiResponse({ 
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
  })
  async getConversationMetrics() {
    try {
      const data = await this.dashboardService.getConversationMetrics();
      return {
        success: true,
        data,
      };
    } catch (error) {
      this.logger.error('Failed to get conversation metrics:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('analytics/sales')
  @ApiOperation({
    summary: 'Get sales metrics',
    description: 'Retrieve sales analytics and metrics',
  })
  @ApiResponse({ 
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
  })
  async getSalesMetrics() {
    try {
      const data = await this.dashboardService.getSalesMetrics();
      return {
        success: true,
        data,
      };
    } catch (error) {
      this.logger.error('Failed to get sales metrics:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('analytics/ads')
  @ApiOperation({
    summary: 'Get ad performance metrics',
    description: 'Retrieve advertising performance analytics and metrics',
  })
  @ApiResponse({ 
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
  })
  async getAdPerformanceMetrics() {
    try {
      const data = await this.dashboardService.getAdPerformanceMetrics();
      return {
        success: true,
        data,
      };
    } catch (error) {
      this.logger.error('Failed to get ad performance metrics:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('learning/insights')
  @ApiOperation({
    summary: 'Get learning insights',
    description: 'Retrieve AI learning insights and recommendations',
  })
  @ApiResponse({ 
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
  })
  async getLearningInsights() {
    try {
      const data = await this.dashboardService.getLearningInsights();
      return {
        success: true,
        data,
      };
    } catch (error) {
      this.logger.error('Failed to get learning insights:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('recommendations/cross-business')
  @ApiOperation({
    summary: 'Get cross-business recommendations',
    description: 'Retrieve cross-business recommendations based on AI analysis',
  })
  @ApiResponse({ 
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
  })
  async getCrossBusinessRecommendations() {
    try {
      const data = await this.dashboardService.getCrossBusinessRecommendations();
      return {
        success: true,
        data,
      };
    } catch (error) {
      this.logger.error('Failed to get cross-business recommendations:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}