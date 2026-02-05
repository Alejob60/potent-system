import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface LoadBalancerConfig {
  strategy: 'round-robin' | 'least-connections' | 'weighted-round-robin';
  servers: Array<{
    url: string;
    weight?: number;
    active: boolean;
  }>;
  healthCheckInterval: number; // in milliseconds
  timeout: number; // in milliseconds
}

export interface ServerHealth {
  url: string;
  healthy: boolean;
  responseTime: number;
  lastChecked: Date;
}

@Injectable()
export class LoadBalancingService {
  private readonly logger = new Logger(LoadBalancingService.name);
  private config: LoadBalancerConfig;
  private serverHealth: Map<string, ServerHealth> = new Map();
  private currentIndex: number = 0;
  private connectionCounts: Map<string, number> = new Map();

  constructor(private readonly httpService: HttpService) {}

  /**
   * Configure the load balancer
   * @param config Load balancer configuration
   */
  configure(config: LoadBalancerConfig): void {
    this.config = config;
    
    // Initialize connection counts
    this.config.servers.forEach(server => {
      this.connectionCounts.set(server.url, 0);
      this.serverHealth.set(server.url, {
        url: server.url,
        healthy: true,
        responseTime: 0,
        lastChecked: new Date(),
      });
    });

    this.logger.log(`Load balancer configured with ${config.servers.length} servers`);
    
    // Start health checks
    this.startHealthChecks();
  }

  /**
   * Get next server based on load balancing strategy
   * @returns Server URL or null if no healthy servers available
   */
  getNextServer(): string | null {
    const healthyServers = this.config.servers.filter(
      server => server.active && this.isServerHealthy(server.url)
    );

    if (healthyServers.length === 0) {
      this.logger.warn('No healthy servers available');
      return null;
    }

    switch (this.config.strategy) {
      case 'round-robin':
        return this.roundRobin(healthyServers);
      case 'least-connections':
        return this.leastConnections(healthyServers);
      case 'weighted-round-robin':
        return this.weightedRoundRobin(healthyServers);
      default:
        return this.roundRobin(healthyServers);
    }
  }

  /**
   * Round Robin algorithm
   * @param servers Healthy servers
   * @returns Server URL
   */
  private roundRobin(servers: LoadBalancerConfig['servers']): string {
    const server = servers[this.currentIndex % servers.length];
    this.currentIndex = (this.currentIndex + 1) % servers.length;
    return server.url;
  }

  /**
   * Least Connections algorithm
   * @param servers Healthy servers
   * @returns Server URL
   */
  private leastConnections(servers: LoadBalancerConfig['servers']): string {
    let minConnections = Infinity;
    let selectedServer = servers[0];

    for (const server of servers) {
      const connections = this.connectionCounts.get(server.url) || 0;
      if (connections < minConnections) {
        minConnections = connections;
        selectedServer = server;
      }
    }

    return selectedServer.url;
  }

  /**
   * Weighted Round Robin algorithm
   * @param servers Healthy servers
   * @returns Server URL
   */
  private weightedRoundRobin(servers: LoadBalancerConfig['servers']): string {
    // Simple implementation - could be enhanced with more sophisticated weighting
    const totalWeight = servers.reduce((sum, server) => sum + (server.weight || 1), 0);
    let random = Math.floor(Math.random() * totalWeight);
    
    for (const server of servers) {
      const weight = server.weight || 1;
      if (random < weight) {
        return server.url;
      }
      random -= weight;
    }
    
    // Fallback to first server
    return servers[0].url;
  }

  /**
   * Check if server is healthy
   * @param url Server URL
   * @returns Boolean indicating health status
   */
  private isServerHealthy(url: string): boolean {
    const health = this.serverHealth.get(url);
    return health ? health.healthy : false;
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    setInterval(async () => {
      await this.performHealthChecks();
    }, this.config.healthCheckInterval);
  }

  /**
   * Perform health checks on all servers
   */
  private async performHealthChecks(): Promise<void> {
    for (const server of this.config.servers) {
      try {
        const startTime = Date.now();
        const response = await firstValueFrom(
          this.httpService.get(`${server.url}/health`, {
            timeout: this.config.timeout,
          })
        );
        const responseTime = Date.now() - startTime;

        this.serverHealth.set(server.url, {
          url: server.url,
          healthy: response.status === 200,
          responseTime,
          lastChecked: new Date(),
        });

        if (response.status !== 200) {
          this.logger.warn(`Server ${server.url} health check failed with status ${response.status}`);
        }
      } catch (error) {
        this.serverHealth.set(server.url, {
          url: server.url,
          healthy: false,
          responseTime: 0,
          lastChecked: new Date(),
        });

        this.logger.error(`Server ${server.url} health check failed: ${error.message}`);
      }
    }
  }

  /**
   * Get server health status
   * @returns Array of server health statuses
   */
  getServerHealth(): ServerHealth[] {
    return Array.from(this.serverHealth.values());
  }

  /**
   * Add connection to server
   * @param url Server URL
   */
  addConnection(url: string): void {
    const current = this.connectionCounts.get(url) || 0;
    this.connectionCounts.set(url, current + 1);
  }

  /**
   * Remove connection from server
   * @param url Server URL
   */
  removeConnection(url: string): void {
    const current = this.connectionCounts.get(url) || 0;
    this.connectionCounts.set(url, Math.max(0, current - 1));
  }

  /**
   * Get connection count for server
   * @param url Server URL
   * @returns Connection count
   */
  getConnectionCount(url: string): number {
    return this.connectionCounts.get(url) || 0;
  }

  /**
   * Add new server to load balancer
   * @param server Server configuration
   */
  addServer(server: LoadBalancerConfig['servers'][0]): void {
    this.config.servers.push(server);
    this.connectionCounts.set(server.url, 0);
    this.serverHealth.set(server.url, {
      url: server.url,
      healthy: true,
      responseTime: 0,
      lastChecked: new Date(),
    });
    
    this.logger.log(`Added server ${server.url} to load balancer`);
  }

  /**
   * Remove server from load balancer
   * @param url Server URL
   */
  removeServer(url: string): void {
    this.config.servers = this.config.servers.filter(server => server.url !== url);
    this.connectionCounts.delete(url);
    this.serverHealth.delete(url);
    
    this.logger.log(`Removed server ${url} from load balancer`);
  }

  /**
   * Update server configuration
   * @param url Server URL
   * @param updates Server configuration updates
   */
  updateServer(url: string, updates: Partial<LoadBalancerConfig['servers'][0]>): void {
    const server = this.config.servers.find(s => s.url === url);
    if (server) {
      Object.assign(server, updates);
      this.logger.log(`Updated server ${url} configuration`);
    }
  }
}