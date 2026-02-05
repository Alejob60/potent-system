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
var LoadBalancingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadBalancingService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let LoadBalancingService = LoadBalancingService_1 = class LoadBalancingService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(LoadBalancingService_1.name);
        this.serverHealth = new Map();
        this.currentIndex = 0;
        this.connectionCounts = new Map();
    }
    configure(config) {
        this.config = config;
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
        this.startHealthChecks();
    }
    getNextServer() {
        const healthyServers = this.config.servers.filter(server => server.active && this.isServerHealthy(server.url));
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
    roundRobin(servers) {
        const server = servers[this.currentIndex % servers.length];
        this.currentIndex = (this.currentIndex + 1) % servers.length;
        return server.url;
    }
    leastConnections(servers) {
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
    weightedRoundRobin(servers) {
        const totalWeight = servers.reduce((sum, server) => sum + (server.weight || 1), 0);
        let random = Math.floor(Math.random() * totalWeight);
        for (const server of servers) {
            const weight = server.weight || 1;
            if (random < weight) {
                return server.url;
            }
            random -= weight;
        }
        return servers[0].url;
    }
    isServerHealthy(url) {
        const health = this.serverHealth.get(url);
        return health ? health.healthy : false;
    }
    startHealthChecks() {
        setInterval(async () => {
            await this.performHealthChecks();
        }, this.config.healthCheckInterval);
    }
    async performHealthChecks() {
        for (const server of this.config.servers) {
            try {
                const startTime = Date.now();
                const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${server.url}/health`, {
                    timeout: this.config.timeout,
                }));
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
            }
            catch (error) {
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
    getServerHealth() {
        return Array.from(this.serverHealth.values());
    }
    addConnection(url) {
        const current = this.connectionCounts.get(url) || 0;
        this.connectionCounts.set(url, current + 1);
    }
    removeConnection(url) {
        const current = this.connectionCounts.get(url) || 0;
        this.connectionCounts.set(url, Math.max(0, current - 1));
    }
    getConnectionCount(url) {
        return this.connectionCounts.get(url) || 0;
    }
    addServer(server) {
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
    removeServer(url) {
        this.config.servers = this.config.servers.filter(server => server.url !== url);
        this.connectionCounts.delete(url);
        this.serverHealth.delete(url);
        this.logger.log(`Removed server ${url} from load balancer`);
    }
    updateServer(url, updates) {
        const server = this.config.servers.find(s => s.url === url);
        if (server) {
            Object.assign(server, updates);
            this.logger.log(`Updated server ${url} configuration`);
        }
    }
};
exports.LoadBalancingService = LoadBalancingService;
exports.LoadBalancingService = LoadBalancingService = LoadBalancingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], LoadBalancingService);
//# sourceMappingURL=load-balancing.service.js.map