import { AgentSpecializedIntegrationService } from '../services/agent-specialized-integration.service';
export declare class AgentSpecializedIntegrationController {
    private readonly agentService;
    constructor(agentService: AgentSpecializedIntegrationService);
    coordinateAgents(payload: any): Promise<import("../../../common/agents/agent-base").AgentResult>;
    getMetrics(): Promise<any>;
    getStatus(): Promise<any>;
}
