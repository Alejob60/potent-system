import { KnowledgeInjectorV2Service } from '../services/knowledge-injector-v2.service';
export declare class KnowledgeInjectorV2Controller {
    private readonly agentService;
    constructor(agentService: KnowledgeInjectorV2Service);
    execute(payload: any): Promise<import("../../../common/agents/agent-base").AgentResult>;
    getMetrics(): Promise<any>;
}
