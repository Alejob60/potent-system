import { IAOrchestratorService } from './ia-orchestrator.service';
export declare class IAOrchestratorController {
    private readonly orchestratorService;
    private readonly logger;
    constructor(orchestratorService: IAOrchestratorService);
    processMessage(payload: {
        message: string;
        sessionId: string;
        channelId?: string;
        channelType?: string;
    }): Promise<any>;
    getChatHistory(sessionId: string): Promise<any>;
    clearChatHistory(sessionId: string): Promise<any>;
    getAnalytics(sessionId: string): Promise<any>;
    sendFeedback(payload: {
        sessionId: string;
        messageId: string;
        feedback: 'positive' | 'negative';
        comment?: string;
    }): Promise<any>;
}
