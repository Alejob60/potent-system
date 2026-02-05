export interface CrossChannelConversation {
    id: string;
    recipientId: string;
    tenantId?: string;
    channels: ChannelParticipation[];
    contextId: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}
export interface ChannelParticipation {
    channelId: string;
    conversationId: string;
    startedAt: Date;
    endedAt?: Date;
    isActive: boolean;
}
export interface ConversationTransition {
    fromChannel: string;
    toChannel: string;
    reason: string;
    timestamp: Date;
    metadata?: any;
}
export declare class ConversationContinuityService {
    private readonly logger;
    private readonly conversations;
    private readonly transitions;
    startCrossChannelConversation(recipientId: string, initialChannel: string, initialConversationId: string, tenantId?: string, contextId?: string): CrossChannelConversation;
    addChannelToConversation(conversationId: string, channelId: string, conversationIdInChannel: string): CrossChannelConversation;
    getCrossChannelConversation(conversationId: string): CrossChannelConversation | null;
    getConversationsForRecipient(recipientId: string): CrossChannelConversation[];
    endCrossChannelConversation(conversationId: string): boolean;
    recordTransition(conversationId: string, fromChannel: string, toChannel: string, reason: string, metadata?: any): void;
    getTransitions(conversationId: string): ConversationTransition[];
    findActiveConversationForRecipient(recipientId: string): CrossChannelConversation | null;
    private generateConversationId;
    private generateContextId;
}
