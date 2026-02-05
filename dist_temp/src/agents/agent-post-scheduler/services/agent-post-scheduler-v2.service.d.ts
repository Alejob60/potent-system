import { Repository } from 'typeorm';
import { AgentPostScheduler } from '../entities/agent-post-scheduler.entity';
import { CreateAgentPostSchedulerDto } from '../dto/create-agent-post-scheduler.dto';
import { AgentBase, AgentResult } from '../../../common/agents/agent-base';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
export declare class AgentPostSchedulerV2Service extends AgentBase {
    private readonly repo;
    constructor(repo: Repository<AgentPostScheduler>, redisService: RedisService, stateManager: StateManagementService, websocketGateway: WebSocketGatewayService);
    execute(payload: CreateAgentPostSchedulerDto): Promise<AgentResult>;
    validate(payload: CreateAgentPostSchedulerDto): Promise<boolean>;
    private schedulePost;
    private saveToDatabase;
    findAll(): Promise<AgentPostScheduler[]>;
    findOne(id: string): Promise<AgentPostScheduler | null>;
    getMetrics(): Promise<any>;
}
