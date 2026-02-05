import { Repository } from 'typeorm';
import { AgentFaqResponder } from '../entities/agent-faq-responder.entity';
import { CreateAgentFaqResponderDto } from '../dto/create-agent-faq-responder.dto';
import { AgentBase, AgentResult } from '../../../common/agents/agent-base';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
export declare class AgentFaqResponderV2Service extends AgentBase {
    private readonly repo;
    constructor(repo: Repository<AgentFaqResponder>, redisService: RedisService, stateManager: StateManagementService, websocketGateway: WebSocketGatewayService);
    execute(payload: CreateAgentFaqResponderDto): Promise<AgentResult>;
    validate(payload: CreateAgentFaqResponderDto): Promise<boolean>;
    private generateFaqResponses;
    private saveToDatabase;
    findAll(): Promise<AgentFaqResponder[]>;
    findOne(id: string): Promise<AgentFaqResponder | null>;
    findBySessionId(sessionId: string): Promise<AgentFaqResponder[]>;
    getMetrics(): Promise<any>;
}
