import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

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
    priority: number; // Lower number means higher priority
    healthCheckPath: string;
    timeout: number;
  }>;
  failoverThreshold: number; // Number of consecutive failures before failover
  healthCheckInterval: number; // Time in milliseconds between health checks
  recoveryCheckInterval: number; // Time in milliseconds to check if primary is recovered
  enableAutoRecovery: boolean; // Whether to automatically switch back to primary when it recovers
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
  duration: number; // Time in milliseconds since last failover
}

@Injectable()
export class FailoverMechanismsService {
  private readonly logger = new Logger(FailoverMechanismsService.name);
  private config: FailoverConfig;
  private serviceStatus: Map<string, ServiceStatus> = new Map();
  private currentActiveService: string;
  private failoverEvents: FailoverEvent[] = [];
  private consecutiveFailures: number = 0;
  private isFailoverEnabled: boolean = false;
  private lastFailover: Date = new Date(0);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Configure failover mechanisms
   * @param config Failover configuration
   */
  configure(config: FailoverConfig): void {
    this.config = config;
    this.currentActiveService = config.primaryService.name;
    
    // Initialize service status records
    this.initializeServiceStatus();
    
    this.logger.log(`Failover mechanisms configured. Primary service: ${config.primaryService.name}`);
  }

  /**
   * Initialize service status records
   */
  private initializeServiceStatus(): void {
    // Add primary service
    this.serviceStatus.set(this.config.primaryService.name, {
      name: this.config.primaryService.name,
      url: this.config.primaryService.url,
      status: 'healthy',
      lastChecked: new Date(0),
      responseTime: 0,
      failureCount: 0,
    });

    // Add backup services
    this.config.backupServices.forEach(service => {
      this.serviceStatus.set(service.name, {
        name: service.name,
        url: service.url,
        status: 'healthy',
        lastChecked: new Date(0),
        responseTime: 0,
        failureCount: 0,
      });
    });
  }

  /**
   * Start failover monitoring
   */
  startFailoverMonitoring(): void {
    if (this.isFailoverEnabled) {
      this.logger.warn('Failover monitoring is already enabled');
      return;
    }

    this.isFailoverEnabled = true;
    this.logger.log('Starting failover monitoring');

    // Start periodic health checks
    setInterval(async () => {
      if (this.isFailoverEnabled) {
        await this.performHealthChecks();
      }
    }, this.config.healthCheckInterval);

    // Start recovery checks if auto-recovery is enabled
    if (this.config.enableAutoRecovery) {
      setInterval(async () => {
        if (this.isFailoverEnabled && this.currentActiveService !== this.config.primaryService.name) {
          await this.checkForRecovery();
        }
      }, this.config.recoveryCheckInterval);
    }
  }

  /**
   * Stop failover monitoring
   */
  stopFailoverMonitoring(): void {
    this.isFailoverEnabled = false;
    this.logger.log('Stopped failover monitoring');
  }

  /**
   * Perform health checks on all services
   */
  private async performHealthChecks(): Promise<void> {
    if (!this.isFailoverEnabled) return;

    // Check primary service if it's currently active
    if (this.currentActiveService === this.config.primaryService.name) {
      const isHealthy = await this.checkServiceHealth(
        this.config.primaryService.name,
        this.config.primaryService.url,
        this.config.primaryService.healthCheckPath,
        this.config.primaryService.timeout
      );

      if (!isHealthy) {
        this.consecutiveFailures++;
        this.logger.warn(`Primary service failed health check (${this.consecutiveFailures}/${this.config.failoverThreshold})`);

        // Trigger failover if threshold is reached
        if (this.consecutiveFailures >= this.config.failoverThreshold) {
          await this.triggerFailover('Primary service unavailable');
        }
      } else {
        // Reset consecutive failures on success
        if (this.consecutiveFailures > 0) {
          this.logger.log('Primary service is healthy again');
          this.consecutiveFailures = 0;
        }
      }
    } else {
      // If we're on a backup service, continue monitoring primary for recovery
      if (this.config.enableAutoRecovery) {
        await this.checkForRecovery();
      }
    }
  }

  /**
   * Check service health
   * @param serviceName Service name
   * @param serviceUrl Service URL
   * @param healthCheckPath Health check path
   * @param timeout Request timeout
   * @returns Boolean indicating health status
   */
  private async checkServiceHealth(
    serviceName: string,
    serviceUrl: string,
    healthCheckPath: string,
    timeout: number
  ): Promise<boolean> {
    try {
      const startTime = Date.now();
      const response = await firstValueFrom(
        this.httpService.get(`${serviceUrl}${healthCheckPath}`, {
          timeout,
        })
      );
      const responseTime = Date.now() - startTime;

      // Update service status
      const status: ServiceStatus = {
        name: serviceName,
        url: serviceUrl,
        status: response.status === 200 ? 'healthy' : 'degraded',
        lastChecked: new Date(),
        responseTime,
        failureCount: 0,
      };

      this.serviceStatus.set(serviceName, status);

      return response.status === 200;
    } catch (error) {
      // Update service status with failure
      const currentStatus = this.serviceStatus.get(serviceName) || {
        name: serviceName,
        url: serviceUrl,
        status: 'unhealthy',
        lastChecked: new Date(),
        responseTime: 0,
        failureCount: 0,
      };

      currentStatus.failureCount += 1;
      currentStatus.lastChecked = new Date();
      currentStatus.status = 'unhealthy';
      currentStatus.lastFailureReason = error.message;

      this.serviceStatus.set(serviceName, currentStatus);

      this.logger.error(`Service ${serviceName} health check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Trigger failover to backup service
   * @param reason Reason for failover
   */
  private async triggerFailover(reason: string): Promise<void> {
    this.logger.warn(`Triggering failover: ${reason}`);

    // Find the highest priority healthy backup service
    const sortedBackups = [...this.config.backupServices].sort((a, b) => a.priority - b.priority);
    let backupService: FailoverConfig['backupServices'][0] | null = null;

    for (const service of sortedBackups) {
      const status = this.serviceStatus.get(service.name);
      if (status && status.status === 'healthy') {
        backupService = service;
        break;
      }
    }

    if (!backupService) {
      this.logger.error('No healthy backup services available for failover');
      return;
    }

    // Record failover event
    const event: FailoverEvent = {
      timestamp: new Date(),
      fromService: this.currentActiveService,
      toService: backupService.name,
      reason,
      duration: Date.now() - this.lastFailover.getTime(),
    };

    this.failoverEvents.push(event);
    this.lastFailover = new Date();

    // Keep only last 100 events
    if (this.failoverEvents.length > 100) {
      this.failoverEvents.shift();
    }

    // Switch to backup service
    const previousService = this.currentActiveService;
    this.currentActiveService = backupService.name;
    this.consecutiveFailures = 0;

    this.logger.log(`Failover completed: ${previousService} -> ${backupService.name}`);
  }

  /**
   * Check if primary service has recovered
   */
  private async checkForRecovery(): Promise<void> {
    const isPrimaryHealthy = await this.checkServiceHealth(
      this.config.primaryService.name,
      this.config.primaryService.url,
      this.config.primaryService.healthCheckPath,
      this.config.primaryService.timeout
    );

    if (isPrimaryHealthy) {
      this.logger.log('Primary service has recovered');

      if (this.config.enableAutoRecovery) {
        this.logger.log('Switching back to primary service due to auto-recovery');
        await this.switchToPrimary();
      }
    }
  }

  /**
   * Switch back to primary service
   */
  private async switchToPrimary(): Promise<void> {
    // Record failover event (switching back)
    const event: FailoverEvent = {
      timestamp: new Date(),
      fromService: this.currentActiveService,
      toService: this.config.primaryService.name,
      reason: 'Primary service recovery',
      duration: Date.now() - this.lastFailover.getTime(),
    };

    this.failoverEvents.push(event);
    this.lastFailover = new Date();

    // Switch to primary service
    const previousService = this.currentActiveService;
    this.currentActiveService = this.config.primaryService.name;

    this.logger.log(`Switched back to primary service: ${previousService} -> ${this.config.primaryService.name}`);
  }

  /**
   * Get current active service
   * @returns Current active service name
   */
  getCurrentActiveService(): string {
    return this.currentActiveService;
  }

  /**
   * Get service status
   * @param serviceName Service name
   * @returns Service status or undefined
   */
  getServiceStatus(serviceName: string): ServiceStatus | undefined {
    return this.serviceStatus.get(serviceName);
  }

  /**
   * Get all service statuses
   * @returns Array of service statuses
   */
  getAllServiceStatuses(): ServiceStatus[] {
    return Array.from(this.serviceStatus.values());
  }

  /**
   * Get failover events
   * @param limit Number of events to return
   * @returns Array of failover events
   */
  getFailoverEvents(limit: number = 20): FailoverEvent[] {
    return this.failoverEvents.slice(-limit);
  }

  /**
   * Manually trigger failover
   * @param reason Reason for manual failover
   */
  async manualFailover(reason: string): Promise<void> {
    this.logger.warn(`Manual failover triggered: ${reason}`);
    await this.triggerFailover(`Manual failover: ${reason}`);
  }

  /**
   * Force switch to specific service
   * @param serviceName Service name to switch to
   * @param reason Reason for switch
   */
  forceSwitchToService(serviceName: string, reason: string): void {
    if (!this.serviceStatus.has(serviceName)) {
      this.logger.error(`Cannot switch to unknown service: ${serviceName}`);
      return;
    }

    const status = this.serviceStatus.get(serviceName);
    if (status && status.status !== 'healthy') {
      this.logger.warn(`Switching to unhealthy service: ${serviceName}`);
    }

    // Record switch event
    const event: FailoverEvent = {
      timestamp: new Date(),
      fromService: this.currentActiveService,
      toService: serviceName,
      reason: `Force switch: ${reason}`,
      duration: Date.now() - this.lastFailover.getTime(),
    };

    this.failoverEvents.push(event);
    this.lastFailover = new Date();

    // Switch to specified service
    const previousService = this.currentActiveService;
    this.currentActiveService = serviceName;

    this.logger.log(`Force switched service: ${previousService} -> ${serviceName}`);
  }

  /**
   * Add backup service
   * @param service Backup service configuration
   */
  addBackupService(service: FailoverConfig['backupServices'][0]): void {
    this.config.backupServices.push(service);
    
    // Initialize service status
    this.serviceStatus.set(service.name, {
      name: service.name,
      url: service.url,
      status: 'healthy',
      lastChecked: new Date(0),
      responseTime: 0,
      failureCount: 0,
    });
    
    this.logger.log(`Added backup service: ${service.name}`);
  }

  /**
   * Remove backup service
   * @param serviceName Service name
   */
  removeBackupService(serviceName: string): void {
    this.config.backupServices = this.config.backupServices.filter(service => service.name !== serviceName);
    this.serviceStatus.delete(serviceName);
    
    this.logger.log(`Removed backup service: ${serviceName}`);
  }

  /**
   * Update service configuration
   * @param serviceName Service name
   * @param updates Service configuration updates
   */
  updateServiceConfig(
    serviceName: string,
    updates: Partial<FailoverConfig['primaryService']> | Partial<FailoverConfig['backupServices'][0]>
  ): void {
    if (serviceName === this.config.primaryService.name) {
      Object.assign(this.config.primaryService, updates);
    } else {
      const service = this.config.backupServices.find(s => s.name === serviceName);
      if (service) {
        Object.assign(service, updates);
      }
    }
    
    this.logger.log(`Updated configuration for service: ${serviceName}`);
  }
}