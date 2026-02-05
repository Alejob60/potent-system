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
var AgentConnectorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentConnectorService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let AgentConnectorService = AgentConnectorService_1 = class AgentConnectorService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(AgentConnectorService_1.name);
        this.agentConfigs = {};
        this.initializeAgentConfigs();
    }
    initializeAgentConfigs() {
        this.agentConfigs['trend-scanner'] = {
            baseUrl: process.env.AGENT_TREND_SCANNER_URL || 'http://localhost:3007/api/v1/agents/trend-scanner',
            timeout: 30000,
            retries: 3,
        };
        this.agentConfigs['video-scriptor'] = {
            baseUrl: process.env.AGENT_VIDEO_SCRIPTOR_URL || 'http://localhost:3007/api/v1/agents/video-scriptor',
            timeout: 45000,
            retries: 3,
        };
        this.agentConfigs['faq-responder'] = {
            baseUrl: process.env.AGENT_FAQ_RESPONDER_URL || 'http://localhost:3007/api/v1/agents/faq-responder',
            timeout: 20000,
            retries: 2,
        };
        this.agentConfigs['post-scheduler'] = {
            baseUrl: process.env.AGENT_POST_SCHEDULER_URL || 'http://localhost:3007/api/v1/agents/post-scheduler',
            timeout: 25000,
            retries: 2,
        };
        this.agentConfigs['analytics-reporter'] = {
            baseUrl: process.env.AGENT_ANALYTICS_REPORTER_URL || 'http://localhost:3007/api/v1/agents/analytics-reporter',
            timeout: 40000,
            retries: 3,
        };
        this.agentConfigs['front-desk'] = {
            baseUrl: process.env.AGENT_FRONT_DESK_URL || 'http://localhost:3007/api/v1/agents/front-desk',
            timeout: 15000,
            retries: 2,
        };
    }
    async execute(agentName, method, path = '', data, config) {
        const startTime = Date.now();
        const agentConfig = { ...this.agentConfigs[agentName], ...config };
        if (!agentConfig) {
            return {
                success: false,
                error: {
                    message: `Agent ${agentName} not configured`,
                    code: 'AGENT_NOT_CONFIGURED'
                },
                metadata: {
                    duration: 0,
                    timestamp: new Date(),
                    retries: 0
                }
            };
        }
        const url = `${agentConfig.baseUrl}${path}`;
        let retries = 0;
        let lastError;
        while (retries <= (agentConfig.retries || 0)) {
            try {
                this.logger.log(`Executing ${method} request to ${agentName} at ${url} (attempt ${retries + 1})`);
                let response;
                switch (method) {
                    case 'GET':
                        response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, {
                            headers: agentConfig.headers,
                            timeout: agentConfig.timeout
                        }).pipe((0, rxjs_1.timeout)(agentConfig.timeout || 30000), (0, rxjs_1.catchError)((error) => {
                            throw error;
                        })));
                        break;
                    case 'POST':
                        response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, data, {
                            headers: agentConfig.headers,
                            timeout: agentConfig.timeout
                        }).pipe((0, rxjs_1.timeout)(agentConfig.timeout || 30000), (0, rxjs_1.catchError)((error) => {
                            throw error;
                        })));
                        break;
                    case 'PUT':
                        response = await (0, rxjs_1.firstValueFrom)(this.httpService.put(url, data, {
                            headers: agentConfig.headers,
                            timeout: agentConfig.timeout
                        }).pipe((0, rxjs_1.timeout)(agentConfig.timeout || 30000), (0, rxjs_1.catchError)((error) => {
                            throw error;
                        })));
                        break;
                    case 'DELETE':
                        response = await (0, rxjs_1.firstValueFrom)(this.httpService.delete(url, {
                            headers: agentConfig.headers,
                            timeout: agentConfig.timeout
                        }).pipe((0, rxjs_1.timeout)(agentConfig.timeout || 30000), (0, rxjs_1.catchError)((error) => {
                            throw error;
                        })));
                        break;
                    default:
                        throw new Error(`Unsupported HTTP method: ${method}`);
                }
                const duration = Date.now() - startTime;
                this.logger.log(`Successfully executed ${method} request to ${agentName} in ${duration}ms`);
                return {
                    success: true,
                    data: response.data,
                    metadata: {
                        duration,
                        timestamp: new Date(),
                        retries
                    }
                };
            }
            catch (error) {
                retries++;
                lastError = error;
                this.logger.warn(`Attempt ${retries} failed for ${agentName}: ${error.message}`);
                if (retries > (agentConfig.retries || 0)) {
                    break;
                }
                const delay = Math.min(1000 * Math.pow(2, retries - 1), 10000);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        const duration = Date.now() - startTime;
        const errorMessage = lastError ? lastError.message : 'Unknown error';
        this.logger.error(`All attempts failed for ${agentName}: ${errorMessage}`, lastError?.stack);
        return {
            success: false,
            error: {
                message: errorMessage,
                code: lastError ? lastError.code : undefined,
                status: lastError ? lastError.response?.status : undefined,
                details: lastError
            },
            metadata: {
                duration,
                timestamp: new Date(),
                retries: agentConfig.retries || 0
            }
        };
    }
    async post(agentName, data, path = '', config) {
        return this.execute(agentName, 'POST', path, data, config);
    }
    async get(agentName, path = '', config) {
        return this.execute(agentName, 'GET', path, undefined, config);
    }
    async put(agentName, data, path = '', config) {
        return this.execute(agentName, 'PUT', path, data, config);
    }
    async delete(agentName, path = '', config) {
        return this.execute(agentName, 'DELETE', path, undefined, config);
    }
    async checkHealth(agentName) {
        try {
            const result = await this.get(agentName, '/health');
            return result.success && result.data && result.data.status === 'healthy';
        }
        catch (error) {
            this.logger.error(`Health check failed for ${agentName}: ${error.message}`);
            return false;
        }
    }
    getAgentConfig(agentName) {
        return this.agentConfigs[agentName];
    }
    updateAgentConfig(agentName, config) {
        if (this.agentConfigs[agentName]) {
            this.agentConfigs[agentName] = { ...this.agentConfigs[agentName], ...config };
        }
        else {
            this.agentConfigs[agentName] = config;
        }
    }
};
exports.AgentConnectorService = AgentConnectorService;
exports.AgentConnectorService = AgentConnectorService = AgentConnectorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], AgentConnectorService);
//# sourceMappingURL=agent-connector.service.js.map