import { Repository } from 'typeorm';
import { SessionContextEntity, ShortContextData } from '../entities/session-context.entity';
import { ConversationTurnEntity } from '../entities/conversation-turn.entity';
export interface RedisService {
    get(key: string): Promise<string | null>;
    setex(key: string, ttl: number, value: string): Promise<void>;
    del(key: string): Promise<void>;
}
export declare class SessionContextService {
    private readonly sessionContextRepo;
    private readonly conversationTurnRepo;
    private readonly logger;
    private readonly redisTTL;
    private readonly maxRecentTurns;
    constructor(sessionContextRepo: Repository<SessionContextEntity>, conversationTurnRepo: Repository<ConversationTurnEntity>);
    getOrCreateContext(sessionId: string, tenantId: string, channel: string, userId?: string): Promise<SessionContextEntity>;
    addConversationTurn(sessionId: string, tenantId: string, correlationId: string, role: 'user' | 'agent', text: string, actions?: any[], metadata?: Record<string, any>): Promise<ConversationTurnEntity>;
    updateShortContext(sessionId: string, tenantId: string, updates: Partial<ShortContextData>): Promise<void>;
    getRecentTurns(sessionId: string, tenantId: string, limit?: number): Promise<ConversationTurnEntity[]>;
    compressContext(context: SessionContextEntity): any;
    deleteSession(sessionId: string, tenantId: string): Promise<void>;
    getSessionSummary(sessionId: string, tenantId: string): Promise<any>;
}
