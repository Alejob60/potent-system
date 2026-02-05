import { HttpService } from '@nestjs/axios';
export interface MonitoringConfig {
    metrics: Array<{
        name: string;
        description: string;
        type: 'counter' | 'gauge' | 'histogram' | 'summary';
        endpoint: string;
        interval: number;
        aggregation: 'avg' | 'sum' | 'min' | 'max' | 'count';
    }>;
    alerts: Array<{
        name: string;
        description: string;
        metric: string;
        condition: {
            operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
            threshold: number;
            duration: number;
        };
        severity: 'info' | 'warning' | 'error' | 'critical';
        notifications: Array<{
            channel: 'email' | 'slack' | 'webhook' | 'sms';
            target: string;
        }>;
    }>;
    dashboards: Array<{
        name: string;
        description: string;
        metrics: string[];
        refreshInterval: number;
    }>;
    monitoringMetrics: {
        maxAlertLatency: number;
        minAlertAccuracy: number;
        maxDashboardLoadTime: number;
    };
}
export interface MetricDataPoint {
    name: string;
    value: number;
    timestamp: Date;
    labels?: Record<string, string>;
}
export interface Alert {
    id: string;
    name: string;
    description: string;
    metric: string;
    currentValue: number;
    threshold: number;
    severity: 'info' | 'warning' | 'error' | 'critical';
    triggeredAt: Date;
    resolvedAt?: Date;
    status: 'triggered' | 'resolved' | 'acknowledged';
    notificationsSent: boolean;
}
export interface DashboardData {
    name: string;
    metrics: Array<{
        name: string;
        data: MetricDataPoint[];
        aggregatedValue: number;
    }>;
    lastUpdated: Date;
    loadTime: number;
}
export interface MonitoringReport {
    overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    metricsCollected: number;
    alertsActive: number;
    alertsTriggered: number;
    dashboardsAvailable: number;
    dashboardsLoaded: number;
    summary: {
        totalMetrics: number;
        activeAlerts: Alert[];
        recentAlerts: Alert[];
        dashboardPerformance: Array<{
            name: string;
            loadTime: number;
            status: 'success' | 'failure';
        }>;
    };
    timestamp: Date;
    duration: number;
}
export declare class MonitoringImplementationService {
    private readonly httpService;
    private readonly logger;
    private config;
    private metrics;
    private alerts;
    private dashboards;
    constructor(httpService: HttpService);
    configure(config: MonitoringConfig): void;
    startMonitoring(): Promise<void>;
    private startMetricCollection;
    private collectMetric;
    private storeMetric;
    private checkAlerts;
    private getCurrentMetricValue;
    private evaluateCondition;
    private sendNotifications;
    private sendEmailNotification;
    private sendSlackNotification;
    private sendWebhookNotification;
    private sendSmsNotification;
    private refreshDashboard;
    private generateAlertId;
    getMonitoringReport(): Promise<MonitoringReport>;
    getMetricData(metricName: string, limit?: number): MetricDataPoint[];
    getAlertHistory(limit?: number): Alert[];
    getDashboardData(dashboardName: string): DashboardData | undefined;
    acknowledgeAlert(alertId: string): void;
    resolveAlert(alertId: string): void;
    getConfiguration(): MonitoringConfig;
    updateConfiguration(config: Partial<MonitoringConfig>): void;
    addMetric(metric: MonitoringConfig['metrics'][0]): void;
    addAlert(alert: MonitoringConfig['alerts'][0]): void;
    addDashboard(dashboard: MonitoringConfig['dashboards'][0]): void;
}
