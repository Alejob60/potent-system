import { SocialAuthMonitorV2Service } from '../services/social-auth-monitor-v2.service';
export declare class SocialAuthMonitorV2Controller {
    private readonly agentService;
    constructor(agentService: SocialAuthMonitorV2Service);
    execute(payload: any): Promise<import("../../../common/agents/agent-base").AgentResult>;
    getMetrics(): Promise<any>;
}
