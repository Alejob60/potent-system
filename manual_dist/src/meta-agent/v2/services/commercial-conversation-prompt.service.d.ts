export interface UserFlowContext {
    isAuthenticated: boolean;
    currentLocation: 'landing' | 'dashboard' | 'checkout' | 'unknown';
    selectedService?: {
        id: string;
        name: string;
        category: string;
    };
    intent?: 'explore' | 'purchase' | 'compare' | 'support' | 'configure';
    conversationHistory?: string[];
    incompleteProcess?: {
        type: 'purchase' | 'activation' | 'configuration';
        serviceId: string;
        step: number;
    };
}
export declare class CommercialConversationPromptService {
    private readonly logger;
    generateCommercialPrompt(tenantName: string, userContext: UserFlowContext): string;
    private getBaseRolePrompt;
    private getFlowRules;
    private getUnauthenticatedFlowRules;
    private getAuthenticatedFlowRules;
    private getGenericFlowRules;
    private getBehaviorGuidelines;
    private getCatalogInstructions;
    private getActionFormat;
    getContextEnhancement(userContext: UserFlowContext): string;
}
