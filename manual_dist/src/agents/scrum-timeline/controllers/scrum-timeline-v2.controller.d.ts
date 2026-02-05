import { ScrumTimelineV2Service } from '../services/scrum-timeline-v2.service';
export declare class ScrumTimelineV2Controller {
    private readonly agentService;
    constructor(agentService: ScrumTimelineV2Service);
    execute(payload: any): Promise<import("../../../common/agents/agent-base").AgentResult>;
    getMetrics(): Promise<any>;
}
