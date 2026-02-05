import { RedisService } from '../common/redis/redis.service';
export interface PerformanceMetrics {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
    throughput: number;
    errorRate: number;
}
export interface PerformanceTestResult {
    testName: string;
    metrics: PerformanceMetrics;
    baseline?: PerformanceMetrics;
    deviation?: number;
    status: 'passed' | 'failed' | 'warning';
}
export declare class PerformanceTestingService {
    private readonly redisService;
    private readonly logger;
    constructor(redisService: RedisService);
    runPerformanceTest(testName: string, testFn: () => Promise<any>, iterations?: number): Promise<PerformanceTestResult>;
    private getBaseline;
    private saveBaseline;
    generatePerformanceReport(results: PerformanceTestResult[]): string;
}
