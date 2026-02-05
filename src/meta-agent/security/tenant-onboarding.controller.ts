import { Controller, Post, Get, Put, Patch, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { TenantOnboardingService } from './tenant-onboarding.service';

@ApiTags('Tenant Onboarding')
@Controller('onboarding')
export class TenantOnboardingController {
  constructor(private readonly onboardingService: TenantOnboardingService) {}

  @Post('tenants/:tenantId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Start onboarding process for a tenant' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'Onboarding process started successfully',
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
  async startOnboarding(@Param('tenantId') tenantId: string) {
    try {
      const data = await this.onboardingService.startOnboarding(tenantId);
      return {
        success: true,
        data,
        message: 'Onboarding process started successfully',
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
        message: 'Failed to start onboarding process',
      };
    }
  }

  @Get('tenants/:tenantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get onboarding status for a tenant' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Onboarding status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Onboarding not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getOnboardingStatus(@Param('tenantId') tenantId: string) {
    try {
      const data = this.onboardingService.getOnboardingStatus(tenantId);
      
      if (data) {
        return {
          success: true,
          data,
          message: 'Onboarding status retrieved successfully',
        };
      } else {
        return {
          success: false,
          message: 'Onboarding not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve onboarding status',
      };
    }
  }

  @Post('tenants/:tenantId/steps/:stepId/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete an onboarding step' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'stepId',
    required: true,
    type: 'string',
    example: 'setup-business-profile',
  })
  @ApiBody({
    description: 'Step-specific data',
    schema: {
      type: 'object',
      example: {
        businessProfile: {
          industry: 'Technology',
          size: 'medium',
          location: 'US',
          primaryLanguage: 'en',
          timezone: 'America/New_York',
          businessHours: {
            start: '09:00',
            end: '17:00',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Onboarding step completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Onboarding or step not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async completeOnboardingStep(
    @Param('tenantId') tenantId: string,
    @Param('stepId') stepId: string,
    @Body() data?: any,
  ) {
    try {
      const result = await this.onboardingService.completeOnboardingStep(tenantId, stepId, data);
      return {
        success: true,
        data: result,
        message: 'Onboarding step completed successfully',
      };
    } catch (error) {
      if (error.message.includes('not found')) {
        return {
          success: false,
          error: error.message,
          message: 'Onboarding or step not found',
        };
      }
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to complete onboarding step',
      };
    }
  }

  @Post('tenants/:tenantId/steps/:stepId/skip')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Skip an onboarding step' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'stepId',
    required: true,
    type: 'string',
    example: 'configure-branding',
  })
  @ApiResponse({
    status: 200,
    description: 'Onboarding step skipped successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Onboarding or step not found' })
  @ApiResponse({ status: 400, description: 'Cannot skip required step' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async skipOnboardingStep(
    @Param('tenantId') tenantId: string,
    @Param('stepId') stepId: string,
  ) {
    try {
      const result = await this.onboardingService.skipOnboardingStep(tenantId, stepId);
      return {
        success: true,
        data: result,
        message: 'Onboarding step skipped successfully',
      };
    } catch (error) {
      if (error.message.includes('not found')) {
        return {
          success: false,
          error: error.message,
          message: 'Onboarding or step not found',
        };
      }
      
      if (error.message.includes('Cannot skip')) {
        return {
          success: false,
          error: error.message,
          message: 'Cannot skip required step',
        };
      }
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to skip onboarding step',
      };
    }
  }

  @Patch('tenants/:tenantId/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset onboarding process for a tenant' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Onboarding process reset successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Onboarding not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async resetOnboarding(@Param('tenantId') tenantId: string) {
    try {
      const data = await this.onboardingService.resetOnboarding(tenantId);
      return {
        success: true,
        data,
        message: 'Onboarding process reset successfully',
      };
    } catch (error) {
      if (error.message.includes('not found')) {
        return {
          success: false,
          error: error.message,
          message: 'Onboarding not found',
        };
      }
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to reset onboarding process',
      };
    }
  }
}