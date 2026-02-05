import { ScrumTimelineService } from '../services/scrum-timeline.service';
import { SyncResult } from '../interfaces/sync-result.interface';
export declare class ScrumTimelineController {
    private readonly service;
    constructor(service: ScrumTimelineService);
    syncScrumTimeline(calendarData: any): Promise<{
        status: string;
        message: string;
        syncResults: SyncResult[];
        agentStatus: any;
        oauthStatus: any;
        timestamp: string;
    }>;
}
