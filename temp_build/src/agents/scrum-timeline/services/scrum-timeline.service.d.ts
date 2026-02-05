import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
import { OAuthService } from '../../../oauth/oauth.service';
import { CalendarService } from '../../../calendar/calendar.service';
interface SyncResult {
    taskId: string;
    success: boolean;
    eventId?: string;
    error?: string;
}
export declare class ScrumTimelineService {
    private readonly stateManager;
    private readonly websocketGateway;
    private readonly oauthService;
    private readonly calendarService;
    private readonly logger;
    constructor(stateManager: StateManagementService, websocketGateway: WebSocketGatewayService, oauthService: OAuthService, calendarService: CalendarService);
    syncScrumTimeline(calendarData: any): Promise<{
        status: string;
        message: string;
        syncResults: SyncResult[];
        agentStatus: {};
        oauthStatus: {
            connectedAccounts: import("../../../oauth/oauth.service").ConnectedAccount[];
            tokenStatus: {};
            calendarIntegration: {
                google: boolean;
                microsoft: boolean;
            };
            error?: undefined;
        } | {
            error: any;
            connectedAccounts?: undefined;
            tokenStatus?: undefined;
            calendarIntegration?: undefined;
        };
        timestamp: string;
    }>;
    private checkOAuthStatus;
    private syncTasksToCalendar;
    private updateAgentStatus;
    private syncAgentStatusToCalendar;
    private sendRemindersAndAlerts;
    private setupCollaborativeEditing;
}
export {};
