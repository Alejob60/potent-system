import { LoadBalancingService } from './load-balancing.service';
import { HealthMonitoringService } from './health-monitoring.service';
import { AutoScalingService } from './auto-scaling.service';
import { CachingStrategyService } from './caching-strategy.service';
import { DatabaseOptimizationService } from './database-optimization.service';
import { FailoverMechanismsService } from './failover-mechanisms.service';
import { PerformanceMonitoringService } from './performance-monitoring.service';
export declare class ScalabilityHaController {
    private readonly loadBalancingService;
    private readonly healthMonitoringService;
    private readonly autoScalingService;
    private readonly cachingStrategyService;
    private readonly databaseOptimizationService;
    private readonly failoverMechanismsService;
    private readonly performanceMonitoringService;
    private readonly logger;
    constructor(loadBalancingService: LoadBalancingService, healthMonitoringService: HealthMonitoringService, autoScalingService: AutoScalingService, cachingStrategyService: CachingStrategyService, databaseOptimizationService: DatabaseOptimizationService, failoverMechanismsService: FailoverMechanismsService, performanceMonitoringService: PerformanceMonitoringService);
    configureLoadBalancer(body: any): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    getNextServer(): Promise<{
        success: boolean;
        data: string | null;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getServerHealth(): Promise<{
        success: boolean;
        data: import("./load-balancing.service").ServerHealth[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    configureHealthMonitoring(body: any): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    getHealthStatus(): Promise<{
        success: boolean;
        data: import("./health-monitoring.service").ServiceHealth[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getHealthAlerts(limit?: string): Promise<{
        success: boolean;
        data: import("./health-monitoring.service").HealthAlert[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    configureAutoScaling(body: any): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    getCurrentReplicas(): Promise<{
        success: boolean;
        data: number;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getScalingEvents(limit?: string): Promise<{
        success: boolean;
        data: import("./auto-scaling.service").ScalingEvent[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    configureCaching(body: any): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    setCacheValue(body: any): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    getCacheValue(key: string): Promise<{
        success: boolean;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getCacheStats(): Promise<{
        success: boolean;
        data: import("./caching-strategy.service").CacheStats;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    configureDatabaseOptimization(body: any): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    getDatabaseStats(): Promise<{
        success: boolean;
        data: import("./database-optimization.service").DatabaseStats;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getSlowQueries(limit?: string): Promise<{
        success: boolean;
        data: import("./database-optimization.service").QueryPerformance[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    configureFailover(body: any): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    getActiveService(): Promise<{
        success: boolean;
        data: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getServiceStatus(): Promise<{
        success: boolean;
        data: import("./failover-mechanisms.service").ServiceStatus[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getFailoverEvents(limit?: string): Promise<{
        success: boolean;
        data: import("./failover-mechanisms.service").FailoverEvent[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    configurePerformanceMonitoring(body: any): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    getSystemMetrics(limit?: string): Promise<{
        success: boolean;
        data: import("./performance-monitoring.service").SystemMetrics[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getApplicationMetrics(limit?: string): Promise<{
        success: boolean;
        data: import("./performance-monitoring.service").ApplicationMetrics[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getPerformanceAlerts(limit?: string, includeResolved?: string): Promise<{
        success: boolean;
        data: import("./performance-monitoring.service").PerformanceAlert[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getPerformanceSummary(): Promise<{
        success: boolean;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
}
