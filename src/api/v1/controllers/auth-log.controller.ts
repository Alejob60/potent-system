import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { AuthLogService } from '../../../services/auth-log.service';
import { AuthEventType } from '../../../entities/auth-log.entity';
// Swagger imports
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('security')
@Controller('auth-logs')
export class AuthLogController {
  constructor(private readonly authLogService: AuthLogService) {}

  @Get()
  @ApiOperation({
    summary: 'Get authentication logs',
    description: 'Retrieve authentication logs with optional filters',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user ID',
    example: 'user-123',
  })
  @ApiQuery({
    name: 'eventType',
    required: false,
    description: 'Filter by event type',
    enum: AuthEventType,
  })
  @ApiQuery({
    name: 'ipAddress',
    required: false,
    description: 'Filter by IP address',
    example: '192.168.1.1',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter by start date (ISO format)',
    example: '2023-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter by end date (ISO format)',
    example: '2023-12-31T23:59:59Z',
  })
  @ApiQuery({
    name: 'success',
    required: false,
    description: 'Filter by success status',
    type: Boolean,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records to return (default: 50)',
    type: Number,
    example: 50,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of records to skip (default: 0)',
    type: Number,
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication logs retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          eventType: { type: 'string', enum: Object.values(AuthEventType) },
          userId: { type: 'string', nullable: true },
          sessionId: { type: 'string', nullable: true },
          ipAddress: { type: 'string', nullable: true },
          userAgent: { type: 'string', nullable: true },
          metadata: { type: 'object' },
          errorMessage: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          countryCode: { type: 'string', nullable: true },
          city: { type: 'string', nullable: true },
          success: { type: 'boolean' },
          attemptDuration: { type: 'number', nullable: true },
        },
      },
    },
  })
  async getAuthLogs(
    @Query('userId') userId?: string,
    @Query('eventType') eventType?: AuthEventType,
    @Query('ipAddress') ipAddress?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('success') success?: boolean,
    @Query('limit', ParseIntPipe) limit: number = 50,
    @Query('offset', ParseIntPipe) offset: number = 0,
  ) {
    const filters = {
      userId,
      eventType,
      ipAddress,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      success,
    };

    return this.authLogService.getAuthLogs(filters, limit, offset);
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get authentication logs for a specific user',
    description: 'Retrieve authentication logs for a specific user',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: 'user-123',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records to return (default: 50)',
    type: Number,
    example: 50,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of records to skip (default: 0)',
    type: Number,
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication logs retrieved successfully',
  })
  async getUserAuthLogs(
    @Param('userId') userId: string,
    @Query('limit', ParseIntPipe) limit: number = 50,
    @Query('offset', ParseIntPipe) offset: number = 0,
  ) {
    const filters = { userId };
    return this.authLogService.getAuthLogs(filters, limit, offset);
  }

  @Get('ip/:ipAddress')
  @ApiOperation({
    summary: 'Get authentication logs for a specific IP address',
    description: 'Retrieve authentication logs for a specific IP address',
  })
  @ApiParam({
    name: 'ipAddress',
    description: 'IP address',
    example: '192.168.1.1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records to return (default: 50)',
    type: Number,
    example: 50,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of records to skip (default: 0)',
    type: Number,
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication logs retrieved successfully',
  })
  async getIpAuthLogs(
    @Param('ipAddress') ipAddress: string,
    @Query('limit', ParseIntPipe) limit: number = 50,
    @Query('offset', ParseIntPipe) offset: number = 0,
  ) {
    const filters = { ipAddress };
    return this.authLogService.getAuthLogs(filters, limit, offset);
  }

  @Get('failed-attempts/ip/:ipAddress')
  @ApiOperation({
    summary: 'Get failed login attempts for IP address',
    description: 'Retrieve number of failed login attempts for a specific IP address in the last hour',
  })
  @ApiParam({
    name: 'ipAddress',
    description: 'IP address',
    example: '192.168.1.1',
  })
  @ApiQuery({
    name: 'timeWindow',
    required: false,
    description: 'Time window in minutes (default: 60)',
    type: Number,
    example: 60,
  })
  @ApiResponse({
    status: 200,
    description: 'Failed attempts count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number' },
        ipAddress: { type: 'string' },
        timeWindow: { type: 'number' },
      },
    },
  })
  async getFailedAttemptsByIp(
    @Param('ipAddress') ipAddress: string,
    @Query('timeWindow', ParseIntPipe) timeWindow: number = 60,
  ) {
    const count = await this.authLogService.getFailedAttemptsByIp(ipAddress, timeWindow);
    return { count, ipAddress, timeWindow };
  }

  @Get('failed-attempts/user/:userId')
  @ApiOperation({
    summary: 'Get failed login attempts for user',
    description: 'Retrieve number of failed login attempts for a specific user in the last hour',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: 'user-123',
  })
  @ApiQuery({
    name: 'timeWindow',
    required: false,
    description: 'Time window in minutes (default: 60)',
    type: Number,
    example: 60,
  })
  @ApiResponse({
    status: 200,
    description: 'Failed attempts count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number' },
        userId: { type: 'string' },
        timeWindow: { type: 'number' },
      },
    },
  })
  async getFailedAttemptsByUser(
    @Param('userId') userId: string,
    @Query('timeWindow', ParseIntPipe) timeWindow: number = 60,
  ) {
    const count = await this.authLogService.getFailedAttemptsByUser(userId, timeWindow);
    return { count, userId, timeWindow };
  }
}