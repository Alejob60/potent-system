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
exports.SocialMediaController = void 0;
const common_1 = require("@nestjs/common");
const social_media_integration_service_1 = require("../social-media-integration.service");
const swagger_1 = require("@nestjs/swagger");
let SocialMediaController = class SocialMediaController {
    constructor(socialMediaService) {
        this.socialMediaService = socialMediaService;
    }
    async initiateOAuth(platform, body) {
        return this.socialMediaService.initiateOAuth(platform, body.sessionId, body.redirectUri);
    }
    async completeOAuth(platform, body) {
        return this.socialMediaService.completeOAuth(platform, body.code, body.state, body.redirectUri);
    }
    getConnectedAccounts(sessionId) {
        return this.socialMediaService.getConnectedAccounts(sessionId);
    }
    async publishPost(post) {
        return this.socialMediaService.publishPost(post);
    }
    async schedulePost(post) {
        return this.socialMediaService.schedulePost(post);
    }
    async getMentions(sessionId, platform, accountId, hours) {
        return this.socialMediaService.getRecentMentions(sessionId, platform, accountId, hours ? parseInt(hours) : 24);
    }
    async handleWebhook(platform, payload) {
        return this.socialMediaService.handleWebhook(platform, payload);
    }
};
exports.SocialMediaController = SocialMediaController;
__decorate([
    (0, common_1.Post)('auth/:platform/initiate'),
    (0, swagger_1.ApiOperation)({
        summary: 'Initiate social media OAuth',
        description: 'Start OAuth flow for social media platforms',
    }),
    (0, swagger_1.ApiParam)({
        name: 'platform',
        description: 'Social media platform',
        enum: ['instagram', 'facebook', 'twitter', 'linkedin', 'youtube', 'tiktok'],
    }),
    (0, swagger_1.ApiBody)({
        description: 'OAuth initiation parameters',
        schema: {
            type: 'object',
            properties: {
                sessionId: { type: 'string', example: 'user-session-123' },
                redirectUri: {
                    type: 'string',
                    example: 'http://localhost:3000/callback',
                },
            },
            required: ['sessionId', 'redirectUri'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OAuth initiation successful' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid parameters' }),
    __param(0, (0, common_1.Param)('platform')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SocialMediaController.prototype, "initiateOAuth", null);
__decorate([
    (0, common_1.Post)('auth/:platform/complete'),
    (0, swagger_1.ApiOperation)({
        summary: 'Complete social media OAuth',
        description: 'Complete OAuth flow after user authorization',
    }),
    (0, swagger_1.ApiParam)({
        name: 'platform',
        description: 'Social media platform',
        enum: ['instagram', 'facebook', 'twitter', 'linkedin', 'youtube', 'tiktok'],
    }),
    (0, swagger_1.ApiBody)({
        description: 'OAuth completion parameters',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: 'auth-code-from-platform' },
                state: { type: 'string', example: 'oauth-state-string' },
                redirectUri: {
                    type: 'string',
                    example: 'http://localhost:3000/callback',
                },
            },
            required: ['code', 'state', 'redirectUri'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OAuth completion successful' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid parameters' }),
    __param(0, (0, common_1.Param)('platform')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SocialMediaController.prototype, "completeOAuth", null);
__decorate([
    (0, common_1.Get)('accounts/:sessionId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get connected social accounts',
        description: 'Retrieve all social media accounts connected for a session',
    }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'User session ID',
        example: 'user-session-123',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of connected accounts' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SocialMediaController.prototype, "getConnectedAccounts", null);
__decorate([
    (0, common_1.Post)('publish'),
    (0, swagger_1.ApiOperation)({
        summary: 'Publish social media post',
        description: 'Publish content to social media platforms',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Social media post content',
        schema: {
            type: 'object',
            properties: {
                platform: { type: 'string', example: 'instagram' },
                accountId: { type: 'string', example: 'account-123' },
                content: {
                    type: 'object',
                    properties: {
                        text: { type: 'string', example: 'Check out our latest update!' },
                        imageUrls: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['https://example.com/image.jpg'],
                        },
                    },
                },
                status: {
                    type: 'string',
                    enum: ['draft', 'scheduled', 'published', 'failed'],
                    example: 'published',
                },
                sessionId: { type: 'string', example: 'user-session-123' },
            },
            required: ['platform', 'accountId', 'content', 'status', 'sessionId'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Post published successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid parameters' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocialMediaController.prototype, "publishPost", null);
__decorate([
    (0, common_1.Post)('schedule'),
    (0, swagger_1.ApiOperation)({
        summary: 'Schedule social media post',
        description: 'Schedule content for future publication on social media platforms',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Social media post content to schedule',
        schema: {
            type: 'object',
            properties: {
                platform: { type: 'string', example: 'instagram' },
                accountId: { type: 'string', example: 'account-123' },
                content: {
                    type: 'object',
                    properties: {
                        text: { type: 'string', example: 'Check out our latest update!' },
                        imageUrls: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['https://example.com/image.jpg'],
                        },
                    },
                },
                status: {
                    type: 'string',
                    enum: ['draft', 'scheduled', 'published', 'failed'],
                    example: 'scheduled',
                },
                sessionId: { type: 'string', example: 'user-session-123' },
            },
            required: ['platform', 'accountId', 'content', 'status', 'sessionId'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Post scheduled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid parameters' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocialMediaController.prototype, "schedulePost", null);
__decorate([
    (0, common_1.Get)('mentions/:sessionId/:platform/:accountId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get recent mentions',
        description: 'Retrieve recent mentions for a social media account',
    }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'User session ID',
        example: 'user-session-123',
    }),
    (0, swagger_1.ApiParam)({
        name: 'platform',
        description: 'Social media platform',
        example: 'instagram',
    }),
    (0, swagger_1.ApiParam)({
        name: 'accountId',
        description: 'Social media account ID',
        example: 'account-123',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'hours',
        description: 'Number of hours to look back for mentions',
        required: false,
        example: 24,
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of recent mentions' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Param)('platform')),
    __param(2, (0, common_1.Param)('accountId')),
    __param(3, (0, common_1.Query)('hours')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], SocialMediaController.prototype, "getMentions", null);
__decorate([
    (0, common_1.Post)('webhook/:platform'),
    (0, swagger_1.ApiOperation)({
        summary: 'Handle social media webhook',
        description: 'Process incoming webhooks from social media platforms',
    }),
    (0, swagger_1.ApiParam)({
        name: 'platform',
        description: 'Social media platform',
        example: 'instagram',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Webhook payload from social media platform',
        type: 'object',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    __param(0, (0, common_1.Param)('platform')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SocialMediaController.prototype, "handleWebhook", null);
exports.SocialMediaController = SocialMediaController = __decorate([
    (0, swagger_1.ApiTags)('social'),
    (0, common_1.Controller)('social'),
    __metadata("design:paramtypes", [social_media_integration_service_1.SocialMediaIntegrationService])
], SocialMediaController);
//# sourceMappingURL=social-media.controller.js.map