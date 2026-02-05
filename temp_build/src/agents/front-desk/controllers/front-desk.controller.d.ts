import { FrontDeskService } from '../services/front-desk.service';
import { FrontDeskRequestDto } from '../dto/front-desk-request.dto';
import { IntegrationActivationDto } from '../dto/integration-activation.dto';
import { ContextCompressionService } from '../services/context-compression.service';
export declare class FrontDeskController {
    private readonly frontDeskService;
    private readonly contextCompressionService;
    constructor(frontDeskService: FrontDeskService, contextCompressionService: ContextCompressionService);
    processMessage(body: FrontDeskRequestDto): Promise<any>;
    activateIntegration(body: IntegrationActivationDto): Promise<{
        status: string;
        integrationId: string;
        platformResponse: any;
    }>;
    getAgentStatus(): Promise<any>;
    getIntegrationStatus(): Promise<{
        timestamp: string;
        integrations: {
            platform: string;
            status: string;
            lastChecked: string;
            connectedAccounts: number;
        }[];
    }>;
    getAllConversations(): Promise<import("../entities/front-desk-conversation.entity").FrontDeskConversation[]>;
    getConversationById(id: string): Promise<import("../entities/front-desk-conversation.entity").FrontDeskConversation | null>;
    getConversationsBySession(sessionId: string): Promise<import("../entities/front-desk-conversation.entity").FrontDeskConversation[]>;
    getSessionContext(sessionId: string): Promise<{
        sessionId: string;
        contextSummary: {
            summary: string;
            keyPoints: string[];
            lastObjective: string;
            completionStatus: "complete" | "incomplete";
            emotion: string;
            entities: any;
        };
        keyContext: {
            objective: string;
            targetAgent: string;
            collectedInfo: any;
            confidence: number;
            emotion: string;
            entities: any;
            context: any;
        };
    }>;
    getNextStepSuggestions(sessionId: string): Promise<{
        sessionId: string;
        suggestions: any[];
        availableAgents: string[];
    }>;
    private generateContextualSuggestions;
    private simulatePlatformIntegration;
}
