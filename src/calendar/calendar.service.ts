import { Injectable, Logger } from '@nestjs/common';
import { StateManagementService } from '../state/state-management.service';
import { WebSocketGatewayService } from '../websocket/websocket.gateway';

export interface CalendarEvent {
  id?: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  type:
    | 'content_publish'
    | 'campaign_milestone'
    | 'review'
    | 'analysis'
    | 'meeting';
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
    time: number; // minutes before event
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
  eventsByType: { [key: string]: number };
  eventsByStatus: { [key: string]: number };
}

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);
  private events = new Map<string, CalendarEvent[]>(); // sessionId -> events[]

  constructor(
    private readonly stateManager: StateManagementService,
    private readonly websocketGateway: WebSocketGatewayService,
  ) {
    // Check for upcoming events every minute
    setInterval(() => this.checkUpcomingEvents(), 60 * 1000);
  }

  async scheduleEvent(
    event: Omit<CalendarEvent, 'id' | 'status'>,
  ): Promise<CalendarEvent> {
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const calendarEvent: CalendarEvent = {
      ...event,
      id: eventId,
      status: 'scheduled',
    };

    // Add to session events
    const sessionEvents = this.events.get(event.sessionId) || [];
    sessionEvents.push(calendarEvent);
    this.events.set(event.sessionId, sessionEvents);

    // Add task to state management
    this.stateManager.addTask(event.sessionId, {
      type: 'calendar_event',
      status: 'pending',
      data: calendarEvent,
    });

    this.logger.log(`Scheduled event: ${event.title} for ${event.startTime}`);

    // Notify via WebSocket
    this.websocketGateway.emitCalendarUpdate(event.sessionId, {
      type: 'event_scheduled',
      event: calendarEvent,
      message: `Event "${event.title}" scheduled for ${event.startTime.toLocaleString()}`,
    });

    // Handle recurring events
    if (event.recurrence) {
      await this.createRecurringEvents(calendarEvent);
    }

    return calendarEvent;
  }

  async getEvents(query: CalendarQuery): Promise<CalendarEvent[]> {
    const sessionEvents = this.events.get(query.sessionId) || [];

    let filteredEvents = sessionEvents;

    // Filter by date range
    if (query.startDate || query.endDate) {
      filteredEvents = filteredEvents.filter((event) => {
        const eventDate = event.startTime;
        const afterStart = !query.startDate || eventDate >= query.startDate;
        const beforeEnd = !query.endDate || eventDate <= query.endDate;
        return afterStart && beforeEnd;
      });
    }

    // Filter by type
    if (query.type) {
      filteredEvents = filteredEvents.filter(
        (event) => event.type === query.type,
      );
    }

    // Filter by status
    if (query.status) {
      filteredEvents = filteredEvents.filter(
        (event) => event.status === query.status,
      );
    }

    // Filter by campaign
    if (query.campaignId) {
      filteredEvents = filteredEvents.filter(
        (event) => event.metadata?.campaignId === query.campaignId,
      );
    }

    // Sort by start time
    return filteredEvents.sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime(),
    );
  }

  async updateEvent(
    eventId: string,
    sessionId: string,
    updates: Partial<CalendarEvent>,
  ): Promise<CalendarEvent | null> {
    const sessionEvents = this.events.get(sessionId) || [];
    const eventIndex = sessionEvents.findIndex((event) => event.id === eventId);

    if (eventIndex === -1) {
      return null;
    }

    const updatedEvent = { ...sessionEvents[eventIndex], ...updates };
    sessionEvents[eventIndex] = updatedEvent;
    this.events.set(sessionId, sessionEvents);

    this.logger.log(`Updated event: ${eventId}`);

    // Notify via WebSocket
    this.websocketGateway.emitCalendarUpdate(sessionId, {
      type: 'event_updated',
      event: updatedEvent,
      message: `Event "${updatedEvent.title}" updated`,
    });

    return updatedEvent;
  }

  async deleteEvent(eventId: string, sessionId: string): Promise<boolean> {
    const sessionEvents = this.events.get(sessionId) || [];
    const eventIndex = sessionEvents.findIndex((event) => event.id === eventId);

    if (eventIndex === -1) {
      return false;
    }

    const deletedEvent = sessionEvents.splice(eventIndex, 1)[0];
    this.events.set(sessionId, sessionEvents);

    this.logger.log(`Deleted event: ${eventId}`);

    // Notify via WebSocket
    this.websocketGateway.emitCalendarUpdate(sessionId, {
      type: 'event_deleted',
      eventId,
      message: `Event "${deletedEvent.title}" deleted`,
    });

    return true;
  }

  async getUpcomingEvents(
    sessionId: string,
    hours = 24,
  ): Promise<CalendarEvent[]> {
    const now = new Date();
    const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

    return this.getEvents({
      sessionId,
      startDate: now,
      endDate: futureTime,
      status: 'scheduled',
    });
  }

  async getOverdueEvents(sessionId: string): Promise<CalendarEvent[]> {
    const now = new Date();
    const sessionEvents = this.events.get(sessionId) || [];

    return sessionEvents.filter(
      (event) => event.status === 'scheduled' && event.startTime < now,
    );
  }

  async markEventCompleted(
    eventId: string,
    sessionId: string,
  ): Promise<CalendarEvent | null> {
    const updatedEvent = await this.updateEvent(eventId, sessionId, {
      status: 'completed',
    });

    if (updatedEvent) {
      // Update related task
      const tasks = this.stateManager.getTasks(sessionId);
      const relatedTask = tasks.find(
        (task) => task.type === 'calendar_event' && task.data?.id === eventId,
      );

      if (relatedTask) {
        this.stateManager.updateTask(sessionId, relatedTask.id, {
          status: 'completed',
        });
      }

      this.logger.log(`Marked event completed: ${eventId}`);
    }

    return updatedEvent;
  }

  async getCalendarStats(sessionId: string): Promise<CalendarStats> {
    const sessionEvents = this.events.get(sessionId) || [];
    const now = new Date();

    const stats: CalendarStats = {
      totalEvents: sessionEvents.length,
      upcomingEvents: 0,
      completedEvents: 0,
      overdueEvents: 0,
      eventsByType: {},
      eventsByStatus: {},
    };

    sessionEvents.forEach((event) => {
      // Count by status
      stats.eventsByStatus[event.status] =
        (stats.eventsByStatus[event.status] || 0) + 1;

      // Count by type
      stats.eventsByType[event.type] =
        (stats.eventsByType[event.type] || 0) + 1;

      // Count specific categories
      if (event.status === 'completed') {
        stats.completedEvents++;
      } else if (event.status === 'scheduled') {
        if (event.startTime > now) {
          stats.upcomingEvents++;
        } else {
          stats.overdueEvents++;
        }
      }
    });

    return stats;
  }

  // Campaign-specific calendar methods
  async scheduleCampaignMilestones(
    campaignId: string,
    campaignTitle: string,
    startDate: Date,
    duration: number,
    sessionId: string,
  ): Promise<CalendarEvent[]> {
    const milestones: Omit<CalendarEvent, 'id' | 'status'>[] = [];

    // Campaign kickoff
    milestones.push({
      title: `Campaign Kickoff: ${campaignTitle}`,
      description: 'Campaign launch and initial content publication',
      startTime: startDate,
      endTime: new Date(startDate.getTime() + 2 * 60 * 60 * 1000), // 2 hours
      type: 'campaign_milestone',
      priority: 'high',
      metadata: { campaignId, milestone: 'kickoff' },
      sessionId,
    });

    // Mid-campaign review
    if (duration > 7) {
      const midDate = new Date(
        startDate.getTime() + (duration / 2) * 24 * 60 * 60 * 1000,
      );
      milestones.push({
        title: `Mid-Campaign Review: ${campaignTitle}`,
        description:
          'Review campaign performance and adjust strategy if needed',
        startTime: midDate,
        endTime: new Date(midDate.getTime() + 60 * 60 * 1000), // 1 hour
        type: 'review',
        priority: 'medium',
        metadata: { campaignId, milestone: 'mid_review' },
        sessionId,
      });
    }

    // Campaign completion
    const endDate = new Date(
      startDate.getTime() + duration * 24 * 60 * 60 * 1000,
    );
    milestones.push({
      title: `Campaign Completion: ${campaignTitle}`,
      description: 'Campaign end and final analysis',
      startTime: endDate,
      endTime: new Date(endDate.getTime() + 60 * 60 * 1000), // 1 hour
      type: 'campaign_milestone',
      priority: 'high',
      metadata: { campaignId, milestone: 'completion' },
      sessionId,
    });

    // Post-campaign analysis
    const analysisDate = new Date(endDate.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days after
    milestones.push({
      title: `Post-Campaign Analysis: ${campaignTitle}`,
      description: 'Comprehensive campaign performance analysis and reporting',
      startTime: analysisDate,
      endTime: new Date(analysisDate.getTime() + 2 * 60 * 60 * 1000), // 2 hours
      type: 'analysis',
      priority: 'medium',
      metadata: { campaignId, milestone: 'analysis' },
      sessionId,
    });

    // Schedule all milestones
    const scheduledMilestones: CalendarEvent[] = [];
    for (const milestone of milestones) {
      const scheduled = await this.scheduleEvent(milestone);
      scheduledMilestones.push(scheduled);
    }

    return scheduledMilestones;
  }

  private async createRecurringEvents(baseEvent: CalendarEvent): Promise<void> {
    if (!baseEvent.recurrence) return;

    const { type, interval, endDate } = baseEvent.recurrence;
    const events: Omit<CalendarEvent, 'id' | 'status'>[] = [];

    const currentDate = new Date(baseEvent.startTime);
    const maxDate = endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Max 1 year

    while (currentDate <= maxDate && events.length < 100) {
      // Max 100 recurring events
      // Calculate next occurrence
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
        const recurringEvent: Omit<CalendarEvent, 'id' | 'status'> = {
          ...baseEvent,
          startTime: new Date(currentDate),
          endTime: new Date(
            currentDate.getTime() +
              (baseEvent.endTime.getTime() - baseEvent.startTime.getTime()),
          ),
          metadata: {
            ...baseEvent.metadata,
            isRecurring: true,
            parentEventId: baseEvent.id,
          },
        };

        events.push(recurringEvent);
      }
    }

    // Schedule recurring events
    for (const event of events) {
      await this.scheduleEvent(event);
    }

    this.logger.log(
      `Created ${events.length} recurring events for ${baseEvent.title}`,
    );
  }

  private checkUpcomingEvents(): void {
    // Check all sessions for upcoming events that need reminders
    for (const [sessionId, sessionEvents] of this.events.entries()) {
      sessionEvents.forEach((event) => {
        if (event.reminders && event.status === 'scheduled') {
          event.reminders.forEach((reminder) => {
            const reminderTime = new Date(
              event.startTime.getTime() - reminder.time * 60 * 1000,
            );
            const now = new Date();

            // Check if reminder should be sent (within 1 minute window)
            if (Math.abs(now.getTime() - reminderTime.getTime()) < 60 * 1000) {
              this.sendEventReminder(event, reminder, sessionId);
            }
          });
        }
      });
    }
  }

  private sendEventReminder(
    event: CalendarEvent,
    reminder: NonNullable<CalendarEvent['reminders']>[0],
    sessionId: string,
  ): void {
    this.websocketGateway.emitToSession(sessionId, 'event_reminder', {
      event,
      reminder,
      message: `Reminder: "${event.title}" starts in ${reminder.time} minutes`,
      time: reminder.time,
    });

    this.logger.log(
      `Sent reminder for event: ${event.title} (${reminder.time} minutes before)`,
    );
  }
}
