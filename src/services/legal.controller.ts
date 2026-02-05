import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { LegalService } from './legal.service';
import { LegalDocument } from '../entities/legal-document.entity';
import { ConsentRecord } from '../entities/consent-record.entity';
import { DataExportRequest } from '../entities/data-export-request.entity';
import { DataDeleteRequest } from '../entities/data-delete-request.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('legal')
@Controller('legal')
export class LegalController {
  private readonly logger = new Logger(LegalController.name);

  constructor(private readonly legalService: LegalService) {}

  @Get('documents/:type')
  @ApiOperation({
    summary: 'Get legal document',
    description: 'Retrieve a legal document by type',
  })
  @ApiParam({
    name: 'type',
    description: 'Document type',
    example: 'terms-of-service',
  })
  @ApiResponse({
    status: 200,
    description: 'Legal document retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
            version: { type: 'string' },
            effective_date: { type: 'string', format: 'date' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async getLegalDocument(@Param('type') type: string) {
    try {
      const document: LegalDocument = await this.legalService.getLegalDocumentByType(type);
      return {
        success: true,
        data: document,
      };
    } catch (error) {
      this.logger.error(`Failed to get legal document: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('consents')
  @ApiOperation({
    summary: 'Record consent',
    description: 'Record user consent for a legal document',
  })
  @ApiBody({
    description: 'Consent record data',
    schema: {
      type: 'object',
      properties: {
        user_id: { type: 'string' },
        document_id: { type: 'string' },
        consented: { type: 'boolean' },
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
        throw new BadRequestException('Missing required fields');
      }

      const consentRecord: ConsentRecord = await this.legalService.recordConsent(
        body.user_id,
        body.document_id,
        body.consented,
        body.ip_address,
        body.user_agent,
      );

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

  @Get('consents/check')
  @ApiOperation({
    summary: 'Check consent status',
    description: 'Check if a user has consented to a legal document',
  })
  @ApiQuery({
    name: 'user_id',
    description: 'User ID',
    required: true,
    example: 'user_1234567890',
  })
  @ApiQuery({
    name: 'document_id',
    description: 'Document ID',
    required: true,
    example: 'doc_1234567890',
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
      const consented: boolean = await this.legalService.checkConsentStatus(userId, documentId);
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
}

@ApiTags('users')
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly legalService: LegalService) {}

  @Post('request-data-export')
  @ApiOperation({
    summary: 'Request data export',
    description: 'Request export of user data',
  })
  @ApiBody({
    description: 'Data export request data',
    schema: {
      type: 'object',
      properties: {
        user_id: { type: 'string' },
        format: { type: 'string', enum: ['json', 'csv', 'pdf'] },
        include_conversations: { type: 'boolean' },
        include_sales: { type: 'boolean' },
        include_profile: { type: 'boolean' },
      },
      required: ['user_id', 'format'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Data export request created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            user_id: { type: 'string' },
            format: { type: 'string', enum: ['json', 'csv', 'pdf'] },
            include_conversations: { type: 'boolean' },
            include_sales: { type: 'boolean' },
            include_profile: { type: 'boolean' },
            status: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed'] },
            download_url: { type: 'string' },
            expires_at: { type: 'string', format: 'date-time' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async requestDataExport(@Body() body: any) {
    try {
      if (!body.user_id || !body.format) {
        throw new BadRequestException('Missing required fields');
      }

      const exportRequest: DataExportRequest = await this.legalService.requestDataExport({
        user_id: body.user_id,
        format: body.format,
        include_conversations: body.include_conversations || false,
        include_sales: body.include_sales || false,
        include_profile: body.include_profile || false,
      });

      return {
        success: true,
        data: exportRequest,
      };
    } catch (error) {
      this.logger.error(`Failed to request data export: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('data-export/:id')
  @ApiOperation({
    summary: 'Check export status',
    description: 'Check the status of a data export request',
  })
  @ApiParam({
    name: 'id',
    description: 'Export request ID',
    example: 'export_1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Export status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            user_id: { type: 'string' },
            format: { type: 'string', enum: ['json', 'csv', 'pdf'] },
            include_conversations: { type: 'boolean' },
            include_sales: { type: 'boolean' },
            include_profile: { type: 'boolean' },
            status: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed'] },
            download_url: { type: 'string' },
            expires_at: { type: 'string', format: 'date-time' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async getDataExportStatus(@Param('id') id: string) {
    try {
      const exportRequest: DataExportRequest = await this.legalService.getDataExportStatus(id);
      return {
        success: true,
        data: exportRequest,
      };
    } catch (error) {
      this.logger.error(`Failed to get data export status: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('request-delete')
  @ApiOperation({
    summary: 'Request data deletion',
    description: 'Request deletion of user data',
  })
  @ApiBody({
    description: 'Data deletion request data',
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
    description: 'Data deletion request created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            user_id: { type: 'string' },
            confirmation_code: { type: 'string' },
            confirmed: { type: 'boolean' },
            processed: { type: 'boolean' },
            error_message: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async requestDataDeletion(@Body() body: any) {
    try {
      if (!body.user_id || !body.confirmation_code) {
        throw new BadRequestException('Missing required fields');
      }

      const deleteRequest: DataDeleteRequest = await this.legalService.requestDataDeletion({
        user_id: body.user_id,
        confirmation_code: body.confirmation_code,
      });

      return {
        success: true,
        data: deleteRequest,
      };
    } catch (error) {
      this.logger.error(`Failed to request data deletion: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('confirm-delete/:id')
  @ApiOperation({
    summary: 'Confirm data deletion',
    description: 'Confirm data deletion with confirmation code',
  })
  @ApiParam({
    name: 'id',
    description: 'Deletion request ID',
    example: 'delete_1234567890',
  })
  @ApiBody({
    description: 'Confirmation code',
    schema: {
      type: 'object',
      properties: {
        confirmation_code: { type: 'string' },
      },
      required: ['confirmation_code'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Data deletion confirmed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            user_id: { type: 'string' },
            confirmation_code: { type: 'string' },
            confirmed: { type: 'boolean' },
            processed: { type: 'boolean' },
            error_message: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async confirmDataDeletion(@Param('id') id: string, @Body() body: any) {
    try {
      if (!body.confirmation_code) {
        throw new BadRequestException('Missing confirmation code');
      }

      const deleteRequest: DataDeleteRequest = await this.legalService.confirmDataDeletion(
        id,
        body.confirmation_code,
      );

      return {
        success: true,
        data: deleteRequest,
      };
    } catch (error) {
      this.logger.error(`Failed to confirm data deletion: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}