import { HttpService } from '@nestjs/axios';
export interface LoadBalancerConfig {
    strategy: 'round-robin' | 'least-connections' | 'weighted-round-robin';
    servers: Array<{
        url: string;
        weight?: number;
        active: boolean;
    }>;
    healthCheckInterval: number;
    timeout: number;
}
export interface ServerHealth {
    url: string;
    healthy: boolean;
    responseTime: number;
    lastChecked: Date;
}
export declare class LoadBalancingService {
    private readonly httpService;
    private readonly logger;
    private config;
    private serverHealth;
    private currentIndex;
    private connectionCounts;
    constructor(httpService: HttpService);
    configure(config: LoadBalancerConfig): void;
    getNextServer(): string | null;
    private roundRobin;
    private leastConnections;
    private weightedRoundRobin;
    private isServerHealthy;
    private startHealthChecks;
    private performHealthChecks;
    getServerHealth(): ServerHealth[];
    addConnection(url: string): void;
    removeConnection(url: string): void;
    getConnectionCount(url: string): number;
    addServer(server: LoadBalancerConfig['servers'][0]): void;
    removeServer(url: string): void;
    updateServer(url: string, updates: Partial<LoadBalancerConfig['servers'][0]>): void;
}
