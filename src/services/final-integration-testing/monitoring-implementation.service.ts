import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface MonitoringConfig {
  metrics: Array<{
    name: string;
    description: string;
    type: 'counter' | 'gauge' | 'histogram' | 'summary';
    endpoint: string;
    interval: number; // in seconds
    aggregation: 'avg' | 'sum' | 'min' | 'max' | 'count';
  }>;
  alerts: Array<{
    name: string;
    description: string;
    metric: string;
    condition: {
      operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
      threshold: number;
      duration: number; // in seconds
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
    refreshInterval: number; // in seconds
  }>;
  monitoringMetrics: {
    maxAlertLatency: number; // in seconds
    minAlertAccuracy: number; // percentage
    maxDashboardLoadTime: number; // in seconds
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

@Injectable()
export class MonitoringImplementationService {
  private readonly logger = new Logger(MonitoringImplementationService.name);
  private config: MonitoringConfig;
  private metrics: Map<string, MetricDataPoint[]> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private dashboards: Map<string, DashboardData> = new Map();

  constructor(private readonly httpService: HttpService) {}

  /**
   * Configure the monitoring service
   * @param config Monitoring configuration
   */
  configure(config: MonitoringConfig): void {
    this.config = config;
    this.logger.log(`Monitoring service configured with ${config.metrics.length} metrics, ${config.alerts.length} alerts, and ${config.dashboards.length} dashboards`);
  }

  /**
   * Start monitoring
   * @returns Promise that resolves when monitoring is started
   */
  async startMonitoring(): Promise<void> {
    this.logger.log('Starting monitoring service');

    // Start collecting metrics
    for (const metric of this.config.metrics) {
      this.startMetricCollection(metric);
    }

    // Start checking alerts
    setInterval(() => {
      this.checkAlerts();
    }, 10000); // Check alerts every 10 seconds

    // Start refreshing dashboards
    for (const dashboard of this.config.dashboards) {
      this.refreshDashboard(dashboard.name);
      setInterval(() => {
        this.refreshDashboard(dashboard.name);
      }, dashboard.refreshInterval * 1000);
    }

    this.logger.log('Monitoring service started');
  }

  /**
   * Start metric collection
   * @param metric Metric configuration
   */
  private startMetricCollection(metric: MonitoringConfig['metrics'][0]): void {
    this.logger.log(`Starting metric collection for ${metric.name}`);

    // Collect metric at specified interval
    setInterval(async () => {
      try {
        const value = await this.collectMetric(metric);
        this.storeMetric(metric.name, value);
      } catch (error) {
        this.logger.error(`Failed to collect metric ${metric.name}: ${error.message}`);
      }
    }, metric.interval * 1000);
  }

  /**
   * Collect metric value
   * @param metric Metric configuration
   * @returns Metric value
   */
  private async collectMetric(metric: MonitoringConfig['metrics'][0]): Promise<number> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(metric.endpoint, {
          timeout: 5000,
        })
      );

      // Extract value based on metric type
      let value: number;
      
      switch (metric.type) {
        case 'counter':
          value = response.data.value || response.data.count || 0;
          break;
        case 'gauge':
          value = response.data.value || response.data.current || 0;
          break;
        case 'histogram':
          value = response.data.value || response.data.average || 0;
          break;
        case 'summary':
          value = response.data.value || response.data.quantile || 0;
          break;
        default:
          value = 0;
      }

      return value;
    } catch (error) {
      this.logger.error(`Failed to collect metric from ${metric.endpoint}: ${error.message}`);
      return 0;
    }
  }

  /**
   * Store metric value
   * @param name Metric name
   * @param value Metric value
   */
  private storeMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const dataPoints = this.metrics.get(name) || [];
    dataPoints.push({
      name,
      value,
      timestamp: new Date(),
    });

    // Keep only the last 1000 data points to prevent memory issues
    if (dataPoints.length > 1000) {
      dataPoints.shift();
    }

    this.metrics.set(name, dataPoints);
  }

  /**
   * Check alerts
   */
  private async checkAlerts(): Promise<void> {
    for (const alertConfig of this.config.alerts) {
      try {
        const currentValue = await this.getCurrentMetricValue(alertConfig.metric);
        
        // Check if alert condition is met
        const conditionMet = this.evaluateCondition(
          currentValue,
          alertConfig.condition.operator,
          alertConfig.condition.threshold
        );

        if (conditionMet) {
          // Check if alert is already active
          const existingAlert = Array.from(this.alerts.values()).find(
            alert => alert.name === alertConfig.name && alert.status === 'triggered'
          );

          if (!existingAlert) {
            // Create new alert
            const alert: Alert = {
              id: this.generateAlertId(),
              name: alertConfig.name,
              description: alertConfig.description,
              metric: alertConfig.metric,
              currentValue,
              threshold: alertConfig.condition.threshold,
              severity: alertConfig.severity,
              triggeredAt: new Date(),
              status: 'triggered',
              notificationsSent: false,
            };

            this.alerts.set(alert.id, alert);
            this.logger.warn(`Alert triggered: ${alert.name} (${alert.severity})`);

            // Send notifications
            await this.sendNotifications(alertConfig, alert);
            alert.notificationsSent = true;
            this.alerts.set(alert.id, alert);
          }
        } else {
          // Check if there's an existing alert that should be resolved
          const existingAlert = Array.from(this.alerts.values()).find(
            alert => alert.name === alertConfig.name && alert.status === 'triggered'
          );

          if (existingAlert) {
            // Resolve alert
            existingAlert.resolvedAt = new Date();
            existingAlert.status = 'resolved';
            this.alerts.set(existingAlert.id, existingAlert);
            this.logger.log(`Alert resolved: ${existingAlert.name}`);
          }
        }
      } catch (error) {
        this.logger.error(`Failed to check alert ${alertConfig.name}: ${error.message}`);
      }
    }
  }

  /**
   * Get current metric value
   * @param metricName Metric name
   * @returns Current metric value
   */
  private async getCurrentMetricValue(metricName: string): Promise<number> {
    const dataPoints = this.metrics.get(metricName) || [];
    
    if (dataPoints.length === 0) {
      // If we don't have data yet, try to collect it
      const metricConfig = this.config.metrics.find(m => m.name === metricName);
      if (metricConfig) {
        return await this.collectMetric(metricConfig);
      }
      return 0;
    }

    // Return the latest value
    return dataPoints[dataPoints.length - 1].value;
  }

  /**
   * Evaluate alert condition
   * @param value Current value
   * @param operator Comparison operator
   * @param threshold Threshold value
   * @returns Boolean indicating if condition is met
   */
  private evaluateCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case '>':
        return value > threshold;
      case '<':
        return value < threshold;
      case '>=':
        return value >= threshold;
      case '<=':
        return value <= threshold;
      case '==':
        return value === threshold;
      case '!=':
        return value !== threshold;
      default:
        return false;
    }
  }

  /**
   * Send notifications for alert
   * @param alertConfig Alert configuration
   * @param alert Alert
   */
  private async sendNotifications(
    alertConfig: MonitoringConfig['alerts'][0],
    alert: Alert
  ): Promise<void> {
    for (const notification of alertConfig.notifications) {
      try {
        switch (notification.channel) {
          case 'email':
            await this.sendEmailNotification(notification.target, alert);
            break;
          case 'slack':
            await this.sendSlackNotification(notification.target, alert);
            break;
          case 'webhook':
            await this.sendWebhookNotification(notification.target, alert);
            break;
          case 'sms':
            await this.sendSmsNotification(notification.target, alert);
            break;
        }
      } catch (error) {
        this.logger.error(`Failed to send ${notification.channel} notification: ${error.message}`);
      }
    }
  }

  /**
   * Send email notification
   * @param target Email address
   * @param alert Alert
   */
  private async sendEmailNotification(target: string, alert: Alert): Promise<void> {
    // In a real implementation, this would send an actual email
    this.logger.log(`Sending email notification to ${target} for alert ${alert.name}`);
  }

  /**
   * Send Slack notification
   * @param target Slack webhook URL
   * @param alert Alert
   */
  private async sendSlackNotification(target: string, alert: Alert): Promise<void> {
    // In a real implementation, this would send a Slack message
    this.logger.log(`Sending Slack notification to ${target} for alert ${alert.name}`);
  }

  /**
   * Send webhook notification
   * @param target Webhook URL
   * @param alert Alert
   */
  private async sendWebhookNotification(target: string, alert: Alert): Promise<void> {
    // In a real implementation, this would send a webhook request
    this.logger.log(`Sending webhook notification to ${target} for alert ${alert.name}`);
  }

  /**
   * Send SMS notification
   * @param target Phone number
   * @param alert Alert
   */
  private async sendSmsNotification(target: string, alert: Alert): Promise<void> {
    // In a real implementation, this would send an SMS
    this.logger.log(`Sending SMS notification to ${target} for alert ${alert.name}`);
  }

  /**
   * Refresh dashboard
   * @param dashboardName Dashboard name
   */
  private async refreshDashboard(dashboardName: string): Promise<void> {
    const dashboardConfig = this.config.dashboards.find(d => d.name === dashboardName);
    if (!dashboardConfig) {
      this.logger.warn(`Dashboard ${dashboardName} not found`);
      return;
    }

    const startTime = Date.now();
    this.logger.log(`Refreshing dashboard ${dashboardName}`);

    try {
      const metricsData: DashboardData['metrics'] = [];

      // Collect data for each metric in the dashboard
      for (const metricName of dashboardConfig.metrics) {
        const dataPoints = this.metrics.get(metricName) || [];
        
        // Calculate aggregated value
        let aggregatedValue = 0;
        if (dataPoints.length > 0) {
          const metricConfig = this.config.metrics.find(m => m.name === metricName);
          if (metricConfig) {
            switch (metricConfig.aggregation) {
              case 'avg':
                aggregatedValue = dataPoints.reduce((sum, point) => sum + point.value, 0) / dataPoints.length;
                break;
              case 'sum':
                aggregatedValue = dataPoints.reduce((sum, point) => sum + point.value, 0);
                break;
              case 'min':
                aggregatedValue = Math.min(...dataPoints.map(point => point.value));
                break;
              case 'max':
                aggregatedValue = Math.max(...dataPoints.map(point => point.value));
                break;
              case 'count':
                aggregatedValue = dataPoints.length;
                break;
            }
          }
        }

        metricsData.push({
          name: metricName,
          data: dataPoints,
          aggregatedValue,
        });
      }

      const loadTime = Date.now() - startTime;
      const dashboardData: DashboardData = {
        name: dashboardName,
        metrics: metricsData,
        lastUpdated: new Date(),
        loadTime,
      };

      this.dashboards.set(dashboardName, dashboardData);
      this.logger.log(`Dashboard ${dashboardName} refreshed successfully in ${loadTime}ms`);
    } catch (error) {
      this.logger.error(`Failed to refresh dashboard ${dashboardName}: ${error.message}`);
    }
  }

  /**
   * Generate alert ID
   * @returns Alert ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get monitoring report
   * @returns Monitoring report
   */
  async getMonitoringReport(): Promise<MonitoringReport> {
    const startTime = Date.now();
    this.logger.log('Generating monitoring report');

    const totalMetrics = this.metrics.size;
    const activeAlerts = Array.from(this.alerts.values()).filter(alert => alert.status === 'triggered').length;
    const triggeredAlerts = this.alerts.size;
    const availableDashboards = this.dashboards.size;
    
    // Get recent alerts (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAlerts = Array.from(this.alerts.values()).filter(
      alert => alert.triggeredAt >= twentyFourHoursAgo
    );

    // Get dashboard performance data
    const dashboardPerformance: MonitoringReport['summary']['dashboardPerformance'] = [];
    this.dashboards.forEach((dashboard, name) => {
      dashboardPerformance.push({
        name,
        loadTime: dashboard.loadTime,
        status: dashboard.loadTime <= this.config.monitoringMetrics.maxDashboardLoadTime * 1000 
          ? 'success' 
          : 'failure',
      });
    });

    const duration = Date.now() - startTime;
    
    // Determine overall status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    // Check if any critical alerts are active
    const criticalAlerts = Array.from(this.alerts.values()).filter(
      alert => alert.status === 'triggered' && alert.severity === 'critical'
    );
    
    if (criticalAlerts.length > 0) {
      overallStatus = 'unhealthy';
    } else if (activeAlerts > 0) {
      overallStatus = 'degraded';
    }

    const report: MonitoringReport = {
      overallStatus,
      metricsCollected: totalMetrics,
      alertsActive: activeAlerts,
      alertsTriggered: triggeredAlerts,
      dashboardsAvailable: availableDashboards,
      dashboardsLoaded: dashboardPerformance.filter(d => d.status === 'success').length,
      summary: {
        totalMetrics,
        activeAlerts: Array.from(this.alerts.values()).filter(alert => alert.status === 'triggered'),
        recentAlerts,
        dashboardPerformance,
      },
      timestamp: new Date(),
      duration,
    };

    this.logger.log(`Monitoring report generated: ${overallStatus}`);
    return report;
  }

  /**
   * Get metric data
   * @param metricName Metric name
   * @param limit Number of data points to return
   * @returns Metric data points
   */
  getMetricData(metricName: string, limit: number = 100): MetricDataPoint[] {
    const dataPoints = this.metrics.get(metricName) || [];
    return dataPoints.slice(-limit);
  }

  /**
   * Get alert history
   * @param limit Number of alerts to return
   * @returns Alerts
   */
  getAlertHistory(limit: number = 50): Alert[] {
    const alerts = Array.from(this.alerts.values());
    return alerts.slice(-limit);
  }

  /**
   * Get dashboard data
   * @param dashboardName Dashboard name
   * @returns Dashboard data
   */
  getDashboardData(dashboardName: string): DashboardData | undefined {
    return this.dashboards.get(dashboardName);
  }

  /**
   * Acknowledge alert
   * @param alertId Alert ID
   */
  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert && alert.status === 'triggered') {
      alert.status = 'acknowledged';
      this.alerts.set(alertId, alert);
      this.logger.log(`Alert ${alert.name} acknowledged`);
    }
  }

  /**
   * Resolve alert
   * @param alertId Alert ID
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert && alert.status === 'triggered') {
      alert.status = 'resolved';
      alert.resolvedAt = new Date();
      this.alerts.set(alertId, alert);
      this.logger.log(`Alert ${alert.name} resolved`);
    }
  }

  /**
   * Get monitoring configuration
   * @returns Monitoring configuration
   */
  getConfiguration(): MonitoringConfig {
    return { ...this.config };
  }

  /**
   * Update monitoring configuration
   * @param config New configuration
   */
  updateConfiguration(config: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.log('Monitoring configuration updated');
  }

  /**
   * Add metric
   * @param metric Metric configuration
   */
  addMetric(metric: MonitoringConfig['metrics'][0]): void {
    this.config.metrics.push(metric);
    this.startMetricCollection(metric);
    this.logger.log(`Added metric ${metric.name}`);
  }

  /**
   * Add alert
   * @param alert Alert configuration
   */
  addAlert(alert: MonitoringConfig['alerts'][0]): void {
    this.config.alerts.push(alert);
    this.logger.log(`Added alert ${alert.name}`);
  }

  /**
   * Add dashboard
   * @param dashboard Dashboard configuration
   */
  addDashboard(dashboard: MonitoringConfig['dashboards'][0]): void {
    this.config.dashboards.push(dashboard);
    this.refreshDashboard(dashboard.name);
    setInterval(() => {
      this.refreshDashboard(dashboard.name);
    }, dashboard.refreshInterval * 1000);
    this.logger.log(`Added dashboard ${dashboard.name}`);
  }
}