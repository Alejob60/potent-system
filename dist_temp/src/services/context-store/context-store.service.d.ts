import { RedisService } from '../../common/redis/redis.service';
import { Repository } from 'typeorm';
import { ContextBundle } from '../../entities/context-bundle.entity';
export interface GlobalContext {
    tenantId: string;
    sessionId: string;
    userId?: string;
    conversationHistory: Array<{
        role: 'user' | 'assistant' | 'system';
        content: string;
        timestamp: Date;
        metadata?: Record<string, any>;
    }>;
    agentStates: Record<string, {
        status: 'idle' | 'processing' | 'completed' | 'failed';
        lastActive: Date;
        data?: any;
    }>;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    version: number;
}
export declare class ContextStoreService {
    private readonly redisService;
    private readonly contextRepository;
    private readonly logger;
    private readonly CONTEXT_TTL;
    private readonly CONTEXT_PREFIX;
    constructor(redisService: RedisService, contextRepository: Repository<ContextBundle>);
    getContext(tenantId: string, sessionId: string): Promise<GlobalContext | null>;
    saveContext(context: GlobalContext): Promise<void>;
    createContext(tenantId: string, sessionId: string, userId?: string): Promise<GlobalContext>;
    addConversationMessage(tenantId: string, sessionId: string, role: 'user' | 'assistant' | 'system', content: string, metadata?: Record<string, any>): Promise<void>;
    updateAgentState(tenantId: string, sessionId: string, agentName: string, status: 'idle' | 'processing' | 'completed' | 'failed', data?: any): Promise<void>;
    deleteContext(tenantId: string, sessionId: string): Promise<void>;
    cleanupExpiredContexts(): Promise<number>;
    private buildCacheKey;
    private compressContext;
    private deserializeContext;
    private contextToDbEntity;
    private dbEntityToContext;
    private cacheContext;
}
