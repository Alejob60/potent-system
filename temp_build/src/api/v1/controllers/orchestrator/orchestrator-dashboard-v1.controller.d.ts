import { Observable } from 'rxjs';
import { OrchestratorMetricsService } from '../../../../common/orchestrator/orchestrator-metrics.service';
export declare class OrchestratorDashboardV1Controller {
    private readonly metricsService;
    constructor(metricsService: OrchestratorMetricsService);
    getDashboard(): Promise<{
        overview: {
            workflowsExecuted: number;
            successfulWorkflows: number;
            failedWorkflows: number;
            successRate: number;
            averageExecutionTime: number;
            lastUpdated: Date;
        };
        agentPerformance: {
            healthScore: number;
            topPerformers: {
                name: string;
                executions: number;
                successRate: number;
                averageResponseTime: number;
                errors: number;
            }[];
        };
        systemStatus: {
            status: string;
            lastUpdated: Date;
        };
    }>;
    sse(): Observable<any>;
    private getDashboardData;
}
