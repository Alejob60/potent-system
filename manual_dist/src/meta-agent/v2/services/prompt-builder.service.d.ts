import { SessionContextEntity } from '../entities/session-context.entity';
import { ChatMessage } from './azure-openai-gpt5.service';
import { UserFlowContext } from './commercial-conversation-prompt.service';
export interface TenantADN {
    businessProfile?: {
        name: string;
        description: string;
        industry: string;
        tone: string;
    };
    brandingConfig?: {
        values: string[];
        communicationStyle: string;
    };
    policies?: {
        safetyGuidelines: string[];
        prohibitedTopics: string[];
        escalationRules: string[];
    };
    commercialMode?: {
        enabled: boolean;
        catalogAvailable: boolean;
        userFlowContext?: UserFlowContext;
    };
}
export interface RetrievedDocument {
    text: string;
    score: number;
    metadata?: {
        source?: string;
        category?: string;
        lang?: string;
    };
}
export declare class PromptBuilderService {
    private readonly logger;
    private readonly maxPromptTokens;
    private readonly commercialPromptService;
    constructor();
    private readonly safetyPolicy;
    buildPrompt(tenantADN: TenantADN, sessionContext: SessionContextEntity, retrievedDocs: RetrievedDocument[], userMessage: string): ChatMessage[];
    private buildSystemPrompt;
    private buildCommercialSystemPrompt;
    private buildContextPrompt;
    private buildConversationHistory;
    private guardTokenLimit;
    private estimateTokens;
    private getToneDescription;
    private translateState;
    buildActionGuidance(availableActions: string[]): string;
    buildIntentClassificationPrompt(userMessage: string): ChatMessage[];
}
