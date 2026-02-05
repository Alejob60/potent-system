import {
  Controller,
  Post,
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
  ApiBody,
} from '@nestjs/swagger';
import { TenantManagementService } from '../tenant-management.service';
import { RegisterOwnerTenantDto } from '../dtos/register-owner-tenant.dto';

@ApiTags('Security - Owner Tenant')
@Controller('api/meta-agent/tenants/owner')
export class OwnerTenantController {
  private readonly logger = new Logger(OwnerTenantController.name);

  constructor(
    private readonly tenantManagementService: TenantManagementService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register Colombiatic as owner tenant' })
  @ApiBody({
    type: () => RegisterOwnerTenantDto,
    description: 'Owner tenant registration data',
    examples: {
      colombiatic: {
        summary: 'Colombiatic registration',
        value: {
          tenantName: 'Colombiatic',
          contactEmail: 'contacto@colombiatic.com',
          websiteUrl: 'https://colombiatic.com',
          businessIndustry: 'Technology'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Owner tenant registered successfully',
    schema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', example: 'colombiatic' },
        siteId: { type: 'string', example: 'colombiatic-site' },
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        tenantSecret: { type: 'string', example: 'generated-secret-key' },
        allowedOrigins: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['https://colombiatic.com'] 
        },
        permissions: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['read', 'write', 'admin', 'system', 'owner'] 
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async registerOwnerTenant(@Body() registerOwnerTenantDto: RegisterOwnerTenantDto) {
    this.logger.log('Registering owner tenant', { registerOwnerTenantDto });
    
    try {
      // Validate input data
      if (!registerOwnerTenantDto.tenantName || !registerOwnerTenantDto.contactEmail || 
          !registerOwnerTenantDto.websiteUrl || !registerOwnerTenantDto.businessIndustry) {
        return {
          success: false,
          error: 'Missing required fields: tenantName, contactEmail, websiteUrl, businessIndustry'
        };
      }

      // Register owner tenant
      const result = await this.tenantManagementService.registerOwnerTenant(registerOwnerTenantDto);
      
      this.logger.log('Owner tenant registered successfully', { tenantId: result.tenantId });
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      this.logger.error('Failed to register owner tenant', error.stack);
      return {
        success: false,
        error: error.message
      };
    }
  }
}