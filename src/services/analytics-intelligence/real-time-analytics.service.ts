import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable, interval } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { DataWarehouseService } from './data-warehouse.service';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';

export interface RealTimeMetric {
  name: string;
  value: number;
  timestamp: Date;
  dimensions?: Record<string, any>;
}

export interface RealTimeAlert {
  metric: string;
  threshold: number;
  currentValue: number;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}

@Injectable()
export class RealTimeAnalyticsService {
  private readonly logger = new Logger(RealTimeAnalyticsService.name);
  private readonly alertStream = new Subject<RealTimeAlert>();
  private readonly metricsStream = new Subject<RealTimeMetric>();
  private alerts: RealTimeAlert[] = [];
  private metrics: RealTimeMetric[] = [];
  private alertThresholds: Map<string, number> = new Map();
  private destroy$ = new Subject<void>();

  constructor(
    private readonly dataWarehouseService: DataWarehouseService,
    private readonly websocketGateway: WebSocketGatewayService,
  ) {
    // Start simulated real-time data generation
    this.startDataSimulation();
  }

  /**
   * Start simulating real-time data for demonstration
   */
  private startDataSimulation(): void {
    // Simulate real-time metrics every 2 seconds
    interval(2000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Generate simulated metrics
        const metrics: RealTimeMetric[] = [
          {
            name: 'active_users',
            value: Math.floor(Math.random() * 1000) + 500,
            timestamp: new Date(),
            dimensions: { source: 'web' }
          },
          {
            name: 'revenue',
            value: Math.random() * 5000 + 1000,
            timestamp: new Date(),
            dimensions: { currency: 'USD' }
          },
          {
            name: 'conversion_rate',
            value: Math.random() * 0.1 + 0.02,
            timestamp: new Date(),
            dimensions: { channel: 'web' }
          }
        ];

        // Emit metrics
        metrics.forEach(metric => {
          this.emitMetric(metric);
        });
      });
  }

  /**
   * Emit a real-time metric
   * @param metric Real-time metric
   */
  emitMetric(metric: RealTimeMetric): void {
    this.metricsStream.next(metric);
    this.metrics.push(metric);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics.shift();
    }

    // Check for alerts
    this.checkAlerts(metric);

    // Send to data warehouse service
    this.dataWarehouseService.emitRealTimeData({
      timestamp: metric.timestamp,
      metric: metric.name,
      value: metric.value,
      dimensions: metric.dimensions
    });

    // Broadcast via WebSocket
    this.websocketGateway.server.emit('real_time_metric', metric);
  }

  /**
   * Get real-time metrics stream
   * @returns Observable of real-time metrics
   */
  getMetricsStream(): Observable<RealTimeMetric> {
    return this.metricsStream.asObservable();
  }

  /**
   * Get recent metrics
   * @param limit Number of metrics to return
   * @returns Array of recent metrics
   */
  getRecentMetrics(limit: number = 50): RealTimeMetric[] {
    return this.metrics.slice(-limit);
  }

  /**
   * Get current metrics by names
   * @param names Array of metric names to retrieve
   * @returns Array of current metrics
   */
  getCurrentMetrics(names: string[]): RealTimeMetric[] {
    // Get the most recent metrics for each specified name
    const currentMetrics: RealTimeMetric[] = [];
    
    names.forEach(name => {
      // Find the most recent metric with this name
      const recentMetric = [...this.metrics]
        .reverse()
        .find(metric => metric.name === name);
      
      if (recentMetric) {
        currentMetrics.push(recentMetric);
      }
    });
    
    return currentMetrics;
  }

  /**
   * Set alert threshold for a metric
   * @param metricName Metric name
   * @param threshold Threshold value
   */
  setAlertThreshold(metricName: string, threshold: number): void {
    this.alertThresholds.set(metricName, threshold);
  }

  /**
   * Check if a metric triggers an alert
   * @param metric Real-time metric
   */
  private checkAlerts(metric: RealTimeMetric): void {
    const threshold = this.alertThresholds.get(metric.name);
    if (threshold && metric.value > threshold) {
      const alert: RealTimeAlert = {
        metric: metric.name,
        threshold,
        currentValue: metric.value,
        timestamp: metric.timestamp,
        severity: metric.value > threshold * 1.5 ? 'high' : 
                  metric.value > threshold * 1.2 ? 'medium' : 'low'
      };

      this.alertStream.next(alert);
      this.alerts.push(alert);

      // Keep only last 100 alerts
      if (this.alerts.length > 100) {
        this.alerts.shift();
      }

      // Broadcast alert via WebSocket
      this.websocketGateway.server.emit('real_time_alert', alert);
    }
  }

  /**
   * Get alert stream
   * @returns Observable of real-time alerts
   */
  getAlertStream(): Observable<RealTimeAlert> {
    return this.alertStream.asObservable();
  }

  /**
   * Get recent alerts
   * @param limit Number of alerts to return
   * @returns Array of recent alerts
   */
  getRecentAlerts(limit: number = 20): RealTimeAlert[] {
    return this.alerts.slice(-limit);
  }

  /**
   * Get active alerts
   * @returns Array of active alerts
   */
  getActiveAlerts(): RealTimeAlert[] {
    // For now, we'll return recent alerts as active alerts
    // In a real implementation, this might filter by alert status
    return this.getRecentAlerts(20);
  }

  /**
   * Get metrics aggregated by time window
   * @param metricName Metric name
   * @param windowMinutes Time window in minutes
   * @returns Aggregated metrics
   */
  getAggregatedMetrics(metricName: string, windowMinutes: number = 5): any[] {
    const windowMs = windowMinutes * 60 * 1000;
    const now = new Date().getTime();
    const windowStart = new Date(now - windowMs);

    const relevantMetrics = this.metrics.filter(
      m => m.name === metricName && m.timestamp >= windowStart
    );

    if (relevantMetrics.length === 0) {
      return [];
    }

    const sum = relevantMetrics.reduce((acc, m) => acc + m.value, 0);
    const avg = sum / relevantMetrics.length;
    const min = Math.min(...relevantMetrics.map(m => m.value));
    const max = Math.max(...relevantMetrics.map(m => m.value));

    return [{
      metric: metricName,
      count: relevantMetrics.length,
      sum,
      average: avg,
      min,
      max,
      windowStart,
      windowEnd: now
    }];
  }

  /**
   * Cleanup resources
   */
  onModuleDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}