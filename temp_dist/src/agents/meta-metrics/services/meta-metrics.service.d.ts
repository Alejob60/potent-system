import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
import { AgentAnalyticsReporterService } from '../../agent-analytics-reporter/services/agent-analytics-reporter.service';
import { HistoricalComparisonResult, Bottleneck, Recommendation } from '../interfaces/metrics.interface';
export declare class MetaMetricsService {
    private readonly stateManager;
    private readonly websocketGateway;
    private readonly analyticsReporter;
    private readonly logger;
    private agentesRegistrados;
    private historicoMetricas;
    constructor(stateManager: StateManagementService, websocketGateway: WebSocketGatewayService, analyticsReporter: AgentAnalyticsReporterService);
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
            bottleneckDetection: Bottleneck[];
            optimizationRecommendations: Recommendation[];
        };
        historicalComparison: HistoricalComparisonResult | null;
        timestamp: string;
    }>;
    private compararConHistorico;
    private generateCompositeMetrics;
    private calculateViralResonanceIndex;
    private calculateEmotionalActivationRate;
    private calculateContentScalabilityCurve;
    private calculateAdvancedMetrics;
    private calculateSystemHealth;
    private calculatePerformanceTrends;
    private detectBottlenecks;
    private generateOptimizationRecommendations;
}
