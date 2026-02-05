import { ColombiaTICAgentService } from './colombiatic-agent.service';
import { WebhookService } from './webhook.service';
import { IAOrchestratorService } from './ia-orchestrator.service';
export interface ColombiaTICWebhookEvent {
    id: string;
    agentId: string;
    channel: string;
    eventType: string;
    payload: any;
    processed: boolean;
    response?: any;
    timestamp: Date;
}
export interface ChannelMessage {
    id: string;
    agentId: string;
    channel: string;
    content: string;
    sender: 'user' | 'agent' | 'system';
    timestamp: Date;
    processed: boolean;
    response?: any;
}
export declare class ColombiaTICOrchestratorService {
    private readonly agentService;
    private readonly webhookService;
    private readonly iaOrchestrator;
    private readonly logger;
    private webhookEvents;
    private channelMessages;
    constructor(agentService: ColombiaTICAgentService, webhookService: WebhookService, iaOrchestrator: IAOrchestratorService);
    processWebhookEvent(channel: string, eventType: string, payload: any, agentId?: string): Promise<any>;
    private processFacebookEvent;
    private processWhatsAppEvent;
    private processGoogleAdsEvent;
    private processGenericEvent;
    getRecentWebhookEvents(limit?: number): ColombiaTICWebhookEvent[];
    getWebhookEventsByChannel(channel: string, limit?: number): ColombiaTICWebhookEvent[];
    getRecentChannelMessages(limit?: number): ChannelMessage[];
    getChannelMessagesByChannel(channel: string, limit?: number): ChannelMessage[];
    getChannelMessagesByAgent(agentId: string, limit?: number): ChannelMessage[];
}
