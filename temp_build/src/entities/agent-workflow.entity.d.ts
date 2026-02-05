export interface WorkflowStep {
    id: string;
    name: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'compensated';
    agent: string;
    payload: any;
    result: any;
    compensationHandler: string;
    startedAt?: Date;
    completedAt?: Date;
}
export declare class AgentWorkflow {
    id: string;
    sessionId: string;
    correlationId: string;
    workflowType: string;
    steps: WorkflowStep[];
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'compensated';
    result: any;
    createdAt: Date;
    updatedAt: Date;
    completedAt: Date;
}
