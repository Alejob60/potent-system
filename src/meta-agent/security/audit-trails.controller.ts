import { Controller, Post, Get, Delete, Body, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuditTrailsService, AuditLog, AuditQuery } from './audit-trails.service';

@ApiTags('Audit Trails')
@Controller('audit')
export class AuditTrailsController {
  constructor(private readonly auditService: AuditTrailsService) {}

  @Post('log')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log an audit event' })
  @ApiBody({
    description: 'Audit log entry',
    schema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', example: 'tenant-123e4567-e89b-12d3-a456-426614174000' },
        userId: { type: 'string', example: 'user-123e4567-e89b-12d3-a456-426614174000' },
        action: { type: 'string', example: 'create' },
        resource: { type: 'string', example: 'user' },
        resourceId: { type: 'string', example: 'resource-123' },
        ipAddress: { type: 'string', example: '192.168.1.1' },
        userAgent: { type: 'string', example: 'Mozilla/5.0...' },
        details: {
          type: 'object',
          example: { name: 'John Doe', email: 'john@example.com' },
        },
        outcome: {
          type: 'string',
          enum: ['success', 'failure'],
          example: 'success',
        },
        failureReason: { type: 'string', example: 'Validation failed' },
      },
      required: ['tenantId', 'action', 'resource', 'outcome'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Audit event logged successfully',
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
  async logEvent(@Body() logData: Omit<AuditLog, 'id' | 'timestamp'>) {
    try {
      await this.auditService.logEvent(logData);
      return {
        success: true,
        message: 'Audit event logged successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to log audit event',
      };
    }
  }

  @Get('tenants/:tenantId/logs')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get audit logs with filtering' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: 'string',
    example: 'user-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'action',
    required: false,
    type: 'string',
    example: 'create',
  })
  @ApiQuery({
    name: 'resource',
    required: false,
    type: 'string',
    example: 'user',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: 'string',
    example: '2023-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: 'string',
    example: '2023-12-31T23:59:59Z',
  })
  @ApiQuery({
    name: 'outcome',
    required: false,
    type: 'string',
    enum: ['success', 'failure'],
    example: 'success',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    example: 50,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: 'number',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: { type: 'object' },
        },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAuditLogs(
    @Param('tenantId') tenantId: string,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('outcome') outcome?: 'success' | 'failure',
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    try {
      const query: AuditQuery = {
        tenantId,
        userId,
        action,
        resource,
        outcome,
        limit,
        offset,
      };

      if (startDate) {
        query.startDate = new Date(startDate);
      }

      if (endDate) {
        query.endDate = new Date(endDate);
      }

      const data = await this.auditService.getAuditLogs(query);
      return {
        success: true,
        data,
        message: 'Audit logs retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve audit logs',
      };
    }
  }

  @Get('tenants/:tenantId/logs/:logId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get audit log by ID' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'logId',
    required: true,
    type: 'string',
    example: 'audit-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit log retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Audit log not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAuditLogById(
    @Param('tenantId') tenantId: string,
    @Param('logId') logId: string,
  ) {
    try {
      const data = await this.auditService.getAuditLogById(tenantId, logId);
      
      if (data) {
        return {
          success: true,
          data,
          message: 'Audit log retrieved successfully',
        };
      } else {
        return {
          success: false,
          message: 'Audit log not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve audit log',
      };
    }
  }

  @Get('tenants/:tenantId/recent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get recent audit logs for a tenant' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Recent audit logs retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: { type: 'object' },
        },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getRecentAuditLogs(
    @Param('tenantId') tenantId: string,
    @Query('limit') limit?: number,
  ) {
    try {
      const data = await this.auditService.getRecentAuditLogs(tenantId, limit);
      return {
        success: true,
        data,
        message: 'Recent audit logs retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve recent audit logs',
      };
    }
  }

  @Get('tenants/:tenantId/statistics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get audit statistics for a tenant' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    type: 'number',
    example: 30,
  })
  @ApiResponse({
    status: 200,
    description: 'Audit statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAuditStatistics(
    @Param('tenantId') tenantId: string,
    @Query('days') days?: number,
  ) {
    try {
      const data = await this.auditService.getAuditStatistics(tenantId, days);
      return {
        success: true,
        data,
        message: 'Audit statistics retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve audit statistics',
      };
    }
  }

  @Post('tenants/:tenantId/export')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Export audit logs' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description: 'Export query parameters',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user-123e4567-e89b-12d3-a456-426614174000' },
        action: { type: 'string', example: 'create' },
        resource: { type: 'string', example: 'user' },
        startDate: { type: 'string', example: '2023-01-01T00:00:00Z' },
        endDate: { type: 'string', example: '2023-12-31T23:59:59Z' },
        outcome: {
          type: 'string',
          enum: ['success', 'failure'],
          example: 'success',
        },
        limit: { type: 'number', example: 1000 },
        offset: { type: 'number', example: 0 },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Audit logs exported successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async exportAuditLogs(
    @Param('tenantId') tenantId: string,
    @Body() query: Omit<AuditQuery, 'tenantId'>,
  ) {
    try {
      const fullQuery: AuditQuery = {
        ...query,
        tenantId,
      };
      
      const data = await this.auditService.exportAuditLogs(fullQuery);
      return {
        success: true,
        data,
        message: 'Audit logs exported successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to export audit logs',
      };
    }
  }

  @Delete('tenants/:tenantId/purge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Purge old audit logs' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'daysToKeep',
    required: false,
    type: 'number',
    example: 90,
  })
  @ApiResponse({
    status: 200,
    description: 'Old audit logs purged successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async purgeOldLogs(
    @Param('tenantId') tenantId: string,
    @Query('daysToKeep') daysToKeep?: number,
  ) {
    try {
      const data = await this.auditService.purgeOldLogs(tenantId, daysToKeep);
      return {
        success: true,
        data,
        message: `Purged ${data} old audit logs`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to purge old audit logs',
      };
    }
  }
}