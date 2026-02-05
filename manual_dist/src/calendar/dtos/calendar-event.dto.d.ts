export declare class CalendarEventDto {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    type: 'content_publish' | 'campaign_milestone' | 'review' | 'analysis' | 'meeting';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    sessionId: string;
    metadata?: {
        contentId?: string;
        campaignId?: string;
        channels?: string[];
        contentType?: string;
        assignedAgent?: string;
        [key: string]: any;
    };
    recurrence?: {
        type: 'daily' | 'weekly' | 'monthly';
        interval: number;
        endDate?: string;
    };
    reminders?: {
        time: number;
        type: 'notification' | 'email' | 'webhook';
    }[];
}
export declare class ScheduleEventDto {
    event: CalendarEventDto;
}
