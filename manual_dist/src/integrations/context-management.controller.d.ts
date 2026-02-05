import { ContextManagementService, ConversationContext, ContextUpdate } from './context-management.service';
export declare class ContextManagementController {
    private readonly contextService;
    constructor(contextService: ContextManagementService);
    createContext(channelId: string, recipientId: string, tenantId?: string, sessionId?: string): Promise<{
        success: boolean;
        data: ConversationContext;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getContext(channelId: string, recipientId: string): Promise<{
        success: boolean;
        data: ConversationContext;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    updateContext(channelId: string, recipientId: string, updates: ContextUpdate): Promise<{
        success: boolean;
        data: ConversationContext;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    deleteContext(channelId: string, recipientId: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    getContextsForRecipient(recipientId: string): Promise<{
        success: boolean;
        data: ConversationContext[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    clearExpiredContexts(maxAge?: number): Promise<{
        success: boolean;
        data: number;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
}
