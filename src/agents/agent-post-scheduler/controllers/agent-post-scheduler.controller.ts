import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AgentPostSchedulerService } from '../services/agent-post-scheduler.service';
import { CreateAgentPostSchedulerDto } from '../dto/create-agent-post-scheduler.dto';
// Swagger imports
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('post-scheduler')
@Controller('agents/post-scheduler')
export class AgentPostSchedulerController {
  constructor(private readonly service: AgentPostSchedulerService) {}

  @Post()
  @ApiOperation({
    summary: 'Schedule social media post',
    description:
      'Create and schedule a social media post for specified platforms and time',
  })
  @ApiBody({
    description: 'Post scheduling parameters',
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', example: 'user-session-123' },
        platform: {
          type: 'string',
          example: 'instagram',
          description:
            'Target social media platform (instagram, facebook, twitter, etc.)',
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
  })
  @ApiResponse({
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
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters provided' })
  async create(@Body() dto: CreateAgentPostSchedulerDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all scheduled posts',
    description:
      'Retrieve a list of all social media posts scheduled by this agent',
  })
  @ApiResponse({
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
  })
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get scheduled post by ID',
    description: 'Retrieve details of a specific scheduled post by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Scheduled post ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
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
  })
  @ApiResponse({ status: 404, description: 'Scheduled post not found' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
