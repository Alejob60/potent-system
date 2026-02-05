import { AgentAnalyticsReporterService } from '../services/agent-analytics-reporter.service';
import { CreateAgentAnalyticsReporterDto } from '../dto/create-agent-analytics-reporter.dto';
export declare class AgentAnalyticsReporterController {
    private readonly service;
    constructor(service: AgentAnalyticsReporterService);
    create(dto: CreateAgentAnalyticsReporterDto): Promise<import("../entities/agent-analytics-reporter.entity").AgentAnalyticsReporter>;
    findAll(): Promise<import("../entities/agent-analytics-reporter.entity").AgentAnalyticsReporter[]>;
    findOne(id: string): Promise<import("../entities/agent-analytics-reporter.entity").AgentAnalyticsReporter | null>;
}
