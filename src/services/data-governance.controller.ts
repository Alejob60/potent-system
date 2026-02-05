import { Controller, Get, Post, Put, Param, Body, Query, Logger } from '@nestjs/common';
import { DataGovernanceService } from './data-governance.service';
// Swagger imports
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('data-governance')
@Controller('data-governance')
export class DataGovernanceController {
  private readonly logger = new Logger(DataGovernanceController.name);

  constructor(private readonly dataGovernanceService: DataGovernanceService) {}

  @Get('instances/:id/data-settings')
  @ApiOperation({
    summary: 'Get data settings',
    description: 'Retrieve data governance settings for a specific instance',
  })
  @ApiParam({
    name: 'id',
    description: 'Instance ID',
    example: 'instance_1234567890',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Data settings retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            instanceId: { type: 'string' },
            useConversationData: { type: 'boolean' },
            usePersonalData: { type: 'boolean' },
            useAnalyticsData: { type: 'boolean' },
            retentionPeriod: { type: 'number', enum: [30, 90, 365] },
            anonymizeData: { type: 'boolean' },
            autoPurgeEnabled: { type: 'boolean' },
            consentRequired: { type: 'boolean' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async getDataSettings(@Param('id') instanceId: string) {
    try {
      const data = await this.dataGovernanceService.getDataSettings(instanceId);
      return {
        success: true,
        data,
      };
    } catch (error) {
      this.logger.error(`Failed to get data settings for instance ${instanceId}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Put('instances/:id/data-settings')
  @ApiOperation({
    summary: 'Update data settings',
    description: 'Update data governance settings for a specific instance',
  })
  @ApiParam({
    name: 'id',
    description: 'Instance ID',
    example: 'instance_1234567890',
  })
  @ApiBody({
    description: 'Data settings to update',
    schema: {
      type: 'object',
      properties: {
        useConversationData: { type: 'boolean' },
        usePersonalData: { type: 'boolean' },
        useAnalyticsData: { type: 'boolean' },
        retentionPeriod: { type: 'number', enum: [30, 90, 365] },
        anonymizeData: { type: 'boolean' },
        autoPurgeEnabled: { type: 'boolean' },
        consentRequired: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Data settings updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            instanceId: { type: 'string' },
            useConversationData: { type: 'boolean' },
            usePersonalData: { type: 'boolean' },
            useAnalyticsData: { type: 'boolean' },
            retentionPeriod: { type: 'number', enum: [30, 90, 365] },
            anonymizeData: { type: 'boolean' },
            autoPurgeEnabled: { type: 'boolean' },
            consentRequired: { type: 'boolean' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async updateDataSettings(
    @Param('id') instanceId: string,
    @Body() settings: any
  ) {
    try {
      const data = await this.dataGovernanceService.updateDataSettings(instanceId, settings);
      return {
        success: true,
        data,
      };
    } catch (error) {
      this.logger.error(`Failed to update data settings for instance ${instanceId}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('instances/:id/data/purge')
  @ApiOperation({
    summary: 'Purge data',
    description: 'Purge data for a specific instance based on provided criteria',
  })
  @ApiParam({
    name: 'id',
    description: 'Instance ID',
    example: 'instance_1234567890',
  })
  @ApiBody({
    description: 'Purge options',
    schema: {
      type: 'object',
      properties: {
        beforeDate: { type: 'string', format: 'date-time' },
        dataType: { type: 'string' },
        userId: { type: 'string' },
      },
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Data purge completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        purgedCount: { type: 'number' },
      },
    },
  })
  async purgeData(
    @Param('id') instanceId: string,
    @Body() options: { beforeDate?: string; dataType?: string; userId?: string }
  ) {
    try {
      const result = await this.dataGovernanceService.purgeData(instanceId, {
        beforeDate: options.beforeDate ? new Date(options.beforeDate) : undefined,
        dataType: options.dataType,
        userId: options.userId,
      });
      return {
        ...result,
        success: true,
      };
    } catch (error) {
      this.logger.error(`Failed to purge data for instance ${instanceId}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('audit')
  @ApiOperation({
    summary: 'Get audit logs',
    description: 'Retrieve audit logs for data governance operations',
  })
  @ApiQuery({
    name: 'instance_id',
    description: 'Instance ID',
    required: true,
    example: 'instance_1234567890',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of logs to return',
    required: false,
    example: 50,
  })
  @ApiQuery({
    name: 'offset',
    description: 'Offset for pagination',
    required: false,
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
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              instanceId: { type: 'string' },
              userId: { type: 'string' },
              action: { type: 'string' },
              resource: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
              ipAddress: { type: 'string' },
              userAgent: { type: 'string' },
              details: { type: 'object' },
            },
          },
        },
      },
    },
  })
  async getAuditLogs(
    @Query('instance_id') instanceId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    try {
      const data = await this.dataGovernanceService.getAuditLogs(
        instanceId,
        limit ? parseInt(limit) : 50,
        offset ? parseInt(offset) : 0
      );
      return {
        success: true,
        data,
      };
    } catch (error) {
      this.logger.error(`Failed to get audit logs for instance ${instanceId}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('compliance/status')
  @ApiOperation({
    summary: 'Get compliance status',
    description: 'Retrieve compliance status for a specific instance',
  })
  @ApiQuery({
    name: 'instance_id',
    description: 'Instance ID',
    required: true,
    example: 'instance_1234567890',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Compliance status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            instanceId: { type: 'string' },
            gdprCompliant: { type: 'boolean' },
            ccpaCompliant: { type: 'boolean' },
            lastAudit: { type: 'string', format: 'date-time' },
            violations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  type: { type: 'string' },
                  description: { type: 'string' },
                  severity: { type: 'string', enum: ['low', 'medium', 'high'] },
                  timestamp: { type: 'string', format: 'date-time' },
                  resolved: { type: 'boolean' },
                  resolution: { type: 'string' },
                },
              },
            },
            riskScore: { type: 'number' },
          },
        },
      },
    },
  })
  async getComplianceStatus(@Query('instance_id') instanceId: string) {
    try {
      const data = await this.dataGovernanceService.getComplianceStatus(instanceId);
      return {
        success: true,
        data,
      };
    } catch (error) {
      this.logger.error(`Failed to get compliance status for instance ${instanceId}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('consent/record')
  @ApiOperation({
    summary: 'Record user consent',
    description: 'Record user consent for data processing',
  })
  @ApiBody({
    description: 'Consent record',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        instanceId: { type: 'string' },
        consentType: { type: 'string' },
        granted: { type: 'boolean' },
        ipAddress: { type: 'string' },
        userAgent: { type: 'string' },
      },
      required: ['userId', 'instanceId', 'consentType', 'granted'],
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Consent recorded successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            instanceId: { type: 'string' },
            consentType: { type: 'string' },
            granted: { type: 'boolean' },
            timestamp: { type: 'string', format: 'date-time' },
            ipAddress: { type: 'string' },
            userAgent: { type: 'string' },
          },
        },
      },
    },
  })
  async recordConsent(@Body() consent: any) {
    try {
      const data = await this.dataGovernanceService.recordConsent(consent);
      return {
        success: true,
        data,
      };
    } catch (error) {
      this.logger.error(`Failed to record consent:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('instances/:id/users')
  @ApiOperation({
    summary: 'Get instance users',
    description: 'Retrieve users and their roles for a specific instance',
  })
  @ApiParam({
    name: 'id',
    description: 'Instance ID',
    example: 'instance_1234567890',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Instance users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              instanceId: { type: 'string' },
              role: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string', enum: ['Owner', 'Admin', 'Editor', 'Viewer'] },
                  permissions: { type: 'array', items: { type: 'string' } },
                },
              },
              joinedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  async getInstanceUsers(@Param('id') instanceId: string) {
    try {
      const data = await this.dataGovernanceService.getInstanceUsers(instanceId);
      return {
        success: true,
        data,
      };
    } catch (error) {
      this.logger.error(`Failed to get instance users for instance ${instanceId}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Put('instances/:id/users/:userId/role')
  @ApiOperation({
    summary: 'Update user role',
    description: 'Update user role for a specific instance',
  })
  @ApiParam({
    name: 'id',
    description: 'Instance ID',
    example: 'instance_1234567890',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: 'user_1234567890',
  })
  @ApiBody({
    description: 'Role name',
    schema: {
      type: 'object',
      properties: {
        roleName: { type: 'string', enum: ['Owner', 'Admin', 'Editor', 'Viewer'] },
      },
      required: ['roleName'],
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User role updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            instanceId: { type: 'string' },
            role: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string', enum: ['Owner', 'Admin', 'Editor', 'Viewer'] },
                permissions: { type: 'array', items: { type: 'string' } },
              },
            },
            joinedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async updateUserRole(
    @Param('id') instanceId: string,
    @Param('userId') userId: string,
    @Body() body: { roleName: 'Owner' | 'Admin' | 'Editor' | 'Viewer' }
  ) {
    try {
      const data = await this.dataGovernanceService.updateUserRole(instanceId, userId, body.roleName);
      return {
        success: true,
        data,
      };
    } catch (error) {
      this.logger.error(`Failed to update user role for user ${userId} in instance ${instanceId}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('pii/detect')
  @ApiOperation({
    summary: 'Detect PII',
    description: 'Detect personally identifiable information in text',
  })
  @ApiBody({
    description: 'Text to analyze for PII',
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
      },
      required: ['text'],
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'PII detection completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            hasPII: { type: 'boolean' },
            piiTypes: { type: 'array', items: { type: 'string' } },
            maskedText: { type: 'string' },
          },
        },
      },
    },
  })
  async detectPII(@Body() body: { text: string }) {
    try {
      const data = await this.dataGovernanceService.detectPII(body.text);
      return {
        success: true,
        data,
      };
    } catch (error) {
      this.logger.error('Failed to detect PII:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}