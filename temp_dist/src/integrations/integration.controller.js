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
var IntegrationController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationController = void 0;
const common_1 = require("@nestjs/common");
const integration_service_1 = require("./integration.service");
const swagger_1 = require("@nestjs/swagger");
let IntegrationController = IntegrationController_1 = class IntegrationController {
    constructor(integrationService) {
        this.integrationService = integrationService;
        this.logger = new common_1.Logger(IntegrationController_1.name);
    }
    async sendEmail(payload) {
        try {
            const result = await this.integrationService.sendEmail(payload.sessionId, payload.message, payload.provider || 'google');
            return {
                success: true,
                messageId: result.id || result.messageId,
                message: 'Email sent successfully',
            };
        }
        catch (error) {
            this.logger.error('Send email failed:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async createCalendarEvent(payload) {
        try {
            const result = await this.integrationService.createCalendarEvent(payload.sessionId, payload.event, payload.provider || 'google-calendar');
            return {
                success: true,
                eventId: result.id,
                eventUrl: result.htmlLink || result.webLink,
                message: 'Calendar event created successfully',
            };
        }
        catch (error) {
            this.logger.error('Create calendar event failed:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async postToSocialMedia(platform, payload) {
        try {
            const result = await this.integrationService.postToSocialMedia(payload.sessionId, platform, payload.content);
            return {
                success: true,
                postId: result.id,
                message: `Posted successfully to ${platform}`,
                result,
            };
        }
        catch (error) {
            this.logger.error(`Post to ${platform} failed:`, error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async uploadToYouTube(payload) {
        try {
            const result = await this.integrationService.uploadToYouTube(payload.sessionId, payload.videoData);
            return {
                success: true,
                videoId: result.id,
                videoUrl: `https://www.youtube.com/watch?v=${result.id}`,
                message: 'Video uploaded successfully to YouTube',
            };
        }
        catch (error) {
            this.logger.error('YouTube upload failed:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
};
exports.IntegrationController = IntegrationController;
__decorate([
    (0, common_1.Post)('email/send'),
    (0, swagger_1.ApiOperation)({
        summary: 'Send email',
        description: 'Send an email through connected email provider (Gmail or Outlook)',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Email sending parameters',
        schema: {
            type: 'object',
            properties: {
                sessionId: { type: 'string', example: 'user-session-123' },
                provider: {
                    type: 'string',
                    enum: ['google', 'microsoft'],
                    example: 'google',
                },
                message: {
                    type: 'object',
                    properties: {
                        to: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['recipient@example.com'],
                        },
                        cc: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['cc@example.com'],
                        },
                        bcc: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['bcc@example.com'],
                        },
                        subject: { type: 'string', example: 'Hello from Misy Agent' },
                        body: { type: 'string', example: '<p>This is an HTML email</p>' },
                        isHtml: { type: 'boolean', example: true },
                        attachments: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    filename: { type: 'string' },
                                    content: { type: 'string' },
                                    contentType: { type: 'string' },
                                },
                            },
                        },
                    },
                    required: ['to', 'subject', 'body'],
                },
            },
            required: ['sessionId', 'message'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email sent successfully' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid parameters or missing account',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "sendEmail", null);
__decorate([
    (0, common_1.Post)('calendar/create-event'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create calendar event',
        description: 'Create a calendar event in Google Calendar or Microsoft Calendar',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Calendar event parameters',
        schema: {
            type: 'object',
            properties: {
                sessionId: { type: 'string', example: 'user-session-123' },
                provider: {
                    type: 'string',
                    enum: ['google-calendar', 'microsoft-calendar'],
                    example: 'google-calendar',
                },
                event: {
                    type: 'object',
                    properties: {
                        title: { type: 'string', example: 'Team Meeting' },
                        description: { type: 'string', example: 'Weekly team sync' },
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
                        location: { type: 'string', example: 'Conference Room' },
                        attendees: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['attendee@example.com'],
                        },
                        isAllDay: { type: 'boolean', example: false },
                        recurrence: {
                            type: 'object',
                            properties: {
                                frequency: {
                                    type: 'string',
                                    enum: ['daily', 'weekly', 'monthly', 'yearly'],
                                },
                                interval: { type: 'number', example: 1 },
                                until: {
                                    type: 'string',
                                    format: 'date-time',
                                    example: '2024-12-31T23:59:59Z',
                                },
                            },
                        },
                    },
                    required: ['title', 'startTime', 'endTime'],
                },
            },
            required: ['sessionId', 'event'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Calendar event created successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid parameters or missing account',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "createCalendarEvent", null);
__decorate([
    (0, common_1.Post)('social/post/:platform'),
    (0, swagger_1.ApiOperation)({
        summary: 'Post to social media',
        description: 'Post content to social media platforms (Instagram, Facebook, etc.)',
    }),
    (0, swagger_1.ApiParam)({
        name: 'platform',
        description: 'Social media platform',
        enum: ['instagram', 'facebook', 'twitter', 'linkedin', 'youtube'],
    }),
    (0, swagger_1.ApiBody)({
        description: 'Social media post parameters',
        schema: {
            type: 'object',
            properties: {
                sessionId: { type: 'string', example: 'user-session-123' },
                content: {
                    type: 'object',
                    properties: {
                        text: { type: 'string', example: 'Check out our latest update!' },
                        imageUrls: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['https://example.com/image.jpg'],
                        },
                        videoUrls: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['https://example.com/video.mp4'],
                        },
                    },
                    required: ['text'],
                },
            },
            required: ['sessionId', 'content'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Post published successfully' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid parameters or missing account',
    }),
    __param(0, (0, common_1.Param)('platform')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "postToSocialMedia", null);
__decorate([
    (0, common_1.Post)('youtube/upload'),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload video to YouTube',
        description: 'Upload a video to YouTube with metadata',
    }),
    (0, swagger_1.ApiBody)({
        description: 'YouTube video upload parameters',
        schema: {
            type: 'object',
            properties: {
                sessionId: { type: 'string', example: 'user-session-123' },
                videoData: {
                    type: 'object',
                    properties: {
                        title: { type: 'string', example: 'My Awesome Video' },
                        description: {
                            type: 'string',
                            example: 'Check out this amazing content!',
                        },
                        videoFile: {
                            type: 'string',
                            format: 'binary',
                            description: 'Video file binary data',
                        },
                        tags: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['tutorial', 'tech'],
                        },
                        privacy: {
                            type: 'string',
                            enum: ['public', 'unlisted', 'private'],
                            example: 'public',
                        },
                    },
                    required: ['title', 'description', 'videoFile'],
                },
            },
            required: ['sessionId', 'videoData'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Video uploaded successfully' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid parameters or missing account',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "uploadToYouTube", null);
exports.IntegrationController = IntegrationController = IntegrationController_1 = __decorate([
    (0, swagger_1.ApiTags)('integrations'),
    (0, common_1.Controller)('integrations'),
    __metadata("design:paramtypes", [integration_service_1.IntegrationService])
], IntegrationController);
//# sourceMappingURL=integration.controller.js.map