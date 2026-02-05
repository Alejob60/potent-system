import { Repository } from 'typeorm';
import { AgentVideoScriptor } from '../entities/agent-video-scriptor.entity';
import { CreateAgentVideoScriptorDto } from '../dto/create-agent-video-scriptor.dto';
import { AgentBase, AgentResult } from '../../../common/agents/agent-base';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
export declare class AgentVideoScriptorV2Service extends AgentBase {
    private readonly repo;
    constructor(repo: Repository<AgentVideoScriptor>, redisService: RedisService, stateManager: StateManagementService, websocketGateway: WebSocketGatewayService);
    execute(payload: CreateAgentVideoScriptorDto): Promise<AgentResult>;
    validate(payload: CreateAgentVideoScriptorDto): Promise<boolean>;
    private generateScriptWithNarrative;
    private saveToDatabase;
    private generateScript;
    private suggestVisuals;
    private generateNarrative;
    private compressScript;
    findAll(): Promise<AgentVideoScriptor[]>;
    findOne(id: string): Promise<AgentVideoScriptor | null>;
    findBySessionId(sessionId: string): Promise<AgentVideoScriptor[]>;
    getMetrics(): Promise<any>;
}
