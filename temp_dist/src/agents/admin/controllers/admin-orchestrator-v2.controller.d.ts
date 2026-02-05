import { AdminOrchestratorV2Service } from '../services/admin-orchestrator-v2.service';
export declare class AdminOrchestratorV2Controller {
    private readonly agentService;
    constructor(agentService: AdminOrchestratorV2Service);
    execute(payload: any): Promise<import("../../../common/agents/agent-base").AgentResult>;
    getMetrics(): Promise<any>;
}
