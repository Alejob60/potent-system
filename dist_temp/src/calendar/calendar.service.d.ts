import { StateManagementService } from '../state/state-management.service';
import { WebSocketGatewayService } from '../websocket/websocket.gateway';
export interface CalendarEvent {
    id?: string;
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    type: 'content_publish' | 'campaign_milestone' | 'review' | 'analysis' | 'meeting';
    status: 'scheduled' | 'completed' | 'cancelled' | 'in_progress';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    metadata?: {
        contentId?: string;
        campaignId?: string;
        channels?: string[];
        contentType?: string;
        assignedAgent?: string;
        [key: string]: any;
    };
    sessionId: string;
    recurrence?: {
        type: 'daily' | 'weekly' | 'monthly';
        interval: number;
        endDate?: Date;
    };
    reminders?: {
        time: number;
        type: 'notification' | 'email' | 'webhook';
    }[];
}
export interface CalendarQuery {
    startDate?: Date;
    endDate?: Date;
    type?: CalendarEvent['type'];
    status?: CalendarEvent['status'];
    sessionId: string;
    campaignId?: string;
}
export interface CalendarStats {
    totalEvents: number;
    upcomingEvents: number;
    completedEvents: number;
    overdueEvents: number;
    eventsByType: {
        [key: string]: number;
    };
    eventsByStatus: {
        [key: string]: number;
    };
}
export declare class CalendarService {
    private readonly stateManager;
    private readonly websocketGateway;
    private readonly logger;
    private events;
    constructor(stateManager: StateManagementService, websocketGateway: WebSocketGatewayService);
    scheduleEvent(event: Omit<CalendarEvent, 'id' | 'status'>): Promise<CalendarEvent>;
    getEvents(query: CalendarQuery): Promise<CalendarEvent[]>;
    updateEvent(eventId: string, sessionId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null>;
    deleteEvent(eventId: string, sessionId: string): Promise<boolean>;
    getUpcomingEvents(sessionId: string, hours?: number): Promise<CalendarEvent[]>;
    getOverdueEvents(sessionId: string): Promise<CalendarEvent[]>;
    markEventCompleted(eventId: string, sessionId: string): Promise<CalendarEvent | null>;
    getCalendarStats(sessionId: string): Promise<CalendarStats>;
    scheduleCampaignMilestones(campaignId: string, campaignTitle: string, startDate: Date, duration: number, sessionId: string): Promise<CalendarEvent[]>;
    private createRecurringEvents;
    private checkUpcomingEvents;
    private sendEventReminder;
}
