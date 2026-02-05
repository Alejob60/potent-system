import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ConsentManagementService } from './consent-management.service';
import { PrivacyControlsService } from './privacy-controls.service';
import { ComplianceService } from './compliance.service';
import { ConsentRecord } from '../../entities/consent-record.entity';
import { ConsentPreferences } from '../../entities/consent-preferences.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('privacy-consent')
@Controller('privacy-consent')
export class PrivacyConsentController {
  private readonly logger = new Logger(PrivacyConsentController.name);

  constructor(
    private readonly consentManagementService: ConsentManagementService,
    private readonly privacyControlsService: PrivacyControlsService,
    private readonly complianceService: ComplianceService,
  ) {}

  // CONSENT MANAGEMENT ENDPOINTS

  @Post('consents')
  @ApiOperation({
    summary: 'Record user consent',
    description: 'Record or update user consent for a specific document or purpose',
  })
  @ApiBody({
    description: 'Consent data',
    schema: {
      type: 'object',
      properties: {
        user_id: { type: 'string' },
        document_id: { type: 'string' },
        consented: { type: 'boolean' },
        purpose: { type: 'string' },
        categories: { type: 'array', items: { type: 'string' } },
        ip_address: { type: 'string' },
        user_agent: { type: 'string' },
      },
      required: ['user_id', 'document_id', 'consented'],
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
            user_id: { type: 'string' },
            document_id: { type: 'string' },
            consented: { type: 'boolean' },
            consented_at: { type: 'string', format: 'date-time' },
            withdrawn_at: { type: 'string', format: 'date-time' },
            purpose: { type: 'string' },
            categories: { type: 'array', items: { type: 'string' } },
            ip_address: { type: 'string' },
            user_agent: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async recordConsent(@Body() body: any) {
    try {
      if (!body.user_id || !body.document_id || body.consented === undefined) {
        throw new BadRequestException('Missing required fields: user_id, document_id, consented');
      }

      const consentRecord: ConsentRecord = await this.consentManagementService.recordConsent({
        user_id: body.user_id,
        document_id: body.document_id,
        consented: body.consented,
        purpose: body.purpose,
        categories: body.categories,
        ip_address: body.ip_address,
        user_agent: body.user_agent,
      });

      return {
        success: true,
        data: consentRecord,
      };
    } catch (error) {
      this.logger.error(`Failed to record consent: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Delete('consents')
  @ApiOperation({
    summary: 'Withdraw user consent',
    description: 'Withdraw user consent by consent ID or user ID and document ID',
  })
  @ApiBody({
    description: 'Consent withdrawal data',
    schema: {
      type: 'object',
      properties: {
        user_id: { type: 'string' },
        document_id: { type: 'string' },
        consent_id: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Consent withdrawn successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            user_id: { type: 'string' },
            document_id: { type: 'string' },
            consented: { type: 'boolean' },
            consented_at: { type: 'string', format: 'date-time' },
            withdrawn_at: { type: 'string', format: 'date-time' },
            purpose: { type: 'string' },
            categories: { type: 'array', items: { type: 'string' } },
            ip_address: { type: 'string' },
            user_agent: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async withdrawConsent(@Body() body: any) {
    try {
      if (!body.consent_id && (!body.user_id || !body.document_id)) {
        throw new BadRequestException('Either consent_id or both user_id and document_id must be provided');
      }

      const consentRecord: ConsentRecord = await this.consentManagementService.withdrawConsent({
        user_id: body.user_id,
        document_id: body.document_id,
        consent_id: body.consent_id,
      });

      return {
        success: true,
        data: consentRecord,
      };
    } catch (error) {
      this.logger.error(`Failed to withdraw consent: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('consents/status')
  @ApiOperation({
    summary: 'Check consent status',
    description: 'Check if a user has consented to a specific document',
  })
  @ApiQuery({
    name: 'user_id',
    description: 'User ID',
    required: true,
  })
  @ApiQuery({
    name: 'document_id',
    description: 'Document ID',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Consent status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'boolean' },
      },
    },
  })
  async checkConsentStatus(
    @Query('user_id') userId: string,
    @Query('document_id') documentId: string,
  ) {
    try {
      const consented: boolean = await this.consentManagementService.checkConsentStatus(userId, documentId);
      return {
        success: true,
        data: consented,
      };
    } catch (error) {
      this.logger.error(`Failed to check consent status: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('consents/user/:userId')
  @ApiOperation({
    summary: 'Get user consent records',
    description: 'Retrieve all consent records for a specific user',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
  })
  @ApiResponse({
    status: 200,
    description: 'User consent records retrieved successfully',
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
              user_id: { type: 'string' },
              document_id: { type: 'string' },
              consented: { type: 'boolean' },
              consented_at: { type: 'string', format: 'date-time' },
              withdrawn_at: { type: 'string', format: 'date-time' },
              purpose: { type: 'string' },
              categories: { type: 'array', items: { type: 'string' } },
              ip_address: { type: 'string' },
              user_agent: { type: 'string' },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  async getUserConsents(@Param('userId') userId: string) {
    try {
      const consentRecords: ConsentRecord[] = await this.consentManagementService.getUserConsents(userId);
      return {
        success: true,
        data: consentRecords,
      };
    } catch (error) {
      this.logger.error(`Failed to get user consents: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('preferences')
  @ApiOperation({
    summary: 'Set user consent preferences',
    description: 'Set or update user consent preferences for different categories',
  })
  @ApiBody({
    description: 'Consent preferences data',
    schema: {
      type: 'object',
      properties: {
        user_id: { type: 'string' },
        preferences: {
          type: 'object',
          properties: {
            marketing_emails: { type: 'boolean' },
            analytics: { type: 'boolean' },
            personalized_content: { type: 'boolean' },
            data_sharing: { type: 'boolean' },
          },
        },
      },
      required: ['user_id', 'preferences'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Consent preferences set successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            user_id: { type: 'string' },
            preferences: {
              type: 'object',
              properties: {
                marketing_emails: { type: 'boolean' },
                analytics: { type: 'boolean' },
                personalized_content: { type: 'boolean' },
                data_sharing: { type: 'boolean' },
              },
            },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async setConsentPreferences(@Body() body: any) {
    try {
      if (!body.user_id || !body.preferences) {
        throw new BadRequestException('Missing required fields: user_id, preferences');
      }

      const preferences: ConsentPreferences = await this.consentManagementService.setConsentPreferences({
        user_id: body.user_id,
        preferences: body.preferences,
      });

      return {
        success: true,
        data: preferences,
      };
    } catch (error) {
      this.logger.error(`Failed to set consent preferences: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('preferences/user/:userId')
  @ApiOperation({
    summary: 'Get user consent preferences',
    description: 'Retrieve consent preferences for a specific user',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Consent preferences retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            user_id: { type: 'string' },
            preferences: {
              type: 'object',
              properties: {
                marketing_emails: { type: 'boolean' },
                analytics: { type: 'boolean' },
                personalized_content: { type: 'boolean' },
                data_sharing: { type: 'boolean' },
              },
            },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async getConsentPreferences(@Param('userId') userId: string) {
    try {
      const preferences: ConsentPreferences | null = await this.consentManagementService.getConsentPreferences(userId);
      return {
        success: true,
        data: preferences,
      };
    } catch (error) {
      this.logger.error(`Failed to get consent preferences: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // PRIVACY CONTROLS ENDPOINTS

  @Post('data-minimization')
  @ApiOperation({
    summary: 'Implement data minimization policies',
    description: 'Configure data minimization policies including retention periods and auto-purge settings',
  })
  @ApiBody({
    description: 'Data minimization configuration',
    schema: {
      type: 'object',
      properties: {
        retention_period_days: { type: 'number' },
        auto_purge_enabled: { type: 'boolean' },
        sensitive_data_types: { type: 'array', items: { type: 'string' } },
      },
      required: ['retention_period_days', 'auto_purge_enabled'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Data minimization policies implemented successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
      },
    },
  })
  async implementDataMinimization(@Body() body: any) {
    try {
      if (body.retention_period_days === undefined || body.auto_purge_enabled === undefined) {
        throw new BadRequestException('Missing required fields: retention_period_days, auto_purge_enabled');
      }

      const success: boolean = await this.privacyControlsService.implementDataMinimization({
        retention_period_days: body.retention_period_days,
        auto_purge_enabled: body.auto_purge_enabled,
        sensitive_data_types: body.sensitive_data_types,
      });

      return {
        success: true,
        data: { implemented: success },
      };
    } catch (error) {
      this.logger.error(`Failed to implement data minimization: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('purpose-limitation')
  @ApiOperation({
    summary: 'Implement purpose limitation controls',
    description: 'Configure purpose limitation controls to restrict data usage to specific purposes',
  })
  @ApiBody({
    description: 'Purpose limitation configuration',
    schema: {
      type: 'object',
      properties: {
        allowed_purposes: { type: 'array', items: { type: 'string' } },
        purpose_mapping: { type: 'object' },
      },
      required: ['allowed_purposes'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Purpose limitation controls implemented successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
      },
    },
  })
  async implementPurposeLimitation(@Body() body: any) {
    try {
      if (!body.allowed_purposes) {
        throw new BadRequestException('Missing required field: allowed_purposes');
      }

      const success: boolean = await this.privacyControlsService.implementPurposeLimitation({
        allowed_purposes: body.allowed_purposes,
        purpose_mapping: body.purpose_mapping,
      });

      return {
        success: true,
        data: { implemented: success },
      };
    } catch (error) {
      this.logger.error(`Failed to implement purpose limitation: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('data-portability')
  @ApiOperation({
    summary: 'Request data portability',
    description: 'Request export of user data in a portable format',
  })
  @ApiBody({
    description: 'Data portability request',
    schema: {
      type: 'object',
      properties: {
        user_id: { type: 'string' },
        format: { type: 'string', enum: ['json', 'csv', 'xml'] },
        include_conversations: { type: 'boolean' },
        include_profile: { type: 'boolean' },
        include_preferences: { type: 'boolean' },
      },
      required: ['user_id', 'format'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Data portability request processed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            file_name: { type: 'string' },
            file_size: { type: 'number' },
            download_url: { type: 'string' },
            expires_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async requestDataPortability(@Body() body: any) {
    try {
      if (!body.user_id || !body.format) {
        throw new BadRequestException('Missing required fields: user_id, format');
      }

      const exportInfo: any = await this.privacyControlsService.processDataPortabilityRequest({
        user_id: body.user_id,
        format: body.format,
        include_conversations: body.include_conversations || false,
        include_profile: body.include_profile || false,
        include_preferences: body.include_preferences || false,
      });

      return {
        success: true,
        data: exportInfo,
      };
    } catch (error) {
      this.logger.error(`Failed to process data portability request: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('right-to-be-forgotten')
  @ApiOperation({
    summary: 'Process right to be forgotten request',
    description: 'Process a user request to delete or anonymize their personal data',
  })
  @ApiBody({
    description: 'Right to be forgotten request',
    schema: {
      type: 'object',
      properties: {
        user_id: { type: 'string' },
        confirmation_code: { type: 'string' },
      },
      required: ['user_id', 'confirmation_code'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Right to be forgotten request processed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
      },
    },
  })
  async processRightToBeForgotten(@Body() body: any) {
    try {
      if (!body.user_id || !body.confirmation_code) {
        throw new BadRequestException('Missing required fields: user_id, confirmation_code');
      }

      const success: boolean = await this.privacyControlsService.processRightToBeForgotten({
        user_id: body.user_id,
        confirmation_code: body.confirmation_code,
      });

      return {
        success: true,
        data: { processed: success },
      };
    } catch (error) {
      this.logger.error(`Failed to process right to be forgotten request: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // COMPLIANCE ENDPOINTS

  @Get('compliance/gdpr/report')
  @ApiOperation({
    summary: 'Generate GDPR compliance report',
    description: 'Generate a comprehensive GDPR compliance report',
  })
  @ApiResponse({
    status: 200,
    description: 'GDPR compliance report generated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            report_date: { type: 'string', format: 'date-time' },
            total_users: { type: 'number' },
            consented_users: { type: 'number' },
            non_consenting_users: { type: 'number' },
            consent_by_purpose: { type: 'object' },
            data_breaches: { type: 'number' },
            breach_notifications_sent: { type: 'number' },
          },
        },
      },
    },
  })
  async generateGDPRComplianceReport() {
    try {
      const report: any = await this.complianceService.generateGDPRComplianceReport();
      return {
        success: true,
        data: report,
      };
    } catch (error) {
      this.logger.error(`Failed to generate GDPR compliance report: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('compliance/ccpa/report')
  @ApiOperation({
    summary: 'Generate CCPA compliance report',
    description: 'Generate a comprehensive CCPA compliance report',
  })
  @ApiResponse({
    status: 200,
    description: 'CCPA compliance report generated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            report_date: { type: 'string', format: 'date-time' },
            total_users: { type: 'number' },
            users_exercising_rights: { type: 'number' },
            data_deletion_requests: { type: 'number' },
            data_access_requests: { type: 'number' },
            opt_out_sales_requests: { type: 'number' },
          },
        },
      },
    },
  })
  async generateCCPAComplianceReport() {
    try {
      const report: any = await this.complianceService.generateCCPAComplianceReport();
      return {
        success: true,
        data: report,
      };
    } catch (error) {
      this.logger.error(`Failed to generate CCPA compliance report: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('audit/user/:userId')
  @ApiOperation({
    summary: 'Get user audit log',
    description: 'Retrieve audit log entries for a specific user',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of entries to return (default: 50)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'User audit log retrieved successfully',
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
              user_id: { type: 'string' },
              action: { type: 'string' },
              resource: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
              ip_address: { type: 'string' },
              user_agent: { type: 'string' },
              details: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async getUserAuditLog(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const limitNum = limit ? parseInt(limit) : 50;
      const auditLog: any[] = await this.complianceService.getUserAuditLog(userId, limitNum);
      return {
        success: true,
        data: auditLog,
      };
    } catch (error) {
      this.logger.error(`Failed to get user audit log: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('compliance/user/:userId/gdpr')
  @ApiOperation({
    summary: 'Check GDPR compliance for user',
    description: 'Check if a user is GDPR compliant',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
  })
  @ApiResponse({
    status: 200,
    description: 'GDPR compliance status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'boolean' },
      },
    },
  })
  async checkGDPRComplianceForUser(@Param('userId') userId: string) {
    try {
      const isCompliant: boolean = await this.complianceService.checkGDPRComplianceForUser(userId);
      return {
        success: true,
        data: isCompliant,
      };
    } catch (error) {
      this.logger.error(`Failed to check GDPR compliance for user: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('compliance/user/:userId/ccpa')
  @ApiOperation({
    summary: 'Check CCPA compliance for user',
    description: 'Check if a user is CCPA compliant',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
  })
  @ApiResponse({
    status: 200,
    description: 'CCPA compliance status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'boolean' },
      },
    },
  })
  async checkCCPAComplianceForUser(@Param('userId') userId: string) {
    try {
      const isCompliant: boolean = await this.complianceService.checkCCPAComplianceForUser(userId);
      return {
        success: true,
        data: isCompliant,
      };
    } catch (error) {
      this.logger.error(`Failed to check CCPA compliance for user: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
