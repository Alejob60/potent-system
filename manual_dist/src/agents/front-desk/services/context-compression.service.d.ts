import { FrontDeskConversation } from '../entities/front-desk-conversation.entity';
export declare class ContextCompressionService {
    compressConversationHistory(conversations: FrontDeskConversation[], maxContextLength?: number): FrontDeskConversation[];
    private summarizeOlderConversations;
    private summarizeText;
    private compressCollectedInfo;
    extractKeyContext(conversations: FrontDeskConversation[]): {
        objective: string;
        targetAgent: string;
        collectedInfo: any;
        confidence: number;
        emotion: string;
        entities: any;
        context: any;
    };
    generateContextSummary(conversations: FrontDeskConversation[]): {
        summary: string;
        keyPoints: string[];
        lastObjective: string;
        completionStatus: 'complete' | 'incomplete';
        emotion: string;
        entities: any;
    };
}
