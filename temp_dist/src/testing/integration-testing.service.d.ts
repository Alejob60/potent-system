import { ModuleRef } from '@nestjs/core';
export interface IntegrationTestResult {
    testName: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    errorMessage?: string;
    details?: any;
    description?: string;
}
export declare class IntegrationTestingService {
    private readonly moduleRef;
    private readonly logger;
    constructor(moduleRef: ModuleRef);
    runIntegrationTests(): Promise<IntegrationTestResult[]>;
    private testDatabaseConnectivity;
    private testRedisConnectivity;
    private testMongoDBConnectivity;
    private testExternalAPIConnectivity;
    private testAgentCommunication;
    private testWorkflowExecution;
    private testTenantContextPropagation;
    private testSecurityMiddleware;
    generateIntegrationReport(results: IntegrationTestResult[]): string;
}
