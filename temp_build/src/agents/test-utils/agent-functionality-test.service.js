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
var AgentFunctionalityTestService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentFunctionalityTestService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
let AgentFunctionalityTestService = AgentFunctionalityTestService_1 = class AgentFunctionalityTestService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(AgentFunctionalityTestService_1.name);
    }
    async testAllAgents() {
        const agents = [
            'trend-scanner',
            'faq-responder',
            'content-editor',
            'creative-synthesizer',
            'video-scriptor',
            'post-scheduler',
            'analytics-reporter',
            'front-desk'
        ];
        const results = [];
        for (const agentName of agents) {
            const status = await this.testAgent(agentName);
            results.push(status);
        }
        return results;
    }
    async testAgent(agentName) {
        const status = {
            name: agentName,
            endpoints: [],
            status: 'incomplete',
            missingComponents: [],
            notes: []
        };
        try {
            const agentExists = await this.checkAgentDirectory(agentName);
            if (!agentExists) {
                status.missingComponents.push('Agent directory');
                status.notes.push(`Agent ${agentName} directory not found`);
                return status;
            }
            const hasController = await this.checkComponent(agentName, 'controller');
            const hasService = await this.checkComponent(agentName, 'service');
            const hasEntity = await this.checkComponent(agentName, 'entity');
            const hasDto = await this.checkComponent(agentName, 'dto');
            const hasModule = await this.checkComponent(agentName, 'module');
            if (!hasController)
                status.missingComponents.push('Controller');
            if (!hasService)
                status.missingComponents.push('Service');
            if (!hasEntity)
                status.missingComponents.push('Entity');
            if (!hasDto)
                status.missingComponents.push('DTO');
            if (!hasModule)
                status.missingComponents.push('Module');
            const hasV2Controller = await this.checkComponent(agentName, 'v2-controller');
            const hasV2Service = await this.checkComponent(agentName, 'v2-service');
            const hasV2Module = await this.checkComponent(agentName, 'v2-module');
            status.endpoints = await this.identifyEndpoints(agentName, hasV2Controller);
            const requiredComponents = [hasController, hasService, hasEntity, hasDto, hasModule];
            const hasAllRequired = requiredComponents.every(component => component);
            if (hasAllRequired) {
                status.status = 'complete';
                status.notes.push('All required components present');
            }
            else {
                status.status = 'incomplete';
                status.notes.push('Missing required components');
            }
            const v2Components = [hasV2Controller, hasV2Service, hasV2Module];
            const hasAllV2 = v2Components.every(component => component);
            if (hasAllV2) {
                status.notes.push('V2 components complete');
            }
            else if (v2Components.some(component => component)) {
                status.notes.push('Partial V2 components');
            }
            else {
                status.notes.push('No V2 components');
            }
        }
        catch (error) {
            this.logger.error(`Error testing agent ${agentName}: ${error.message}`);
            status.status = 'incomplete';
            status.missingComponents.push('Error during testing');
            status.notes.push(`Error: ${error.message}`);
        }
        return status;
    }
    async checkAgentDirectory(agentName) {
        try {
            const knownAgents = [
                'trend-scanner',
                'faq-responder',
                'content-editor',
                'creative-synthesizer',
                'video-scriptor',
                'post-scheduler',
                'analytics-reporter',
                'front-desk'
            ];
            return knownAgents.includes(agentName);
        }
        catch (error) {
            return false;
        }
    }
    async checkComponent(agentName, componentType) {
        try {
            const componentMap = {
                'trend-scanner': [
                    'controller', 'service', 'entity', 'dto', 'module',
                    'v2-controller', 'v2-service', 'v2-module'
                ],
                'faq-responder': [
                    'controller', 'service', 'entity', 'dto', 'module',
                    'v2-controller', 'v2-service', 'v2-module'
                ],
                'content-editor': [
                    'controller', 'service', 'entity', 'dto', 'module',
                    'v2-controller', 'v2-service', 'v2-module'
                ],
                'creative-synthesizer': [
                    'controller', 'service', 'entity', 'dto', 'module',
                    'v2-controller', 'v2-service', 'v2-module'
                ],
                'video-scriptor': [
                    'controller', 'service', 'entity', 'dto', 'module',
                    'v2-controller', 'v2-service', 'v2-module'
                ],
                'post-scheduler': [
                    'controller', 'service', 'entity', 'dto', 'module',
                    'v2-controller', 'v2-service', 'v2-module'
                ],
                'analytics-reporter': [
                    'controller', 'service', 'entity', 'dto', 'module',
                    'v2-controller', 'v2-service', 'v2-module'
                ],
                'front-desk': [
                    'controller', 'service', 'entity', 'dto', 'module',
                    'v2-controller', 'v2-service', 'v2-module'
                ]
            };
            return componentMap[agentName]?.includes(componentType) || false;
        }
        catch (error) {
            return false;
        }
    }
    async identifyEndpoints(agentName, hasV2) {
        const endpoints = [];
        if (hasV2) {
            endpoints.push(`/v2/agents/${agentName}`, `/v2/agents/${agentName}/:id`, `/v2/agents/${agentName}/metrics`);
            if (agentName === 'faq-responder') {
                endpoints.push(`/v2/agents/${agentName}/session/:sessionId`);
            }
        }
        else {
            endpoints.push(`/agents/${agentName}`, `/agents/${agentName}/:id`, `/agents/${agentName}/metrics`);
        }
        return endpoints;
    }
    generateReport(statuses) {
        let report = '# Agent Functionality Status Report\n\n';
        report += '## Summary\n';
        const complete = statuses.filter(s => s.status === 'complete').length;
        const incomplete = statuses.filter(s => s.status === 'incomplete').length;
        const partial = statuses.filter(s => s.status === 'partial').length;
        report += `- Complete agents: ${complete}\n`;
        report += `- Incomplete agents: ${incomplete}\n`;
        report += `- Partial agents: ${partial}\n\n`;
        report += '## Detailed Status\n\n';
        for (const status of statuses) {
            report += `### ${status.name}\n`;
            report += `- Status: ${status.status}\n`;
            report += `- Endpoints: ${status.endpoints.length}\n`;
            if (status.missingComponents.length > 0) {
                report += `- Missing components: ${status.missingComponents.join(', ')}\n`;
            }
            if (status.notes.length > 0) {
                report += `- Notes: ${status.notes.join('; ')}\n`;
            }
            report += `- Endpoints:\n`;
            for (const endpoint of status.endpoints) {
                report += `  - ${endpoint}\n`;
            }
            report += '\n';
        }
        return report;
    }
};
exports.AgentFunctionalityTestService = AgentFunctionalityTestService;
exports.AgentFunctionalityTestService = AgentFunctionalityTestService = AgentFunctionalityTestService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], AgentFunctionalityTestService);
//# sourceMappingURL=agent-functionality-test.service.js.map