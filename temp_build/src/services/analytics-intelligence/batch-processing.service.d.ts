import { Observable } from 'rxjs';
import { DataWarehouseService } from './data-warehouse.service';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';
export interface BatchJobConfig {
    jobId: string;
    name: string;
    description?: string;
    source: {
        type: 'database' | 'file' | 'api' | 'stream';
        connection: string;
        query?: string;
        table?: string;
        filePath?: string;
        endpoint?: string;
    };
    destination: {
        type: 'data_warehouse' | 'database' | 'file' | 'api';
        connection: string;
        table?: string;
        filePath?: string;
        endpoint?: string;
    };
    batchSize: number;
    parallelProcessing: boolean;
    maxRetries: number;
    retryDelay: number;
    schedule?: string;
    active: boolean;
    transformations?: Array<{
        field: string;
        transformation: string;
        parameters?: any;
    }>;
}
export interface BatchJobExecution {
    executionId: string;
    jobId: string;
    status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
    startTime: Date;
    endTime?: Date;
    duration?: number;
    totalBatches: number;
    completedBatches: number;
    totalRecords: number;
    processedRecords: number;
    failedRecords: number;
    retryCount: number;
    errorMessage?: string;
    metrics: {
        extracted: number;
        transformed: number;
        loaded: number;
    };
}
export interface BatchDataRecord {
    id: string;
    data: Record<string, any>;
    batchId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    createdAt: Date;
    updatedAt: Date;
    errorMessage?: string;
}
export declare class BatchProcessingService {
    private readonly dataWarehouseService;
    private readonly websocketGateway;
    private readonly logger;
    private readonly jobExecutionStream;
    private batchJobs;
    private jobExecutions;
    private executionHistory;
    constructor(dataWarehouseService: DataWarehouseService, websocketGateway: WebSocketGatewayService);
    createBatchJob(config: BatchJobConfig): string;
    getBatchJob(jobId: string): BatchJobConfig | undefined;
    listBatchJobs(): BatchJobConfig[];
    updateBatchJob(jobId: string, config: Partial<BatchJobConfig>): boolean;
    deleteBatchJob(jobId: string): boolean;
    executeBatchJob(jobId: string): Promise<string>;
    private simulateBatchProcess;
    getJobExecution(executionId: string): BatchJobExecution | undefined;
    listJobExecutions(jobId?: string, limit?: number): BatchJobExecution[];
    getExecutionHistory(limit?: number): BatchJobExecution[];
    cancelJobExecution(executionId: string): boolean;
    getJobExecutionStream(): Observable<BatchJobExecution>;
    validateBatchJobConfig(config: BatchJobConfig): boolean;
    retryJobExecution(executionId: string): Promise<string>;
    processBatchData(config: any): Promise<any>;
}
