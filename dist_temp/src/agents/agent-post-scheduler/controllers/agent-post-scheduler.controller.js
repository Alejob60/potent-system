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
exports.AgentPostSchedulerController = void 0;
const common_1 = require("@nestjs/common");
const agent_post_scheduler_service_1 = require("../services/agent-post-scheduler.service");
const create_agent_post_scheduler_dto_1 = require("../dto/create-agent-post-scheduler.dto");
const swagger_1 = require("@nestjs/swagger");
let AgentPostSchedulerController = class AgentPostSchedulerController {
    constructor(service) {
        this.service = service;
    }
    async create(dto) {
        return this.service.create(dto);
    }
    async findAll() {
        return this.service.findAll();
    }
    async findOne(id) {
        return this.service.findOne(id);
    }
};
exports.AgentPostSchedulerController = AgentPostSchedulerController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Schedule social media post',
        description: 'Create and schedule a social media post for specified platforms and time',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Post scheduling parameters',
        schema: {
            type: 'object',
            properties: {
                sessionId: { type: 'string', example: 'user-session-123' },
                platform: {
                    type: 'string',
                    example: 'instagram',
                    description: 'Target social media platform (instagram, facebook, twitter, etc.)',
                },
                content: {
                    type: 'string',
                    example: 'Check out our latest product! #innovation #tech',
                    description: 'Post content including text and hashtags',
                },
                scheduledTime: {
                    type: 'string',
                    format: 'date-time',
                    example: '2025-12-25T10:00:00Z',
                    description: 'When to publish the post (ISO 8601 format)',
                },
                mediaUrl: {
                    type: 'string',
                    example: 'https://storage.example.com/image.jpg',
                    description: 'URL to associated image or video',
                },
                targeting: {
                    type: 'object',
                    properties: {
                        audience: { type: 'string', example: 'followers' },
                        location: { type: 'string', example: 'New York, NY' },
                    },
                    description: 'Targeting parameters for the post',
                },
            },
            required: ['sessionId', 'platform', 'content'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Social media post scheduled successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: 'uuid-123' },
                sessionId: { type: 'string', example: 'user-session-123' },
                status: { type: 'string', example: 'scheduled' },
                result: {
                    type: 'object',
                    properties: {
                        postId: { type: 'string', example: 'post-456' },
                        scheduledTime: { type: 'string', format: 'date-time' },
                        platform: { type: 'string', example: 'instagram' },
                    },
                },
                createdAt: { type: 'string', format: 'date-time' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid parameters provided' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_agent_post_scheduler_dto_1.CreateAgentPostSchedulerDto]),
    __metadata("design:returntype", Promise)
], AgentPostSchedulerController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all scheduled posts',
        description: 'Retrieve a list of all social media posts scheduled by this agent',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of scheduled posts',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    sessionId: { type: 'string' },
                    status: { type: 'string' },
                    result: { type: 'object' },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentPostSchedulerController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get scheduled post by ID',
        description: 'Retrieve details of a specific scheduled post by its ID',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Scheduled post ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Scheduled post details',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                sessionId: { type: 'string' },
                status: { type: 'string' },
                result: { type: 'object' },
                createdAt: { type: 'string', format: 'date-time' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Scheduled post not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgentPostSchedulerController.prototype, "findOne", null);
exports.AgentPostSchedulerController = AgentPostSchedulerController = __decorate([
    (0, swagger_1.ApiTags)('post-scheduler'),
    (0, common_1.Controller)('agents/post-scheduler'),
    __metadata("design:paramtypes", [agent_post_scheduler_service_1.AgentPostSchedulerService])
], AgentPostSchedulerController);
//# sourceMappingURL=agent-post-scheduler.controller.js.map