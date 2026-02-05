export declare class FrontDeskConversation {
    id: string;
    sessionId: string;
    userId: string;
    userMessage: string;
    agentResponse: string;
    objective: string;
    targetAgent: string;
    collectedInfo: any;
    missingInfo: string[];
    language: string;
    confidence: number;
    emotion: string;
    entities: any;
    context: any;
    integrationId: string;
    integrationStatus: string;
    createdAt: Date;
    updatedAt: Date;
}
