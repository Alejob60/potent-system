import { PerformanceOptimizationService } from './performance-optimization.service';
export declare class PerformanceOptimizationController {
    private readonly performanceOptimizationService;
    private readonly logger;
    constructor(performanceOptimizationService: PerformanceOptimizationService);
    getStatus(): Promise<{
        success: boolean;
        data: {
            poolStatus: any;
            timestamp: string;
        };
        error?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    analyzeQuery(body: {
        tableName: string;
        columns: string[];
    }): Promise<{
        success: boolean;
        data: any;
        error?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    executeOptimizedQuery(body: {
        query: string;
        params?: any[];
        cacheKey?: string;
    }): Promise<{
        success: boolean;
        data: any[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    batchRedisOperations(body: {
        operations: Array<{
            key: string;
            value: string;
            ttl?: number;
        }>;
    }): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
}
