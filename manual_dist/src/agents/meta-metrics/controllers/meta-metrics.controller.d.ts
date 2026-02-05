import { MetaMetricsService } from '../services/meta-metrics.service';
export declare class MetaMetricsController {
    private readonly service;
    constructor(service: MetaMetricsService);
    getAggregateMetrics(): Promise<{
        timestamp: string;
        metrics: {};
        compositeMetrics: {
            viralResonanceIndex: number;
            emotionalActivationRate: number;
            contentScalabilityCurve: {};
        };
    }>;
    getAgentMetrics(agent: string): Promise<{
        agent: string;
        metrics: {
            reportsGenerated: number;
            dataPoints: any;
            lastReport: Date | null;
        };
        reports: import("../../agent-analytics-reporter/entities/agent-analytics-reporter.entity").AgentAnalyticsReporter[];
    } | {
        agent: string;
        metrics: {
            requestsProcessed: number;
            successRate: number;
            avgResponseTime: number;
            errors: number;
            lastActive: string;
        };
        reports?: undefined;
    }>;
    generateInsights(params: any): Promise<{
        status: string;
        insights: {
            systemHealth: {
                healthScore: number;
                errorRate: number;
                totalErrors: number;
                totalRequests: number;
            };
            performanceTrends: {
                avgResponseTime: number;
                trend: string;
            };
            bottleneckDetection: import("../interfaces/metrics.interface").Bottleneck[];
            optimizationRecommendations: import("../interfaces/metrics.interface").Recommendation[];
        };
        historicalComparison: import("../interfaces/metrics.interface").HistoricalComparisonResult | null;
        timestamp: string;
    }>;
}
