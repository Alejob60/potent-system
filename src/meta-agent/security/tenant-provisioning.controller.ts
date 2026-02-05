import { Controller, Post, Get, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { TenantProvisioningService } from './tenant-provisioning.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';

@ApiTags('Tenant Provisioning')
@Controller('provisioning')
export class TenantProvisioningController {
  constructor(private readonly provisioningService: TenantProvisioningService) {}

  @Post('tenants')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Provision a new tenant with all required resources' })
  @ApiBody({
    type: RegisterTenantDto,
    examples: {
      example1: {
        summary: 'Example tenant provisioning',
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
    description: 'Tenant provisioning started successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        provisioningId: { type: 'string' },
        tenantData: { type: 'object' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async provisionTenant(@Body() registerTenantDto: RegisterTenantDto) {
    try {
      const result = await this.provisioningService.provisionTenant(registerTenantDto);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to provision tenant',
      };
    }
  }

  @Get('status/:provisioningId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get provisioning status' })
  @ApiParam({
    name: 'provisioningId',
    required: true,
    type: 'string',
    example: 'prov-1234567890-abc123def456',
  })
  @ApiResponse({
    status: 200,
    description: 'Provisioning status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Provisioning not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getProvisioningStatus(@Param('provisioningId') provisioningId: string) {
    try {
      const data = this.provisioningService.getProvisioningStatus(provisioningId);
      
      if (data) {
        return {
          success: true,
          data,
          message: 'Provisioning status retrieved successfully',
        };
      } else {
        return {
          success: false,
          message: 'Provisioning not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve provisioning status',
      };
    }
  }

  @Delete('tenants/:tenantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deprovision a tenant and clean up all resources' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tenant deprovisioned successfully',
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
  async deprovisionTenant(@Param('tenantId') tenantId: string) {
    try {
      const result = await this.provisioningService.deprovisionTenant(tenantId);
      
      if (result) {
        return {
          success: true,
          message: 'Tenant deprovisioned successfully',
        };
      } else {
        return {
          success: false,
          message: 'Failed to deprovision tenant',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to deprovision tenant',
      };
    }
  }
}