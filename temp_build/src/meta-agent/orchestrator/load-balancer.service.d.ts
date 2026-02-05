import { RedisService } from '../../common/redis/redis.service';
import { AgentConnectorService } from '../../common/orchestrator/agent-connector.service';
export interface AgentInstance {
    id: string;
    agentName: string;
    host: string;
    port: number;
    status: 'healthy' | 'unhealthy' | 'maintenance';
    load: number;
    capacity: number;
    lastHealthCheck: Date;
    metadata: Record<string, any>;
}
export interface LoadBalancingStrategy {
    type: 'round-robin' | 'least-connections' | 'weighted-round-robin' | 'ip-hash';
    weights?: Record<string, number>;
}
export declare class LoadBalancerService {
    private readonly redisService;
    private readonly agentConnector;
    private readonly logger;
    private readonly AGENT_INSTANCES_PREFIX;
    private readonly LOAD_BALANCER_PREFIX;
    private readonly HEALTH_CHECK_INTERVAL;
    constructor(redisService: RedisService, agentConnector: AgentConnectorService);
    registerAgentInstance(agentInstance: AgentInstance): Promise<boolean>;
    deregisterAgentInstance(agentName: string, instanceId: string): Promise<boolean>;
    getAgentInstances(agentName: string): Promise<AgentInstance[]>;
    updateInstanceLoad(agentName: string, instanceId: string, load: number): Promise<boolean>;
    performHealthCheck(agentName: string): Promise<number>;
    getNextInstance(agentName: string, strategy?: LoadBalancingStrategy, clientId?: string): Promise<AgentInstance | null>;
    private roundRobinSelect;
    private leastConnectionsSelect;
    private weightedRoundRobinSelect;
    private ipHashSelect;
    private simpleHash;
}
