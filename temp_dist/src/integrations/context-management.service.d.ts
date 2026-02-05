export interface ConversationContext {
    id: string;
    channelId: string;
    recipientId: string;
    tenantId?: string;
    sessionId?: string;
    language: string;
    timezone: string;
    variables: Map<string, any>;
    history: MessageHistory[];
    createdAt: Date;
    updatedAt: Date;
}
export interface MessageHistory {
    id: string;
    timestamp: Date;
    direction: 'inbound' | 'outbound';
    content: string;
    metadata?: any;
}
export interface ContextUpdate {
    variables?: Record<string, any>;
    language?: string;
    timezone?: string;
    appendToHistory?: MessageHistory;
}
export declare class ContextManagementService {
    private readonly logger;
    private readonly contexts;
    private readonly defaultContext;
    createContext(channelId: string, recipientId: string, tenantId?: string, sessionId?: string): ConversationContext;
    getContext(channelId: string, recipientId: string, tenantId?: string, sessionId?: string): ConversationContext;
    updateContext(channelId: string, recipientId: string, updates: ContextUpdate): ConversationContext;
    deleteContext(channelId: string, recipientId: string): boolean;
    getContextsForRecipient(recipientId: string): ConversationContext[];
    clearExpiredContexts(maxAge?: number): number;
    private generateContextId;
}
