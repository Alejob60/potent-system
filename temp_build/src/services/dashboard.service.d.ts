import { HttpService } from '@nestjs/axios';
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
    topTopics: {
        topic: string;
        count: number;
    }[];
    updatedAt: Date;
}
export interface SalesMetrics {
    totalRevenue: number;
    conversionRate: number;
    avgDealSize: number;
    salesByChannel: {
        channel: string;
        revenue: number;
        count: number;
    }[];
    salesTrends: {
        date: string;
        revenue: number;
    }[];
    updatedAt: Date;
}
export interface AdPerformanceMetrics {
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    ctr: number;
    cpc: number;
    roas: number;
    performanceByPlatform: {
        platform: string;
        spend: number;
        impressions: number;
        clicks: number;
        ctr: number;
    }[];
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
export declare class DashboardService {
    private readonly httpService;
    private readonly logger;
    private readonly misybotApiUrl;
    private readonly apiKey;
    constructor(httpService: HttpService);
    getDashboardSummary(): Promise<DashboardSummary>;
    getConversationMetrics(): Promise<ConversationMetrics>;
    getSalesMetrics(): Promise<SalesMetrics>;
    getAdPerformanceMetrics(): Promise<AdPerformanceMetrics>;
    getLearningInsights(): Promise<LearningInsight[]>;
    getCrossBusinessRecommendations(): Promise<CrossBusinessRecommendation[]>;
}
