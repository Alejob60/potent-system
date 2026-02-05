import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Logger,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BulkImportService, ImportJobDetail } from './bulk-import.service';
import { ImportJob } from '../entities/import-job.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiConsumes } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { diskStorage } from 'multer';
import * as express from 'express';

@ApiTags('bulk-import')
@Controller('imports')
export class BulkImportController {
  private readonly logger = new Logger(BulkImportController.name);

  constructor(private readonly bulkImportService: BulkImportService) {}

  @Post()
  @ApiOperation({
    summary: 'Start import job',
    description: 'Start a new bulk customer import job',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Import job parameters',
    schema: {
      type: 'object',
      properties: {
        instance_id: { type: 'string' },
        column_mapping: { type: 'object' },
        file: { type: 'string', format: 'binary' },
      },
      required: ['instance_id', 'column_mapping', 'file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Import job started successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            instance_id: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed'] },
            total_rows: { type: 'number' },
            processed_rows: { type: 'number' },
            failed_rows: { type: 'number' },
            file_name: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only CSV files are allowed'), false);
        }
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    }),
  )
  async startImportJob(
    @UploadedFile() file: Express.Multer.File,
    @Body('instance_id') instanceId: string,
    @Body('column_mapping') columnMapping: Record<string, string>,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('File is required');
      }

      if (!instanceId) {
        throw new BadRequestException('Instance ID is required');
      }

      if (!columnMapping) {
        throw new BadRequestException('Column mapping is required');
      }

      const job = await this.bulkImportService.startImportJob(
        instanceId,
        file.originalname,
        file.path,
        columnMapping,
      );

      return {
        success: true,
        data: job,
      };
    } catch (error) {
      this.logger.error(`Failed to start import job: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get job status',
    description: 'Get the status of an import job',
  })
  @ApiParam({
    name: 'id',
    description: 'Job ID',
    example: 'job_1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Job status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            instance_id: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed'] },
            total_rows: { type: 'number' },
            processed_rows: { type: 'number' },
            failed_rows: { type: 'number' },
            file_name: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async getImportJobStatus(@Param('id') jobId: string) {
    try {
      const job = await this.bulkImportService.getImportJobStatus(jobId);
      return {
        success: true,
        data: job,
      };
    } catch (error) {
      this.logger.error(`Failed to get import job status: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get(':id/detail')
  @ApiOperation({
    summary: 'Get detailed job info',
    description: 'Get detailed information about an import job including validation errors',
  })
  @ApiParam({
    name: 'id',
    description: 'Job ID',
    example: 'job_1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed job info retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            instance_id: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed'] },
            total_rows: { type: 'number' },
            processed_rows: { type: 'number' },
            failed_rows: { type: 'number' },
            file_name: { type: 'string' },
            column_mapping: { type: 'object' },
            error: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            validation_errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  row_number: { type: 'number' },
                  error: { type: 'string' },
                  data: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
  })
  async getImportJobDetail(@Param('id') jobId: string) {
    try {
      const detail: ImportJobDetail = await this.bulkImportService.getImportJobDetail(jobId);
      return {
        success: true,
        data: detail,
      };
    } catch (error) {
      this.logger.error(`Failed to get import job detail: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post(':id/cancel')
  @ApiOperation({
    summary: 'Cancel job',
    description: 'Cancel an ongoing import job',
  })
  @ApiParam({
    name: 'id',
    description: 'Job ID',
    example: 'job_1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Job canceled successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            instance_id: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed'] },
            total_rows: { type: 'number' },
            processed_rows: { type: 'number' },
            failed_rows: { type: 'number' },
            file_name: { type: 'string' },
            error: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async cancelImportJob(@Param('id') jobId: string) {
    try {
      const job = await this.bulkImportService.cancelImportJob(jobId);
      return {
        success: true,
        data: job,
      };
    } catch (error) {
      this.logger.error(`Failed to cancel import job: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post(':id/retry')
  @ApiOperation({
    summary: 'Retry failed job',
    description: 'Retry a failed import job',
  })
  @ApiParam({
    name: 'id',
    description: 'Job ID',
    example: 'job_1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Job retry initiated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            instance_id: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed'] },
            total_rows: { type: 'number' },
            processed_rows: { type: 'number' },
            failed_rows: { type: 'number' },
            file_name: { type: 'string' },
            error: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async retryImportJob(@Param('id') jobId: string) {
    try {
      const job = await this.bulkImportService.retryImportJob(jobId);
      return {
        success: true,
        data: job,
      };
    } catch (error) {
      this.logger.error(`Failed to retry import job: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('preview')
  @ApiOperation({
    summary: 'Preview CSV file',
    description: 'Preview the first few rows of a CSV file',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'CSV file to preview',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'CSV preview retrieved successfully',
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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only CSV files are allowed'), false);
        }
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    }),
  )
  async previewCsvFile(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('File is required');
      }

      const previewData = await this.bulkImportService.previewCsvFile(file.path, 5);

      // Clean up uploaded file
      fs.unlinkSync(file.path);

      return {
        success: true,
        data: previewData,
      };
    } catch (error) {
      this.logger.error(`Failed to preview CSV file: ${error.message}`);
      
      // Clean up uploaded file if it exists
      if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      return {
        success: false,
        error: error.message,
      };
    }
  }
}