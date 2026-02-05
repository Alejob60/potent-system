import { Repository } from 'typeorm';
import { AgentMarketingAutomation } from '../entities/agent-marketing-automation.entity';
import { CreateAgentMarketingAutomationDto } from '../dto/create-agent-marketing-automation.dto';
import { AgentBase, AgentResult } from '../../../common/agents/agent-base';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
export declare class AgentMarketingAutomationService extends AgentBase {
    private readonly repo;
    constructor(repo: Repository<AgentMarketingAutomation>, redisService: RedisService, stateManager: StateManagementService, websocketGateway: WebSocketGatewayService);
    execute(payload: CreateAgentMarketingAutomationDto): Promise<AgentResult>;
    validate(payload: CreateAgentMarketingAutomationDto): Promise<boolean>;
    private generateCampaign;
    private saveToDatabase;
    findAll(): Promise<AgentMarketingAutomation[]>;
    findOne(id: string): Promise<AgentMarketingAutomation | null>;
    findBySessionId(sessionId: string): Promise<AgentMarketingAutomation[]>;
    getMetrics(): Promise<any>;
}
