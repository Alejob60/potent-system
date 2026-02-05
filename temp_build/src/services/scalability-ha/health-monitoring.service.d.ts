import { HttpService } from '@nestjs/axios';
export interface HealthCheckConfig {
    services: Array<{
        name: string;
        url: string;
        critical: boolean;
        expectedStatusCode: number;
        timeout: number;
    }>;
    checkInterval: number;
    alertThreshold: number;
}
export interface ServiceHealth {
    name: string;
    url: string;
    status: 'healthy' | 'unhealthy' | 'degraded';
    lastChecked: Date;
    responseTime: number;
    statusCode: number;
    failureCount: number;
    lastFailureReason?: string;
}
export interface HealthAlert {
    service: string;
    level: 'warning' | 'critical';
    message: string;
    timestamp: Date;
}
export declare class HealthMonitoringService {
    private readonly httpService;
    private readonly logger;
    private config;
    private serviceHealth;
    private alerts;
    private isMonitoring;
    constructor(httpService: HttpService);
    configure(config: HealthCheckConfig): void;
    startMonitoring(): void;
    stopMonitoring(): void;
    private performHealthChecks;
    private createAlert;
    getHealthStatus(): ServiceHealth[];
    getServiceHealth(serviceName: string): ServiceHealth | undefined;
    getAlerts(limit?: number): HealthAlert[];
    getHealthSummary(): any;
    addService(service: HealthCheckConfig['services'][0]): void;
    removeService(serviceName: string): void;
}
