import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    private readonly logger;
    constructor(dashboardService: DashboardService);
    getDashboardSummary(): Promise<{
        success: boolean;
        data: import("./dashboard.service").DashboardSummary;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getConversationMetrics(): Promise<{
        success: boolean;
        data: import("./dashboard.service").ConversationMetrics;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getSalesMetrics(): Promise<{
        success: boolean;
        data: import("./dashboard.service").SalesMetrics;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getAdPerformanceMetrics(): Promise<{
        success: boolean;
        data: import("./dashboard.service").AdPerformanceMetrics;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getLearningInsights(): Promise<{
        success: boolean;
        data: import("./dashboard.service").LearningInsight[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getCrossBusinessRecommendations(): Promise<{
        success: boolean;
        data: import("./dashboard.service").CrossBusinessRecommendation[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
}
