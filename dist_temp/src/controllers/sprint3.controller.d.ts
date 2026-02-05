import { ViralizationPipelineService } from '../services/viralization-pipeline/viralization-pipeline.service';
import { HeartbeatMonitoringService } from '../services/heartbeat-monitoring/heartbeat-monitoring.service';
export declare class Sprint3Controller {
    private readonly pipelineService;
    private readonly monitoringService;
    constructor(pipelineService: ViralizationPipelineService, monitoringService: HeartbeatMonitoringService);
    executeViralizationPipeline(body: any): Promise<{
        success: boolean;
        message: string;
        result: import("../services/viralization-pipeline/viralization-pipeline.service").PipelineResult;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        result?: undefined;
    }>;
    getPipelineExecution(executionId: string): Promise<{
        success: boolean;
        message: string;
        execution?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        execution: import("../services/viralization-pipeline/viralization-pipeline.service").PipelineExecution;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
        execution?: undefined;
    }>;
    getTenantExecutions(tenantId: string): Promise<{
        success: boolean;
        executions: import("../services/viralization-pipeline/viralization-pipeline.service").PipelineExecution[];
        count: number;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        executions?: undefined;
        count?: undefined;
    }>;
    getPipelineMetrics(): Promise<{
        success: boolean;
        metrics: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        metrics?: undefined;
    }>;
    getSystemHealth(): Promise<{
        success: boolean;
        health: import("../services/heartbeat-monitoring/heartbeat-monitoring.service").SystemHealth;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        health?: undefined;
    }>;
    getAlertStats(): Promise<{
        success: boolean;
        stats: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        stats?: undefined;
    }>;
    getAgentHistory(agentId: string, hours?: string): Promise<{
        success: boolean;
        message: string;
        history?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        history: any;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
        history?: undefined;
    }>;
    simulateAgentHeartbeat(agentId: string, body: any): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    simulateAgentError(agentId: string, body: {
        message: string;
    }): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    testSimplePipeline(body: any): Promise<{
        success: boolean;
        message: string;
        testData: {
            tenantId: any;
            sessionId: any;
            inputData: {
                topics: string[];
                platforms: string[];
                style: string;
                duration: number;
            };
        };
        result: import("../services/viralization-pipeline/viralization-pipeline.service").PipelineResult;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        testData: {
            tenantId: any;
            sessionId: any;
            inputData: {
                topics: string[];
                platforms: string[];
                style: string;
                duration: number;
            };
        };
        message?: undefined;
        result?: undefined;
    }>;
    getDemoStatus(): Promise<{
        success: boolean;
        timestamp: string;
        services: {
            pipeline: {
                status: string;
                metrics: any;
            };
            monitoring: {
                status: string;
                health: "healthy" | "degraded" | "unhealthy";
                alerts: any;
            };
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        timestamp: string;
        services?: undefined;
        message?: undefined;
    }>;
}
