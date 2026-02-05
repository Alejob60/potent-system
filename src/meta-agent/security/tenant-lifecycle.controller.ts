import { Controller, Post, Get, Put, Delete, Body, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TenantLifecycleService } from './tenant-lifecycle.service';

@ApiTags('Tenant Lifecycle')
@Controller('lifecycle')
export class TenantLifecycleController {
  constructor(private readonly lifecycleService: TenantLifecycleService) {}

  @Post('tenants/:tenantId/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a tenant' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description: 'Activation details',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user-123' },
        reason: { type: 'string', example: 'Payment received' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tenant activated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async activateTenant(
    @Param('tenantId') tenantId: string,
    @Body('userId') userId?: string,
    @Body('reason') reason?: string,
  ) {
    try {
      await this.lifecycleService.handleTenantActivated(tenantId, userId, { reason });
      return {
        success: true,
        message: 'Tenant activated successfully',
      };
    } catch (error) {
      if (error.message.includes('not found')) {
        return {
          success: false,
          error: error.message,
          message: 'Tenant not found',
        };
      }
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to activate tenant',
      };
    }
  }

  @Post('tenants/:tenantId/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a tenant' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description: 'Deactivation details',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user-123' },
        reason: { type: 'string', example: 'Payment failed' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tenant deactivated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deactivateTenant(
    @Param('tenantId') tenantId: string,
    @Body('userId') userId?: string,
    @Body('reason') reason?: string,
  ) {
    try {
      await this.lifecycleService.handleTenantDeactivated(tenantId, userId, { reason });
      return {
        success: true,
        message: 'Tenant deactivated successfully',
      };
    } catch (error) {
      if (error.message.includes('not found')) {
        return {
          success: false,
          error: error.message,
          message: 'Tenant not found',
        };
      }
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to deactivate tenant',
      };
    }
  }

  @Post('tenants/:tenantId/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend a tenant' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description: 'Suspension details',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user-123' },
        reason: { type: 'string', example: 'Terms of service violation' },
      },
      required: ['reason'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tenant suspended successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async suspendTenant(
    @Param('tenantId') tenantId: string,
    @Body('userId') userId?: string,
    @Body('reason') reason?: string,
  ) {
    try {
      if (!reason) {
        return {
          success: false,
          message: 'Reason is required for suspension',
        };
      }
      
      await this.lifecycleService.handleTenantSuspended(tenantId, reason, userId);
      return {
        success: true,
        message: 'Tenant suspended successfully',
      };
    } catch (error) {
      if (error.message.includes('not found')) {
        return {
          success: false,
          error: error.message,
          message: 'Tenant not found',
        };
      }
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to suspend tenant',
      };
    }
  }

  @Delete('tenants/:tenantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a tenant and all associated data' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description: 'Deletion details',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user-123' },
        reason: { type: 'string', example: 'Account closure requested' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tenant deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteTenant(
    @Param('tenantId') tenantId: string,
    @Body('userId') userId?: string,
    @Body('reason') reason?: string,
  ) {
    try {
      await this.lifecycleService.handleTenantDeleted(tenantId, userId, { reason });
      return {
        success: true,
        message: 'Tenant deleted successfully',
      };
    } catch (error) {
      if (error.message.includes('not found')) {
        return {
          success: false,
          error: error.message,
          message: 'Tenant not found',
        };
      }
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete tenant',
      };
    }
  }

  @Put('tenants/:tenantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update tenant information' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description: 'Tenant updates',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user-123' },
        updates: {
          type: 'object',
          example: {
            tenantName: 'New Company Name',
            contactEmail: 'newcontact@company.com',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tenant updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateTenant(
    @Param('tenantId') tenantId: string,
    @Body('userId') userId?: string,
    @Body('updates') updates?: any,
  ) {
    try {
      await this.lifecycleService.handleTenantUpdated(tenantId, updates, userId);
      return {
        success: true,
        message: 'Tenant updated successfully',
      };
    } catch (error) {
      if (error.message.includes('not found')) {
        return {
          success: false,
          error: error.message,
          message: 'Tenant not found',
        };
      }
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to update tenant',
      };
    }
  }

  @Get('tenants/:tenantId/events')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get lifecycle events for a tenant' })
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
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Lifecycle events retrieved successfully',
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
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTenantEvents(
    @Param('tenantId') tenantId: string,
    @Query('limit') limit?: number,
  ) {
    try {
      const data = this.lifecycleService.getLifecycleEvents(tenantId, limit);
      return {
        success: true,
        data,
        message: 'Lifecycle events retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve lifecycle events',
      };
    }
  }

  @Get('events')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all lifecycle events' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'All lifecycle events retrieved successfully',
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
  async getAllEvents(@Query('limit') limit?: number) {
    try {
      const data = this.lifecycleService.getAllLifecycleEvents(limit);
      return {
        success: true,
        data,
        message: 'All lifecycle events retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve lifecycle events',
      };
    }
  }
}