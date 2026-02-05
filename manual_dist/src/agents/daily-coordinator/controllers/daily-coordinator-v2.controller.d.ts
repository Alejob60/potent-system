import { DailyCoordinatorV2Service } from '../services/daily-coordinator-v2.service';
export declare class DailyCoordinatorV2Controller {
    private readonly agentService;
    constructor(agentService: DailyCoordinatorV2Service);
    execute(payload: any): Promise<import("../../../common/agents/agent-base").AgentResult>;
    getMetrics(): Promise<any>;
}
