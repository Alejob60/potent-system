export interface ShortContextData {
    summary: string;
    lastIntent: string;
    entities: Record<string, any>;
    conversationState: 'greeting' | 'information_gathering' | 'processing' | 'closing' | 'escalated';
}
export interface ConversationTurn {
    role: 'user' | 'agent';
    text: string;
    timestamp: string;
    metadata?: {
        tokensUsed?: number;
        embeddingsRetrieved?: number;
        actions?: string[];
    };
}
export declare class SessionContextEntity {
    id: string;
    sessionId: string;
    tenantId: string;
    userId?: string;
    channel: string;
    shortContext: ShortContextData;
    recentTurns: ConversationTurn[];
    turnCount: number;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    expiresAt?: Date;
    isActive: boolean;
}
