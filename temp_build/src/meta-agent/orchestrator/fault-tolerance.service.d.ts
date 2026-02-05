import { RedisService } from '../../common/redis/redis.service';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';
import { StateManagementService } from '../../state/state-management.service';
export interface CircuitBreakerConfig {
    failureThreshold: number;
    timeout: number;
    resetTimeout: number;
}
export interface CircuitBreakerState {
    id: string;
    status: 'closed' | 'open' | 'half-open';
    failureCount: number;
    lastFailure: Date | null;
    nextAttempt: Date | null;
    config: CircuitBreakerConfig;
}
export interface RetryPolicy {
    maxAttempts: number;
    delay: number;
    backoffMultiplier: number;
    maxDelay: number;
}
export declare class FaultToleranceService {
    private readonly redisService;
    private readonly websocketGateway;
    private readonly stateManager;
    private readonly logger;
    private readonly CIRCUIT_BREAKER_PREFIX;
    private readonly RETRY_POLICY_PREFIX;
    private readonly FAILURE_LOG_PREFIX;
    constructor(redisService: RedisService, websocketGateway: WebSocketGatewayService, stateManager: StateManagementService);
    createCircuitBreaker(id: string, config: CircuitBreakerConfig): Promise<boolean>;
    canExecute(id: string): Promise<boolean>;
    reportSuccess(id: string): Promise<boolean>;
    reportFailure(id: string, error: any): Promise<boolean>;
    private logFailure;
    getCircuitBreakerState(id: string): Promise<CircuitBreakerState | null>;
    executeWithRetry<T>(id: string, fn: () => Promise<T>, policy?: RetryPolicy): Promise<T>;
    createRetryPolicy(id: string, policy: RetryPolicy): Promise<boolean>;
    getRetryPolicy(id: string): Promise<RetryPolicy | null>;
}
