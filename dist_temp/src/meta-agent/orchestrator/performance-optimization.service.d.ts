import { RedisService } from '../../common/redis/redis.service';
import { StateManagementService } from '../../state/state-management.service';
export interface PerformanceMetrics {
    executionTime: number;
    memoryUsage: number;
    cpuUsage: number;
    throughput: number;
    errorRate: number;
    cacheHitRate: number;
    timestamp: Date;
}
export interface OptimizationRecommendation {
    id: string;
    type: 'scaling' | 'caching' | 'database' | 'network' | 'algorithm';
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    suggestedAction: string;
    estimatedImpact: string;
    implementationCost: 'low' | 'medium' | 'high';
    createdAt: Date;
}
export interface PerformanceBaseline {
    metric: string;
    baselineValue: number;
    threshold: number;
    alertOnExceed: boolean;
}
export declare class PerformanceOptimizationService {
    private readonly redisService;
    private readonly stateManager;
    private readonly logger;
    private readonly METRICS_PREFIX;
    private readonly RECOMMENDATIONS_PREFIX;
    private readonly BASELINE_PREFIX;
    private readonly CACHE_PREFIX;
    constructor(redisService: RedisService, stateManager: StateManagementService);
    recordMetrics(sessionId: string, metrics: PerformanceMetrics): Promise<boolean>;
    getMetrics(sessionId: string, limit?: number): Promise<PerformanceMetrics[]>;
    generateRecommendations(sessionId: string): Promise<OptimizationRecommendation[]>;
    cacheResult(key: string, value: any, ttl?: number): Promise<boolean>;
    getCachedResult(key: string): Promise<any | null>;
    isCached(key: string): Promise<boolean>;
    invalidateCache(key: string): Promise<boolean>;
    createBaseline(baseline: PerformanceBaseline): Promise<boolean>;
    getBaseline(metric: string): Promise<PerformanceBaseline | null>;
    checkBaselineDeviation(metric: string, value: number): Promise<boolean>;
    recordRecommendation(recommendation: OptimizationRecommendation): Promise<boolean>;
    getRecommendations(limit?: number): Promise<OptimizationRecommendation[]>;
    applyCachingStrategy(workflowId: string, stepId: string, cacheTTL: number): Promise<boolean>;
    optimizeDatabaseQuery(queryId: string, optimizationStrategy: string): Promise<boolean>;
    enableParallelProcessing(workflowId: string, stepIds: string[]): Promise<boolean>;
    getSystemMetrics(): Promise<PerformanceMetrics>;
}
