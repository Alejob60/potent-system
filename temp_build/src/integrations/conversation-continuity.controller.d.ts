import { ConversationContinuityService, CrossChannelConversation } from './conversation-continuity.service';
export declare class ConversationContinuityController {
    private readonly continuityService;
    constructor(continuityService: ConversationContinuityService);
    startCrossChannelConversation(recipientId: string, initialChannel: string, initialConversationId: string, tenantId?: string, contextId?: string): Promise<{
        success: boolean;
        data: CrossChannelConversation;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    addChannelToConversation(conversationId: string, channelId: string, conversationIdInChannel: string): Promise<{
        success: boolean;
        data: CrossChannelConversation;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getCrossChannelConversation(conversationId: string): Promise<{
        success: boolean;
        data: CrossChannelConversation;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getConversationsForRecipient(recipientId: string): Promise<{
        success: boolean;
        data: CrossChannelConversation[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    endCrossChannelConversation(conversationId: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    getTransitions(conversationId: string): Promise<{
        success: boolean;
        data: import("./conversation-continuity.service").ConversationTransition[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    findActiveConversationForRecipient(recipientId: string): Promise<{
        success: boolean;
        data: CrossChannelConversation;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
}
