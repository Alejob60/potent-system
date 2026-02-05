import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface DashboardSummary {
  leads: number;
  sales: number;
  satisfaction: number;
  activeConversations: number;
  totalConversations: number;
  conversionRate: number;
  updatedAt: Date;
}

export interface ConversationMetrics {
  totalMessages: number;
  avgResponseTime: number;
  sentimentScores: {
    positive: number;
    neutral: number;
    negative: number;
  };
  emotionalTrends: {
    date: string;
    positive: number;
    neutral: number;
    negative: number;
  }[];
  topTopics: { topic: string; count: number }[];
  updatedAt: Date;
}

export interface SalesMetrics {
  totalRevenue: number;
  conversionRate: number;
  avgDealSize: number;
  salesByChannel: { channel: string; revenue: number; count: number }[];
  salesTrends: { date: string; revenue: number }[];
  updatedAt: Date;
}

export interface AdPerformanceMetrics {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  ctr: number;
  cpc: number;
  roas: number;
  performanceByPlatform: { platform: string; spend: number; impressions: number; clicks: number; ctr: number }[];
  updatedAt: Date;
}

export interface LearningInsight {
  id: string;
  title: string;
  description: string;
  category: 'conversation' | 'sales' | 'marketing' | 'general';
  confidence: number;
  actionItems: string[];
  createdAt: Date;
}

export interface CrossBusinessRecommendation {
  id: string;
  title: string;
  description: string;
  businessArea: string;
  confidence: number;
  potentialImpact: 'low' | 'medium' | 'high';
  implementationSteps: string[];
  createdAt: Date;
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);
  private readonly misybotApiUrl: string;
  private readonly apiKey: string;

  constructor(private readonly httpService: HttpService) {
    this.misybotApiUrl = process.env.MISYBOT_API_URL || 'https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net';
    this.apiKey = process.env.MISYBOT_API_KEY || '';
  }

  /**
   * Get dashboard summary data
   * @returns Dashboard summary
   */
  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      // In a real implementation, this would fetch data from the Misybot API
      // For now, we'll return mock data
      const summary: DashboardSummary = {
        leads: Math.floor(Math.random() * 1000) + 500,
        sales: Math.floor(Math.random() * 500) + 100,
        satisfaction: parseFloat((Math.random() * 0.5 + 0.5).toFixed(2)), // 0.5 to 1.0
        activeConversations: Math.floor(Math.random() * 50) + 10,
        totalConversations: Math.floor(Math.random() * 500) + 200,
        conversionRate: parseFloat((Math.random() * 0.3 + 0.1).toFixed(2)), // 0.1 to 0.4
        updatedAt: new Date(),
      };

      return summary;
    } catch (error) {
      this.logger.error('Failed to get dashboard summary:', error.message);
      throw error;
    }
  }

  /**
   * Get conversation metrics
   * @returns Conversation metrics
   */
  async getConversationMetrics(): Promise<ConversationMetrics> {
    try {
      // In a real implementation, this would fetch data from the Misybot API
      // For now, we'll return mock data
      const metrics: ConversationMetrics = {
        totalMessages: Math.floor(Math.random() * 10000) + 5000,
        avgResponseTime: parseFloat((Math.random() * 30 + 5).toFixed(1)), // 5 to 35 seconds
        sentimentScores: {
          positive: parseFloat((Math.random() * 0.4 + 0.4).toFixed(2)), // 0.4 to 0.8
          neutral: parseFloat((Math.random() * 0.3 + 0.1).toFixed(2)), // 0.1 to 0.4
          negative: parseFloat((Math.random() * 0.2).toFixed(2)), // 0.0 to 0.2
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
    } catch (error) {
      this.logger.error('Failed to get conversation metrics:', error.message);
      throw error;
    }
  }

  /**
   * Get sales metrics
   * @returns Sales metrics
   */
  async getSalesMetrics(): Promise<SalesMetrics> {
    try {
      // In a real implementation, this would fetch data from the Misybot API
      // For now, we'll return mock data
      const metrics: SalesMetrics = {
        totalRevenue: parseFloat((Math.random() * 100000 + 50000).toFixed(2)), // $50,000 to $150,000
        conversionRate: parseFloat((Math.random() * 0.2 + 0.05).toFixed(3)), // 5% to 25%
        avgDealSize: parseFloat((Math.random() * 1000 + 200).toFixed(2)), // $200 to $1,200
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
    } catch (error) {
      this.logger.error('Failed to get sales metrics:', error.message);
      throw error;
    }
  }

  /**
   * Get ad performance metrics
   * @returns Ad performance metrics
   */
  async getAdPerformanceMetrics(): Promise<AdPerformanceMetrics> {
    try {
      // In a real implementation, this would fetch data from the Misybot API
      // For now, we'll return mock data
      const metrics: AdPerformanceMetrics = {
        totalSpend: parseFloat((Math.random() * 5000 + 1000).toFixed(2)), // $1,000 to $6,000
        totalImpressions: Math.floor(Math.random() * 500000) + 100000, // 100,000 to 600,000
        totalClicks: Math.floor(Math.random() * 10000) + 2000, // 2,000 to 12,000
        ctr: parseFloat((Math.random() * 0.05 + 0.01).toFixed(4)), // 1% to 6%
        cpc: parseFloat((Math.random() * 2 + 0.5).toFixed(2)), // $0.50 to $2.50
        roas: parseFloat((Math.random() * 5 + 2).toFixed(2)), // 2x to 7x
        performanceByPlatform: [
          { platform: 'Facebook', spend: 1500, impressions: 150000, clicks: 3000, ctr: 0.02 },
          { platform: 'Google Ads', spend: 2000, impressions: 200000, clicks: 4000, ctr: 0.02 },
          { platform: 'Instagram', spend: 1000, impressions: 100000, clicks: 2000, ctr: 0.02 },
        ],
        updatedAt: new Date(),
      };

      return metrics;
    } catch (error) {
      this.logger.error('Failed to get ad performance metrics:', error.message);
      throw error;
    }
  }

  /**
   * Get learning insights
   * @returns Learning insights
   */
  async getLearningInsights(): Promise<LearningInsight[]> {
    try {
      // In a real implementation, this would fetch data from the Misybot API
      // For now, we'll return mock data
      const insights: LearningInsight[] = [
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
    } catch (error) {
      this.logger.error('Failed to get learning insights:', error.message);
      throw error;
    }
  }

  /**
   * Get cross-business recommendations
   * @returns Cross-business recommendations
   */
  async getCrossBusinessRecommendations(): Promise<CrossBusinessRecommendation[]> {
    try {
      // In a real implementation, this would fetch data from the Misybot API
      // For now, we'll return mock data
      const recommendations: CrossBusinessRecommendation[] = [
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
    } catch (error) {
      this.logger.error('Failed to get cross-business recommendations:', error.message);
      throw error;
    }
  }
}