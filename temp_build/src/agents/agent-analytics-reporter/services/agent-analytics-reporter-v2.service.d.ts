import { Repository } from 'typeorm';
import { AgentAnalyticsReporter } from '../entities/agent-analytics-reporter.entity';
import { CreateAgentAnalyticsReporterDto } from '../dto/create-agent-analytics-reporter.dto';
import { AgentBase, AgentResult } from '../../../common/agents/agent-base';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
export declare class AgentAnalyticsReporterV2Service extends AgentBase {
    private readonly repo;
    constructor(repo: Repository<AgentAnalyticsReporter>, redisService: RedisService, stateManager: StateManagementService, websocketGateway: WebSocketGatewayService);
    execute(payload: CreateAgentAnalyticsReporterDto): Promise<AgentResult>;
    validate(payload: CreateAgentAnalyticsReporterDto): Promise<boolean>;
    private generateAnalyticsReport;
    private saveToDatabase;
    findAll(): Promise<AgentAnalyticsReporter[]>;
    findOne(id: string): Promise<AgentAnalyticsReporter | null>;
    getMetrics(): Promise<any>;
}
