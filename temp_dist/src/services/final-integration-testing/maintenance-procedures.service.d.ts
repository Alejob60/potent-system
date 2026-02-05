import { HttpService } from '@nestjs/axios';
export interface MaintenanceConfig {
    routines: Array<{
        name: string;
        description: string;
        type: 'backup' | 'cleanup' | 'optimization' | 'update' | 'diagnostic';
        schedule: {
            frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
            time: string;
            timezone: string;
        };
        execution: {
            script: string;
            timeout: number;
            retryAttempts: number;
            retryDelay: number;
        };
        notifications: {
            onSuccess: boolean;
            onFailure: boolean;
            channels: Array<{
                type: 'email' | 'slack' | 'webhook' | 'sms';
                target: string;
            }>;
        };
    }>;
    backup: {
        retention: {
            daily: number;
            weekly: number;
            monthly: number;
        };
        storage: {
            primary: string;
            secondary: string;
            encryption: boolean;
        };
    };
    monitoring: {
        healthCheckInterval: number;
        alertThresholds: {
            cpu: number;
            memory: number;
            disk: number;
            responseTime: number;
        };
    };
    maintenanceMetrics: {
        maxRoutineDuration: number;
        minSuccessRate: number;
        maxConsecutiveFailures: number;
    };
}
export interface MaintenanceRoutineExecution {
    id: string;
    routineName: string;
    status: 'scheduled' | 'running' | 'completed' | 'failed' | 'cancelled';
    startTime: Date;
    endTime?: Date;
    duration?: number;
    output?: string;
    error?: string;
    retryCount: number;
}
export interface BackupInfo {
    id: string;
    timestamp: Date;
    location: string;
    size: number;
    status: 'created' | 'verified' | 'failed' | 'expired';
    encrypted: boolean;
    checksum?: string;
}
export interface SystemHealth {
    timestamp: Date;
    metrics: {
        cpu: number;
        memory: number;
        disk: number;
        responseTime: number;
    };
    status: 'healthy' | 'degraded' | 'unhealthy';
    issues: string[];
}
export interface MaintenanceReport {
    overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    routinesExecuted: number;
    routinesSuccessful: number;
    routinesFailed: number;
    backupsCreated: number;
    backupsVerified: number;
    systemHealth: SystemHealth;
    summary: {
        recentExecutions: MaintenanceRoutineExecution[];
        failedRoutines: MaintenanceRoutineExecution[];
        backupHistory: BackupInfo[];
        healthHistory: SystemHealth[];
    };
    timestamp: Date;
    duration: number;
}
export declare class MaintenanceProceduresService {
    private readonly httpService;
    private readonly logger;
    private config;
    private executions;
    private backups;
    private healthHistory;
    constructor(httpService: HttpService);
    configure(config: MaintenanceConfig): void;
    private startScheduledRoutines;
    private parseScheduleTime;
    executeRoutine(routineName: string): Promise<MaintenanceRoutineExecution>;
    private runRoutineScript;
    private handleBackupCompletion;
    private verifyBackup;
    private performHealthCheck;
    private collectSystemMetrics;
    private sendNotifications;
    private sendEmailNotification;
    private sendSlackNotification;
    private sendWebhookNotification;
    private sendSmsNotification;
    private generateExecutionId;
    getMaintenanceReport(): Promise<MaintenanceReport>;
    getRoutineExecutionHistory(routineName: string, limit?: number): MaintenanceRoutineExecution[];
    getBackupHistory(limit?: number): BackupInfo[];
    getHealthHistory(limit?: number): SystemHealth[];
    cancelRoutineExecution(executionId: string): void;
    getConfiguration(): MaintenanceConfig;
    updateConfiguration(config: Partial<MaintenanceConfig>): void;
    addRoutine(routine: MaintenanceConfig['routines'][0]): void;
    removeRoutine(routineName: string): void;
}
