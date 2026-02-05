import { RedisService } from '../../common/redis/redis.service';
export interface AgentEvent {
    id: string;
    type: string;
    tenantId: string;
    sessionId: string;
    userId?: string;
    payload: any;
    timestamp: Date;
    correlationId?: string;
    source?: string;
    destination?: string;
    retryCount?: number;
    maxRetries?: number;
}
export interface EventSubscription {
    pattern: string;
    handler: (event: AgentEvent) => Promise<void>;
    options?: {
        concurrency?: number;
        autoAck?: boolean;
        deadLetterQueue?: string;
    };
}
export declare class EventBusService {
    private readonly redisService;
    private readonly logger;
    private readonly EVENT_PREFIX;
    private readonly RETRY_DELAY_BASE;
    private readonly MAX_RETRIES;
    private subscriptions;
    constructor(redisService: RedisService);
    publish(event: Omit<AgentEvent, 'id' | 'timestamp' | 'retryCount'>): Promise<string>;
    subscribe(pattern: string, handler: (event: AgentEvent) => Promise<void>, options?: EventSubscription['options']): Promise<string>;
    unsubscribe(subscriptionId: string): Promise<void>;
    publishWithRetry(event: Omit<AgentEvent, 'id' | 'timestamp' | 'retryCount'>, maxRetries?: number): Promise<string>;
    handleFailedEvent(event: AgentEvent, error: Error): Promise<void>;
    getStats(): Promise<any>;
    private getChannelName;
    private startListening;
    private processEvent;
    private calculateRetryDelay;
    private sendToDLQ;
}
