import { EventBusService } from '../event-bus/event-bus.service';
import { ContextStoreService } from '../context-store/context-store.service';
export interface PipelineStage {
    id: string;
    name: string;
    type: 'TREND_ANALYSIS' | 'CONTENT_CREATION' | 'VIDEO_PRODUCTION' | 'PUBLISHING';
    service: any;
    inputMapper: (data: any) => any;
    outputMapper: (result: any) => any;
    timeout: number;
    retryConfig: {
        maxRetries: number;
        backoffMs: number;
        exponentialBase: number;
    };
    dependencies: string[];
    metrics: StageMetrics;
}
export interface StageMetrics {
    executions: number;
    successes: number;
    failures: number;
    avgDuration: number;
    lastExecution: Date | null;
}
export interface PipelineExecution {
    id: string;
    tenantId: string;
    sessionId: string;
    userId?: string;
    stages: PipelineStage[];
    currentStageIndex: number;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
    inputData: any;
    outputData: any;
    startTime: Date;
    endTime?: Date;
    error?: string;
    metadata: Record<string, any>;
}
export interface PipelineResult {
    executionId: string;
    status: 'success' | 'partial_success' | 'failed';
    stagesCompleted: number;
    totalStages: number;
    results: Record<string, any>;
    metrics: {
        totalTime: number;
        avgStageTime: number;
        successRate: number;
    };
    recommendations: string[];
}
export declare class ViralizationPipelineService {
    private readonly eventBus;
    private readonly contextStore;
    private readonly logger;
    private readonly executions;
    private readonly DEFAULT_TIMEOUT;
    private readonly STAGE_TYPES;
    constructor(eventBus: EventBusService, contextStore: ContextStoreService);
    executeViralizationPipeline(tenantId: string, sessionId: string, inputData: any, userId?: string): Promise<PipelineResult>;
    private createPipelineExecution;
    private initializePipelineStages;
    private runPipelineStages;
    private executeStageWithRetry;
    private simulateStageExecution;
    private verifyStageDependencies;
    private calculateRetryDelay;
    private shouldAbortPipeline;
    private calculateOptimalPostingTime;
    private enforceStageTimeout;
    private updateStageMetrics;
    private buildPipelineResult;
    private generateRecommendations;
    private updateContextWithResults;
    private publishPipelineEvent;
    getPipelineExecution(executionId: string): Promise<PipelineExecution | undefined>;
    getTenantExecutions(tenantId: string): Promise<PipelineExecution[]>;
    getPipelineMetrics(): Promise<any>;
    private aggregateStageMetrics;
}
