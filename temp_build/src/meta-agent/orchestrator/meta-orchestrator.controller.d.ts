import { Request } from 'express';
import { MetaOrchestratorService } from './meta-orchestrator.service';
import { WorkflowDefinitionEntity, WorkflowStepDefinition } from './workflow-definition.entity';
import { WorkflowExecutionEntity } from './workflow-execution.entity';
export declare class MetaOrchestratorController {
    private readonly orchestratorService;
    private readonly logger;
    constructor(orchestratorService: MetaOrchestratorService);
    createWorkflow(req: Request, body: {
        name: string;
        description: string;
        steps: WorkflowStepDefinition[];
        metadata?: Record<string, any>;
    }): Promise<{
        success: boolean;
        data: WorkflowDefinitionEntity;
        message: string;
    }>;
    activateWorkflow(req: Request, workflowId: string): Promise<{
        success: boolean;
        data: WorkflowDefinitionEntity;
        message: string;
    }>;
    executeWorkflow(req: Request, workflowId: string, body: {
        sessionId: string;
        inputData: Record<string, any>;
        userId?: string;
        metadata?: Record<string, any>;
    }): Promise<{
        success: boolean;
        data: import("./meta-orchestrator.service").WorkflowExecutionResult;
        message: string;
    }>;
    getWorkflow(req: Request, workflowId: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: WorkflowDefinitionEntity;
        message: string;
    }>;
    listWorkflows(req: Request, status?: string, limit?: number, offset?: number): Promise<{
        success: boolean;
        data: {
            workflows: WorkflowDefinitionEntity[];
            total: number;
            limit: number;
            offset: number;
        };
        message: string;
    }>;
    getExecution(req: Request, executionId: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: WorkflowExecutionEntity;
        message: string;
    }>;
    listExecutions(req: Request, workflowId?: string, status?: string, limit?: number, offset?: number): Promise<{
        success: boolean;
        data: {
            executions: WorkflowExecutionEntity[];
            total: number;
            limit: number;
            offset: number;
        };
        message: string;
    }>;
    cancelExecution(req: Request, executionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
