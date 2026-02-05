import { Logger } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';
import { StateManagementService } from '../../state/state-management.service';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';
export interface AgentConfig {
    name: string;
    version: string;
    description: string;
    capabilities: string[];
    category?: string;
    priority?: number;
}
export interface AgentMetrics {
    requestsProcessed: number;
    successRate: number;
    avgResponseTime: number;
    errors: number;
    lastActive: Date;
}
export interface AgentResult {
    success: boolean;
    data?: any;
    error?: string;
    metrics?: Partial<AgentMetrics>;
}
export declare abstract class AgentBase {
    protected readonly redisService?: RedisService | undefined;
    protected readonly stateManager?: StateManagementService | undefined;
    protected readonly websocketGateway?: WebSocketGatewayService | undefined;
    protected readonly logger: Logger;
    protected readonly config: AgentConfig;
    protected metrics: AgentMetrics;
    constructor(name: string, description: string, capabilities: string[], redisService?: RedisService | undefined, stateManager?: StateManagementService | undefined, websocketGateway?: WebSocketGatewayService | undefined);
    abstract execute(payload: any): Promise<AgentResult>;
    abstract validate(payload: any): Promise<boolean>;
    reportMetrics(): Promise<AgentMetrics>;
    protected updateMetrics(updates: Partial<AgentMetrics>): void;
    protected handleError(error: Error, context: string): AgentResult;
    protected retryWithBackoff<T>(operation: () => Promise<T>, maxRetries?: number, delay?: number): Promise<T>;
    protected cacheData(key: string, data: any, ttl?: number): Promise<void>;
    protected getCachedData(key: string): Promise<any>;
    protected batchProcess<T>(operations: Array<() => Promise<T>>, concurrency?: number): Promise<T[]>;
    protected scheduleTask<T>(task: () => Promise<T>, delay: number): Promise<T>;
    private registerAgent;
    private reportMetricsToRedis;
    protected formatResponse(data: any): AgentResult;
    protected logActivity(sessionId: string, activity: string, data?: any): void;
}
