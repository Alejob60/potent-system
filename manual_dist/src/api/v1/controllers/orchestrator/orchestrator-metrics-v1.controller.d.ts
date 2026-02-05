import { OrchestratorMetricsService } from '../../../../common/orchestrator/orchestrator-metrics.service';
export declare class OrchestratorMetricsV1Controller {
    private readonly metricsService;
    constructor(metricsService: OrchestratorMetricsService);
    getMetrics(): Promise<import("../../../../common/orchestrator/orchestrator-metrics.service").OrchestratorMetrics>;
    getAgentMetrics(agentName: string): Promise<import("../../../../common/orchestrator/orchestrator-metrics.service").AgentMetric | {
        message: string;
    }>;
    getWorkflowExecution(workflowId: string): Promise<import("../../../../common/orchestrator/orchestrator-metrics.service").WorkflowExecutionRecord | {
        message: string;
    }>;
    getRecentExecutions(limit?: number): Promise<import("../../../../common/orchestrator/orchestrator-metrics.service").WorkflowExecutionRecord[]>;
    getDashboard(): Promise<{
        metrics: {
            workflowsExecuted: number;
            successfulWorkflows: number;
            failedWorkflows: number;
            averageExecutionTime: number;
        };
        topAgents: {
            executions: number;
            successRate: number;
            averageResponseTime: number;
            errors: number;
            lastExecution: Date;
            name: string;
        }[];
        recentExecutions: never[];
    }>;
}
