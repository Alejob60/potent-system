import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { ImportJob } from '../entities/import-job.entity';
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
export declare class BulkImportService {
    private customerRepository;
    private importJobRepository;
    private readonly logger;
    constructor(customerRepository: Repository<Customer>, importJobRepository: Repository<ImportJob>);
    startImportJob(instanceId: string, fileName: string, filePath: string, columnMapping: Record<string, string>): Promise<ImportJob>;
    private processImportFile;
    getImportJobStatus(jobId: string): Promise<ImportJob>;
    getImportJobDetail(jobId: string): Promise<ImportJobDetail>;
    cancelImportJob(jobId: string): Promise<ImportJob>;
    retryImportJob(jobId: string): Promise<ImportJob>;
    previewCsvFile(filePath: string, limit?: number): Promise<any[]>;
    private isValidEmail;
}
