import { CalendarService, CalendarEvent } from './calendar.service';
import { ScheduleEventDto } from './dtos/calendar-event.dto';
import { CampaignMilestonesDto } from './dtos/campaign-milestones.dto';
export declare class CalendarController {
    private readonly calendarService;
    constructor(calendarService: CalendarService);
    scheduleEvent(dto: ScheduleEventDto): Promise<CalendarEvent>;
    getEvents(sessionId: string, startDate?: string, endDate?: string, type?: string, status?: string, campaignId?: string): Promise<CalendarEvent[]>;
    updateEvent(eventId: string, sessionId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null>;
    deleteEvent(eventId: string, sessionId: string): Promise<boolean>;
    getUpcomingEvents(sessionId: string, hours?: string): Promise<CalendarEvent[]>;
    getOverdueEvents(sessionId: string): Promise<CalendarEvent[]>;
    markEventCompleted(eventId: string, sessionId: string): Promise<CalendarEvent | null>;
    getCalendarStats(sessionId: string): Promise<import("./calendar.service").CalendarStats>;
    scheduleCampaignMilestones(dto: CampaignMilestonesDto): Promise<CalendarEvent[]>;
}
