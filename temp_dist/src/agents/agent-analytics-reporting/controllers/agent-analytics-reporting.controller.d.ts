import { AgentAnalyticsReportingService } from '../services/agent-analytics-reporting.service';
import { CreateAgentAnalyticsReportingDto } from '../dto/create-agent-analytics-reporting.dto';
import { AgentAnalyticsReporting } from '../entities/agent-analytics-reporting.entity';
export declare class AgentAnalyticsReportingController {
    private readonly agentService;
    constructor(agentService: AgentAnalyticsReportingService);
    generateReport(createDto: CreateAgentAnalyticsReportingDto): Promise<import("../../../common/agents/agent-base").AgentResult>;
    findOne(id: string): Promise<AgentAnalyticsReporting | null>;
    findBySessionId(sessionId: string): Promise<AgentAnalyticsReporting[]>;
    findAll(query: any): Promise<AgentAnalyticsReporting[]>;
    getMetrics(): Promise<any>;
}
