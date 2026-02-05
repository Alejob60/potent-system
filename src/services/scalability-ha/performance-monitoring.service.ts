import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface PerformanceMonitoringConfig {
  metricsCollection: {
    interval: number; // Time in seconds between metric collections
    retentionPeriod: number; // Time in hours to retain metrics
  };
  alerting: {
    enableAlerts: boolean;
    thresholds: {
      cpuUtilization: number; // Percentage
      memoryUtilization: number; // Percentage
      responseTime: number; // Milliseconds
      errorRate: number; // Percentage
      throughput: number; // Requests per second
    };
    notificationChannels: string[]; // e.g., ['email', 'slack', 'webhook']
  };
  sampling: {
    requestSamplingRate: number; // Percentage of requests to sample (0-100)
    traceSamplingRate: number; // Percentage of traces to sample (0-100)
  };
}

export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    utilization: number; // Percentage
    loadAverage: number;
    cores: number;
  };
  memory: {
    used: number; // MB
    total: number; // MB
    utilization: number; // Percentage
  };
  disk: {
    used: number; // MB
    total: number; // MB
    utilization: number; // Percentage
  };
  network: {
    in: number; // MB
    out: number; // MB
  };
}

export interface ApplicationMetrics {
  timestamp: Date;
  requests: {
    total: number;
    successful: number;
    failed: number;
    errorRate: number; // Percentage
  };
  responseTimes: {
    avg: number; // Milliseconds
    p50: number; // Milliseconds
    p90: number; // Milliseconds
    p95: number; // Milliseconds
    p99: number; // Milliseconds
  };
  throughput: {
    requestsPerSecond: number;
    currentRPS: number;
  };
  endpoints: Map<string, EndpointMetrics>;
}

export interface EndpointMetrics {
  path: string;
  method: string;
  requests: number;
  errors: number;
  avgResponseTime: number; // Milliseconds
  minResponseTime: number; // Milliseconds
  maxResponseTime: number; // Milliseconds
}

export interface PerformanceAlert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  metric: string;
  currentValue: number;
  threshold: number;
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

@Injectable()
export class PerformanceMonitoringService {
  private readonly logger = new Logger(PerformanceMonitoringService.name);
  private config: PerformanceMonitoringConfig;
  private systemMetrics: SystemMetrics[] = [];
  private applicationMetrics: ApplicationMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private isMonitoring: boolean = false;
  private sampledRequests: Map<string, any> = new Map();
  private endpointMetrics: Map<string, EndpointMetrics> = new Map();

  constructor(private readonly httpService: HttpService) {}

  /**
   * Configure performance monitoring
   * @param config Performance monitoring configuration
   */
  configure(config: PerformanceMonitoringConfig): void {
    this.config = config;
    this.logger.log('Performance monitoring configured');
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      this.logger.warn('Performance monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    this.logger.log('Starting performance monitoring');

    // Start periodic metric collection
    setInterval(async () => {
      if (this.isMonitoring) {
        await this.collectMetrics();
      }
    }, this.config.metricsCollection.interval * 1000);

    // Start cleanup of old metrics
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 60000); // Cleanup every minute
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    this.logger.log('Stopped performance monitoring');
  }

  /**
   * Collect system and application metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      // Collect system metrics
      const systemMetrics = await this.collectSystemMetrics();
      this.systemMetrics.push(systemMetrics);

      // Collect application metrics
      const applicationMetrics = await this.collectApplicationMetrics();
      this.applicationMetrics.push(applicationMetrics);

      // Check for alerts
      if (this.config.alerting.enableAlerts) {
        await this.checkForAlerts(systemMetrics, applicationMetrics);
      }

      this.logger.debug('Collected performance metrics');
    } catch (error) {
      this.logger.error(`Error collecting performance metrics: ${error.message}`);
    }
  }

  /**
   * Collect system metrics
   * @returns System metrics
   */
  private async collectSystemMetrics(): Promise<SystemMetrics> {
    // In a real implementation, this would collect actual system metrics
    // For now, we'll simulate with random values
    return {
      timestamp: new Date(),
      cpu: {
        utilization: Math.random() * 100,
        loadAverage: Math.random() * 4,
        cores: 4,
      },
      memory: {
        used: Math.random() * 8000,
        total: 8192,
        utilization: Math.random() * 100,
      },
      disk: {
        used: Math.random() * 50000,
        total: 100000,
        utilization: Math.random() * 100,
      },
      network: {
        in: Math.random() * 100,
        out: Math.random() * 100,
      },
    };
  }

  /**
   * Collect application metrics
   * @returns Application metrics
   */
  private async collectApplicationMetrics(): Promise<ApplicationMetrics> {
    // In a real implementation, this would collect actual application metrics
    // For now, we'll simulate with random values and use collected endpoint metrics
    const totalRequests = Array.from(this.endpointMetrics.values()).reduce((sum, e) => sum + e.requests, 0);
    const failedRequests = Array.from(this.endpointMetrics.values()).reduce((sum, e) => sum + e.errors, 0);
    const errorRate = totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0;

    // Calculate average response time across all endpoints
    const endpointCount = this.endpointMetrics.size;
    const totalResponseTime = Array.from(this.endpointMetrics.values()).reduce((sum, e) => sum + e.avgResponseTime, 0);
    const avgResponseTime = endpointCount > 0 ? totalResponseTime / endpointCount : 0;

    return {
      timestamp: new Date(),
      requests: {
        total: totalRequests,
        successful: totalRequests - failedRequests,
        failed: failedRequests,
        errorRate,
      },
      responseTimes: {
        avg: avgResponseTime,
        p50: avgResponseTime * 0.9,
        p90: avgResponseTime * 1.2,
        p95: avgResponseTime * 1.5,
        p99: avgResponseTime * 2.0,
      },
      throughput: {
        requestsPerSecond: totalRequests / this.config.metricsCollection.interval,
        currentRPS: totalRequests / this.config.metricsCollection.interval,
      },
      endpoints: new Map(this.endpointMetrics),
    };
  }

  /**
   * Check for performance alerts
   * @param systemMetrics Current system metrics
   * @param applicationMetrics Current application metrics
   */
  private async checkForAlerts(
    systemMetrics: SystemMetrics,
    applicationMetrics: ApplicationMetrics
  ): Promise<void> {
    const thresholds = this.config.alerting.thresholds;

    // Check CPU utilization
    if (systemMetrics.cpu.utilization > thresholds.cpuUtilization) {
      this.createAlert(
        'critical',
        'cpu.utilization',
        systemMetrics.cpu.utilization,
        thresholds.cpuUtilization,
        `CPU utilization is above threshold: ${systemMetrics.cpu.utilization.toFixed(2)}% > ${thresholds.cpuUtilization}%`
      );
    }

    // Check memory utilization
    if (systemMetrics.memory.utilization > thresholds.memoryUtilization) {
      this.createAlert(
        'critical',
        'memory.utilization',
        systemMetrics.memory.utilization,
        thresholds.memoryUtilization,
        `Memory utilization is above threshold: ${systemMetrics.memory.utilization.toFixed(2)}% > ${thresholds.memoryUtilization}%`
      );
    }

    // Check response time
    if (applicationMetrics.responseTimes.avg > thresholds.responseTime) {
      this.createAlert(
        'warning',
        'response.time',
        applicationMetrics.responseTimes.avg,
        thresholds.responseTime,
        `Average response time is above threshold: ${applicationMetrics.responseTimes.avg.toFixed(2)}ms > ${thresholds.responseTime}ms`
      );
    }

    // Check error rate
    if (applicationMetrics.requests.errorRate > thresholds.errorRate) {
      this.createAlert(
        'critical',
        'error.rate',
        applicationMetrics.requests.errorRate,
        thresholds.errorRate,
        `Error rate is above threshold: ${applicationMetrics.requests.errorRate.toFixed(2)}% > ${thresholds.errorRate}%`
      );
    }

    // Check throughput
    if (applicationMetrics.throughput.requestsPerSecond > thresholds.throughput) {
      this.createAlert(
        'info',
        'throughput',
        applicationMetrics.throughput.requestsPerSecond,
        thresholds.throughput,
        `Throughput is above threshold: ${applicationMetrics.throughput.requestsPerSecond.toFixed(2)} RPS > ${thresholds.throughput} RPS`
      );
    }
  }

  /**
   * Create performance alert
   * @param level Alert level
   * @param metric Metric name
   * @param currentValue Current value
   * @param threshold Threshold value
   * @param message Alert message
   */
  private createAlert(
    level: 'info' | 'warning' | 'critical',
    metric: string,
    currentValue: number,
    threshold: number,
    message: string
  ): void {
    const alert: PerformanceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      level,
      metric,
      currentValue,
      threshold,
      message,
      timestamp: new Date(),
      resolved: false,
    };

    this.alerts.push(alert);

    // Keep only last 1000 alerts
    if (this.alerts.length > 1000) {
      this.alerts.shift();
    }

    this.logger.log(`Performance alert created: ${level} - ${message}`);

    // Send notifications if enabled
    if (this.config.alerting.notificationChannels.length > 0) {
      this.sendNotifications(alert);
    }
  }

  /**
   * Send alert notifications
   * @param alert Performance alert
   */
  private async sendNotifications(alert: PerformanceAlert): Promise<void> {
    // In a real implementation, this would send notifications to configured channels
    // For now, we'll just log the notification
    this.logger.log(`Sending notification for alert ${alert.id} to channels: ${this.config.alerting.notificationChannels.join(', ')}`);
  }

  /**
   * Resolve alert
   * @param alertId Alert ID
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      this.logger.log(`Resolved alert: ${alertId}`);
    }
  }

  /**
   * Get system metrics
   * @param limit Number of metrics to return
   * @returns Array of system metrics
   */
  getSystemMetrics(limit: number = 100): SystemMetrics[] {
    return this.systemMetrics.slice(-limit);
  }

  /**
   * Get application metrics
   * @param limit Number of metrics to return
   * @returns Array of application metrics
   */
  getApplicationMetrics(limit: number = 100): ApplicationMetrics[] {
    return this.applicationMetrics.slice(-limit);
  }

  /**
   * Get performance alerts
   * @param limit Number of alerts to return
   * @param includeResolved Whether to include resolved alerts
   * @returns Array of performance alerts
   */
  getAlerts(limit: number = 50, includeResolved: boolean = false): PerformanceAlert[] {
    let alerts = [...this.alerts];
    
    if (!includeResolved) {
      alerts = alerts.filter(alert => !alert.resolved);
    }
    
    return alerts.slice(-limit);
  }

  /**
   * Get unresolved critical alerts
   * @returns Array of critical alerts
   */
  getCriticalAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => !alert.resolved && alert.level === 'critical');
  }

  /**
   * Cleanup old metrics based on retention period
   */
  private cleanupOldMetrics(): void {
    const retentionCutoff = new Date(Date.now() - this.config.metricsCollection.retentionPeriod * 60 * 60 * 1000);

    // Clean up system metrics
    this.systemMetrics = this.systemMetrics.filter(metric => metric.timestamp > retentionCutoff);

    // Clean up application metrics
    this.applicationMetrics = this.applicationMetrics.filter(metric => metric.timestamp > retentionCutoff);

    // Clean up alerts (keep resolved alerts for 24 hours after resolution)
    const alertCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.alerts = this.alerts.filter(alert => {
      if (alert.resolved && alert.resolvedAt) {
        return alert.resolvedAt > alertCutoff;
      }
      return true;
    });

    this.logger.debug('Cleaned up old metrics');
  }

  /**
   * Record endpoint metrics
   * @param path Endpoint path
   * @param method HTTP method
   * @param responseTime Response time in milliseconds
   * @param success Whether the request was successful
   */
  recordEndpointMetrics(
    path: string,
    method: string,
    responseTime: number,
    success: boolean
  ): void {
    const key = `${method}:${path}`;
    let metrics = this.endpointMetrics.get(key);

    if (!metrics) {
      metrics = {
        path,
        method,
        requests: 0,
        errors: 0,
        avgResponseTime: 0,
        minResponseTime: Infinity,
        maxResponseTime: 0,
      };
      this.endpointMetrics.set(key, metrics);
    }

    // Update metrics
    metrics.requests++;
    if (!success) {
      metrics.errors++;
    }

    // Update response time metrics
    metrics.avgResponseTime = ((metrics.avgResponseTime * (metrics.requests - 1)) + responseTime) / metrics.requests;
    metrics.minResponseTime = Math.min(metrics.minResponseTime, responseTime);
    metrics.maxResponseTime = Math.max(metrics.maxResponseTime, responseTime);
  }

  /**
   * Get endpoint metrics
   * @returns Map of endpoint metrics
   */
  getEndpointMetrics(): Map<string, EndpointMetrics> {
    return new Map(this.endpointMetrics);
  }

  /**
   * Get performance summary
   * @returns Performance summary
   */
  getPerformanceSummary(): any {
    const latestSystemMetrics = this.systemMetrics[this.systemMetrics.length - 1];
    const latestAppMetrics = this.applicationMetrics[this.applicationMetrics.length - 1];

    if (!latestSystemMetrics || !latestAppMetrics) {
      return {
        status: 'no_data',
        message: 'No metrics collected yet',
      };
    }

    return {
      timestamp: new Date(),
      system: {
        cpu: {
          utilization: latestSystemMetrics.cpu.utilization.toFixed(2) + '%',
          loadAverage: latestSystemMetrics.cpu.loadAverage.toFixed(2),
        },
        memory: {
          utilization: latestSystemMetrics.memory.utilization.toFixed(2) + '%',
          used: Math.round(latestSystemMetrics.memory.used) + 'MB',
          total: latestSystemMetrics.memory.total + 'MB',
        },
      },
      application: {
        requests: {
          total: latestAppMetrics.requests.total,
          errorRate: latestAppMetrics.requests.errorRate.toFixed(2) + '%',
        },
        responseTime: {
          average: latestAppMetrics.responseTimes.avg.toFixed(2) + 'ms',
        },
        throughput: {
          rps: latestAppMetrics.throughput.requestsPerSecond.toFixed(2),
        },
      },
      alerts: {
        total: this.alerts.filter(a => !a.resolved).length,
        critical: this.alerts.filter(a => !a.resolved && a.level === 'critical').length,
      },
    };
  }

  /**
   * Sample request for detailed tracing
   * @param requestId Request ID
   * @param requestDetails Request details
   */
  sampleRequest(requestId: string, requestDetails: any): void {
    // Only sample if within sampling rate
    if (Math.random() * 100 > this.config.sampling.requestSamplingRate) {
      return;
    }

    this.sampledRequests.set(requestId, {
      ...requestDetails,
      sampledAt: new Date(),
    });

    // Keep only last 1000 sampled requests
    if (this.sampledRequests.size > 1000) {
      const firstKey = this.sampledRequests.keys().next().value;
      if (firstKey) {
        this.sampledRequests.delete(firstKey);
      }
    }
  }

  /**
   * Get sampled requests
   * @param limit Number of requests to return
   * @returns Map of sampled requests
   */
  getSampledRequests(limit: number = 50): Map<string, any> {
    const entries = Array.from(this.sampledRequests.entries());
    const limitedEntries = entries.slice(-limit);
    return new Map(limitedEntries);
  }
}