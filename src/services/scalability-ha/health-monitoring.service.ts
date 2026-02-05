import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface HealthCheckConfig {
  services: Array<{
    name: string;
    url: string;
    critical: boolean;
    expectedStatusCode: number;
    timeout: number;
  }>;
  checkInterval: number; // in milliseconds
  alertThreshold: number; // number of consecutive failures before alerting
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

@Injectable()
export class HealthMonitoringService {
  private readonly logger = new Logger(HealthMonitoringService.name);
  private config: HealthCheckConfig;
  private serviceHealth: Map<string, ServiceHealth> = new Map();
  private alerts: HealthAlert[] = [];
  private isMonitoring: boolean = false;

  constructor(private readonly httpService: HttpService) {}

  /**
   * Configure health monitoring
   * @param config Health check configuration
   */
  configure(config: HealthCheckConfig): void {
    this.config = config;
    
    // Initialize service health records
    this.config.services.forEach(service => {
      this.serviceHealth.set(service.name, {
        name: service.name,
        url: service.url,
        status: 'healthy',
        lastChecked: new Date(0),
        responseTime: 0,
        statusCode: 0,
        failureCount: 0,
      });
    });

    this.logger.log(`Health monitoring configured for ${config.services.length} services`);
  }

  /**
   * Start health monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      this.logger.warn('Health monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    this.logger.log('Starting health monitoring');

    // Start periodic health checks
    setInterval(async () => {
      await this.performHealthChecks();
    }, this.config.checkInterval);
  }

  /**
   * Stop health monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    this.logger.log('Stopped health monitoring');
  }

  /**
   * Perform health checks on all services
   */
  private async performHealthChecks(): Promise<void> {
    if (!this.isMonitoring) return;

    for (const service of this.config.services) {
      try {
        const startTime = Date.now();
        const response = await firstValueFrom(
          this.httpService.get(service.url, {
            timeout: service.timeout,
          })
        );
        const responseTime = Date.now() - startTime;

        const health: ServiceHealth = {
          name: service.name,
          url: service.url,
          status: response.status === service.expectedStatusCode ? 'healthy' : 'degraded',
          lastChecked: new Date(),
          responseTime,
          statusCode: response.status,
          failureCount: 0,
        };

        this.serviceHealth.set(service.name, health);

        // Reset failure count
        const currentHealth = this.serviceHealth.get(service.name);
        if (currentHealth) {
          currentHealth.failureCount = 0;
        }

        if (health.status === 'degraded') {
          this.logger.warn(`Service ${service.name} is degraded (status: ${response.status})`);
          this.createAlert(service.name, 'warning', `Service ${service.name} returned unexpected status code ${response.status}`);
        }
      } catch (error) {
        const currentHealth = this.serviceHealth.get(service.name) || {
          name: service.name,
          url: service.url,
          status: 'unhealthy',
          lastChecked: new Date(),
          responseTime: 0,
          statusCode: 0,
          failureCount: 0,
        };

        currentHealth.failureCount += 1;
        currentHealth.lastChecked = new Date();
        currentHealth.status = 'unhealthy';
        currentHealth.lastFailureReason = error.message;

        this.serviceHealth.set(service.name, currentHealth);

        this.logger.error(`Service ${service.name} health check failed: ${error.message}`);

        // Check if we should create an alert
        if (currentHealth.failureCount >= this.config.alertThreshold) {
          const level = service.critical ? 'critical' : 'warning';
          this.createAlert(service.name, level, `Service ${service.name} has failed ${currentHealth.failureCount} consecutive health checks: ${error.message}`);
        }
      }
    }
  }

  /**
   * Create a health alert
   * @param service Service name
   * @param level Alert level
   * @param message Alert message
   */
  private createAlert(service: string, level: 'warning' | 'critical', message: string): void {
    const alert: HealthAlert = {
      service,
      level,
      message,
      timestamp: new Date(),
    };

    this.alerts.push(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }

    this.logger.log(`Health alert created: ${level} - ${message}`);
  }

  /**
   * Get health status for all services
   * @returns Array of service health statuses
   */
  getHealthStatus(): ServiceHealth[] {
    return Array.from(this.serviceHealth.values());
  }

  /**
   * Get health status for specific service
   * @param serviceName Service name
   * @returns Service health status or undefined
   */
  getServiceHealth(serviceName: string): ServiceHealth | undefined {
    return this.serviceHealth.get(serviceName);
  }

  /**
   * Get recent alerts
   * @param limit Number of alerts to return
   * @returns Array of recent alerts
   */
  getAlerts(limit: number = 20): HealthAlert[] {
    return this.alerts.slice(-limit);
  }

  /**
   * Get system health summary
   * @returns Health summary
   */
  getHealthSummary(): any {
    const healthStatus = this.getHealthStatus();
    const healthyCount = healthStatus.filter(s => s.status === 'healthy').length;
    const degradedCount = healthStatus.filter(s => s.status === 'degraded').length;
    const unhealthyCount = healthStatus.filter(s => s.status === 'unhealthy').length;
    const criticalServices = this.config.services.filter(s => s.critical).map(s => s.name);
    const criticalUnhealthy = criticalServices.filter(name => {
      const health = this.serviceHealth.get(name);
      return health && health.status === 'unhealthy';
    });

    return {
      totalServices: healthStatus.length,
      healthy: healthyCount,
      degraded: degradedCount,
      unhealthy: unhealthyCount,
      overallStatus: unhealthyCount > 0 ? 'unhealthy' : degradedCount > 0 ? 'degraded' : 'healthy',
      criticalServicesUnhealthy: criticalUnhealthy,
      lastChecked: new Date(),
    };
  }

  /**
   * Add service to monitoring
   * @param service Service configuration
   */
  addService(service: HealthCheckConfig['services'][0]): void {
    this.config.services.push(service);
    this.serviceHealth.set(service.name, {
      name: service.name,
      url: service.url,
      status: 'healthy',
      lastChecked: new Date(0),
      responseTime: 0,
      statusCode: 0,
      failureCount: 0,
    });
    
    this.logger.log(`Added service ${service.name} to health monitoring`);
  }

  /**
   * Remove service from monitoring
   * @param serviceName Service name
   */
  removeService(serviceName: string): void {
    this.config.services = this.config.services.filter(service => service.name !== serviceName);
    this.serviceHealth.delete(serviceName);
    
    this.logger.log(`Removed service ${serviceName} from health monitoring`);
  }
}