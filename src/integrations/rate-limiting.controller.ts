import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { RateLimitingService, RateLimitConfig } from './rate-limiting.service';

@ApiTags('Rate Limiting')
@Controller('rate-limit')
export class RateLimitingController {
  constructor(private readonly rateLimitingService: RateLimitingService) {}

  @Post('config/:channel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set rate limit configuration for a channel' })
  @ApiParam({
    name: 'channel',
    required: true,
    type: 'string',
    example: 'whatsapp',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        windowMs: { type: 'number', example: 60000 },
        maxRequests: { type: 'number', example: 10 },
        banThreshold: { type: 'number', example: 5 },
        banDuration: { type: 'number', example: 3600000 },
      },
      required: ['windowMs', 'maxRequests'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Rate limit configuration set successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async setChannelConfig(
    @Param('channel') channel: string,
    @Body() config: RateLimitConfig,
  ) {
    try {
      this.rateLimitingService.setChannelConfig(channel, config);
      return {
        success: true,
        message: 'Rate limit configuration set successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to set rate limit configuration',
      };
    }
  }

  @Get('info/:channel/:identifier')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get rate limit information for an identifier on a channel' })
  @ApiParam({
    name: 'channel',
    required: true,
    type: 'string',
    example: 'whatsapp',
  })
  @ApiParam({
    name: 'identifier',
    required: true,
    type: 'string',
    example: '+1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Rate limit information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'No rate limit information found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getRateLimitInfo(
    @Param('channel') channel: string,
    @Param('identifier') identifier: string,
  ) {
    try {
      const data = this.rateLimitingService.getRateLimitInfo(channel, identifier);
      
      if (data) {
        return {
          success: true,
          data,
          message: 'Rate limit information retrieved successfully',
        };
      } else {
        return {
          success: false,
          message: 'No rate limit information found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve rate limit information',
      };
    }
  }

  @Post('reset/:channel/:identifier')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset rate limit for an identifier on a channel' })
  @ApiParam({
    name: 'channel',
    required: true,
    type: 'string',
    example: 'whatsapp',
  })
  @ApiParam({
    name: 'identifier',
    required: true,
    type: 'string',
    example: '+1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Rate limit reset successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async resetRateLimit(
    @Param('channel') channel: string,
    @Param('identifier') identifier: string,
  ) {
    try {
      this.rateLimitingService.resetRateLimit(channel, identifier);
      return {
        success: true,
        message: 'Rate limit reset successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to reset rate limit',
      };
    }
  }

  @Post('unban/:channel/:identifier')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unban an identifier on a channel' })
  @ApiParam({
    name: 'channel',
    required: true,
    type: 'string',
    example: 'whatsapp',
  })
  @ApiParam({
    name: 'identifier',
    required: true,
    type: 'string',
    example: '+1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Identifier unbanned successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async unbanIdentifier(
    @Param('channel') channel: string,
    @Param('identifier') identifier: string,
  ) {
    try {
      this.rateLimitingService.unbanIdentifier(channel, identifier);
      return {
        success: true,
        message: 'Identifier unbanned successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to unban identifier',
      };
    }
  }

  @Get('configs')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all rate limit configurations' })
  @ApiResponse({
    status: 200,
    description: 'Rate limit configurations retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAllConfigurations() {
    try {
      const data = this.rateLimitingService.getAllConfigurations();
      return {
        success: true,
        data: Object.fromEntries(data),
        message: 'Rate limit configurations retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve rate limit configurations',
      };
    }
  }
}