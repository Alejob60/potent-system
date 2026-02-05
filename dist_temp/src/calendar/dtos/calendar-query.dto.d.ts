import { CalendarEvent } from '../calendar.service';
export declare class CalendarQueryDto {
    startDate?: string;
    endDate?: string;
    type?: CalendarEvent['type'];
    status?: CalendarEvent['status'];
    sessionId: string;
    campaignId?: string;
}
