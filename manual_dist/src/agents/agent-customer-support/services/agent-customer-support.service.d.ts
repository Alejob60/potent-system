import { Repository } from 'typeorm';
import { AgentCustomerSupport } from '../entities/agent-customer-support.entity';
import { CreateAgentCustomerSupportDto } from '../dto/create-agent-customer-support.dto';
import { AgentBase, AgentResult } from '../../../common/agents/agent-base';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
export declare class AgentCustomerSupportService extends AgentBase {
    private readonly repo;
    constructor(repo: Repository<AgentCustomerSupport>, redisService: RedisService, stateManager: StateManagementService, websocketGateway: WebSocketGatewayService);
    execute(payload: CreateAgentCustomerSupportDto): Promise<AgentResult>;
    validate(payload: CreateAgentCustomerSupportDto): Promise<boolean>;
    private generateSupportResponse;
    private saveToDatabase;
    findAll(): Promise<AgentCustomerSupport[]>;
    findOne(id: string): Promise<AgentCustomerSupport | null>;
    findBySessionId(sessionId: string): Promise<AgentCustomerSupport[]>;
    getMetrics(): Promise<any>;
}
