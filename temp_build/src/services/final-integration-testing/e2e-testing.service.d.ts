import { HttpService } from '@nestjs/axios';
export interface E2ETestConfig {
    testSuites: Array<{
        name: string;
        description: string;
        tests: Array<{
            name: string;
            description: string;
            endpoint: string;
            method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
            payload?: any;
            expectedStatus: number;
            timeout: number;
            validation?: (response: any) => boolean;
        }>;
    }>;
    parallelExecution: boolean;
    maxConcurrency: number;
    retryAttempts: number;
    retryDelay: number;
}
export interface E2ETestResult {
    testName: string;
    testSuite: string;
    status: 'passed' | 'failed' | 'skipped';
    message: string;
    timestamp: Date;
    responseTime: number;
    details?: any;
}
export interface E2ETestSuiteResult {
    suiteName: string;
    status: 'passed' | 'failed' | 'partial';
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    results: E2ETestResult[];
    timestamp: Date;
    duration: number;
}
export interface E2ETestingReport {
    overallStatus: 'passed' | 'failed' | 'partial';
    totalSuites: number;
    passedSuites: number;
    failedSuites: number;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    suiteResults: E2ETestSuiteResult[];
    timestamp: Date;
    duration: number;
}
export declare class E2ETestingService {
    private readonly httpService;
    private readonly logger;
    private config;
    constructor(httpService: HttpService);
    configure(config: E2ETestConfig): void;
    executeE2ETests(): Promise<E2ETestingReport>;
    private executeTestSuite;
    private executeTest;
    validateE2ETesting(report: E2ETestingReport): boolean;
    getConfiguration(): E2ETestConfig;
    updateConfiguration(config: Partial<E2ETestConfig>): void;
    addTestSuite(suite: E2ETestConfig['testSuites'][0]): void;
    removeTestSuite(suiteName: string): void;
}
