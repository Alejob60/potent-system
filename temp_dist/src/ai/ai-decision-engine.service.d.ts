import { SessionContext, UserPreferences } from '../state/state-management.service';
export interface DecisionInput {
    message: string;
    context: SessionContext & {
        siteType?: string;
        products?: string[];
        services?: string[];
        origin?: string;
        websiteUrl?: string;
    };
    conversationHistory: Array<{
        content: string;
        type: string;
        agent?: string;
    }>;
    userPreferences: UserPreferences;
}
export interface AgentDecision {
    primaryAgent: string;
    supportingAgents: string[];
    confidence: number;
    reasoning: string;
    taskType: 'single_post' | 'campaign' | 'media_generation' | 'analysis' | 'planning' | 'sales_inquiry' | 'product_info' | 'service_info' | 'website_analysis';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    estimatedDuration: number;
    requiredResources: string[];
}
export interface IntentAnalysis {
    intent: string;
    entities: {
        [key: string]: string;
    };
    sentiment: 'positive' | 'neutral' | 'negative';
    urgency: number;
    complexity: number;
}
export declare class AIDecisionEngine {
    private readonly logger;
    private readonly intentPatterns;
    private readonly channelPatterns;
    private readonly agentCapabilities;
    analyzeIntent(input: DecisionInput): Promise<IntentAnalysis>;
    makeDecision(input: DecisionInput): Promise<AgentDecision>;
    private selectPrimaryAgent;
    private selectSupportingAgents;
    private calculateConfidence;
    private mapIntentToTaskType;
    private calculatePriority;
    private estimateDuration;
    private identifyRequiredResources;
    private isSalesWebsite;
    private getTenantType;
    private generateReasoning;
    private calculateComplexity;
}
