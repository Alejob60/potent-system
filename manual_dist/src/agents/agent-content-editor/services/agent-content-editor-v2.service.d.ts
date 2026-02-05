import { Repository } from 'typeorm';
import { AgentContentEditor } from '../entities/agent-content-editor.entity';
import { CreateAgentContentEditorDto } from '../dto/create-agent-content-editor.dto';
import { AgentBase, AgentResult } from '../../../common/agents/agent-base';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
export declare class AgentContentEditorV2Service extends AgentBase {
    private readonly repo;
    constructor(repo: Repository<AgentContentEditor>, redisService: RedisService, stateManager: StateManagementService, websocketGateway: WebSocketGatewayService);
    execute(payload: CreateAgentContentEditorDto): Promise<AgentResult>;
    validate(payload: CreateAgentContentEditorDto): Promise<boolean>;
    private editContent;
    private saveToDatabase;
    findAll(): Promise<AgentContentEditor[]>;
    findOne(id: string): Promise<AgentContentEditor | null>;
    getMetrics(): Promise<any>;
}
