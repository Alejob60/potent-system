import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import { AgentAnalyticsReporting } from '../../agents/agent-analytics-reporting/entities/agent-analytics-reporting.entity';
import { DataWarehouse } from '../../entities/data-warehouse.entity';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';
export interface DataWarehouseConfig {
    dataSource: string;
    tableName: string;
    primaryKey: string;
    columns: string[];
}
export interface ETLProcessConfig {
    source: string;
    destination: string;
    transformations: Array<{
        field: string;
        transformation: string;
        parameters?: any;
    }>;
}
export interface ETLProcessResult {
    processId: string;
    status: 'started' | 'running' | 'completed' | 'failed';
    extracted: number;
    transformed: number;
    loaded: number;
    errors: number;
    startTime: Date;
    endTime?: Date;
    errorMessage?: string;
}
export interface ETLTransformationFunction {
    (data: any, parameters?: any): any;
}
export interface BatchProcessConfig {
    schedule: string;
    batchSize: number;
    parallelProcessing: boolean;
}
export interface BatchProcessResult {
    processId: string;
    status: 'started' | 'running' | 'completed' | 'failed';
    totalBatches: number;
    completedBatches: number;
    totalRecords: number;
    processedRecords: number;
    failedRecords: number;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    errorMessage?: string;
}
export interface BatchPipelineConfig {
    pipelineId: string;
    name: string;
    description?: string;
    source: string;
    destination: string;
    batchSize: number;
    parallelProcessing: boolean;
    schedule?: string;
    active: boolean;
    transformations?: Array<{
        field: string;
        transformation: string;
        parameters?: any;
    }>;
}
export interface RealTimeDataPoint {
    timestamp: Date;
    metric: string;
    value: number;
    dimensions?: Record<string, any>;
}
export declare class DataWarehouseService {
    private readonly analyticsRepo;
    private readonly dataWarehouseRepo;
    private readonly websocketGateway;
    private readonly logger;
    private readonly realTimeDataStream;
    private realTimeDataBuffer;
    private etlProcesses;
    private batchProcesses;
    private batchPipelines;
    private transformationFunctions;
    constructor(analyticsRepo: Repository<AgentAnalyticsReporting>, dataWarehouseRepo: Repository<DataWarehouse>, websocketGateway: WebSocketGatewayService);
    initializeDataWarehouse(config: DataWarehouseConfig): Promise<boolean>;
    registerTransformationFunction(name: string, fn: ETLTransformationFunction): void;
    getTransformationFunction(name: string): ETLTransformationFunction | undefined;
    executeETLProcess(config: ETLProcessConfig): Promise<ETLProcessResult>;
    getETLProcessStatus(processId: string): ETLProcessResult | undefined;
    listETLProcesses(): ETLProcessResult[];
    private applyTransformations;
    createBatchPipeline(config: BatchPipelineConfig): string;
    getBatchPipeline(pipelineId: string): BatchPipelineConfig | undefined;
    listBatchPipelines(): BatchPipelineConfig[];
    updateBatchPipeline(pipelineId: string, config: Partial<BatchPipelineConfig>): boolean;
    deleteBatchPipeline(pipelineId: string): boolean;
    processBatchData(config: BatchProcessConfig): Promise<BatchProcessResult>;
    getBatchProcessStatus(processId: string): BatchProcessResult | undefined;
    listBatchProcesses(): BatchProcessResult[];
    executeBatchPipeline(pipelineId: string): Promise<string>;
    getRealTimeDataStream(): Observable<RealTimeDataPoint>;
    emitRealTimeData(dataPoint: RealTimeDataPoint): void;
    getBufferedRealTimeData(limit?: number): RealTimeDataPoint[];
    getRealTimeAnalytics(query: any): Promise<any>;
    createDataPipeline(pipelineConfig: any): Promise<string>;
}
