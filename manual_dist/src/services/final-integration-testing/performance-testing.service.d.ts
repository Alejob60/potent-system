import { HttpService } from '@nestjs/axios';
export interface PerformanceTestConfig {
    loadTests: Array<{
        name: string;
        description: string;
        endpoint: string;
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
        payload?: any;
        concurrency: number;
        duration: number;
        rampUpTime: number;
    }>;
    stressTests: Array<{
        name: string;
        description: string;
        endpoint: string;
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
        payload?: any;
        maxConcurrency: number;
        rampUpTime: number;
    }>;
    scalabilityTests: Array<{
        name: string;
        description: string;
        endpoint: string;
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
        payload?: any;
        concurrencyLevels: number[];
        duration: number;
    }>;
    metrics: {
        responseTimeThreshold: number;
        errorRateThreshold: number;
        throughputThreshold: number;
    };
}
export interface PerformanceMetrics {
    responseTime: {
        avg: number;
        min: number;
        max: number;
        p50: number;
        p90: number;
        p95: number;
        p99: number;
    };
    throughput: {
        requestsPerSecond: number;
        totalRequests: number;
        successfulRequests: number;
        failedRequests: number;
        errorRate: number;
    };
    concurrency: number;
    timestamp: Date;
}
export interface LoadTestResult {
    testName: string;
    status: 'passed' | 'failed';
    metrics: PerformanceMetrics;
    message: string;
    timestamp: Date;
    duration: number;
}
export interface StressTestResult {
    testName: string;
    status: 'passed' | 'failed';
    metrics: PerformanceMetrics;
    maxConcurrencyReached: number;
    message: string;
    timestamp: Date;
    duration: number;
}
export interface ScalabilityTestResult {
    testName: string;
    status: 'passed' | 'failed' | 'partial';
    concurrencyResults: Array<{
        concurrency: number;
        metrics: PerformanceMetrics;
        status: 'passed' | 'failed';
    }>;
    message: string;
    timestamp: Date;
    duration: number;
}
export interface PerformanceTestingReport {
    overallStatus: 'passed' | 'failed' | 'partial';
    loadTestResults: LoadTestResult[];
    stressTestResults: StressTestResult[];
    scalabilityTestResults: ScalabilityTestResult[];
    timestamp: Date;
    duration: number;
}
export declare class PerformanceTestingService {
    private readonly httpService;
    private readonly logger;
    private config;
    constructor(httpService: HttpService);
    configure(config: PerformanceTestConfig): void;
    executePerformanceTests(): Promise<PerformanceTestingReport>;
    private executeLoadTest;
    private executeStressTest;
    private executeScalabilityTest;
    private calculateMetrics;
    private percentile;
    private validateMetrics;
    private determineOverallStatus;
    getConfiguration(): PerformanceTestConfig;
    updateConfiguration(config: Partial<PerformanceTestConfig>): void;
    addLoadTest(test: PerformanceTestConfig['loadTests'][0]): void;
    addStressTest(test: PerformanceTestConfig['stressTests'][0]): void;
    addScalabilityTest(test: PerformanceTestConfig['scalabilityTests'][0]): void;
}
