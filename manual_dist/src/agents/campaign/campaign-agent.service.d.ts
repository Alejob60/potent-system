import { StateManagementService } from '../../state/state-management.service';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';
import { TokenManagementService } from '../../services/token-management.service';
export interface CampaignRequest {
    title: string;
    objective: string;
    targetChannels: string[];
    duration: number;
    contentTypes: string[];
    tone: string;
    budget?: number;
    startDate?: Date;
    sessionId: string;
}
export interface CampaignPlan {
    id: string;
    title: string;
    objective: string;
    strategy: CampaignStrategy;
    contentCalendar: ContentItem[];
    metrics: CampaignMetrics;
    status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused';
}
export interface CampaignStrategy {
    approach: string;
    keyMessages: string[];
    targetAudience: string;
    postingFrequency: string;
    engagementTactics: string[];
    trendAlignment: string[];
}
export interface ContentItem {
    id: string;
    type: 'post' | 'video' | 'image' | 'story';
    title: string;
    content: string;
    channels: string[];
    scheduledDate: Date;
    status: 'planned' | 'created' | 'scheduled' | 'published';
    mediaUrls?: string[];
    hashtags?: string[];
    mentions?: string[];
}
export interface CampaignMetrics {
    targetReach: number;
    expectedEngagement: number;
    estimatedBudget: number;
    contentCount: number;
    channelsCount: number;
}
export declare class CampaignAgentService {
    private readonly stateManager;
    private readonly websocketGateway;
    private readonly tokenManager;
    private readonly logger;
    constructor(stateManager: StateManagementService, websocketGateway: WebSocketGatewayService, tokenManager: TokenManagementService);
    createCampaign(request: CampaignRequest): Promise<CampaignPlan>;
    private createCampaignStrategy;
    private generateContentCalendar;
    private getPostsPerWeek;
    private selectContentType;
    private generateContentTitle;
    private generateContentText;
    private generateHashtags;
    private calculateCampaignMetrics;
    private scheduleContentItems;
    getCampaignStatus(campaignId: string, sessionId: string): Promise<any>;
    updateCampaignStatus(campaignId: string, status: CampaignPlan['status'], sessionId: string): Promise<void>;
}
