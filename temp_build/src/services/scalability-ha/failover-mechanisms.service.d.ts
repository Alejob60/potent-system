import { HttpService } from '@nestjs/axios';
export interface FailoverConfig {
    primaryService: {
        name: string;
        url: string;
        healthCheckPath: string;
        timeout: number;
    };
    backupServices: Array<{
        name: string;
        url: string;
        priority: number;
        healthCheckPath: string;
        timeout: number;
    }>;
    failoverThreshold: number;
    healthCheckInterval: number;
    recoveryCheckInterval: number;
    enableAutoRecovery: boolean;
}
export interface ServiceStatus {
    name: string;
    url: string;
    status: 'healthy' | 'unhealthy' | 'degraded';
    lastChecked: Date;
    responseTime: number;
    failureCount: number;
    lastFailureReason?: string;
}
export interface FailoverEvent {
    timestamp: Date;
    fromService: string;
    toService: string;
    reason: string;
    duration: number;
}
export declare class FailoverMechanismsService {
    private readonly httpService;
    private readonly logger;
    private config;
    private serviceStatus;
    private currentActiveService;
    private failoverEvents;
    private consecutiveFailures;
    private isFailoverEnabled;
    private lastFailover;
    constructor(httpService: HttpService);
    configure(config: FailoverConfig): void;
    private initializeServiceStatus;
    startFailoverMonitoring(): void;
    stopFailoverMonitoring(): void;
    private performHealthChecks;
    private checkServiceHealth;
    private triggerFailover;
    private checkForRecovery;
    private switchToPrimary;
    getCurrentActiveService(): string;
    getServiceStatus(serviceName: string): ServiceStatus | undefined;
    getAllServiceStatuses(): ServiceStatus[];
    getFailoverEvents(limit?: number): FailoverEvent[];
    manualFailover(reason: string): Promise<void>;
    forceSwitchToService(serviceName: string, reason: string): void;
    addBackupService(service: FailoverConfig['backupServices'][0]): void;
    removeBackupService(serviceName: string): void;
    updateServiceConfig(serviceName: string, updates: Partial<FailoverConfig['primaryService']> | Partial<FailoverConfig['backupServices'][0]>): void;
}
