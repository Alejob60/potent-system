import { ViralCampaignOrchestratorService } from '../services/viral-campaign-orchestrator.service';
import { ActivateCampaignDto } from '../dto/activate-campaign.dto';
export declare class ViralCampaignOrchestratorController {
    private readonly viralCampaignOrchestratorService;
    constructor(viralCampaignOrchestratorService: ViralCampaignOrchestratorService);
    activateCampaign(activateCampaignDto: ActivateCampaignDto, authHeader: string): Promise<any>;
    getCampaignStatus(campaignId: string): Promise<any>;
    getCampaignsBySession(sessionId: string): Promise<import("../entities").ViralCampaign[]>;
    private extractUserIdFromToken;
}
