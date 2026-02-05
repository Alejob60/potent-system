import { HttpService } from '@nestjs/axios';
export interface ColombiaTICAgentConfig {
    siteUrl: string;
    industry: string;
    language: string;
    tone: string;
    connectChannels: string[];
}
export interface ColombiaTICAgent {
    id: string;
    config: ColombiaTICAgentConfig;
    createdAt: Date;
    updatedAt: Date;
    status: 'active' | 'inactive' | 'pending';
    clientId: string;
}
export declare class ColombiaTICAgentService {
    private readonly httpService;
    private readonly logger;
    private agents;
    constructor(httpService: HttpService);
    createAgent(config: ColombiaTICAgentConfig): Promise<ColombiaTICAgent>;
    getAgent(id: string): ColombiaTICAgent | null;
    updateAgent(id: string, config: Partial<ColombiaTICAgentConfig>): Promise<ColombiaTICAgent>;
    private configureWebhooks;
    private configureFacebookWebhook;
    private configureWhatsAppWebhook;
    private configureGoogleAdsWebhook;
    getWebhookConfiguration(agentId: string): any;
    generateChatWidgetScript(clientId: string): string;
}
