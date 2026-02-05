import { WorkflowEngineService, WorkflowDefinition, WorkflowExecutionResult } from '../../../../common/workflow/workflow-engine.service';
import { PipelineStep, PipelineContext } from '../../../../common/workflow/pipeline-step.interface';
export declare class OrchestratorV1Controller {
    private readonly workflowEngine;
    constructor(workflowEngine: WorkflowEngineService);
    executeWorkflow(body: {
        workflow: WorkflowDefinition;
        context: PipelineContext;
    }): Promise<WorkflowExecutionResult>;
    createWorkflow(body: {
        name: string;
        description: string;
        steps: PipelineStep[];
    }): Promise<WorkflowDefinition>;
    executeAgent(agentName: string, body: {
        sessionId: string;
        params: Record<string, any>;
    }): Promise<{
        message: string;
        sessionId: string;
        params: Record<string, any>;
    }>;
    getMetrics(): Promise<{
        workflowsExecuted: number;
        successfulWorkflows: number;
        failedWorkflows: number;
        averageExecutionTime: number;
        agentMetrics: {
            'trend-scanner': {
                executions: number;
                successRate: number;
                averageResponseTime: number;
            };
            'video-scriptor': {
                executions: number;
                successRate: number;
                averageResponseTime: number;
            };
        };
    }>;
    getHealth(): Promise<{
        status: string;
        agents: {
            name: string;
            status: string;
            lastCheck: string;
        }[];
    }>;
}
