import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';
import { AgentConnectorService } from '../../common/orchestrator/agent-connector.service';

export interface AgentInstance {
  id: string;
  agentName: string;
  host: string;
  port: number;
  status: 'healthy' | 'unhealthy' | 'maintenance';
  load: number; // 0-100
  capacity: number; // Max concurrent requests
  lastHealthCheck: Date;
  metadata: Record<string, any>;
}

export interface LoadBalancingStrategy {
  type: 'round-robin' | 'least-connections' | 'weighted-round-robin' | 'ip-hash';
  weights?: Record<string, number>; // For weighted strategies
}

@Injectable()
export class LoadBalancerService {
  private readonly logger = new Logger(LoadBalancerService.name);
  private readonly AGENT_INSTANCES_PREFIX = 'agent_instances';
  private readonly LOAD_BALANCER_PREFIX = 'load_balancer';
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

  constructor(
    private readonly redisService: RedisService,
    private readonly agentConnector: AgentConnectorService,
  ) {}

  /**
   * Register an agent instance
   * @param agentInstance Agent instance to register
   * @returns Promise resolving to boolean indicating success
   */
  async registerAgentInstance(agentInstance: AgentInstance): Promise<boolean> {
    try {
      const key = `${this.AGENT_INSTANCES_PREFIX}:${agentInstance.agentName}`;
      
      // Get existing instances
      const instancesJson = await this.redisService.get(key);
      const instances: AgentInstance[] = instancesJson ? JSON.parse(instancesJson) : [];
      
      // Add or update instance
      const existingIndex = instances.findIndex(i => i.id === agentInstance.id);
      if (existingIndex >= 0) {
        instances[existingIndex] = agentInstance;
      } else {
        instances.push(agentInstance);
      }
      
      // Save updated instances
      await this.redisService.set(key, JSON.stringify(instances));
      
      this.logger.log(`Registered agent instance ${agentInstance.id} for ${agentInstance.agentName}`);
      return true;
    } catch (error) {
      this.logger.error(`Error registering agent instance ${agentInstance.id}: ${error.message}`);
      return false;
    }
  }

  /**
   * Deregister an agent instance
   * @param agentName Agent name
   * @param instanceId Instance ID
   * @returns Promise resolving to boolean indicating success
   */
  async deregisterAgentInstance(agentName: string, instanceId: string): Promise<boolean> {
    try {
      const key = `${this.AGENT_INSTANCES_PREFIX}:${agentName}`;
      
      // Get existing instances
      const instancesJson = await this.redisService.get(key);
      if (!instancesJson) {
        return true; // Already deregistered
      }
      
      const instances: AgentInstance[] = JSON.parse(instancesJson);
      
      // Remove instance
      const filteredInstances = instances.filter(i => i.id !== instanceId);
      
      // Save updated instances
      await this.redisService.set(key, JSON.stringify(filteredInstances));
      
      this.logger.log(`Deregistered agent instance ${instanceId} for ${agentName}`);
      return true;
    } catch (error) {
      this.logger.error(`Error deregistering agent instance ${instanceId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Get agent instances
   * @param agentName Agent name
   * @returns Promise resolving to array of agent instances
   */
  async getAgentInstances(agentName: string): Promise<AgentInstance[]> {
    try {
      const key = `${this.AGENT_INSTANCES_PREFIX}:${agentName}`;
      const instancesJson = await this.redisService.get(key);
      
      if (!instancesJson) {
        return [];
      }

      const instances: AgentInstance[] = JSON.parse(instancesJson);
      
      // Convert date strings back to Date objects
      return instances.map(instance => ({
        ...instance,
        lastHealthCheck: new Date(instance.lastHealthCheck)
      }));
    } catch (error) {
      this.logger.error(`Error retrieving agent instances for ${agentName}: ${error.message}`);
      return [];
    }
  }

  /**
   * Update agent instance load
   * @param agentName Agent name
   * @param instanceId Instance ID
   * @param load Load value (0-100)
   * @returns Promise resolving to boolean indicating success
   */
  async updateInstanceLoad(agentName: string, instanceId: string, load: number): Promise<boolean> {
    try {
      const instances = await this.getAgentInstances(agentName);
      const instanceIndex = instances.findIndex(i => i.id === instanceId);
      
      if (instanceIndex === -1) {
        this.logger.warn(`Agent instance ${instanceId} not found for ${agentName}`);
        return false;
      }
      
      instances[instanceIndex].load = Math.max(0, Math.min(100, load));
      instances[instanceIndex].lastHealthCheck = new Date();
      
      const key = `${this.AGENT_INSTANCES_PREFIX}:${agentName}`;
      await this.redisService.set(key, JSON.stringify(instances));
      
      return true;
    } catch (error) {
      this.logger.error(`Error updating load for agent instance ${instanceId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Perform health check on agent instances
   * @param agentName Agent name
   * @returns Promise resolving to number of unhealthy instances
   */
  async performHealthCheck(agentName: string): Promise<number> {
    try {
      const instances = await this.getAgentInstances(agentName);
      let unhealthyCount = 0;
      
      for (const instance of instances) {
        try {
          // Update the agent connector config for this instance
          const baseUrl = `http://${instance.host}:${instance.port}`;
          this.agentConnector.updateAgentConfig(agentName, { baseUrl });
          
          // Check health
          const isHealthy = await this.agentConnector.checkHealth(agentName);
          
          // Update instance status
          instance.status = isHealthy ? 'healthy' : 'unhealthy';
          instance.lastHealthCheck = new Date();
          
          if (!isHealthy) {
            unhealthyCount++;
            this.logger.warn(`Agent instance ${instance.id} for ${agentName} is unhealthy`);
          }
        } catch (error) {
          instance.status = 'unhealthy';
          instance.lastHealthCheck = new Date();
          unhealthyCount++;
          this.logger.error(`Health check failed for agent instance ${instance.id}: ${error.message}`);
        }
      }
      
      // Save updated instances
      const key = `${this.AGENT_INSTANCES_PREFIX}:${agentName}`;
      await this.redisService.set(key, JSON.stringify(instances));
      
      if (unhealthyCount > 0) {
        this.logger.log(`Health check completed for ${agentName}: ${unhealthyCount} unhealthy instances`);
      }
      
      return unhealthyCount;
    } catch (error) {
      this.logger.error(`Error performing health check for ${agentName}: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get next available agent instance based on load balancing strategy
   * @param agentName Agent name
   * @param strategy Load balancing strategy
   * @param clientId Client ID (for IP-hash strategy)
   * @returns Promise resolving to agent instance or null
   */
  async getNextInstance(
    agentName: string,
    strategy: LoadBalancingStrategy = { type: 'least-connections' },
    clientId?: string
  ): Promise<AgentInstance | null> {
    try {
      const instances = await this.getAgentInstances(agentName);
      
      // Filter to only healthy instances
      const healthyInstances = instances.filter(i => i.status === 'healthy');
      
      if (healthyInstances.length === 0) {
        this.logger.warn(`No healthy instances available for agent ${agentName}`);
        return null;
      }
      
      // Filter to only instances with available capacity
      const availableInstances = healthyInstances.filter(i => i.load < 90); // Below 90% load
      
      if (availableInstances.length === 0) {
        this.logger.warn(`No instances with available capacity for agent ${agentName}`);
        // Return any healthy instance as fallback
        return healthyInstances[0];
      }
      
      // Apply load balancing strategy
      switch (strategy.type) {
        case 'round-robin':
          return this.roundRobinSelect(availableInstances, agentName);
          
        case 'least-connections':
          return this.leastConnectionsSelect(availableInstances);
          
        case 'weighted-round-robin':
          return this.weightedRoundRobinSelect(availableInstances, strategy.weights || {}, agentName);
          
        case 'ip-hash':
          return this.ipHashSelect(availableInstances, clientId);
          
        default:
          return this.leastConnectionsSelect(availableInstances);
      }
    } catch (error) {
      this.logger.error(`Error selecting next instance for agent ${agentName}: ${error.message}`);
      return null;
    }
  }

  /**
   * Round-robin selection
   * @param instances Available instances
   * @param agentName Agent name
   * @returns Selected instance
   */
  private async roundRobinSelect(instances: AgentInstance[], agentName: string): Promise<AgentInstance> {
    const key = `${this.LOAD_BALANCER_PREFIX}:round_robin:${agentName}`;
    
    // Get current index
    const indexStr = await this.redisService.get(key);
    let currentIndex = indexStr ? parseInt(indexStr, 10) : 0;
    
    // Select instance
    const instance = instances[currentIndex % instances.length];
    
    // Update index for next selection
    const nextIndex = (currentIndex + 1) % instances.length;
    await this.redisService.set(key, nextIndex.toString());
    
    return instance;
  }

  /**
   * Least connections selection
   * @param instances Available instances
   * @returns Selected instance
   */
  private leastConnectionsSelect(instances: AgentInstance[]): AgentInstance {
    return instances.reduce((min, instance) => 
      instance.load < min.load ? instance : min, 
      instances[0]
    );
  }

  /**
   * Weighted round-robin selection
   * @param instances Available instances
   * @param weights Weights for each instance
   * @param agentName Agent name
   * @returns Selected instance
   */
  private async weightedRoundRobinSelect(
    instances: AgentInstance[],
    weights: Record<string, number>,
    agentName: string
  ): Promise<AgentInstance> {
    const key = `${this.LOAD_BALANCER_PREFIX}:weighted_round_robin:${agentName}`;
    
    // Get current index
    const indexStr = await this.redisService.get(key);
    let currentIndex = indexStr ? parseInt(indexStr, 10) : 0;
    
    // Calculate weighted selection
    const weightedInstances: AgentInstance[] = [];
    for (const instance of instances) {
      const weight = weights[instance.id] || 1;
      for (let i = 0; i < weight; i++) {
        weightedInstances.push(instance);
      }
    }
    
    // Select instance
    const instance = weightedInstances[currentIndex % weightedInstances.length];
    
    // Update index for next selection
    const nextIndex = (currentIndex + 1) % weightedInstances.length;
    await this.redisService.set(key, nextIndex.toString());
    
    return instance;
  }

  /**
   * IP-hash selection
   * @param instances Available instances
   * @param clientId Client ID
   * @returns Selected instance
   */
  private ipHashSelect(instances: AgentInstance[], clientId?: string): AgentInstance {
    if (!clientId) {
      // Fallback to least connections if no client ID
      return this.leastConnectionsSelect(instances);
    }
    
    // Hash the client ID to select instance
    const hash = this.simpleHash(clientId);
    const index = hash % instances.length;
    return instances[index];
  }

  /**
   * Simple hash function
   * @param str String to hash
   * @returns Hash value
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}