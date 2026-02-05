import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  CalendarService,
  CalendarEvent,
  CalendarQuery,
} from './calendar.service';
import { CalendarEventDto, ScheduleEventDto } from './dtos/calendar-event.dto';
import { CalendarQueryDto } from './dtos/calendar-query.dto';
import { CampaignMilestonesDto } from './dtos/campaign-milestones.dto';
// Swagger imports
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('calendar')
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post('events')
  @ApiOperation({
    summary: 'Schedule calendar event',
    description: 'Create a new calendar event in the internal calendar system',
  })
  @ApiBody({
    description: 'Calendar event parameters',
    schema: {
      type: 'object',
      properties: {
        event: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'Content Review Meeting' },
            description: {
              type: 'string',
              example: 'Weekly content review and approval',
            },
            startTime: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-20T15:00:00Z',
            },
            endTime: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-20T16:00:00Z',
            },
            type: {
              type: 'string',
              enum: [
                'content_publish',
                'campaign_milestone',
                'review',
                'analysis',
                'meeting',
              ],
              example: 'meeting',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              example: 'high',
            },
            sessionId: { type: 'string', example: 'user-session-123' },
            metadata: {
              type: 'object',
              properties: {
                contentId: { type: 'string', example: 'content-123' },
                campaignId: { type: 'string', example: 'campaign-456' },
                channels: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['instagram', 'facebook'],
                },
                contentType: { type: 'string', example: 'video' },
                assignedAgent: {
                  type: 'string',
                  example: 'agent-post-scheduler',
                },
              },
            },
            recurrence: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['daily', 'weekly', 'monthly'],
                  example: 'weekly',
                },
                interval: { type: 'number', example: 1 },
                endDate: {
                  type: 'string',
                  format: 'date-time',
                  example: '2024-12-31T23:59:59Z',
                },
              },
            },
            reminders: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  time: {
                    type: 'number',
                    example: 30,
                    description: 'Minutes before event',
                  },
                  type: {
                    type: 'string',
                    enum: ['notification', 'email', 'webhook'],
                    example: 'notification',
                  },
                },
              },
            },
          },
          required: [
            'title',
            'description',
            'startTime',
            'endTime',
            'type',
            'priority',
            'sessionId',
          ],
        },
      },
      required: ['event'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Calendar event scheduled successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  async scheduleEvent(@Body() dto: ScheduleEventDto) {
    // Convert string dates to Date objects
    const eventWithDates: Omit<CalendarEvent, 'id' | 'status'> = {
      ...dto.event,
      startTime: new Date(dto.event.startTime),
      endTime: new Date(dto.event.endTime),
      sessionId: dto.event.sessionId,
      type: dto.event.type,
      priority: dto.event.priority,
      description: dto.event.description,
      title: dto.event.title,
      metadata: dto.event.metadata,
      recurrence: dto.event.recurrence
        ? {
            ...dto.event.recurrence,
            endDate: dto.event.recurrence.endDate
              ? new Date(dto.event.recurrence.endDate)
              : undefined,
          }
        : undefined,
      reminders: dto.event.reminders,
    };

    return this.calendarService.scheduleEvent(eventWithDates);
  }

  @Get('events/:sessionId')
  @ApiOperation({
    summary: 'Get calendar events',
    description:
      'Retrieve calendar events for a specific session with optional filtering',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'User session ID',
    example: 'user-session-123',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Filter events after this date',
    required: false,
    type: 'string',
    format: 'date-time',
  })
  @ApiQuery({
    name: 'endDate',
    description: 'Filter events before this date',
    required: false,
    type: 'string',
    format: 'date-time',
  })
  @ApiQuery({
    name: 'type',
    description: 'Filter events by type',
    required: false,
    type: 'string',
  })
  @ApiQuery({
    name: 'status',
    description: 'Filter events by status',
    required: false,
    type: 'string',
  })
  @ApiQuery({
    name: 'campaignId',
    description: 'Filter events by campaign ID',
    required: false,
    type: 'string',
  })
  @ApiResponse({ status: 200, description: 'List of calendar events' })
  async getEvents(
    @Param('sessionId') sessionId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('campaignId') campaignId?: string,
  ) {
    const query: CalendarQuery = {
      sessionId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      type: type as CalendarEvent['type'],
      status: status as CalendarEvent['status'],
      campaignId,
    };

    return this.calendarService.getEvents(query);
  }

  @Put('events/:eventId/:sessionId')
  @ApiOperation({
    summary: 'Update calendar event',
    description: 'Update an existing calendar event',
  })
  @ApiParam({
    name: 'eventId',
    description: 'Calendar event ID',
    example: 'event-123',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'User session ID',
    example: 'user-session-123',
  })
  @ApiBody({
    description: 'Calendar event updates',
    schema: {
      type: 'object',
      properties: {
        updates: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'Updated Meeting Title' },
            description: {
              type: 'string',
              example: 'Updated meeting description',
            },
            startTime: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-20T15:00:00Z',
            },
            endTime: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-20T16:00:00Z',
            },
            type: {
              type: 'string',
              enum: [
                'content_publish',
                'campaign_milestone',
                'review',
                'analysis',
                'meeting',
              ],
              example: 'meeting',
            },
            status: {
              type: 'string',
              enum: ['scheduled', 'completed', 'cancelled', 'in_progress'],
              example: 'completed',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              example: 'high',
            },
            metadata: {
              type: 'object',
              properties: {
                contentId: { type: 'string', example: 'content-123' },
                campaignId: { type: 'string', example: 'campaign-456' },
                channels: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['instagram', 'facebook'],
                },
                contentType: { type: 'string', example: 'video' },
                assignedAgent: {
                  type: 'string',
                  example: 'agent-post-scheduler',
                },
              },
            },
          },
        },
      },
      required: ['updates'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Calendar event updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid parameters or event not found',
  })
  async updateEvent(
    @Param('eventId') eventId: string,
    @Param('sessionId') sessionId: string,
    @Body('updates') updates: Partial<CalendarEvent>,
  ) {
    return this.calendarService.updateEvent(eventId, sessionId, updates);
  }

  @Delete('events/:eventId/:sessionId')
  @ApiOperation({
    summary: 'Delete calendar event',
    description: 'Remove a calendar event from the system',
  })
  @ApiParam({
    name: 'eventId',
    description: 'Calendar event ID',
    example: 'event-123',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'User session ID',
    example: 'user-session-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Calendar event deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid parameters or event not found',
  })
  async deleteEvent(
    @Param('eventId') eventId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.calendarService.deleteEvent(eventId, sessionId);
  }

  @Get('events/upcoming/:sessionId')
  @ApiOperation({
    summary: 'Get upcoming events',
    description:
      'Retrieve upcoming calendar events for the next 24 hours (default) or specified hours',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'User session ID',
    example: 'user-session-123',
  })
  @ApiQuery({
    name: 'hours',
    description: 'Number of hours to look ahead for events',
    required: false,
    type: 'number',
    example: 24,
  })
  @ApiResponse({ status: 200, description: 'List of upcoming calendar events' })
  async getUpcomingEvents(
    @Param('sessionId') sessionId: string,
    @Query('hours') hours?: string,
  ) {
    return this.calendarService.getUpcomingEvents(
      sessionId,
      hours ? parseInt(hours) : 24,
    );
  }

  @Get('events/overdue/:sessionId')
  @ApiOperation({
    summary: 'Get overdue events',
    description:
      'Retrieve calendar events that should have occurred but are still scheduled',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'User session ID',
    example: 'user-session-123',
  })
  @ApiResponse({ status: 200, description: 'List of overdue calendar events' })
  async getOverdueEvents(@Param('sessionId') sessionId: string) {
    return this.calendarService.getOverdueEvents(sessionId);
  }

  @Post('events/:eventId/complete/:sessionId')
  @ApiOperation({
    summary: 'Mark event as completed',
    description: 'Mark a calendar event as completed and update related tasks',
  })
  @ApiParam({
    name: 'eventId',
    description: 'Calendar event ID',
    example: 'event-123',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'User session ID',
    example: 'user-session-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Calendar event marked as completed',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid parameters or event not found',
  })
  async markEventCompleted(
    @Param('eventId') eventId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.calendarService.markEventCompleted(eventId, sessionId);
  }

  @Get('stats/:sessionId')
  @ApiOperation({
    summary: 'Get calendar statistics',
    description: 'Retrieve statistics about calendar events for a session',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'User session ID',
    example: 'user-session-123',
  })
  @ApiResponse({ status: 200, description: 'Calendar statistics' })
  async getCalendarStats(@Param('sessionId') sessionId: string) {
    return this.calendarService.getCalendarStats(sessionId);
  }

  @Post('campaign/milestones')
  @ApiOperation({
    summary: 'Schedule campaign milestones',
    description: 'Create calendar events for key campaign milestones',
  })
  @ApiBody({
    description: 'Campaign milestone parameters',
    schema: {
      type: 'object',
      properties: {
        campaignId: { type: 'string', example: 'campaign-123' },
        campaignTitle: { type: 'string', example: 'Summer Marketing Campaign' },
        startDate: {
          type: 'string',
          format: 'date-time',
          example: '2024-06-01T00:00:00Z',
        },
        duration: {
          type: 'number',
          example: 30,
          description: 'Campaign duration in days',
        },
        sessionId: { type: 'string', example: 'user-session-123' },
      },
      required: [
        'campaignId',
        'campaignTitle',
        'startDate',
        'duration',
        'sessionId',
      ],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Campaign milestones scheduled successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  async scheduleCampaignMilestones(@Body() dto: CampaignMilestonesDto) {
    return this.calendarService.scheduleCampaignMilestones(
      dto.campaignId,
      dto.campaignTitle,
      new Date(dto.startDate),
      dto.duration,
      dto.sessionId,
    );
  }
}
