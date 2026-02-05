export interface WorkflowStepDefinition {
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
}
export declare class WorkflowDefinitionEntity {
    id: string;
    name: string;
    description: string;
    steps: WorkflowStepDefinition[];
    status: 'draft' | 'active' | 'inactive' | 'archived';
    version: string;
    tenantId: string;
    createdBy: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    activatedAt: Date;
    deactivatedAt: Date;
}
