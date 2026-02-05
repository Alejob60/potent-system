import { Repository } from 'typeorm';
import { AgentCreativeSynthesizer } from '../entities/agent-creative-synthesizer.entity';
import { CreateAgentCreativeSynthesizerDto } from '../dto/create-agent-creative-synthesizer.dto';
import { AgentBase, AgentResult } from '../../../common/agents/agent-base';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
export declare class AgentCreativeSynthesizerV2Service extends AgentBase {
    private readonly repo;
    constructor(repo: Repository<AgentCreativeSynthesizer>, redisService: RedisService, stateManager: StateManagementService, websocketGateway: WebSocketGatewayService);
    execute(payload: CreateAgentCreativeSynthesizerDto): Promise<AgentResult>;
    validate(payload: CreateAgentCreativeSynthesizerDto): Promise<boolean>;
    private generateCreativeContent;
    private saveToDatabase;
    findAll(): Promise<AgentCreativeSynthesizer[]>;
    findOne(id: string): Promise<AgentCreativeSynthesizer | null>;
    getMetrics(): Promise<any>;
}
