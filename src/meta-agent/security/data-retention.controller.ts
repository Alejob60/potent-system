import { Controller, Post, Get, Put, Delete, Body, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DataRetentionService, DataRetentionPolicy } from './data-retention.service';

@ApiTags('Data Retention')
@Controller('retention')
export class DataRetentionController {
  constructor(private readonly retentionService: DataRetentionService) {}

  @Post('tenants/:tenantId/policies')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new data retention policy' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description: 'Data retention policy',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'User Data Retention' },
        description: { type: 'string', example: 'Retain user data for 2 years' },
        resourceType: { type: 'string', example: 'users' },
        retentionPeriod: { type: 'number', example: 730 },
        retentionUnit: {
          type: 'string',
          enum: ['days', 'weeks', 'months', 'years'],
          example: 'days',
        },
        action: {
          type: 'string',
          enum: ['delete', 'archive', 'anonymize'],
          example: 'anonymize',
        },
        isActive: { type: 'boolean', example: true },
      },
      required: ['name', 'resourceType', 'retentionPeriod', 'retentionUnit', 'action'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Data retention policy created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createPolicy(
    @Param('tenantId') tenantId: string,
    @Body() policyData: Omit<DataRetentionPolicy, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>,
  ) {
    try {
      const data = await this.retentionService.createPolicy({
        ...policyData,
        tenantId,
      });
      return {
        success: true,
        data,
        message: 'Data retention policy created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to create data retention policy',
      };
    }
  }

  @Get('tenants/:tenantId/policies/:policyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a data retention policy by ID' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'policyId',
    required: true,
    type: 'string',
    example: 'policy-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Data retention policy retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getPolicy(
    @Param('tenantId') tenantId: string,
    @Param('policyId') policyId: string,
  ) {
    try {
      const data = await this.retentionService.getPolicy(tenantId, policyId);
      
      if (data) {
        return {
          success: true,
          data,
          message: 'Data retention policy retrieved successfully',
        };
      } else {
        return {
          success: false,
          message: 'Policy not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve data retention policy',
      };
    }
  }

  @Get('tenants/:tenantId/policies')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all policies for a tenant' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: 'boolean',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Data retention policies retrieved successfully',
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
  async getTenantPolicies(
    @Param('tenantId') tenantId: string,
    @Query('activeOnly') activeOnly?: boolean,
  ) {
    try {
      const data = activeOnly 
        ? await this.retentionService.getActivePolicies(tenantId)
        : await this.retentionService.getTenantPolicies(tenantId);
        
      return {
        success: true,
        data,
        message: 'Data retention policies retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve data retention policies',
      };
    }
  }

  @Put('tenants/:tenantId/policies/:policyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a data retention policy' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'policyId',
    required: true,
    type: 'string',
    example: 'policy-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description: 'Policy updates',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Updated User Data Retention' },
        description: { type: 'string', example: 'Updated retention policy for user data' },
        retentionPeriod: { type: 'number', example: 1095 },
        retentionUnit: {
          type: 'string',
          enum: ['days', 'weeks', 'months', 'years'],
          example: 'days',
        },
        action: {
          type: 'string',
          enum: ['delete', 'archive', 'anonymize'],
          example: 'delete',
        },
        isActive: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Data retention policy updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updatePolicy(
    @Param('tenantId') tenantId: string,
    @Param('policyId') policyId: string,
    @Body() updates: Partial<Omit<DataRetentionPolicy, 'id' | 'tenantId' | 'createdAt'>>,
  ) {
    try {
      const data = await this.retentionService.updatePolicy(tenantId, policyId, updates);
      
      if (data) {
        return {
          success: true,
          data,
          message: 'Data retention policy updated successfully',
        };
      } else {
        return {
          success: false,
          message: 'Policy not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to update data retention policy',
      };
    }
  }

  @Delete('tenants/:tenantId/policies/:policyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a data retention policy' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'policyId',
    required: true,
    type: 'string',
    example: 'policy-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Data retention policy deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deletePolicy(
    @Param('tenantId') tenantId: string,
    @Param('policyId') policyId: string,
  ) {
    try {
      const result = await this.retentionService.deletePolicy(tenantId, policyId);
      
      if (result) {
        return {
          success: true,
          message: 'Data retention policy deleted successfully',
        };
      } else {
        return {
          success: false,
          message: 'Policy not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete data retention policy',
      };
    }
  }

  @Post('tenants/:tenantId/execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute data retention policies for a tenant' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Data retention policies executed successfully',
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
  async executePolicies(@Param('tenantId') tenantId: string) {
    try {
      const data = await this.retentionService.executePolicies(tenantId);
      return {
        success: true,
        data,
        message: 'Data retention policies executed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to execute data retention policies',
      };
    }
  }

  @Get('tenants/:tenantId/logs/:policyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get execution logs for a policy' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'policyId',
    required: true,
    type: 'string',
    example: 'policy-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Execution logs retrieved successfully',
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
  async getExecutionLogs(
    @Param('tenantId') tenantId: string,
    @Param('policyId') policyId: string,
    @Query('limit') limit?: number,
  ) {
    try {
      const data = await this.retentionService.getExecutionLogs(tenantId, policyId, limit);
      return {
        success: true,
        data,
        message: 'Execution logs retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve execution logs',
      };
    }
  }

  @Get('tenants/:tenantId/logs')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get recent execution logs for a tenant' })
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
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Recent execution logs retrieved successfully',
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
  async getRecentExecutionLogs(
    @Param('tenantId') tenantId: string,
    @Query('limit') limit?: number,
  ) {
    try {
      const data = await this.retentionService.getRecentExecutionLogs(tenantId, limit);
      return {
        success: true,
        data,
        message: 'Recent execution logs retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve recent execution logs',
      };
    }
  }
}