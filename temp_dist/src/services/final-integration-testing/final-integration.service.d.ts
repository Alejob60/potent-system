import { HttpService } from '@nestjs/axios';
export interface IntegrationConfig {
    services: Array<{
        name: string;
        url: string;
        expectedStatus: number;
        timeout: number;
    }>;
    integrationTimeout: number;
    retryAttempts: number;
    retryDelay: number;
}
export interface IntegrationResult {
    service: string;
    status: 'success' | 'failure';
    message: string;
    timestamp: Date;
    responseTime: number;
    details?: any;
}
export interface SystemIntegrationReport {
    overallStatus: 'success' | 'partial' | 'failure';
    totalServices: number;
    successfulServices: number;
    failedServices: number;
    results: IntegrationResult[];
    timestamp: Date;
    duration: number;
}
export declare class FinalIntegrationService {
    private readonly httpService;
    private readonly logger;
    private config;
    constructor(httpService: HttpService);
    configure(config: IntegrationConfig): void;
    executeSystemIntegration(): Promise<SystemIntegrationReport>;
    private testService;
    validateIntegration(report: SystemIntegrationReport): boolean;
    getConfiguration(): IntegrationConfig;
    updateConfiguration(config: Partial<IntegrationConfig>): void;
    addService(service: IntegrationConfig['services'][0]): void;
    removeService(serviceName: string): void;
}
