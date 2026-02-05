import { ColombiaTICAgentService } from './colombiatic-agent.service';
import type { ColombiaTICAgentConfig } from './colombiatic-agent.service';
export declare class ColombiaTICAgentController {
    private readonly agentService;
    private readonly logger;
    constructor(agentService: ColombiaTICAgentService);
    createAgent(config: ColombiaTICAgentConfig): Promise<{
        success: boolean;
        agent: import("./colombiatic-agent.service").ColombiaTICAgent;
        chatWidgetScript: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        agent?: undefined;
        chatWidgetScript?: undefined;
    }>;
    getAgent(id: string): Promise<{
        success: boolean;
        agent: import("./colombiatic-agent.service").ColombiaTICAgent;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        agent?: undefined;
    }>;
    updateAgent(id: string, config: Partial<ColombiaTICAgentConfig>): Promise<{
        success: boolean;
        agent: import("./colombiatic-agent.service").ColombiaTICAgent;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        agent?: undefined;
    }>;
    configureWebhooks(id: string): Promise<{
        success: boolean;
        webhooks: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        webhooks?: undefined;
    }>;
    getWebhookConfiguration(id: string): Promise<{
        success: boolean;
        webhooks: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        webhooks?: undefined;
    }>;
}
