import { EventEmitter2 } from '@nestjs/event-emitter';
export interface AgentHealthStatus {
    agentId: string;
    agentName: string;
    status: 'healthy' | 'degraded' | 'unhealthy' | 'offline';
    lastPing: Date;
    responseTime: number;
    uptime: number;
    errorCount: number;
    lastError?: string;
    metrics: AgentMetrics;
}
export interface AgentMetrics {
    requestsProcessed: number;
    successRate: number;
    avgResponseTime: number;
    errorRate: number;
    lastHourRequests: number;
    memoryUsage: number;
    cpuUsage: number;
}
export interface SystemHealth {
    overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: Date;
    agents: AgentHealthStatus[];
    systemMetrics: SystemMetrics;
    alerts: HealthAlert[];
}
export interface SystemMetrics {
    totalRequests: number;
    avgResponseTime: number;
    errorRate: number;
    activeConnections: number;
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
}
export interface HealthAlert {
    id: string;
    severity: 'info' | 'warning' | 'critical';
    message: string;
    agentId?: string;
    timestamp: Date;
    resolved: boolean;
}
export declare class HeartbeatMonitoringService {
    private readonly eventEmitter;
    private readonly logger;
    private readonly agents;
    private readonly alerts;
    private readonly HEALTH_CHECK_INTERVAL;
    private readonly ALERT_CLEANUP_INTERVAL;
    private monitoringInterval;
    constructor(eventEmitter: EventEmitter2);
    private initializeMonitoring;
    private registerEventListeners;
    processHeartbeat(agentId: string, heartbeatData: any): Promise<void>;
    processAgentError(agentId: string, error: Error): Promise<void>;
    private processPipelineEvent;
    private determineAgentStatus;
    private updateAgentMetrics;
    private calculateAverageResponseTime;
    private performHealthChecks;
    private evaluateAndGenerateAlerts;
    private createAlert;
    resolveAlert(alertId: string): Promise<boolean>;
    private cleanupResolvedAlerts;
    getSystemHealth(): Promise<SystemHealth>;
    private calculateOverallSystemStatus;
    private calculateSystemMetrics;
    private getActiveAlerts;
    getAgentHistory(agentId: string, hours?: number): Promise<any>;
    getAlertStats(): Promise<any>;
    shutdown(): Promise<void>;
}
