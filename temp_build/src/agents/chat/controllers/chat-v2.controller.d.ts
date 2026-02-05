import { ChatV2Service } from '../services/chat-v2.service';
export declare class ChatV2Controller {
    private readonly agentService;
    constructor(agentService: ChatV2Service);
    execute(payload: any): Promise<import("../../../common/agents/agent-base").AgentResult>;
    getMetrics(): Promise<any>;
}
