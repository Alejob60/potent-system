import { TaskPlannerService } from '../task-planner/task-planner.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { ContextStoreService } from '../context-store/context-store.service';
export interface SagaStep {
    id: string;
    name: string;
    action: () => Promise<any>;
    compensation?: () => Promise<any>;
    timeout: number;
    retryCount: number;
    maxRetries: number;
}
export interface SagaTransaction {
    id: string;
    tenantId: string;
    sessionId: string;
    steps: SagaStep[];
    currentState: number;
    status: 'pending' | 'executing' | 'completed' | 'compensating' | 'failed';
    createdAt: Date;
    updatedAt: Date;
    result?: any;
    error?: string;
}
export declare class EnhancedMetaAgentService {
    private readonly taskPlanner;
    private readonly eventBus;
    private readonly contextStore;
    private readonly logger;
    private readonly sagas;
    private readonly STEP_TIMEOUT;
    private readonly MAX_RETRIES;
    constructor(taskPlanner: TaskPlannerService, eventBus: EventBusService, contextStore: ContextStoreService);
    processUserMessage(message: string, tenantId: string, sessionId: string, context?: any, userId?: string): Promise<{
        text: string;
        intent?: 'CREATE_NODE' | 'PROPOSE_STRATEGY' | 'EXECUTE_ACTION' | 'NONE';
        payload?: any;
        planId?: string;
        sagaId?: string;
    }>;
    processWithPlanning(payload: any): Promise<any>;
    private generateStructuredResponse;
    private detectUserIntent;
    private generateNodePayload;
    private extractPromptFromMessage;
    private mapActionToNodeType;
    getSagaStatus(sagaId: string): Promise<SagaTransaction | undefined>;
    getTenantSagas(tenantId: string): Promise<SagaTransaction[]>;
    private createAndExecuteSaga;
    private executeSaga;
    private compensateSaga;
    private analyzeInputForTrends;
    private extractTopics;
    private extractHashtags;
    private analyzeSentiment;
}
