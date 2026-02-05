import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { TenantContextStore, TenantContextData, BusinessProfile, BrandingConfig, FaqData, WorkflowState, TenantLimits, ServiceItem, SalesStrategy } from './tenant-context.store';

@ApiTags('Meta-Agent - Tenant Context')
@Controller('api/meta-agent/tenant-context')
export class TenantContextController {
  private readonly logger = new Logger(TenantContextController.name);

  constructor(
    private readonly tenantContextStore: TenantContextStore,
  ) {}

  @Get(':tenantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get tenant context data' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({
    status: 200,
    description: 'Tenant context data retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Tenant context not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTenantContext(@Param('tenantId') tenantId: string) {
    this.logger.log(`Retrieving context for tenant: ${tenantId}`);
    
    try {
      const context = await this.tenantContextStore.getTenantContext(tenantId);
      
      if (!context) {
        return {
          success: false,
          message: 'Tenant context not found',
        };
      }
      
      return {
        success: true,
        data: context,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve context for tenant ${tenantId}`, error.message);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve tenant context',
      };
    }
  }

  @Post(':tenantId/initialize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initialize tenant context with services and strategies' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiBody({ type: Object })
  @ApiResponse({
    status: 200,
    description: 'Tenant context initialized successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async initializeTenantContext(
    @Param('tenantId') tenantId: string,
    @Body() initData: { 
      businessProfile?: Partial<BusinessProfile>;
      services?: ServiceItem[];
      salesStrategies?: SalesStrategy[];
    },
  ) {
    this.logger.log(`Initializing context for tenant: ${tenantId}`);
    
    try {
      // Initialize tenant context with default values
      const businessProfile = initData.businessProfile || {
        industry: 'general',
        size: 'small',
        location: 'global',
        primaryLanguage: 'en',
        timezone: 'UTC',
        businessHours: {
          start: '09:00',
          end: '17:00',
        },
      };
      
      // First initialize the basic context
      const initResult = await this.tenantContextStore.initializeTenantContext(tenantId, businessProfile);
      
      if (!initResult) {
        return {
          success: false,
          message: 'Failed to initialize tenant context',
        };
      }
      
      // Then update with services and strategies if provided
      const updates: Partial<TenantContextData> = {};
      
      if (initData.services) {
        updates.services = initData.services;
      }
      
      if (initData.salesStrategies) {
        updates.salesStrategies = initData.salesStrategies;
      }
      
      if (Object.keys(updates).length > 0) {
        const updateResult = await this.tenantContextStore.updateTenantContext(tenantId, updates);
        if (!updateResult) {
          return {
            success: false,
            message: 'Failed to update tenant context with services and strategies',
          };
        }
      }
      
      return {
        success: true,
        message: 'Tenant context initialized successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to initialize context for tenant ${tenantId}`, error.message);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to initialize tenant context',
      };
    }
  }

  @Put(':tenantId/business-profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update tenant business profile' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiBody({ type: Object })
  @ApiResponse({
    status: 200,
    description: 'Business profile updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateBusinessProfile(
    @Param('tenantId') tenantId: string,
    @Body() businessProfile: BusinessProfile,
  ) {
    this.logger.log(`Updating business profile for tenant: ${tenantId}`);
    
    try {
      const result = await this.tenantContextStore.updateTenantContext(tenantId, {
        businessProfile,
      });
      
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
  @ApiBody({ type: Object })
  @ApiResponse({
    status: 200,
    description: 'Branding configuration updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateBranding(
    @Param('tenantId') tenantId: string,
    @Body() branding: BrandingConfig,
  ) {
    this.logger.log(`Updating branding for tenant: ${tenantId}`);
    
    try {
      const result = await this.tenantContextStore.updateTenantContext(tenantId, {
        branding,
      });
      
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
  @ApiBody({ type: Object })
  @ApiResponse({
    status: 200,
    description: 'FAQ data updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateFaqData(
    @Param('tenantId') tenantId: string,
    @Body() faqData: FaqData,
  ) {
    this.logger.log(`Updating FAQ data for tenant: ${tenantId}`);
    
    try {
      const result = await this.tenantContextStore.updateTenantContext(tenantId, {
        faqData,
      });
      
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

  @Put(':tenantId/workflow-state')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update tenant workflow state' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiBody({ type: Object })
  @ApiResponse({
    status: 200,
    description: 'Workflow state updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateWorkflowState(
    @Param('tenantId') tenantId: string,
    @Body() workflowState: WorkflowState,
  ) {
    this.logger.log(`Updating workflow state for tenant: ${tenantId}`);
    
    try {
      const result = await this.tenantContextStore.updateTenantContext(tenantId, {
        workflowState,
      });
      
      if (result) {
        return {
          success: true,
          message: 'Workflow state updated successfully',
        };
      } else {
        return {
          success: false,
          message: 'Failed to update workflow state',
        };
      }
    } catch (error) {
      this.logger.error(`Failed to update workflow state for tenant ${tenantId}`, error.message);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to update workflow state',
      };
    }
  }

  @Put(':tenantId/limits')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update tenant limits' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiBody({ type: Object })
  @ApiResponse({
    status: 200,
    description: 'Limits updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateLimits(
    @Param('tenantId') tenantId: string,
    @Body() limits: TenantLimits,
  ) {
    this.logger.log(`Updating limits for tenant: ${tenantId}`);
    
    try {
      const result = await this.tenantContextStore.updateTenantContext(tenantId, {
        limits,
      });
      
      if (result) {
        return {
          success: true,
          message: 'Limits updated successfully',
        };
      } else {
        return {
          success: false,
          message: 'Failed to update limits',
        };
      }
    } catch (error) {
      this.logger.error(`Failed to update limits for tenant ${tenantId}`, error.message);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to update limits',
      };
    }
  }

  @Delete(':tenantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete tenant context' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({
    status: 200,
    description: 'Tenant context deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Tenant context not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteTenantContext(@Param('tenantId') tenantId: string) {
    this.logger.log(`Deleting context for tenant: ${tenantId}`);
    
    try {
      const result = await this.tenantContextStore.deleteTenantContext(tenantId);
      
      if (result) {
        return {
          success: true,
          message: 'Tenant context deleted successfully',
        };
      } else {
        return {
          success: false,
          message: 'Failed to delete tenant context',
        };
      }
    } catch (error) {
      this.logger.error(`Failed to delete context for tenant ${tenantId}`, error.message);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete tenant context',
      };
    }
  }
}