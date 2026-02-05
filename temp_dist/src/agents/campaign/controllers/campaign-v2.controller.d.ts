import { CampaignV2Service } from '../services/campaign-v2.service';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
export declare class CampaignV2Controller {
    private readonly agentService;
    constructor(agentService: CampaignV2Service);
    execute(dto: CreateCampaignDto): Promise<import("../../../common/agents/agent-base").AgentResult>;
    getMetrics(): Promise<any>;
    findOne(id: string): Promise<import("../entities/campaign.entity").Campaign | null>;
    findAll(): Promise<import("../entities/campaign.entity").Campaign[]>;
}
