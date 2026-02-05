import { BulkImportService, ImportJobDetail } from './bulk-import.service';
import { ImportJob } from '../entities/import-job.entity';
export declare class BulkImportController {
    private readonly bulkImportService;
    private readonly logger;
    constructor(bulkImportService: BulkImportService);
    startImportJob(file: Express.Multer.File, instanceId: string, columnMapping: Record<string, string>): Promise<{
        success: boolean;
        data: ImportJob;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getImportJobStatus(jobId: string): Promise<{
        success: boolean;
        data: ImportJob;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getImportJobDetail(jobId: string): Promise<{
        success: boolean;
        data: ImportJobDetail;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    cancelImportJob(jobId: string): Promise<{
        success: boolean;
        data: ImportJob;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    retryImportJob(jobId: string): Promise<{
        success: boolean;
        data: ImportJob;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    previewCsvFile(file: Express.Multer.File): Promise<{
        success: boolean;
        data: any[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
}
