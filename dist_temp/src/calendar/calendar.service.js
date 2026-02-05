"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CalendarService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarService = void 0;
const common_1 = require("@nestjs/common");
const state_management_service_1 = require("../state/state-management.service");
const websocket_gateway_1 = require("../websocket/websocket.gateway");
let CalendarService = CalendarService_1 = class CalendarService {
    constructor(stateManager, websocketGateway) {
        this.stateManager = stateManager;
        this.websocketGateway = websocketGateway;
        this.logger = new common_1.Logger(CalendarService_1.name);
        this.events = new Map();
        setInterval(() => this.checkUpcomingEvents(), 60 * 1000);
    }
    async scheduleEvent(event) {
        const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const calendarEvent = {
            ...event,
            id: eventId,
            status: 'scheduled',
        };
        const sessionEvents = this.events.get(event.sessionId) || [];
        sessionEvents.push(calendarEvent);
        this.events.set(event.sessionId, sessionEvents);
        this.stateManager.addTask(event.sessionId, {
            type: 'calendar_event',
            status: 'pending',
            data: calendarEvent,
        });
        this.logger.log(`Scheduled event: ${event.title} for ${event.startTime}`);
        this.websocketGateway.emitCalendarUpdate(event.sessionId, {
            type: 'event_scheduled',
            event: calendarEvent,
            message: `Event "${event.title}" scheduled for ${event.startTime.toLocaleString()}`,
        });
        if (event.recurrence) {
            await this.createRecurringEvents(calendarEvent);
        }
        return calendarEvent;
    }
    async getEvents(query) {
        const sessionEvents = this.events.get(query.sessionId) || [];
        let filteredEvents = sessionEvents;
        if (query.startDate || query.endDate) {
            filteredEvents = filteredEvents.filter((event) => {
                const eventDate = event.startTime;
                const afterStart = !query.startDate || eventDate >= query.startDate;
                const beforeEnd = !query.endDate || eventDate <= query.endDate;
                return afterStart && beforeEnd;
            });
        }
        if (query.type) {
            filteredEvents = filteredEvents.filter((event) => event.type === query.type);
        }
        if (query.status) {
            filteredEvents = filteredEvents.filter((event) => event.status === query.status);
        }
        if (query.campaignId) {
            filteredEvents = filteredEvents.filter((event) => event.metadata?.campaignId === query.campaignId);
        }
        return filteredEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    }
    async updateEvent(eventId, sessionId, updates) {
        const sessionEvents = this.events.get(sessionId) || [];
        const eventIndex = sessionEvents.findIndex((event) => event.id === eventId);
        if (eventIndex === -1) {
            return null;
        }
        const updatedEvent = { ...sessionEvents[eventIndex], ...updates };
        sessionEvents[eventIndex] = updatedEvent;
        this.events.set(sessionId, sessionEvents);
        this.logger.log(`Updated event: ${eventId}`);
        this.websocketGateway.emitCalendarUpdate(sessionId, {
            type: 'event_updated',
            event: updatedEvent,
            message: `Event "${updatedEvent.title}" updated`,
        });
        return updatedEvent;
    }
    async deleteEvent(eventId, sessionId) {
        const sessionEvents = this.events.get(sessionId) || [];
        const eventIndex = sessionEvents.findIndex((event) => event.id === eventId);
        if (eventIndex === -1) {
            return false;
        }
        const deletedEvent = sessionEvents.splice(eventIndex, 1)[0];
        this.events.set(sessionId, sessionEvents);
        this.logger.log(`Deleted event: ${eventId}`);
        this.websocketGateway.emitCalendarUpdate(sessionId, {
            type: 'event_deleted',
            eventId,
            message: `Event "${deletedEvent.title}" deleted`,
        });
        return true;
    }
    async getUpcomingEvents(sessionId, hours = 24) {
        const now = new Date();
        const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
        return this.getEvents({
            sessionId,
            startDate: now,
            endDate: futureTime,
            status: 'scheduled',
        });
    }
    async getOverdueEvents(sessionId) {
        const now = new Date();
        const sessionEvents = this.events.get(sessionId) || [];
        return sessionEvents.filter((event) => event.status === 'scheduled' && event.startTime < now);
    }
    async markEventCompleted(eventId, sessionId) {
        const updatedEvent = await this.updateEvent(eventId, sessionId, {
            status: 'completed',
        });
        if (updatedEvent) {
            const tasks = this.stateManager.getTasks(sessionId);
            const relatedTask = tasks.find((task) => task.type === 'calendar_event' && task.data?.id === eventId);
            if (relatedTask) {
                this.stateManager.updateTask(sessionId, relatedTask.id, {
                    status: 'completed',
                });
            }
            this.logger.log(`Marked event completed: ${eventId}`);
        }
        return updatedEvent;
    }
    async getCalendarStats(sessionId) {
        const sessionEvents = this.events.get(sessionId) || [];
        const now = new Date();
        const stats = {
            totalEvents: sessionEvents.length,
            upcomingEvents: 0,
            completedEvents: 0,
            overdueEvents: 0,
            eventsByType: {},
            eventsByStatus: {},
        };
        sessionEvents.forEach((event) => {
            stats.eventsByStatus[event.status] =
                (stats.eventsByStatus[event.status] || 0) + 1;
            stats.eventsByType[event.type] =
                (stats.eventsByType[event.type] || 0) + 1;
            if (event.status === 'completed') {
                stats.completedEvents++;
            }
            else if (event.status === 'scheduled') {
                if (event.startTime > now) {
                    stats.upcomingEvents++;
                }
                else {
                    stats.overdueEvents++;
                }
            }
        });
        return stats;
    }
    async scheduleCampaignMilestones(campaignId, campaignTitle, startDate, duration, sessionId) {
        const milestones = [];
        milestones.push({
            title: `Campaign Kickoff: ${campaignTitle}`,
            description: 'Campaign launch and initial content publication',
            startTime: startDate,
            endTime: new Date(startDate.getTime() + 2 * 60 * 60 * 1000),
            type: 'campaign_milestone',
            priority: 'high',
            metadata: { campaignId, milestone: 'kickoff' },
            sessionId,
        });
        if (duration > 7) {
            const midDate = new Date(startDate.getTime() + (duration / 2) * 24 * 60 * 60 * 1000);
            milestones.push({
                title: `Mid-Campaign Review: ${campaignTitle}`,
                description: 'Review campaign performance and adjust strategy if needed',
                startTime: midDate,
                endTime: new Date(midDate.getTime() + 60 * 60 * 1000),
                type: 'review',
                priority: 'medium',
                metadata: { campaignId, milestone: 'mid_review' },
                sessionId,
            });
        }
        const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);
        milestones.push({
            title: `Campaign Completion: ${campaignTitle}`,
            description: 'Campaign end and final analysis',
            startTime: endDate,
            endTime: new Date(endDate.getTime() + 60 * 60 * 1000),
            type: 'campaign_milestone',
            priority: 'high',
            metadata: { campaignId, milestone: 'completion' },
            sessionId,
        });
        const analysisDate = new Date(endDate.getTime() + 2 * 24 * 60 * 60 * 1000);
        milestones.push({
            title: `Post-Campaign Analysis: ${campaignTitle}`,
            description: 'Comprehensive campaign performance analysis and reporting',
            startTime: analysisDate,
            endTime: new Date(analysisDate.getTime() + 2 * 60 * 60 * 1000),
            type: 'analysis',
            priority: 'medium',
            metadata: { campaignId, milestone: 'analysis' },
            sessionId,
        });
        const scheduledMilestones = [];
        for (const milestone of milestones) {
            const scheduled = await this.scheduleEvent(milestone);
            scheduledMilestones.push(scheduled);
        }
        return scheduledMilestones;
    }
    async createRecurringEvents(baseEvent) {
        if (!baseEvent.recurrence)
            return;
        const { type, interval, endDate } = baseEvent.recurrence;
        const events = [];
        const currentDate = new Date(baseEvent.startTime);
        const maxDate = endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        while (currentDate <= maxDate && events.length < 100) {
            switch (type) {
                case 'daily':
                    currentDate.setDate(currentDate.getDate() + interval);
                    break;
                case 'weekly':
                    currentDate.setDate(currentDate.getDate() + 7 * interval);
                    break;
                case 'monthly':
                    currentDate.setMonth(currentDate.getMonth() + interval);
                    break;
            }
            if (currentDate <= maxDate) {
                const recurringEvent = {
                    ...baseEvent,
                    startTime: new Date(currentDate),
                    endTime: new Date(currentDate.getTime() +
                        (baseEvent.endTime.getTime() - baseEvent.startTime.getTime())),
                    metadata: {
                        ...baseEvent.metadata,
                        isRecurring: true,
                        parentEventId: baseEvent.id,
                    },
                };
                events.push(recurringEvent);
            }
        }
        for (const event of events) {
            await this.scheduleEvent(event);
        }
        this.logger.log(`Created ${events.length} recurring events for ${baseEvent.title}`);
    }
    checkUpcomingEvents() {
        for (const [sessionId, sessionEvents] of this.events.entries()) {
            sessionEvents.forEach((event) => {
                if (event.reminders && event.status === 'scheduled') {
                    event.reminders.forEach((reminder) => {
                        const reminderTime = new Date(event.startTime.getTime() - reminder.time * 60 * 1000);
                        const now = new Date();
                        if (Math.abs(now.getTime() - reminderTime.getTime()) < 60 * 1000) {
                            this.sendEventReminder(event, reminder, sessionId);
                        }
                    });
                }
            });
        }
    }
    sendEventReminder(event, reminder, sessionId) {
        this.websocketGateway.emitToSession(sessionId, 'event_reminder', {
            event,
            reminder,
            message: `Reminder: "${event.title}" starts in ${reminder.time} minutes`,
            time: reminder.time,
        });
        this.logger.log(`Sent reminder for event: ${event.title} (${reminder.time} minutes before)`);
    }
};
exports.CalendarService = CalendarService;
exports.CalendarService = CalendarService = CalendarService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService])
], CalendarService);
//# sourceMappingURL=calendar.service.js.map