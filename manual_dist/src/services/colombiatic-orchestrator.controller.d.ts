import { ColombiaTICOrchestratorService } from './colombiatic-orchestrator.service';
export declare class ColombiaTICOrchestratorController {
    private readonly orchestratorService;
    private readonly logger;
    constructor(orchestratorService: ColombiaTICOrchestratorService);
    processWebhookEvent(channel: string, eventType: string, agentId: string, payload: any): Promise<any>;
    getRecentWebhookEvents(limit?: number): Promise<any>;
    getWebhookEventsByChannel(channel: string, limit?: number): Promise<any>;
    getRecentChannelMessages(limit?: number): Promise<any>;
    getChannelMessagesByChannel(channel: string, limit?: number): Promise<any>;
    getChannelMessagesByAgent(agentId: string, limit?: number): Promise<any>;
}
