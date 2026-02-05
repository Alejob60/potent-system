import { HttpService } from '@nestjs/axios';
export interface IAOrchestratorConfig {
    baseUrl: string;
    apiKey?: string;
    clientId?: string;
}
export interface ChatMessage {
    id: string;
    content: string;
    sender: 'user' | 'agent';
    timestamp: Date;
    channelId?: string;
    channelType?: string;
}
export interface AgentResponse {
    id: string;
    response: string;
    agentId: string;
    confidence: number;
    timestamp: Date;
    suggestedActions?: string[];
}
export declare class IAOrchestratorService {
    private readonly httpService;
    private readonly logger;
    private readonly config;
    private chatHistory;
    constructor(httpService: HttpService);
    processMessage(message: string, sessionId: string, channelId?: string, channelType?: string): Promise<AgentResponse>;
    getChatHistory(sessionId: string): ChatMessage[];
    clearChatHistory(sessionId: string): void;
    getAnalytics(sessionId: string): Promise<any>;
    sendFeedback(sessionId: string, messageId: string, feedback: 'positive' | 'negative', comment?: string): Promise<any>;
}
