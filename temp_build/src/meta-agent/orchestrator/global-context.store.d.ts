import { RedisService } from '../../common/redis/redis.service';
import { StateManagementService } from '../../state/state-management.service';
export interface GlobalContext {
    sessionId: string;
    tenantId: string;
    userId?: string;
    workflowId?: string;
    executionId?: string;
    sharedData: Record<string, any>;
    agentStates: Record<string, any>;
    metrics: {
        startTime: Date;
        lastUpdate: Date;
        stepCount: number;
        agentInvocations: number;
    };
    security: {
        permissions: string[];
        accessTokens: Record<string, string>;
        auditTrail: Array<{
            action: string;
            timestamp: Date;
            actor: string;
            details?: any;
        }>;
    };
}
export declare class GlobalContextStore {
    private readonly redisService;
    private readonly stateManager;
    private readonly logger;
    private readonly CONTEXT_PREFIX;
    private readonly CONTEXT_TTL;
    constructor(redisService: RedisService, stateManager: StateManagementService);
    createContext(sessionId: string, tenantId: string, userId?: string): Promise<GlobalContext>;
    getContext(sessionId: string): Promise<GlobalContext | null>;
    saveContext(context: GlobalContext): Promise<boolean>;
    updateSharedData(sessionId: string, data: Record<string, any>): Promise<boolean>;
    updateAgentState(sessionId: string, agentName: string, state: any): Promise<boolean>;
    incrementStepCount(sessionId: string): Promise<boolean>;
    addAuditTrailEntry(sessionId: string, action: string, actor: string, details?: any): Promise<boolean>;
    setWorkflowExecution(sessionId: string, workflowId: string, executionId: string): Promise<boolean>;
    deleteContext(sessionId: string): Promise<boolean>;
}
