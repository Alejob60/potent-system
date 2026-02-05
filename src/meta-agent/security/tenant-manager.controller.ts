import { Controller, Post, Get, Put, Delete, Body, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TenantManagementService } from './tenant-management.service';
import { MongoConfigService } from '../../common/mongodb/mongo-config.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';

@ApiTags('Tenant Manager')
@Controller('tenants')
export class TenantManagerController {
  constructor(
    private readonly tenantManagementService: TenantManagementService,
    private readonly mongoConfigService: MongoConfigService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new tenant' })
  @ApiBody({
    type: RegisterTenantDto,
    examples: {
      example1: {
        summary: 'Example tenant registration',
        value: {
          tenantName: 'Acme Corporation',
          contactEmail: 'admin@acme.com',
          websiteUrl: 'https://acme.com',
          businessIndustry: 'Technology',
          allowedOrigins: ['https://acme.com', 'https://app.acme.com'],
          permissions: ['read', 'write', 'admin'],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Tenant registered successfully',
    schema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string' },
        siteId: { type: 'string' },
        accessToken: { type: 'string' },
        tenantSecret: { type: 'string' },
        allowedOrigins: {
          type: 'array',
          items: { type: 'string' },
        },
        permissions: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async registerTenant(@Body() registerTenantDto: RegisterTenantDto) {
    try {
      // Register tenant in PostgreSQL
      const tenantData = await this.tenantManagementService.registerTenant(registerTenantDto);
      
      // Create tenant-specific MongoDB collections
      await this.mongoConfigService.createTenantCollections(tenantData.tenantId);
      
      return {
        success: true,
        data: tenantData,
        message: 'Tenant registered successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to register tenant',
      };
    }
  }

  @Get(':tenantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get tenant information' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tenant information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTenant(@Param('tenantId') tenantId: string) {
    try {
      const data = await this.tenantManagementService.getTenantById(tenantId);
      
      if (data) {
        return {
          success: true,
          data,
          message: 'Tenant information retrieved successfully',
        };
      } else {
        return {
          success: false,
          message: 'Tenant not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve tenant information',
      };
    }
  }

  @Put(':tenantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update tenant information' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tenantName: { type: 'string', example: 'Acme Corporation Updated' },
        contactEmail: { type: 'string', example: 'newadmin@acme.com' },
        websiteUrl: { type: 'string', example: 'https://new.acme.com' },
        allowedOrigins: {
          type: 'array',
          items: { type: 'string' },
          example: ['https://new.acme.com', 'https://app.new.acme.com'],
        },
        permissions: {
          type: 'array',
          items: { type: 'string' },
          example: ['read', 'write', 'admin', 'delete'],
        },
        isActive: { type: 'boolean', example: true },
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
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateTenant(
    @Param('tenantId') tenantId: string,
    @Body() updateData: any,
  ) {
    try {
      const data = await this.tenantManagementService.updateTenant(tenantId, updateData);
      
      if (data) {
        return {
          success: true,
          data,
          message: 'Tenant updated successfully',
        };
      } else {
        return {
          success: false,
          message: 'Tenant not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to update tenant',
      };
    }
  }

  @Delete(':tenantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a tenant' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
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
  async deactivateTenant(@Param('tenantId') tenantId: string) {
    try {
      const result = await this.tenantManagementService.deactivateTenant(tenantId);
      
      if (result) {
        // Delete tenant-specific MongoDB collections
        await this.mongoConfigService.deleteTenantCollections(tenantId);
        
        return {
          success: true,
          message: 'Tenant deactivated successfully',
        };
      } else {
        return {
          success: false,
          message: 'Tenant not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to deactivate tenant',
      };
    }
  }

  @Post(':tenantId/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a tenant' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
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
  async activateTenant(@Param('tenantId') tenantId: string) {
    try {
      const result = await this.tenantManagementService.updateTenant(tenantId, { isActive: true });
      
      if (result) {
        // Recreate tenant-specific MongoDB collections
        await this.mongoConfigService.createTenantCollections(tenantId);
        
        return {
          success: true,
          message: 'Tenant activated successfully',
        };
      } else {
        return {
          success: false,
          message: 'Tenant not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to activate tenant',
      };
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all tenants' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: 'number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    example: 10,
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: 'boolean',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Tenants retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: { type: 'object' },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async listTenants(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('isActive') isActive?: boolean,
  ) {
    try {
      // In a real implementation, we would use pagination and filtering
      // For now, we'll just return a simple list
      return {
        success: true,
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
        },
        message: 'Tenants retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve tenants',
      };
    }
  }
}