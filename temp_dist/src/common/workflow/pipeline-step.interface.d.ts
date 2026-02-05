import { AgentResult } from '../../agents/admin/services/admin-orchestrator.service';
export interface PipelineStep {
    id: string;
    name: string;
    description: string;
    agent: string;
    input: Record<string, any>;
    outputSchema?: Record<string, any>;
    timeout?: number;
    retryConfig?: {
        maxAttempts: number;
        delay: number;
        backoffMultiplier: number;
    };
    dependencies?: string[];
    parallel?: boolean;
    priority?: number;
    execute(context: PipelineContext): Promise<StepResult>;
}
export interface PipelineContext {
    sessionId: string;
    sharedData: Record<string, any>;
    stepResults: Record<string, StepResult>;
    userContext?: Record<string, any>;
}
export interface StepResult {
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
    agentResult?: AgentResult;
}
