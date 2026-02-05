import { Repository } from 'typeorm';
import { AgentAnalyticsReporter } from '../entities/agent-analytics-reporter.entity';
import { CreateAgentAnalyticsReporterDto } from '../dto/create-agent-analytics-reporter.dto';
export declare class AgentAnalyticsReporterService {
    private readonly repo;
    constructor(repo: Repository<AgentAnalyticsReporter>);
    create(dto: CreateAgentAnalyticsReporterDto): Promise<AgentAnalyticsReporter>;
    findAll(): Promise<AgentAnalyticsReporter[]>;
    findOne(id: string): Promise<AgentAnalyticsReporter | null>;
}
