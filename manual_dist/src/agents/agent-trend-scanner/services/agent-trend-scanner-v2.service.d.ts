import { Repository } from 'typeorm';
import { AgentTrendScanner } from '../entities/agent-trend-scanner.entity';
import { CreateAgentTrendScannerDto } from '../dto/create-agent-trend-scanner.dto';
import { AgentBase, AgentResult } from '../../../common/agents/agent-base';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
export declare class AgentTrendScannerV2Service extends AgentBase {
    private readonly agentTrendScannerRepository;
    constructor(agentTrendScannerRepository: Repository<AgentTrendScanner>, redisService: RedisService, stateManager: StateManagementService, websocketGateway: WebSocketGatewayService);
    execute(payload: CreateAgentTrendScannerDto): Promise<AgentResult>;
    validate(payload: CreateAgentTrendScannerDto): Promise<boolean>;
    private performTrendAnalysis;
    private saveToDatabase;
    findAll(): Promise<AgentTrendScanner[]>;
    findOne(id: string): Promise<AgentTrendScanner | null>;
    getMetrics(): Promise<any>;
}
