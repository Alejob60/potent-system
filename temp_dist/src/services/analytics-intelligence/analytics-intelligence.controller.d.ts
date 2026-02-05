import { DataWarehouseService } from './data-warehouse.service';
import { PredictiveAnalyticsService } from './predictive-analytics.service';
import { BusinessIntelligenceService } from './business-intelligence.service';
import { ReportingService } from './reporting.service';
import { RealTimeAnalyticsService } from './real-time-analytics.service';
import { ETLService } from './etl.service';
import { BatchProcessingService } from './batch-processing.service';
export declare class AnalyticsIntelligenceController {
    private readonly dataWarehouseService;
    private readonly predictiveAnalyticsService;
    private readonly businessIntelligenceService;
    private readonly reportingService;
    private readonly realTimeAnalyticsService;
    private readonly etlService;
    private readonly batchProcessingService;
    private readonly logger;
    constructor(dataWarehouseService: DataWarehouseService, predictiveAnalyticsService: PredictiveAnalyticsService, businessIntelligenceService: BusinessIntelligenceService, reportingService: ReportingService, realTimeAnalyticsService: RealTimeAnalyticsService, etlService: ETLService, batchProcessingService: BatchProcessingService);
    initializeDataWarehouse(body: any): Promise<{
        success: boolean;
        data: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    executeETLProcess(body: any): Promise<{
        success: boolean;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    processBatchData(body: any): Promise<{
        success: boolean;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    listBatchExecutions(jobId?: string, limit?: string): Promise<{
        success: boolean;
        data: import("./batch-processing.service").BatchJobExecution[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    cancelBatchExecution(executionId: string): Promise<{
        success: boolean;
        data: true;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getBatchExecution(executionId: string): Promise<{
        success: boolean;
        data: import("./batch-processing.service").BatchJobExecution;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    retryBatchExecution(executionId: string): Promise<{
        success: boolean;
        data: Promise<string>;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    trainPredictiveModel(body: any): Promise<{
        success: boolean;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    makePredictions(body: any): Promise<{
        success: boolean;
        data: any[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    createDashboard(body: any): Promise<{
        success: boolean;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getDashboard(dashboardId: string): Promise<{
        success: boolean;
        data: Promise<any>;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    generateReport(body: any): Promise<{
        success: boolean;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getReport(reportId: string): Promise<{
        success: boolean;
        data: Promise<any>;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getRealTimeMetrics(metricNames?: string): Promise<{
        success: boolean;
        data: import("./real-time-analytics.service").RealTimeMetric[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getRealTimeAlerts(): Promise<{
        success: boolean;
        data: import("./real-time-analytics.service").RealTimeAlert[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
}
