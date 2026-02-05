import { RedisService } from '../../common/redis/redis.service';
export interface OrchestratorMetrics {
    workflowsExecuted: number;
    successfulWorkflows: number;
    failedWorkflows: number;
    averageExecutionTime: number;
    agentMetrics: Record<string, AgentMetric>;
    lastUpdated: Date;
}
export interface AgentMetric {
    executions: number;
    successRate: number;
    averageResponseTime: number;
    errors: number;
    lastExecution: Date;
}
export interface WorkflowExecutionRecord {
    workflowId: string;
    status: 'success' | 'failure' | 'partial';
    duration: number;
    startTime: Date;
    endTime: Date;
    agentExecutions: AgentExecutionRecord[];
}
export interface AgentExecutionRecord {
    agent: string;
    status: 'success' | 'failure';
    duration: number;
    startTime: Date;
    endTime: Date;
    error?: string;
}
export declare class OrchestratorMetricsService {
    private readonly redisService;
    private readonly logger;
    private readonly METRICS_KEY;
    private readonly EXECUTIONS_KEY;
    constructor(redisService: RedisService);
    recordWorkflowExecution(executionRecord: WorkflowExecutionRecord): Promise<void>;
    getMetrics(): Promise<OrchestratorMetrics>;
    getRecentExecutions(limit?: number): Promise<WorkflowExecutionRecord[]>;
    resetMetrics(): Promise<void>;
    getAgentMetrics(agentName: string): Promise<AgentMetric | null>;
    getWorkflowExecution(workflowId: string): Promise<WorkflowExecutionRecord | null>;
}
