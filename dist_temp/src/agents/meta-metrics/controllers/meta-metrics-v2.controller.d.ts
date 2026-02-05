import { MetaMetricsV2Service } from '../services/meta-metrics-v2.service';
export declare class MetaMetricsV2Controller {
    private readonly agentService;
    constructor(agentService: MetaMetricsV2Service);
    execute(payload: any): Promise<import("../../../common/agents/agent-base").AgentResult>;
    getMetrics(): Promise<any>;
}
