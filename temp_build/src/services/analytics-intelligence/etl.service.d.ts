import { Observable } from 'rxjs';
import { DataWarehouseService } from './data-warehouse.service';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';
export interface ETLJobConfig {
    jobId: string;
    name: string;
    description?: string;
    source: {
        type: 'database' | 'api' | 'file' | 'stream';
        connection: string;
        query?: string;
        table?: string;
        endpoint?: string;
        filePath?: string;
    };
    transformations: Array<{
        id: string;
        name: string;
        type: 'field_mapping' | 'data_cleaning' | 'aggregation' | 'custom';
        config: any;
    }>;
    destination: {
        type: 'data_warehouse' | 'database' | 'file' | 'api';
        connection: string;
        table?: string;
        endpoint?: string;
        filePath?: string;
    };
    schedule?: string;
    active: boolean;
}
export interface ETLJobExecution {
    executionId: string;
    jobId: string;
    status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
    startTime: Date;
    endTime?: Date;
    duration?: number;
    recordsProcessed: number;
    recordsFailed: number;
    errorMessage?: string;
    metrics: {
        extracted: number;
        transformed: number;
        loaded: number;
    };
}
export interface ETLDataRecord {
    id: string;
    data: Record<string, any>;
    timestamp: Date;
    source: string;
}
export declare class ETLService {
    private readonly dataWarehouseService;
    private readonly websocketGateway;
    private readonly logger;
    private readonly jobExecutionStream;
    private etlJobs;
    private jobExecutions;
    private executionHistory;
    constructor(dataWarehouseService: DataWarehouseService, websocketGateway: WebSocketGatewayService);
    createETLJob(config: ETLJobConfig): string;
    getETLJob(jobId: string): ETLJobConfig | undefined;
    listETLJobs(): ETLJobConfig[];
    updateETLJob(jobId: string, config: Partial<ETLJobConfig>): boolean;
    deleteETLJob(jobId: string): boolean;
    executeETLJob(jobId: string): Promise<string>;
    private simulateETLProcess;
    getJobExecution(executionId: string): ETLJobExecution | undefined;
    listJobExecutions(jobId?: string, limit?: number): ETLJobExecution[];
    getExecutionHistory(limit?: number): ETLJobExecution[];
    cancelJobExecution(executionId: string): boolean;
    getJobExecutionStream(): Observable<ETLJobExecution>;
    validateETLJobConfig(config: ETLJobConfig): boolean;
}
