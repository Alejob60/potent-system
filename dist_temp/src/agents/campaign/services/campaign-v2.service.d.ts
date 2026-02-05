import { Repository } from 'typeorm';
import { Campaign } from '../entities/campaign.entity';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { AgentBase, AgentResult } from '../../../common/agents/agent-base';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
export declare class CampaignV2Service extends AgentBase {
    private readonly repo;
    constructor(repo: Repository<Campaign>, redisService: RedisService, stateManager: StateManagementService, websocketGateway: WebSocketGatewayService);
    execute(payload: CreateCampaignDto): Promise<AgentResult>;
    validate(payload: CreateCampaignDto): Promise<boolean>;
    private manageCampaign;
    private saveToDatabase;
    findAll(): Promise<Campaign[]>;
    findOne(id: string): Promise<Campaign | null>;
    getMetrics(): Promise<any>;
}
