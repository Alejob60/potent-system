import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { ImportJob } from '../entities/import-job.entity';
import { createObjectCsvStringifier } from 'csv-writer';
import csvParser from 'csv-parser';
import * as fs from 'fs';
import * as path from 'path';

export interface CustomerData {
  name: string;
  email?: string;
  phone?: string;
  meta?: Record<string, any>;
}

export interface ImportJobDetail extends ImportJob {
  validation_errors: Array<{
    row_number: number;
    error: string;
    data: Record<string, any>;
  }>;
}

@Injectable()
export class BulkImportService {
  private readonly logger = new Logger(BulkImportService.name);

  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(ImportJob)
    private importJobRepository: Repository<ImportJob>,
  ) {}

  /**
   * Start a new import job
   * @param instanceId Instance ID
   * @param fileName Original file name
   * @param filePath Path to the uploaded file
   * @param columnMapping Column mapping configuration
   * @returns Import job
   */
  async startImportJob(
    instanceId: string,
    fileName: string,
    filePath: string,
    columnMapping: Record<string, string>,
  ): Promise<ImportJob> {
    try {
      // Create import job record
      const importJob = this.importJobRepository.create({
        instance_id: instanceId,
        file_name: fileName,
        column_mapping: columnMapping,
        status: 'pending',
        total_rows: 0,
        processed_rows: 0,
        failed_rows: 0,
      });

      const savedJob = await this.importJobRepository.save(importJob);
      
      // Process the file asynchronously
      this.processImportFile(savedJob, filePath);
      
      return savedJob;
    } catch (error) {
      this.logger.error(`Failed to start import job: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process the import file
   * @param job Import job
   * @param filePath Path to the uploaded file
   */
  private async processImportFile(job: ImportJob, filePath: string): Promise<void> {
    try {
      // Update job status to processing
      await this.importJobRepository.update(job.id, { status: 'processing' });

      const customers: CustomerData[] = [];
      const validationErrors: Array<{ row_number: number; error: string; data: Record<string, any> }> = [];
      let totalRows = 0;

      // Parse CSV file
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csvParser())
          .on('data', (row) => {
            totalRows++;
            try {
              // Map columns based on configuration
              const mappedRow: Record<string, any> = {};
              for (const [sourceColumn, targetColumn] of Object.entries(job.column_mapping)) {
                if (row[sourceColumn] !== undefined) {
                  mappedRow[targetColumn] = row[sourceColumn];
                }
              }

              // Validate required fields
              if (!mappedRow.name) {
                validationErrors.push({
                  row_number: totalRows,
                  error: 'Name is required',
                  data: row,
                });
                return;
              }

              // Validate email format if provided
              if (mappedRow.email && !this.isValidEmail(mappedRow.email)) {
                validationErrors.push({
                  row_number: totalRows,
                  error: 'Invalid email format',
                  data: row,
                });
                return;
              }

              customers.push({
                name: mappedRow.name,
                email: mappedRow.email,
                phone: mappedRow.phone,
                meta: mappedRow,
              });
            } catch (error) {
              validationErrors.push({
                row_number: totalRows,
                error: error.message,
                data: row,
              });
            }
          })
          .on('end', () => {
            resolve();
          })
          .on('error', (error) => {
            reject(error);
          });
      });

      // Update job with total rows count
      await this.importJobRepository.update(job.id, { total_rows: totalRows });

      // Process valid customers
      let processedRows = 0;
      let failedRows = validationErrors.length;

      for (const customerData of customers) {
        try {
          // Check for duplicates
          const existingCustomer = await this.customerRepository.findOne({
            where: {
              instance_id: job.instance_id,
              email: customerData.email,
            },
          });

          if (existingCustomer) {
            // Update existing customer
            await this.customerRepository.update(existingCustomer.id, {
              name: customerData.name,
              phone: customerData.phone,
              meta: {
                ...existingCustomer.meta,
                ...customerData.meta,
              },
              updated_at: new Date(),
            });
          } else {
            // Create new customer
            const customer = this.customerRepository.create({
              instance_id: job.instance_id,
              name: customerData.name,
              email: customerData.email,
              phone: customerData.phone,
              meta: customerData.meta,
            });
            await this.customerRepository.save(customer);
          }

          processedRows++;
        } catch (error) {
          failedRows++;
          validationErrors.push({
            row_number: processedRows + failedRows,
            error: error.message,
            data: customerData,
          });
        }
      }

      // Update job status to completed
      await this.importJobRepository.update(job.id, {
        status: 'completed',
        processed_rows: processedRows,
        failed_rows: failedRows,
      });

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      this.logger.log(`Import job ${job.id} completed. Processed: ${processedRows}, Failed: ${failedRows}`);
    } catch (error) {
      this.logger.error(`Failed to process import file for job ${job.id}: ${error.message}`);
      
      // Update job status to failed
      await this.importJobRepository.update(job.id, {
        status: 'failed',
        error: error.message,
      });

      // Clean up uploaded file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  /**
   * Get import job status
   * @param jobId Job ID
   * @returns Import job
   */
  async getImportJobStatus(jobId: string): Promise<ImportJob> {
    try {
      const job = await this.importJobRepository.findOne({
        where: { id: jobId },
      });

      if (!job) {
        throw new Error(`Import job ${jobId} not found`);
      }

      return job;
    } catch (error) {
      this.logger.error(`Failed to get import job status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get detailed import job information
   * @param jobId Job ID
   * @returns Import job detail
   */
  async getImportJobDetail(jobId: string): Promise<ImportJobDetail> {
    try {
      const job = await this.importJobRepository.findOne({
        where: { id: jobId },
      });

      if (!job) {
        throw new Error(`Import job ${jobId} not found`);
      }

      // In a real implementation, we would retrieve validation errors from a separate table
      // For now, we'll return an empty array
      return {
        ...job,
        validation_errors: [],
      };
    } catch (error) {
      this.logger.error(`Failed to get import job detail: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cancel import job
   * @param jobId Job ID
   * @returns Canceled job
   */
  async cancelImportJob(jobId: string): Promise<ImportJob> {
    try {
      const job = await this.importJobRepository.findOne({
        where: { id: jobId },
      });

      if (!job) {
        throw new Error(`Import job ${jobId} not found`);
      }

      if (job.status !== 'processing' && job.status !== 'pending') {
        throw new Error(`Cannot cancel job in ${job.status} status`);
      }

      const updatedJob = await this.importJobRepository.save({
        ...job,
        status: 'failed',
        error: 'Job canceled by user',
      });

      return updatedJob;
    } catch (error) {
      this.logger.error(`Failed to cancel import job: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retry failed import job
   * @param jobId Job ID
   * @returns Retried job
   */
  async retryImportJob(jobId: string): Promise<ImportJob> {
    try {
      const job = await this.importJobRepository.findOne({
        where: { id: jobId },
      });

      if (!job) {
        throw new Error(`Import job ${jobId} not found`);
      }

      if (job.status !== 'failed') {
        throw new Error(`Cannot retry job in ${job.status} status`);
      }

      // Reset job status
      const updatedJob = await this.importJobRepository.save({
        ...job,
        status: 'pending',
        processed_rows: 0,
        failed_rows: 0,
        error: null as any,
        updated_at: new Date(),
      }) as ImportJob;

      return updatedJob;
    } catch (error) {
      this.logger.error(`Failed to retry import job: ${error.message}`);
      throw error;
    }
  }

  /**
   * Preview CSV file
   * @param filePath Path to the uploaded file
   * @param limit Number of rows to preview
   * @returns Preview data
   */
  async previewCsvFile(filePath: string, limit: number = 5): Promise<any[]> {
    try {
      const previewData: any[] = [];

      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csvParser())
          .on('data', (row) => {
            if (previewData.length < limit) {
              previewData.push(row);
            }
          })
          .on('end', () => {
            resolve();
          })
          .on('error', (error) => {
            reject(error);
          });
      });

      return previewData;
    } catch (error) {
      this.logger.error(`Failed to preview CSV file: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate email format
   * @param email Email address
   * @returns True if valid, false otherwise
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}