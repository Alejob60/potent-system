import { Injectable, Logger } from '@nestjs/common';

export interface AutoScalingConfig {
  serviceName: string;
  minReplicas: number;
  maxReplicas: number;
  targetCPUUtilization: number;
  targetMemoryUtilization: number;
  scaleUpThreshold: number; // Percentage above target to trigger scale up
  scaleDownThreshold: number; // Percentage below target to trigger scale down
  scaleUpFactor: number; // How much to scale up (1.5 = 50% increase)
  scaleDownFactor: number; // How much to scale down (0.8 = 20% decrease)
  cooldownPeriod: number; // Time in seconds between scaling operations
  metricsCheckInterval: number; // Time in seconds between metrics checks
}

export interface ScalingPolicy {
  name: string;
  conditions: Array<{
    metric: string;
    operator: '>' | '<' | '>=' | '<=' | '==';
    threshold: number;
    action: 'scale_up' | 'scale_down' | 'scale_to';
    targetReplicas?: number;
    factor?: number;
  }>;
}

export interface ResourceMetrics {
  cpuUtilization: number;
  memoryUtilization: number;
  requestRate: number;
  errorRate: number;
  responseTime: number;
}

export interface ScalingEvent {
  timestamp: Date;
  action: 'scale_up' | 'scale_down' | 'scale_to';
  fromReplicas: number;
  toReplicas: number;
  reason: string;
  metrics: ResourceMetrics;
}

@Injectable()
export class AutoScalingService {
  private readonly logger = new Logger(AutoScalingService.name);
  private config: AutoScalingConfig;
  private currentReplicas: number;
  private lastScalingEvent: Date;
  private scalingEvents: ScalingEvent[] = [];
  private customPolicies: ScalingPolicy[] = [];
  private isScalingEnabled: boolean = false;

  constructor() {
    this.currentReplicas = 1;
    this.lastScalingEvent = new Date(0);
  }

  /**
   * Configure auto-scaling
   * @param config Auto-scaling configuration
   */
  configure(config: AutoScalingConfig): void {
    this.config = config;
    this.currentReplicas = config.minReplicas;
    this.logger.log(`Auto-scaling configured for service ${config.serviceName}`);
  }

  /**
   * Start auto-scaling
   */
  startAutoScaling(): void {
    if (this.isScalingEnabled) {
      this.logger.warn('Auto-scaling is already enabled');
      return;
    }

    this.isScalingEnabled = true;
    this.logger.log(`Starting auto-scaling for service ${this.config.serviceName}`);

    // Start periodic metrics checking
    setInterval(async () => {
      if (this.isScalingEnabled) {
        await this.checkAndScale();
      }
    }, this.config.metricsCheckInterval * 1000);
  }

  /**
   * Stop auto-scaling
   */
  stopAutoScaling(): void {
    this.isScalingEnabled = false;
    this.logger.log(`Stopped auto-scaling for service ${this.config.serviceName}`);
  }

  /**
   * Check metrics and scale if necessary
   */
  private async checkAndScale(): Promise<void> {
    if (!this.isScalingEnabled) return;

    // Check cooldown period
    const timeSinceLastScale = (Date.now() - this.lastScalingEvent.getTime()) / 1000;
    if (timeSinceLastScale < this.config.cooldownPeriod) {
      return;
    }

    // Get current resource metrics (in a real implementation, this would come from monitoring systems)
    const metrics = await this.getCurrentMetrics();

    // Check custom policies first
    for (const policy of this.customPolicies) {
      const shouldScale = this.evaluatePolicy(policy, metrics);
      if (shouldScale) {
        return;
      }
    }

    // Check default scaling rules
    await this.evaluateDefaultScalingRules(metrics);
  }

  /**
   * Get current resource metrics
   * @returns Resource metrics
   */
  private async getCurrentMetrics(): Promise<ResourceMetrics> {
    // In a real implementation, this would fetch actual metrics from monitoring systems
    // For now, we'll simulate with random values
    return {
      cpuUtilization: Math.random() * 100,
      memoryUtilization: Math.random() * 100,
      requestRate: Math.random() * 1000,
      errorRate: Math.random() * 5,
      responseTime: Math.random() * 200,
    };
  }

  /**
   * Evaluate custom scaling policy
   * @param policy Scaling policy
   * @param metrics Current metrics
   * @returns Boolean indicating if scaling action was taken
   */
  private evaluatePolicy(policy: ScalingPolicy, metrics: ResourceMetrics): boolean {
    for (const condition of policy.conditions) {
      let metricValue: number;
      
      switch (condition.metric) {
        case 'cpu':
          metricValue = metrics.cpuUtilization;
          break;
        case 'memory':
          metricValue = metrics.memoryUtilization;
          break;
        case 'requests':
          metricValue = metrics.requestRate;
          break;
        case 'errors':
          metricValue = metrics.errorRate;
          break;
        case 'response_time':
          metricValue = metrics.responseTime;
          break;
        default:
          continue;
      }

      let conditionMet = false;
      switch (condition.operator) {
        case '>':
          conditionMet = metricValue > condition.threshold;
          break;
        case '<':
          conditionMet = metricValue < condition.threshold;
          break;
        case '>=':
          conditionMet = metricValue >= condition.threshold;
          break;
        case '<=':
          conditionMet = metricValue <= condition.threshold;
          break;
        case '==':
          conditionMet = metricValue === condition.threshold;
          break;
      }

      if (conditionMet) {
        switch (condition.action) {
          case 'scale_up':
            this.scaleUp(condition.factor || 1.2, `${policy.name}: ${condition.metric} ${condition.operator} ${condition.threshold}`);
            return true;
          case 'scale_down':
            this.scaleDown(condition.factor || 0.8, `${policy.name}: ${condition.metric} ${condition.operator} ${condition.threshold}`);
            return true;
          case 'scale_to':
            if (condition.targetReplicas !== undefined) {
              this.scaleTo(condition.targetReplicas, `${policy.name}: ${condition.metric} ${condition.operator} ${condition.threshold}`);
              return true;
            }
            break;
        }
      }
    }

    return false;
  }

  /**
   * Evaluate default scaling rules
   * @param metrics Current metrics
   */
  private async evaluateDefaultScalingRules(metrics: ResourceMetrics): Promise<void> {
    // Check CPU utilization
    if (metrics.cpuUtilization > this.config.targetCPUUtilization * (1 + this.config.scaleUpThreshold / 100)) {
      this.scaleUp(this.config.scaleUpFactor, `CPU utilization ${metrics.cpuUtilization.toFixed(2)}% above target ${this.config.targetCPUUtilization}%`);
    } else if (metrics.cpuUtilization < this.config.targetCPUUtilization * (1 - this.config.scaleDownThreshold / 100)) {
      this.scaleDown(this.config.scaleDownFactor, `CPU utilization ${metrics.cpuUtilization.toFixed(2)}% below target ${this.config.targetCPUUtilization}%`);
    }

    // Check memory utilization
    if (metrics.memoryUtilization > this.config.targetMemoryUtilization * (1 + this.config.scaleUpThreshold / 100)) {
      this.scaleUp(this.config.scaleUpFactor, `Memory utilization ${metrics.memoryUtilization.toFixed(2)}% above target ${this.config.targetMemoryUtilization}%`);
    } else if (metrics.memoryUtilization < this.config.targetMemoryUtilization * (1 - this.config.scaleDownThreshold / 100)) {
      this.scaleDown(this.config.scaleDownFactor, `Memory utilization ${metrics.memoryUtilization.toFixed(2)}% below target ${this.config.targetMemoryUtilization}%`);
    }
  }

  /**
   * Scale up the service
   * @param factor Scale factor
   * @param reason Reason for scaling
   */
  private scaleUp(factor: number, reason: string): void {
    const newReplicas = Math.min(
      Math.ceil(this.currentReplicas * factor),
      this.config.maxReplicas
    );

    if (newReplicas > this.currentReplicas) {
      this.executeScaling('scale_up', newReplicas, reason);
    }
  }

  /**
   * Scale down the service
   * @param factor Scale factor
   * @param reason Reason for scaling
   */
  private scaleDown(factor: number, reason: string): void {
    const newReplicas = Math.max(
      Math.floor(this.currentReplicas * factor),
      this.config.minReplicas
    );

    if (newReplicas < this.currentReplicas) {
      this.executeScaling('scale_down', newReplicas, reason);
    }
  }

  /**
   * Scale to specific number of replicas
   * @param replicas Target replicas
   * @param reason Reason for scaling
   */
  private scaleTo(replicas: number, reason: string): void {
    const newReplicas = Math.max(
      this.config.minReplicas,
      Math.min(replicas, this.config.maxReplicas)
    );

    if (newReplicas !== this.currentReplicas) {
      const action = newReplicas > this.currentReplicas ? 'scale_up' : 'scale_down';
      this.executeScaling(action, newReplicas, reason);
    }
  }

  /**
   * Execute scaling action
   * @param action Scaling action
   * @param newReplicas New replica count
   * @param reason Reason for scaling
   */
  private executeScaling(action: 'scale_up' | 'scale_down', newReplicas: number, reason: string): void {
    const event: ScalingEvent = {
      timestamp: new Date(),
      action,
      fromReplicas: this.currentReplicas,
      toReplicas: newReplicas,
      reason,
      metrics: { cpuUtilization: 0, memoryUtilization: 0, requestRate: 0, errorRate: 0, responseTime: 0 }, // Would be filled with actual metrics
    };

    this.scalingEvents.push(event);
    this.currentReplicas = newReplicas;
    this.lastScalingEvent = new Date();

    // Keep only last 100 events
    if (this.scalingEvents.length > 100) {
      this.scalingEvents.shift();
    }

    this.logger.log(`Scaled ${this.config.serviceName} ${action} from ${event.fromReplicas} to ${event.toReplicas} replicas: ${reason}`);

    // In a real implementation, this would actually scale the service (e.g., update Kubernetes deployment)
    // For now, we just log the action
  }

  /**
   * Get current replica count
   * @returns Current replica count
   */
  getCurrentReplicas(): number {
    return this.currentReplicas;
  }

  /**
   * Get scaling events
   * @param limit Number of events to return
   * @returns Array of scaling events
   */
  getScalingEvents(limit: number = 20): ScalingEvent[] {
    return this.scalingEvents.slice(-limit);
  }

  /**
   * Add custom scaling policy
   * @param policy Scaling policy
   */
  addScalingPolicy(policy: ScalingPolicy): void {
    this.customPolicies.push(policy);
    this.logger.log(`Added scaling policy: ${policy.name}`);
  }

  /**
   * Remove custom scaling policy
   * @param policyName Policy name
   */
  removeScalingPolicy(policyName: string): void {
    this.customPolicies = this.customPolicies.filter(policy => policy.name !== policyName);
    this.logger.log(`Removed scaling policy: ${policyName}`);
  }

  /**
   * Get current configuration
   * @returns Auto-scaling configuration
   */
  getConfiguration(): AutoScalingConfig {
    return this.config;
  }

  /**
   * Update configuration
   * @param config New configuration
   */
  updateConfiguration(config: Partial<AutoScalingConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.log(`Updated auto-scaling configuration for service ${this.config.serviceName}`);
  }
}