export interface ActionRecord {
    type: string;
    params: Record<string, any>;
    status: 'pending' | 'sent' | 'processing' | 'completed' | 'failed';
    target?: string;
    error?: string;
}
export declare class ConversationTurnEntity {
    id: string;
    sessionId: string;
    tenantId: string;
    correlationId: string;
    role: 'user' | 'agent';
    text: string;
    actions?: ActionRecord[];
    metadata?: {
        channel?: string;
        tokensUsed?: number;
        embeddingsRetrieved?: number;
        latencyMs?: number;
        model?: string;
        temperature?: number;
        [key: string]: any;
    };
    timestamp: Date;
    turnNumber?: number;
}
