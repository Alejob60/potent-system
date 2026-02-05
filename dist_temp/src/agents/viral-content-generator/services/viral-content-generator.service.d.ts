import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
import { AgentVideoScriptorService } from '../../agent-video-scriptor/services/agent-video-scriptor.service';
import { AgentPostSchedulerService } from '../../agent-post-scheduler/services/agent-post-scheduler.service';
interface GeneratedContent {
    id: string;
    [key: string]: any;
}
export declare class ViralContentGeneratorService {
    private readonly stateManager;
    private readonly websocketGateway;
    private readonly videoScriptor;
    private readonly postScheduler;
    private readonly logger;
    constructor(stateManager: StateManagementService, websocketGateway: WebSocketGatewayService, videoScriptor: AgentVideoScriptorService, postScheduler: AgentPostSchedulerService);
    generateViralContent(contentData: any): Promise<{
        status: string;
        message: string;
        content: GeneratedContent;
        asset: {
            id: string;
            contentId: string;
            type: any;
            createdAt: string;
            version: string;
            metadata: {
                trend: any;
                emotionalGoal: any;
                platform: any;
            };
            content: GeneratedContent;
            repositoryPath: string;
            tags: any[];
        };
        timestamp: string;
    }>;
    private coordinarConAgentes;
    private generateVideoContent;
    private generateVoiceClone;
    private calculateOptimalDuration;
    private calculateAspectRatio;
    private generateEffects;
    private generateImageContent;
    private generateImageFilters;
    private selectOptimalFont;
    private generateMemeContent;
    private selectMemeTemplate;
    private generatePostContent;
    private generateEmojis;
    private generateTagsContent;
    private generateTrendingTags;
    private saveToRepository;
}
export {};
