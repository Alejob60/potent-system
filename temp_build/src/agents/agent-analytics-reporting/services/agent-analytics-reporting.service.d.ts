import { Repository } from 'typeorm';
import { AgentAnalyticsReporting } from '../entities/agent-analytics-reporting.entity';
import { CreateAgentAnalyticsReportingDto } from '../dto/create-agent-analytics-reporting.dto';
import { AgentBase, AgentResult } from '../../../common/agents/agent-base';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
export declare class AgentAnalyticsReportingService extends AgentBase {
    private readonly repo;
    constructor(repo: Repository<AgentAnalyticsReporting>, redisService: RedisService, stateManager: StateManagementService, websocketGateway: WebSocketGatewayService);
    execute(payload: CreateAgentAnalyticsReportingDto): Promise<AgentResult>;
    validate(payload: CreateAgentAnalyticsReportingDto): Promise<boolean>;
    private generateReport;
    private generateMetrics;
    private generateInsights;
    private generateRecommendations;
    private generateVisualizationData;
    private saveToDatabase;
    findAll(): Promise<AgentAnalyticsReporting[]>;
    findOne(id: string): Promise<AgentAnalyticsReporting | null>;
    findBySessionId(sessionId: string): Promise<AgentAnalyticsReporting[]>;
    getMetrics(): Promise<any>;
}
