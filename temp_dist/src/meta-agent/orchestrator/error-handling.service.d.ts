import { RedisService } from '../../common/redis/redis.service';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';
import { StateManagementService } from '../../state/state-management.service';
export interface ErrorInfo {
    id: string;
    type: string;
    message: string;
    stack?: string;
    context?: Record<string, any>;
    severity: 'low' | 'medium' | 'high' | 'critical';
    component: string;
    sessionId?: string;
    workflowId?: string;
    executionId?: string;
    timestamp: Date;
    resolved: boolean;
    resolution?: string;
    metadata?: Record<string, any>;
}
export interface ErrorHandlingPolicy {
    component: string;
    errorType: string;
    action: 'retry' | 'failover' | 'ignore' | 'notify' | 'escalate';
    maxRetries?: number;
    retryDelay?: number;
    failoverTarget?: string;
    notificationChannels?: string[];
    escalationLevel?: 'level1' | 'level2' | 'level3';
}
export interface RecoveryStrategy {
    id: string;
    name: string;
    description: string;
    steps: string[];
    successCriteria: string;
    estimatedDuration: number;
    requiredResources: string[];
}
export declare class ErrorHandlingService {
    private readonly redisService;
    private readonly websocketGateway;
    private readonly stateManager;
    private readonly logger;
    private readonly ERROR_PREFIX;
    private readonly ERROR_POLICY_PREFIX;
    private readonly RECOVERY_STRATEGY_PREFIX;
    private readonly ERROR_STATS_PREFIX;
    constructor(redisService: RedisService, websocketGateway: WebSocketGatewayService, stateManager: StateManagementService);
    recordError(errorInfo: Omit<ErrorInfo, 'id' | 'timestamp' | 'resolved'>): Promise<boolean>;
    getError(errorId: string): Promise<ErrorInfo | null>;
    listErrors(component?: string, severity?: string, resolved?: boolean, limit?: number): Promise<ErrorInfo[]>;
    resolveError(errorId: string, resolution: string): Promise<boolean>;
    handleError(error: ErrorInfo): Promise<boolean>;
    createErrorPolicy(policy: ErrorHandlingPolicy): Promise<boolean>;
    getErrorPolicy(component: string, errorType: string): Promise<ErrorHandlingPolicy | null>;
    createRecoveryStrategy(strategy: RecoveryStrategy): Promise<boolean>;
    getRecoveryStrategy(strategyId: string): Promise<RecoveryStrategy | null>;
    executeRecoveryStrategy(strategyId: string, context: Record<string, any>): Promise<boolean>;
    getErrorStats(component?: string): Promise<Record<string, number>>;
    private updateErrorStats;
    private notifyOnError;
    private notifyOnResolution;
    private handleRetry;
    private handleFailover;
    private handleIgnore;
    private handleNotify;
    private handleEscalate;
    private defaultErrorHandling;
    private generateErrorId;
}
