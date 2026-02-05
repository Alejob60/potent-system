"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LoadBalancerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadBalancerService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../common/redis/redis.service");
const agent_connector_service_1 = require("../../common/orchestrator/agent-connector.service");
let LoadBalancerService = LoadBalancerService_1 = class LoadBalancerService {
    constructor(redisService, agentConnector) {
        this.redisService = redisService;
        this.agentConnector = agentConnector;
        this.logger = new common_1.Logger(LoadBalancerService_1.name);
        this.AGENT_INSTANCES_PREFIX = 'agent_instances';
        this.LOAD_BALANCER_PREFIX = 'load_balancer';
        this.HEALTH_CHECK_INTERVAL = 30000;
    }
    async registerAgentInstance(agentInstance) {
        try {
            const key = `${this.AGENT_INSTANCES_PREFIX}:${agentInstance.agentName}`;
            const instancesJson = await this.redisService.get(key);
            const instances = instancesJson ? JSON.parse(instancesJson) : [];
            const existingIndex = instances.findIndex(i => i.id === agentInstance.id);
            if (existingIndex >= 0) {
                instances[existingIndex] = agentInstance;
            }
            else {
                instances.push(agentInstance);
            }
            await this.redisService.set(key, JSON.stringify(instances));
            this.logger.log(`Registered agent instance ${agentInstance.id} for ${agentInstance.agentName}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error registering agent instance ${agentInstance.id}: ${error.message}`);
            return false;
        }
    }
    async deregisterAgentInstance(agentName, instanceId) {
        try {
            const key = `${this.AGENT_INSTANCES_PREFIX}:${agentName}`;
            const instancesJson = await this.redisService.get(key);
            if (!instancesJson) {
                return true;
            }
            const instances = JSON.parse(instancesJson);
            const filteredInstances = instances.filter(i => i.id !== instanceId);
            await this.redisService.set(key, JSON.stringify(filteredInstances));
            this.logger.log(`Deregistered agent instance ${instanceId} for ${agentName}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error deregistering agent instance ${instanceId}: ${error.message}`);
            return false;
        }
    }
    async getAgentInstances(agentName) {
        try {
            const key = `${this.AGENT_INSTANCES_PREFIX}:${agentName}`;
            const instancesJson = await this.redisService.get(key);
            if (!instancesJson) {
                return [];
            }
            const instances = JSON.parse(instancesJson);
            return instances.map(instance => ({
                ...instance,
                lastHealthCheck: new Date(instance.lastHealthCheck)
            }));
        }
        catch (error) {
            this.logger.error(`Error retrieving agent instances for ${agentName}: ${error.message}`);
            return [];
        }
    }
    async updateInstanceLoad(agentName, instanceId, load) {
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
        }
        catch (error) {
            this.logger.error(`Error updating load for agent instance ${instanceId}: ${error.message}`);
            return false;
        }
    }
    async performHealthCheck(agentName) {
        try {
            const instances = await this.getAgentInstances(agentName);
            let unhealthyCount = 0;
            for (const instance of instances) {
                try {
                    const baseUrl = `http://${instance.host}:${instance.port}`;
                    this.agentConnector.updateAgentConfig(agentName, { baseUrl });
                    const isHealthy = await this.agentConnector.checkHealth(agentName);
                    instance.status = isHealthy ? 'healthy' : 'unhealthy';
                    instance.lastHealthCheck = new Date();
                    if (!isHealthy) {
                        unhealthyCount++;
                        this.logger.warn(`Agent instance ${instance.id} for ${agentName} is unhealthy`);
                    }
                }
                catch (error) {
                    instance.status = 'unhealthy';
                    instance.lastHealthCheck = new Date();
                    unhealthyCount++;
                    this.logger.error(`Health check failed for agent instance ${instance.id}: ${error.message}`);
                }
            }
            const key = `${this.AGENT_INSTANCES_PREFIX}:${agentName}`;
            await this.redisService.set(key, JSON.stringify(instances));
            if (unhealthyCount > 0) {
                this.logger.log(`Health check completed for ${agentName}: ${unhealthyCount} unhealthy instances`);
            }
            return unhealthyCount;
        }
        catch (error) {
            this.logger.error(`Error performing health check for ${agentName}: ${error.message}`);
            return 0;
        }
    }
    async getNextInstance(agentName, strategy = { type: 'least-connections' }, clientId) {
        try {
            const instances = await this.getAgentInstances(agentName);
            const healthyInstances = instances.filter(i => i.status === 'healthy');
            if (healthyInstances.length === 0) {
                this.logger.warn(`No healthy instances available for agent ${agentName}`);
                return null;
            }
            const availableInstances = healthyInstances.filter(i => i.load < 90);
            if (availableInstances.length === 0) {
                this.logger.warn(`No instances with available capacity for agent ${agentName}`);
                return healthyInstances[0];
            }
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
        }
        catch (error) {
            this.logger.error(`Error selecting next instance for agent ${agentName}: ${error.message}`);
            return null;
        }
    }
    async roundRobinSelect(instances, agentName) {
        const key = `${this.LOAD_BALANCER_PREFIX}:round_robin:${agentName}`;
        const indexStr = await this.redisService.get(key);
        let currentIndex = indexStr ? parseInt(indexStr, 10) : 0;
        const instance = instances[currentIndex % instances.length];
        const nextIndex = (currentIndex + 1) % instances.length;
        await this.redisService.set(key, nextIndex.toString());
        return instance;
    }
    leastConnectionsSelect(instances) {
        return instances.reduce((min, instance) => instance.load < min.load ? instance : min, instances[0]);
    }
    async weightedRoundRobinSelect(instances, weights, agentName) {
        const key = `${this.LOAD_BALANCER_PREFIX}:weighted_round_robin:${agentName}`;
        const indexStr = await this.redisService.get(key);
        let currentIndex = indexStr ? parseInt(indexStr, 10) : 0;
        const weightedInstances = [];
        for (const instance of instances) {
            const weight = weights[instance.id] || 1;
            for (let i = 0; i < weight; i++) {
                weightedInstances.push(instance);
            }
        }
        const instance = weightedInstances[currentIndex % weightedInstances.length];
        const nextIndex = (currentIndex + 1) % weightedInstances.length;
        await this.redisService.set(key, nextIndex.toString());
        return instance;
    }
    ipHashSelect(instances, clientId) {
        if (!clientId) {
            return this.leastConnectionsSelect(instances);
        }
        const hash = this.simpleHash(clientId);
        const index = hash % instances.length;
        return instances[index];
    }
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
};
exports.LoadBalancerService = LoadBalancerService;
exports.LoadBalancerService = LoadBalancerService = LoadBalancerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        agent_connector_service_1.AgentConnectorService])
], LoadBalancerService);
//# sourceMappingURL=load-balancer.service.js.map