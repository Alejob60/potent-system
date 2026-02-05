import { HttpService } from '@nestjs/axios';
export interface PerformanceMonitoringConfig {
    metricsCollection: {
        interval: number;
        retentionPeriod: number;
    };
    alerting: {
        enableAlerts: boolean;
        thresholds: {
            cpuUtilization: number;
            memoryUtilization: number;
            responseTime: number;
            errorRate: number;
            throughput: number;
        };
        notificationChannels: string[];
    };
    sampling: {
        requestSamplingRate: number;
        traceSamplingRate: number;
    };
}
export interface SystemMetrics {
    timestamp: Date;
    cpu: {
        utilization: number;
        loadAverage: number;
        cores: number;
    };
    memory: {
        used: number;
        total: number;
        utilization: number;
    };
    disk: {
        used: number;
        total: number;
        utilization: number;
    };
    network: {
        in: number;
        out: number;
    };
}
export interface ApplicationMetrics {
    timestamp: Date;
    requests: {
        total: number;
        successful: number;
        failed: number;
        errorRate: number;
    };
    responseTimes: {
        avg: number;
        p50: number;
        p90: number;
        p95: number;
        p99: number;
    };
    throughput: {
        requestsPerSecond: number;
        currentRPS: number;
    };
    endpoints: Map<string, EndpointMetrics>;
}
export interface EndpointMetrics {
    path: string;
    method: string;
    requests: number;
    errors: number;
    avgResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
}
export interface PerformanceAlert {
    id: string;
    level: 'info' | 'warning' | 'critical';
    metric: string;
    currentValue: number;
    threshold: number;
    message: string;
    timestamp: Date;
    resolved: boolean;
    resolvedAt?: Date;
}
export declare class PerformanceMonitoringService {
    private readonly httpService;
    private readonly logger;
    private config;
    private systemMetrics;
    private applicationMetrics;
    private alerts;
    private isMonitoring;
    private sampledRequests;
    private endpointMetrics;
    constructor(httpService: HttpService);
    configure(config: PerformanceMonitoringConfig): void;
    startMonitoring(): void;
    stopMonitoring(): void;
    private collectMetrics;
    private collectSystemMetrics;
    private collectApplicationMetrics;
    private checkForAlerts;
    private createAlert;
    private sendNotifications;
    resolveAlert(alertId: string): void;
    getSystemMetrics(limit?: number): SystemMetrics[];
    getApplicationMetrics(limit?: number): ApplicationMetrics[];
    getAlerts(limit?: number, includeResolved?: boolean): PerformanceAlert[];
    getCriticalAlerts(): PerformanceAlert[];
    private cleanupOldMetrics;
    recordEndpointMetrics(path: string, method: string, responseTime: number, success: boolean): void;
    getEndpointMetrics(): Map<string, EndpointMetrics>;
    getPerformanceSummary(): any;
    sampleRequest(requestId: string, requestDetails: any): void;
    getSampledRequests(limit?: number): Map<string, any>;
}
