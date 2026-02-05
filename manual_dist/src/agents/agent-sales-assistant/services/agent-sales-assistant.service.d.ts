import { Repository } from 'typeorm';
import { AgentSalesAssistant } from '../entities/agent-sales-assistant.entity';
import { CreateAgentSalesAssistantDto } from '../dto/create-agent-sales-assistant.dto';
import { AgentBase, AgentResult } from '../../../common/agents/agent-base';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
export declare class AgentSalesAssistantService extends AgentBase {
    private readonly repo;
    constructor(repo: Repository<AgentSalesAssistant>, redisService: RedisService, stateManager: StateManagementService, websocketGateway: WebSocketGatewayService);
    execute(payload: CreateAgentSalesAssistantDto): Promise<AgentResult>;
    validate(payload: CreateAgentSalesAssistantDto): Promise<boolean>;
    private generateQualification;
    private saveToDatabase;
    findAll(): Promise<AgentSalesAssistant[]>;
    findOne(id: string): Promise<AgentSalesAssistant | null>;
    findBySessionId(sessionId: string): Promise<AgentSalesAssistant[]>;
    getMetrics(): Promise<any>;
}
