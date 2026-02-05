import { AgentAnalyticsReporterV2Service } from '../services/agent-analytics-reporter-v2.service';
import { CreateAgentAnalyticsReporterDto } from '../dto/create-agent-analytics-reporter.dto';
export declare class AgentAnalyticsReporterV2Controller {
    private readonly agentService;
    constructor(agentService: AgentAnalyticsReporterV2Service);
    execute(dto: CreateAgentAnalyticsReporterDto): Promise<import("../../../common/agents/agent-base").AgentResult>;
    getMetrics(): Promise<any>;
    findOne(id: string): Promise<import("../entities/agent-analytics-reporter.entity").AgentAnalyticsReporter | null>;
    findAll(): Promise<import("../entities/agent-analytics-reporter.entity").AgentAnalyticsReporter[]>;
}
