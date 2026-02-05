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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarController = void 0;
const common_1 = require("@nestjs/common");
const calendar_service_1 = require("./calendar.service");
const calendar_event_dto_1 = require("./dtos/calendar-event.dto");
const campaign_milestones_dto_1 = require("./dtos/campaign-milestones.dto");
const swagger_1 = require("@nestjs/swagger");
let CalendarController = class CalendarController {
    constructor(calendarService) {
        this.calendarService = calendarService;
    }
    async scheduleEvent(dto) {
        const eventWithDates = {
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
    async getEvents(sessionId, startDate, endDate, type, status, campaignId) {
        const query = {
            sessionId,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            type: type,
            status: status,
            campaignId,
        };
        return this.calendarService.getEvents(query);
    }
    async updateEvent(eventId, sessionId, updates) {
        return this.calendarService.updateEvent(eventId, sessionId, updates);
    }
    async deleteEvent(eventId, sessionId) {
        return this.calendarService.deleteEvent(eventId, sessionId);
    }
    async getUpcomingEvents(sessionId, hours) {
        return this.calendarService.getUpcomingEvents(sessionId, hours ? parseInt(hours) : 24);
    }
    async getOverdueEvents(sessionId) {
        return this.calendarService.getOverdueEvents(sessionId);
    }
    async markEventCompleted(eventId, sessionId) {
        return this.calendarService.markEventCompleted(eventId, sessionId);
    }
    async getCalendarStats(sessionId) {
        return this.calendarService.getCalendarStats(sessionId);
    }
    async scheduleCampaignMilestones(dto) {
        return this.calendarService.scheduleCampaignMilestones(dto.campaignId, dto.campaignTitle, new Date(dto.startDate), dto.duration, dto.sessionId);
    }
};
exports.CalendarController = CalendarController;
__decorate([
    (0, common_1.Post)('events'),
    (0, swagger_1.ApiOperation)({
        summary: 'Schedule calendar event',
        description: 'Create a new calendar event in the internal calendar system',
    }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Calendar event scheduled successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid parameters' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [calendar_event_dto_1.ScheduleEventDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "scheduleEvent", null);
__decorate([
    (0, common_1.Get)('events/:sessionId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get calendar events',
        description: 'Retrieve calendar events for a specific session with optional filtering',
    }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'User session ID',
        example: 'user-session-123',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'startDate',
        description: 'Filter events after this date',
        required: false,
        type: 'string',
        format: 'date-time',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'endDate',
        description: 'Filter events before this date',
        required: false,
        type: 'string',
        format: 'date-time',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'type',
        description: 'Filter events by type',
        required: false,
        type: 'string',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        description: 'Filter events by status',
        required: false,
        type: 'string',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'campaignId',
        description: 'Filter events by campaign ID',
        required: false,
        type: 'string',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of calendar events' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('type')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('campaignId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getEvents", null);
__decorate([
    (0, common_1.Put)('events/:eventId/:sessionId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update calendar event',
        description: 'Update an existing calendar event',
    }),
    (0, swagger_1.ApiParam)({
        name: 'eventId',
        description: 'Calendar event ID',
        example: 'event-123',
    }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'User session ID',
        example: 'user-session-123',
    }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Calendar event updated successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid parameters or event not found',
    }),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, common_1.Body)('updates')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "updateEvent", null);
__decorate([
    (0, common_1.Delete)('events/:eventId/:sessionId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete calendar event',
        description: 'Remove a calendar event from the system',
    }),
    (0, swagger_1.ApiParam)({
        name: 'eventId',
        description: 'Calendar event ID',
        example: 'event-123',
    }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'User session ID',
        example: 'user-session-123',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Calendar event deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid parameters or event not found',
    }),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "deleteEvent", null);
__decorate([
    (0, common_1.Get)('events/upcoming/:sessionId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get upcoming events',
        description: 'Retrieve upcoming calendar events for the next 24 hours (default) or specified hours',
    }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'User session ID',
        example: 'user-session-123',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'hours',
        description: 'Number of hours to look ahead for events',
        required: false,
        type: 'number',
        example: 24,
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of upcoming calendar events' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Query)('hours')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getUpcomingEvents", null);
__decorate([
    (0, common_1.Get)('events/overdue/:sessionId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get overdue events',
        description: 'Retrieve calendar events that should have occurred but are still scheduled',
    }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'User session ID',
        example: 'user-session-123',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of overdue calendar events' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getOverdueEvents", null);
__decorate([
    (0, common_1.Post)('events/:eventId/complete/:sessionId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Mark event as completed',
        description: 'Mark a calendar event as completed and update related tasks',
    }),
    (0, swagger_1.ApiParam)({
        name: 'eventId',
        description: 'Calendar event ID',
        example: 'event-123',
    }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'User session ID',
        example: 'user-session-123',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Calendar event marked as completed',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid parameters or event not found',
    }),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "markEventCompleted", null);
__decorate([
    (0, common_1.Get)('stats/:sessionId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get calendar statistics',
        description: 'Retrieve statistics about calendar events for a session',
    }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'User session ID',
        example: 'user-session-123',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Calendar statistics' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getCalendarStats", null);
__decorate([
    (0, common_1.Post)('campaign/milestones'),
    (0, swagger_1.ApiOperation)({
        summary: 'Schedule campaign milestones',
        description: 'Create calendar events for key campaign milestones',
    }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Campaign milestones scheduled successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid parameters' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [campaign_milestones_dto_1.CampaignMilestonesDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "scheduleCampaignMilestones", null);
exports.CalendarController = CalendarController = __decorate([
    (0, swagger_1.ApiTags)('calendar'),
    (0, common_1.Controller)('calendar'),
    __metadata("design:paramtypes", [calendar_service_1.CalendarService])
], CalendarController);
//# sourceMappingURL=calendar.controller.js.map