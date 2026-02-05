import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
import { OAuthService } from '../../../oauth/oauth.service';
import { DailyCoordinatorService } from '../../daily-coordinator/services/daily-coordinator.service';
import { AgentPostSchedulerService } from '../../agent-post-scheduler/services/agent-post-scheduler.service';
import { ViralContentGeneratorService } from '../../viral-content-generator/services/viral-content-generator.service';
import { AccountStatusResult } from '../interfaces/auth-monitor.interface';
export declare class SocialAuthMonitorService {
    private readonly stateManager;
    private readonly websocketGateway;
    private readonly oauthService;
    private readonly dailyCoordinator;
    private readonly postScheduler;
    private readonly contentGenerator;
    private readonly logger;
    private readonly supportedPlatforms;
    constructor(stateManager: StateManagementService, websocketGateway: WebSocketGatewayService, oauthService: OAuthService, dailyCoordinator: DailyCoordinatorService, postScheduler: AgentPostSchedulerService, contentGenerator: ViralContentGeneratorService);
    getSocialAuthStatus(): Promise<{
        status: string;
        accountStatus: any[];
        publishingStatus: {
            scheduler: boolean;
            generator: boolean;
            platforms: unknown[];
            message: string;
        };
        timestamp: string;
    }>;
    getPlatformStatus(platform: string): Promise<{
        platform: string;
        accountStatus: any[];
        publishingStatus: {
            platform: string;
            canPublish: boolean;
            activeAccounts: number;
            message: string;
        };
        timestamp: string;
    }>;
    refreshTokens(refreshData: any): Promise<{
        status: string;
        message: string;
        accountId: any;
        result: any;
        timestamp: string;
        platform?: undefined;
        results?: undefined;
        publishingStatus?: undefined;
    } | {
        status: string;
        message: string;
        platform: any;
        results: AccountStatusResult[];
        timestamp: string;
        accountId?: undefined;
        result?: undefined;
        publishingStatus?: undefined;
    } | {
        status: string;
        message: string;
        results: AccountStatusResult[];
        publishingStatus: {
            scheduler: boolean;
            generator: boolean;
            platforms: unknown[];
            message: string;
        };
        timestamp: string;
        accountId?: undefined;
        result?: undefined;
        platform?: undefined;
    }>;
    private findAccountById;
    private checkAccountStatus;
    private notifyDailyCoordinator;
    private verifyPublishingCapabilities;
    private verifyPlatformPublishing;
}
