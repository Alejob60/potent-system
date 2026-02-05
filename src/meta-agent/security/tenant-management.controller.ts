import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { TenantManagementService } from './tenant-management.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';

@ApiTags('Meta-Agent - Tenant Management')
@Controller('api/meta-agent/tenants')
export class TenantManagementController {
  private readonly logger = new Logger(TenantManagementController.name);

  constructor(
    private readonly tenantManagementService: TenantManagementService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new tenant' })
  @ApiBody({ type: RegisterTenantDto })
  @ApiResponse({
    status: 201,
    description: 'Tenant registered successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async registerTenant(@Body() registerTenantDto: RegisterTenantDto) {
    this.logger.log(`Registering new tenant: ${registerTenantDto.tenantName}`);
    
    try {
      const result = await this.tenantManagementService.registerTenant(registerTenantDto);
      
      this.logger.log(`Tenant registered successfully: ${registerTenantDto.tenantName}`);
      
      // Note: In a real implementation, the tenantSecret should be sent securely
      // and not included in the response. This is just for demonstration.
      
      return {
        success: true,
        data: result,
        message: 'Tenant registered successfully. Please store the tenantSecret securely.',
      };
    } catch (error) {
      this.logger.error('Tenant registration failed', error.message);
      
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
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({
    status: 200,
    description: 'Tenant information retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTenant(@Param('tenantId') tenantId: string) {
    this.logger.log(`Retrieving tenant information for: ${tenantId}`);
    
    try {
      // In a real implementation, this would return tenant information
      // For now, we'll return a placeholder response
      return {
        success: true,
        data: {
          tenantId,
          message: 'Tenant information would be returned here in a real implementation',
        },
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve tenant ${tenantId}`, error.message);
      
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
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({
    status: 200,
    description: 'Tenant updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateTenant(
    @Param('tenantId') tenantId: string,
    @Body() updateData: any,
  ) {
    this.logger.log(`Updating tenant: ${tenantId}`);
    
    try {
      // In a real implementation, this would update tenant information
      // For now, we'll return a placeholder response
      return {
        success: true,
        data: {
          tenantId,
          message: 'Tenant would be updated here in a real implementation',
        },
      };
    } catch (error) {
      this.logger.error(`Failed to update tenant ${tenantId}`, error.message);
      
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
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({
    status: 200,
    description: 'Tenant deactivated successfully',
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deactivateTenant(@Param('tenantId') tenantId: string) {
    this.logger.log(`Deactivating tenant: ${tenantId}`);
    
    try {
      const result = await this.tenantManagementService.deactivateTenant(tenantId);
      
      if (result) {
        return {
          success: true,
          message: 'Tenant deactivated successfully',
        };
      } else {
        return {
          success: false,
          message: 'Failed to deactivate tenant',
        };
      }
    } catch (error) {
      this.logger.error(`Failed to deactivate tenant ${tenantId}`, error.message);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to deactivate tenant',
      };
    }
  }

  @Put(':tenantId/business-profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update tenant business profile' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiBody({ description: 'Business profile data', type: Object })
  @ApiResponse({
    status: 200,
    description: 'Business profile updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateBusinessProfile(
    @Param('tenantId') tenantId: string,
    @Body() businessProfile: any,
  ) {
    this.logger.log(`Updating business profile for tenant: ${tenantId}`);
    
    try {
      const result = await this.tenantManagementService.updateTenantBusinessProfile(tenantId, businessProfile);
      
      if (result) {
        return {
          success: true,
          message: 'Business profile updated successfully',
        };
      } else {
        return {
          success: false,
          message: 'Failed to update business profile',
        };
      }
    } catch (error) {
      this.logger.error(`Failed to update business profile for tenant ${tenantId}`, error.message);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to update business profile',
      };
    }
  }

  @Put(':tenantId/branding')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update tenant branding configuration' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiBody({ description: 'Branding configuration', type: Object })
  @ApiResponse({
    status: 200,
    description: 'Branding configuration updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateBranding(
    @Param('tenantId') tenantId: string,
    @Body() branding: any,
  ) {
    this.logger.log(`Updating branding for tenant: ${tenantId}`);
    
    try {
      const result = await this.tenantManagementService.updateTenantBranding(tenantId, branding);
      
      if (result) {
        return {
          success: true,
          message: 'Branding configuration updated successfully',
        };
      } else {
        return {
          success: false,
          message: 'Failed to update branding configuration',
        };
      }
    } catch (error) {
      this.logger.error(`Failed to update branding for tenant ${tenantId}`, error.message);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to update branding configuration',
      };
    }
  }

  @Put(':tenantId/faq-data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update tenant FAQ data' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiBody({ description: 'FAQ data', type: Object })
  @ApiResponse({
    status: 200,
    description: 'FAQ data updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateFaqData(
    @Param('tenantId') tenantId: string,
    @Body() faqData: any,
  ) {
    this.logger.log(`Updating FAQ data for tenant: ${tenantId}`);
    
    try {
      const result = await this.tenantManagementService.updateTenantFaqData(tenantId, faqData);
      
      if (result) {
        return {
          success: true,
          message: 'FAQ data updated successfully',
        };
      } else {
        return {
          success: false,
          message: 'Failed to update FAQ data',
        };
      }
    } catch (error) {
      this.logger.error(`Failed to update FAQ data for tenant ${tenantId}`, error.message);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to update FAQ data',
      };
    }
  }

  @Post(':tenantId/custom-faq')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add custom FAQ to tenant' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiBody({ description: 'Custom FAQ entry', type: Object })
  @ApiResponse({
    status: 200,
    description: 'Custom FAQ added successfully',
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async addCustomFaq(
    @Param('tenantId') tenantId: string,
    @Body() faq: { question: string; answer: string; category?: string },
  ) {
    this.logger.log(`Adding custom FAQ for tenant: ${tenantId}`);
    
    try {
      const result = await this.tenantManagementService.addCustomFaq(tenantId, faq);
      
      if (result) {
        return {
          success: true,
          message: 'Custom FAQ added successfully',
        };
      } else {
        return {
          success: false,
          message: 'Failed to add custom FAQ',
        };
      }
    } catch (error) {
      this.logger.error(`Failed to add custom FAQ for tenant ${tenantId}`, error.message);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to add custom FAQ',
      };
    }
  }

  @Put(':tenantId/products-services')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update tenant products and services' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiBody({ description: 'Products and services data', type: Object })
  @ApiResponse({
    status: 200,
    description: 'Products and services updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateProductsAndServices(
    @Param('tenantId') tenantId: string,
    @Body() data: { products?: string[]; services?: string[] },
  ) {
    this.logger.log(`Updating products and services for tenant: ${tenantId}`);
    
    try {
      const result = await this.tenantManagementService.updateTenantProductsAndServices(
        tenantId, 
        data.products, 
        data.services
      );
      
      if (result) {
        return {
          success: true,
          message: 'Products and services updated successfully',
        };
      } else {
        return {
          success: false,
          message: 'Failed to update products and services',
        };
      }
    } catch (error) {
      this.logger.error(`Failed to update products and services for tenant ${tenantId}`, error.message);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to update products and services',
      };
    }
  }
}