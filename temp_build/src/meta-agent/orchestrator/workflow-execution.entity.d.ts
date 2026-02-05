import { WorkflowDefinitionEntity } from './workflow-definition.entity';
export interface StepExecutionResult {
    stepId: string;
    stepName: string;
    success: boolean;
    data?: any;
    error?: {
        message: string;
        code?: string;
        details?: any;
    };
    metrics?: {
        duration: number;
        startTime: Date;
        endTime: Date;
    };
    agentResult?: any;
}
export declare class WorkflowExecutionEntity {
    id: string;
    workflowId: string;
    workflow: WorkflowDefinitionEntity;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    tenantId: string;
    sessionId: string;
    inputData: Record<string, any>;
    stepResults: StepExecutionResult[];
    totalSteps: number;
    completedSteps: number;
    durationMs: number;
    error: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    startedAt: Date;
    completedAt: Date;
}
