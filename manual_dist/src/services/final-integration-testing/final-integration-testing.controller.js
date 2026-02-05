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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinalIntegrationTestingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const final_integration_service_1 = require("./final-integration.service");
const e2e_testing_service_1 = require("./e2e-testing.service");
const performance_testing_service_1 = require("./performance-testing.service");
const security_testing_service_1 = require("./security-testing.service");
const user_acceptance_testing_service_1 = require("./user-acceptance-testing.service");
const production_deployment_service_1 = require("./production-deployment.service");
const monitoring_implementation_service_1 = require("./monitoring-implementation.service");
const maintenance_procedures_service_1 = require("./maintenance-procedures.service");
const operational_documentation_service_1 = require("./operational-documentation.service");
let FinalIntegrationTestingController = class FinalIntegrationTestingController {
    constructor(finalIntegrationService, e2eTestingService, performanceTestingService, securityTestingService, userAcceptanceTestingService, productionDeploymentService, monitoringImplementationService, maintenanceProceduresService, operationalDocumentationService) {
        this.finalIntegrationService = finalIntegrationService;
        this.e2eTestingService = e2eTestingService;
        this.performanceTestingService = performanceTestingService;
        this.securityTestingService = securityTestingService;
        this.userAcceptanceTestingService = userAcceptanceTestingService;
        this.productionDeploymentService = productionDeploymentService;
        this.monitoringImplementationService = monitoringImplementationService;
        this.maintenanceProceduresService = maintenanceProceduresService;
        this.operationalDocumentationService = operationalDocumentationService;
    }
    async configureFinalIntegration(body) {
        try {
            if (!body.services || !body.integrationTimeout || !body.retryAttempts || !body.retryDelay) {
                throw new common_1.HttpException('Missing required fields', common_1.HttpStatus.BAD_REQUEST);
            }
            this.finalIntegrationService.configure(body);
            return {
                success: true,
                message: 'Final integration service configured successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to configure final integration service: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async executeSystemIntegration() {
        try {
            const report = await this.finalIntegrationService.executeSystemIntegration();
            return {
                success: true,
                report,
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to execute system integration: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async configureE2ETesting(body) {
        try {
            if (!body.testSuites || body.parallelExecution === undefined || !body.maxConcurrency ||
                !body.retryAttempts || !body.retryDelay) {
                throw new common_1.HttpException('Missing required fields', common_1.HttpStatus.BAD_REQUEST);
            }
            this.e2eTestingService.configure(body);
            return {
                success: true,
                message: 'E2E testing service configured successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to configure E2E testing service: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async executeE2ETests() {
        try {
            const report = await this.e2eTestingService.executeE2ETests();
            return {
                success: true,
                report,
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to execute E2E tests: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async configurePerformanceTesting(body) {
        try {
            if (!body.loadTests || !body.stressTests || !body.scalabilityTests || !body.metrics) {
                throw new common_1.HttpException('Missing required fields', common_1.HttpStatus.BAD_REQUEST);
            }
            this.performanceTestingService.configure(body);
            return {
                success: true,
                message: 'Performance testing service configured successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to configure performance testing service: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async executePerformanceTests() {
        try {
            const report = await this.performanceTestingService.executePerformanceTests();
            return {
                success: true,
                report,
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to execute performance tests: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async configureSecurityTesting(body) {
        try {
            if (!body.vulnerabilityScans || !body.penetrationTests || !body.complianceChecks || !body.securityMetrics) {
                throw new common_1.HttpException('Missing required fields', common_1.HttpStatus.BAD_REQUEST);
            }
            this.securityTestingService.configure(body);
            return {
                success: true,
                message: 'Security testing service configured successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to configure security testing service: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async executeSecurityTests() {
        try {
            const report = await this.securityTestingService.executeSecurityTests();
            return {
                success: true,
                report,
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to execute security tests: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async configureUAT(body) {
        try {
            if (!body.userStories || !body.testUsers || !body.testEnvironment || !body.uatMetrics) {
                throw new common_1.HttpException('Missing required fields', common_1.HttpStatus.BAD_REQUEST);
            }
            this.userAcceptanceTestingService.configure(body);
            return {
                success: true,
                message: 'UAT service configured successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to configure UAT service: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async executeUAT() {
        try {
            const report = await this.userAcceptanceTestingService.executeUAT();
            return {
                success: true,
                report,
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to execute UAT: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async configureDeployment(body) {
        try {
            if (!body.environments || !body.deploymentPipeline || !body.rollbackStrategy || !body.deploymentMetrics) {
                throw new common_1.HttpException('Missing required fields', common_1.HttpStatus.BAD_REQUEST);
            }
            this.productionDeploymentService.configure(body);
            return {
                success: true,
                message: 'Deployment service configured successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to configure deployment service: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async executeDeployment(environment, version) {
        try {
            const result = await this.productionDeploymentService.executeDeployment(environment, version);
            return {
                success: true,
                result,
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to execute deployment: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async configureMonitoring(body) {
        try {
            if (!body.metrics || !body.alerts || !body.dashboards || !body.monitoringMetrics) {
                throw new common_1.HttpException('Missing required fields', common_1.HttpStatus.BAD_REQUEST);
            }
            this.monitoringImplementationService.configure(body);
            return {
                success: true,
                message: 'Monitoring service configured successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to configure monitoring service: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async startMonitoring() {
        try {
            await this.monitoringImplementationService.startMonitoring();
            return {
                success: true,
                message: 'Monitoring service started successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to start monitoring service: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async configureMaintenance(body) {
        try {
            if (!body.routines || !body.backup || !body.monitoring || !body.maintenanceMetrics) {
                throw new common_1.HttpException('Missing required fields', common_1.HttpStatus.BAD_REQUEST);
            }
            this.maintenanceProceduresService.configure(body);
            return {
                success: true,
                message: 'Maintenance service configured successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to configure maintenance service: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async executeMaintenanceRoutine(routineName) {
        try {
            const execution = await this.maintenanceProceduresService.executeRoutine(routineName);
            return {
                success: true,
                execution,
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to execute maintenance routine: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async configureDocumentation(body) {
        try {
            if (!body.categories || !body.templates || !body.search || !body.documentationMetrics) {
                throw new common_1.HttpException('Missing required fields', common_1.HttpStatus.BAD_REQUEST);
            }
            this.operationalDocumentationService.configure(body);
            return {
                success: true,
                message: 'Documentation service configured successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to configure documentation service: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getDocument(documentId) {
        try {
            const content = this.operationalDocumentationService.getDocument(documentId);
            if (content === null) {
                throw new common_1.HttpException('Document not found', common_1.HttpStatus.NOT_FOUND);
            }
            return {
                success: true,
                content,
            };
        }
        catch (error) {
            if (error.status === common_1.HttpStatus.NOT_FOUND) {
                throw error;
            }
            throw new common_1.HttpException(`Failed to get document: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async searchDocumentation(query, category, tags) {
        try {
            if (!query) {
                throw new common_1.HttpException('Query parameter is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const tagArray = tags ? tags.split(',') : undefined;
            const results = this.operationalDocumentationService.searchDocumentation(query, category, tagArray);
            return {
                success: true,
                results,
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to search documentation: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.FinalIntegrationTestingController = FinalIntegrationTestingController;
__decorate([
    (0, common_1.Post)('integration/configure'),
    (0, swagger_1.ApiOperation)({
        summary: 'Configure final integration service',
        description: 'Configure the final integration service with specified settings',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Integration configuration',
        schema: {
            type: 'object',
            properties: {
                services: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            url: { type: 'string' },
                            expectedStatus: { type: 'number' },
                            timeout: { type: 'number' },
                        },
                        required: ['name', 'url', 'expectedStatus', 'timeout'],
                    },
                },
                integrationTimeout: { type: 'number' },
                retryAttempts: { type: 'number' },
                retryDelay: { type: 'number' },
            },
            required: ['services', 'integrationTimeout', 'retryAttempts', 'retryDelay'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Integration service configured successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinalIntegrationTestingController.prototype, "configureFinalIntegration", null);
__decorate([
    (0, common_1.Post)('integration/execute'),
    (0, swagger_1.ApiOperation)({
        summary: 'Execute system integration',
        description: 'Execute the system integration process',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'System integration executed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                report: { type: 'object' },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinalIntegrationTestingController.prototype, "executeSystemIntegration", null);
__decorate([
    (0, common_1.Post)('e2e/configure'),
    (0, swagger_1.ApiOperation)({
        summary: 'Configure E2E testing service',
        description: 'Configure the end-to-end testing service with specified settings',
    }),
    (0, swagger_1.ApiBody)({
        description: 'E2E test configuration',
        schema: {
            type: 'object',
            properties: {
                testSuites: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            description: { type: 'string' },
                            tests: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        description: { type: 'string' },
                                        endpoint: { type: 'string' },
                                        method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
                                        payload: { type: 'object' },
                                        expectedStatus: { type: 'number' },
                                        timeout: { type: 'number' },
                                    },
                                    required: ['name', 'description', 'endpoint', 'method', 'expectedStatus', 'timeout'],
                                },
                            },
                        },
                        required: ['name', 'description', 'tests'],
                    },
                },
                parallelExecution: { type: 'boolean' },
                maxConcurrency: { type: 'number' },
                retryAttempts: { type: 'number' },
                retryDelay: { type: 'number' },
            },
            required: ['testSuites', 'parallelExecution', 'maxConcurrency', 'retryAttempts', 'retryDelay'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'E2E testing service configured successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinalIntegrationTestingController.prototype, "configureE2ETesting", null);
__decorate([
    (0, common_1.Post)('e2e/execute'),
    (0, swagger_1.ApiOperation)({
        summary: 'Execute E2E tests',
        description: 'Execute the end-to-end tests',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'E2E tests executed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                report: { type: 'object' },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinalIntegrationTestingController.prototype, "executeE2ETests", null);
__decorate([
    (0, common_1.Post)('performance/configure'),
    (0, swagger_1.ApiOperation)({
        summary: 'Configure performance testing service',
        description: 'Configure the performance testing service with specified settings',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Performance test configuration',
        schema: {
            type: 'object',
            properties: {
                loadTests: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            description: { type: 'string' },
                            endpoint: { type: 'string' },
                            method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
                            payload: { type: 'object' },
                            concurrency: { type: 'number' },
                            duration: { type: 'number' },
                            rampUpTime: { type: 'number' },
                        },
                        required: ['name', 'description', 'endpoint', 'method', 'concurrency', 'duration', 'rampUpTime'],
                    },
                },
                stressTests: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            description: { type: 'string' },
                            endpoint: { type: 'string' },
                            method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
                            payload: { type: 'object' },
                            maxConcurrency: { type: 'number' },
                            rampUpTime: { type: 'number' },
                        },
                        required: ['name', 'description', 'endpoint', 'method', 'maxConcurrency', 'rampUpTime'],
                    },
                },
                scalabilityTests: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            description: { type: 'string' },
                            endpoint: { type: 'string' },
                            method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
                            payload: { type: 'object' },
                            concurrencyLevels: {
                                type: 'array',
                                items: { type: 'number' },
                            },
                            duration: { type: 'number' },
                        },
                        required: ['name', 'description', 'endpoint', 'method', 'concurrencyLevels', 'duration'],
                    },
                },
                metrics: {
                    type: 'object',
                    properties: {
                        responseTimeThreshold: { type: 'number' },
                        errorRateThreshold: { type: 'number' },
                        throughputThreshold: { type: 'number' },
                    },
                    required: ['responseTimeThreshold', 'errorRateThreshold', 'throughputThreshold'],
                },
            },
            required: ['loadTests', 'stressTests', 'scalabilityTests', 'metrics'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Performance testing service configured successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinalIntegrationTestingController.prototype, "configurePerformanceTesting", null);
__decorate([
    (0, common_1.Post)('performance/execute'),
    (0, swagger_1.ApiOperation)({
        summary: 'Execute performance tests',
        description: 'Execute the performance tests',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Performance tests executed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                report: { type: 'object' },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinalIntegrationTestingController.prototype, "executePerformanceTests", null);
__decorate([
    (0, common_1.Post)('security/configure'),
    (0, swagger_1.ApiOperation)({
        summary: 'Configure security testing service',
        description: 'Configure the security testing service with specified settings',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Security test configuration',
        schema: {
            type: 'object',
            properties: {
                vulnerabilityScans: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            description: { type: 'string' },
                            endpoint: { type: 'string' },
                            method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
                            payload: { type: 'object' },
                            testType: {
                                type: 'string',
                                enum: ['sql_injection', 'xss', 'csrf', 'command_injection', 'path_traversal', 'authentication_bypass']
                            },
                            expectedResponse: {
                                type: 'object',
                                properties: {
                                    status: { type: 'number' },
                                    bodyContains: { type: 'string' },
                                    bodyNotContains: { type: 'string' },
                                },
                            },
                        },
                        required: ['name', 'description', 'endpoint', 'method', 'testType'],
                    },
                },
                penetrationTests: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            description: { type: 'string' },
                            endpoint: { type: 'string' },
                            method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
                            payload: { type: 'object' },
                            authRequired: { type: 'boolean' },
                            expectedBehavior: { type: 'string', enum: ['authorized', 'unauthorized', 'rate_limited'] },
                        },
                        required: ['name', 'description', 'endpoint', 'method', 'authRequired', 'expectedBehavior'],
                    },
                },
                complianceChecks: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            description: { type: 'string' },
                            checkType: {
                                type: 'string',
                                enum: ['gdpr', 'ccpa', 'hipaa', 'pci_dss', 'soc2']
                            },
                            endpoint: { type: 'string' },
                            method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
                            payload: { type: 'object' },
                        },
                        required: ['name', 'description', 'checkType'],
                    },
                },
                securityMetrics: {
                    type: 'object',
                    properties: {
                        maxVulnerabilities: { type: 'number' },
                        maxCriticalVulnerabilities: { type: 'number' },
                        minComplianceScore: { type: 'number' },
                    },
                    required: ['maxVulnerabilities', 'maxCriticalVulnerabilities', 'minComplianceScore'],
                },
            },
            required: ['vulnerabilityScans', 'penetrationTests', 'complianceChecks', 'securityMetrics'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Security testing service configured successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinalIntegrationTestingController.prototype, "configureSecurityTesting", null);
__decorate([
    (0, common_1.Post)('security/execute'),
    (0, swagger_1.ApiOperation)({
        summary: 'Execute security tests',
        description: 'Execute the security tests',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Security tests executed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                report: { type: 'object' },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinalIntegrationTestingController.prototype, "executeSecurityTests", null);
__decorate([
    (0, common_1.Post)('uat/configure'),
    (0, swagger_1.ApiOperation)({
        summary: 'Configure UAT service',
        description: 'Configure the user acceptance testing service with specified settings',
    }),
    (0, swagger_1.ApiBody)({
        description: 'UAT configuration',
        schema: {
            type: 'object',
            properties: {
                userStories: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            title: { type: 'string' },
                            description: { type: 'string' },
                            priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                            acceptanceCriteria: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        description: { type: 'string' },
                                        testSteps: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    step: { type: 'number' },
                                                    action: { type: 'string' },
                                                    expectedOutcome: { type: 'string' },
                                                },
                                                required: ['step', 'action', 'expectedOutcome'],
                                            },
                                        },
                                        endpoint: { type: 'string' },
                                        method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
                                        payload: { type: 'object' },
                                        expectedStatus: { type: 'number' },
                                    },
                                    required: ['id', 'description', 'testSteps'],
                                },
                            },
                        },
                        required: ['id', 'title', 'description', 'priority', 'acceptanceCriteria'],
                    },
                },
                testUsers: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            role: { type: 'string' },
                            credentials: {
                                type: 'object',
                                properties: {
                                    username: { type: 'string' },
                                    password: { type: 'string' },
                                },
                                required: ['username', 'password'],
                            },
                        },
                        required: ['id', 'name', 'role', 'credentials'],
                    },
                },
                testEnvironment: {
                    type: 'object',
                    properties: {
                        baseUrl: { type: 'string' },
                        timeout: { type: 'number' },
                        retryAttempts: { type: 'number' },
                        retryDelay: { type: 'number' },
                    },
                    required: ['baseUrl', 'timeout', 'retryAttempts', 'retryDelay'],
                },
                uatMetrics: {
                    type: 'object',
                    properties: {
                        minPassRate: { type: 'number' },
                        maxCriticalFailures: { type: 'number' },
                        maxHighPriorityFailures: { type: 'number' },
                    },
                    required: ['minPassRate', 'maxCriticalFailures', 'maxHighPriorityFailures'],
                },
            },
            required: ['userStories', 'testUsers', 'testEnvironment', 'uatMetrics'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'UAT service configured successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinalIntegrationTestingController.prototype, "configureUAT", null);
__decorate([
    (0, common_1.Post)('uat/execute'),
    (0, swagger_1.ApiOperation)({
        summary: 'Execute UAT',
        description: 'Execute the user acceptance tests',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'UAT executed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                report: { type: 'object' },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinalIntegrationTestingController.prototype, "executeUAT", null);
__decorate([
    (0, common_1.Post)('deployment/configure'),
    (0, swagger_1.ApiOperation)({
        summary: 'Configure deployment service',
        description: 'Configure the production deployment service with specified settings',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Deployment configuration',
        schema: {
            type: 'object',
            properties: {
                environments: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            type: { type: 'string', enum: ['development', 'staging', 'production'] },
                            baseUrl: { type: 'string' },
                            credentials: {
                                type: 'object',
                                properties: {
                                    username: { type: 'string' },
                                    password: { type: 'string' },
                                },
                                required: ['username', 'password'],
                            },
                            deploymentTarget: { type: 'string' },
                        },
                        required: ['name', 'type', 'baseUrl', 'credentials', 'deploymentTarget'],
                    },
                },
                deploymentPipeline: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            stage: { type: 'string' },
                            description: { type: 'string' },
                            actions: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        type: { type: 'string', enum: ['build', 'test', 'deploy', 'validate', 'rollback'] },
                                        script: { type: 'string' },
                                        timeout: { type: 'number' },
                                        dependencies: {
                                            type: 'array',
                                            items: { type: 'string' },
                                        },
                                    },
                                    required: ['name', 'type', 'script', 'timeout', 'dependencies'],
                                },
                            },
                        },
                        required: ['stage', 'description', 'actions'],
                    },
                },
                rollbackStrategy: {
                    type: 'object',
                    properties: {
                        autoRollback: { type: 'boolean' },
                        rollbackConditions: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    metric: { type: 'string' },
                                    threshold: { type: 'number' },
                                    operator: { type: 'string', enum: ['>', '<', '>=', '<=', '=='] },
                                },
                                required: ['metric', 'threshold', 'operator'],
                            },
                        },
                        notificationChannels: {
                            type: 'array',
                            items: { type: 'string' },
                        },
                    },
                    required: ['autoRollback', 'rollbackConditions', 'notificationChannels'],
                },
                deploymentMetrics: {
                    type: 'object',
                    properties: {
                        maxDeploymentTime: { type: 'number' },
                        minSuccessRate: { type: 'number' },
                        maxRollbackAttempts: { type: 'number' },
                    },
                    required: ['maxDeploymentTime', 'minSuccessRate', 'maxRollbackAttempts'],
                },
            },
            required: ['environments', 'deploymentPipeline', 'rollbackStrategy', 'deploymentMetrics'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Deployment service configured successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinalIntegrationTestingController.prototype, "configureDeployment", null);
__decorate([
    (0, common_1.Post)('deployment/execute/:environment/:version'),
    (0, swagger_1.ApiOperation)({
        summary: 'Execute deployment',
        description: 'Execute deployment to specified environment and version',
    }),
    (0, swagger_1.ApiParam)({ name: 'environment', description: 'Target environment', type: 'string' }),
    (0, swagger_1.ApiParam)({ name: 'version', description: 'Version to deploy', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Deployment executed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                result: { type: 'object' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('environment')),
    __param(1, (0, common_1.Param)('version')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FinalIntegrationTestingController.prototype, "executeDeployment", null);
__decorate([
    (0, common_1.Post)('monitoring/configure'),
    (0, swagger_1.ApiOperation)({
        summary: 'Configure monitoring service',
        description: 'Configure the monitoring implementation service with specified settings',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Monitoring configuration',
        schema: {
            type: 'object',
            properties: {
                metrics: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            description: { type: 'string' },
                            type: { type: 'string', enum: ['counter', 'gauge', 'histogram', 'summary'] },
                            endpoint: { type: 'string' },
                            interval: { type: 'number' },
                            aggregation: { type: 'string', enum: ['avg', 'sum', 'min', 'max', 'count'] },
                        },
                        required: ['name', 'description', 'type', 'endpoint', 'interval', 'aggregation'],
                    },
                },
                alerts: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            description: { type: 'string' },
                            metric: { type: 'string' },
                            condition: {
                                type: 'object',
                                properties: {
                                    operator: { type: 'string', enum: ['>', '<', '>=', '<=', '==', '!='] },
                                    threshold: { type: 'number' },
                                    duration: { type: 'number' },
                                },
                                required: ['operator', 'threshold', 'duration'],
                            },
                            severity: { type: 'string', enum: ['info', 'warning', 'error', 'critical'] },
                            notifications: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        channel: { type: 'string', enum: ['email', 'slack', 'webhook', 'sms'] },
                                        target: { type: 'string' },
                                    },
                                    required: ['channel', 'target'],
                                },
                            },
                        },
                        required: ['name', 'description', 'metric', 'condition', 'severity', 'notifications'],
                    },
                },
                dashboards: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            description: { type: 'string' },
                            metrics: {
                                type: 'array',
                                items: { type: 'string' },
                            },
                            refreshInterval: { type: 'number' },
                        },
                        required: ['name', 'description', 'metrics', 'refreshInterval'],
                    },
                },
                monitoringMetrics: {
                    type: 'object',
                    properties: {
                        maxAlertLatency: { type: 'number' },
                        minAlertAccuracy: { type: 'number' },
                        maxDashboardLoadTime: { type: 'number' },
                    },
                    required: ['maxAlertLatency', 'minAlertAccuracy', 'maxDashboardLoadTime'],
                },
            },
            required: ['metrics', 'alerts', 'dashboards', 'monitoringMetrics'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Monitoring service configured successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinalIntegrationTestingController.prototype, "configureMonitoring", null);
__decorate([
    (0, common_1.Post)('monitoring/start'),
    (0, swagger_1.ApiOperation)({
        summary: 'Start monitoring',
        description: 'Start the monitoring service',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Monitoring service started successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinalIntegrationTestingController.prototype, "startMonitoring", null);
__decorate([
    (0, common_1.Post)('maintenance/configure'),
    (0, swagger_1.ApiOperation)({
        summary: 'Configure maintenance service',
        description: 'Configure the maintenance procedures service with specified settings',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Maintenance configuration',
        schema: {
            type: 'object',
            properties: {
                routines: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            description: { type: 'string' },
                            type: { type: 'string', enum: ['backup', 'cleanup', 'optimization', 'update', 'diagnostic'] },
                            schedule: {
                                type: 'object',
                                properties: {
                                    frequency: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'custom'] },
                                    time: { type: 'string' },
                                    timezone: { type: 'string' },
                                },
                                required: ['frequency', 'time', 'timezone'],
                            },
                            execution: {
                                type: 'object',
                                properties: {
                                    script: { type: 'string' },
                                    timeout: { type: 'number' },
                                    retryAttempts: { type: 'number' },
                                    retryDelay: { type: 'number' },
                                },
                                required: ['script', 'timeout', 'retryAttempts', 'retryDelay'],
                            },
                            notifications: {
                                type: 'object',
                                properties: {
                                    onSuccess: { type: 'boolean' },
                                    onFailure: { type: 'boolean' },
                                    channels: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                type: { type: 'string', enum: ['email', 'slack', 'webhook', 'sms'] },
                                                target: { type: 'string' },
                                            },
                                            required: ['type', 'target'],
                                        },
                                    },
                                },
                                required: ['onSuccess', 'onFailure', 'channels'],
                            },
                        },
                        required: ['name', 'description', 'type', 'schedule', 'execution', 'notifications'],
                    },
                },
                backup: {
                    type: 'object',
                    properties: {
                        retention: {
                            type: 'object',
                            properties: {
                                daily: { type: 'number' },
                                weekly: { type: 'number' },
                                monthly: { type: 'number' },
                            },
                            required: ['daily', 'weekly', 'monthly'],
                        },
                        storage: {
                            type: 'object',
                            properties: {
                                primary: { type: 'string' },
                                secondary: { type: 'string' },
                                encryption: { type: 'boolean' },
                            },
                            required: ['primary', 'secondary', 'encryption'],
                        },
                    },
                    required: ['retention', 'storage'],
                },
                monitoring: {
                    type: 'object',
                    properties: {
                        healthCheckInterval: { type: 'number' },
                        alertThresholds: {
                            type: 'object',
                            properties: {
                                cpu: { type: 'number' },
                                memory: { type: 'number' },
                                disk: { type: 'number' },
                                responseTime: { type: 'number' },
                            },
                            required: ['cpu', 'memory', 'disk', 'responseTime'],
                        },
                    },
                    required: ['healthCheckInterval', 'alertThresholds'],
                },
                maintenanceMetrics: {
                    type: 'object',
                    properties: {
                        maxRoutineDuration: { type: 'number' },
                        minSuccessRate: { type: 'number' },
                        maxConsecutiveFailures: { type: 'number' },
                    },
                    required: ['maxRoutineDuration', 'minSuccessRate', 'maxConsecutiveFailures'],
                },
            },
            required: ['routines', 'backup', 'monitoring', 'maintenanceMetrics'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Maintenance service configured successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinalIntegrationTestingController.prototype, "configureMaintenance", null);
__decorate([
    (0, common_1.Post)('maintenance/execute/:routineName'),
    (0, swagger_1.ApiOperation)({
        summary: 'Execute maintenance routine',
        description: 'Execute specified maintenance routine',
    }),
    (0, swagger_1.ApiParam)({ name: 'routineName', description: 'Name of routine to execute', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Maintenance routine executed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                execution: { type: 'object' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('routineName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinalIntegrationTestingController.prototype, "executeMaintenanceRoutine", null);
__decorate([
    (0, common_1.Post)('documentation/configure'),
    (0, swagger_1.ApiOperation)({
        summary: 'Configure documentation service',
        description: 'Configure the operational documentation service with specified settings',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Documentation configuration',
        schema: {
            type: 'object',
            properties: {
                categories: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            description: { type: 'string' },
                            documents: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        title: { type: 'string' },
                                        description: { type: 'string' },
                                        content: { type: 'string' },
                                        format: { type: 'string', enum: ['markdown', 'html', 'text'] },
                                        version: { type: 'string' },
                                        lastUpdated: { type: 'string', format: 'date-time' },
                                        tags: {
                                            type: 'array',
                                            items: { type: 'string' },
                                        },
                                        relatedDocuments: {
                                            type: 'array',
                                            items: { type: 'string' },
                                        },
                                    },
                                    required: ['id', 'title', 'description', 'content', 'format', 'version', 'lastUpdated', 'tags', 'relatedDocuments'],
                                },
                            },
                        },
                        required: ['name', 'description', 'documents'],
                    },
                },
                templates: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            description: { type: 'string' },
                            content: { type: 'string' },
                            variables: {
                                type: 'array',
                                items: { type: 'string' },
                            },
                        },
                        required: ['name', 'description', 'content', 'variables'],
                    },
                },
                search: {
                    type: 'object',
                    properties: {
                        indexing: {
                            type: 'object',
                            properties: {
                                enabled: { type: 'boolean' },
                                frequency: { type: 'number' },
                            },
                            required: ['enabled', 'frequency'],
                        },
                        suggestions: {
                            type: 'object',
                            properties: {
                                enabled: { type: 'boolean' },
                                maxSuggestions: { type: 'number' },
                            },
                            required: ['enabled', 'maxSuggestions'],
                        },
                    },
                    required: ['indexing', 'suggestions'],
                },
                documentationMetrics: {
                    type: 'object',
                    properties: {
                        minDocumentationCoverage: { type: 'number' },
                        maxOutdatedThreshold: { type: 'number' },
                        minSearchRelevance: { type: 'number' },
                    },
                    required: ['minDocumentationCoverage', 'maxOutdatedThreshold', 'minSearchRelevance'],
                },
            },
            required: ['categories', 'templates', 'search', 'documentationMetrics'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Documentation service configured successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinalIntegrationTestingController.prototype, "configureDocumentation", null);
__decorate([
    (0, common_1.Get)('documentation/:documentId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get document',
        description: 'Get document by ID',
    }),
    (0, swagger_1.ApiParam)({ name: 'documentId', description: 'Document ID', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Document retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                content: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('documentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinalIntegrationTestingController.prototype, "getDocument", null);
__decorate([
    (0, common_1.Get)('documentation/search'),
    (0, swagger_1.ApiOperation)({
        summary: 'Search documentation',
        description: 'Search documentation with query and optional filters',
    }),
    (0, swagger_1.ApiQuery)({ name: 'query', description: 'Search query', type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'category', description: 'Category filter', required: false, type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'tags', description: 'Tags filter (comma-separated)', required: false, type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Search completed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                results: {
                    type: 'array',
                    items: { type: 'object' },
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('tags')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], FinalIntegrationTestingController.prototype, "searchDocumentation", null);
exports.FinalIntegrationTestingController = FinalIntegrationTestingController = __decorate([
    (0, swagger_1.ApiTags)('Final Integration & Testing'),
    (0, common_1.Controller)('final-integration-testing'),
    __metadata("design:paramtypes", [final_integration_service_1.FinalIntegrationService,
        e2e_testing_service_1.E2ETestingService,
        performance_testing_service_1.PerformanceTestingService,
        security_testing_service_1.SecurityTestingService,
        user_acceptance_testing_service_1.UserAcceptanceTestingService,
        production_deployment_service_1.ProductionDeploymentService,
        monitoring_implementation_service_1.MonitoringImplementationService,
        maintenance_procedures_service_1.MaintenanceProceduresService,
        operational_documentation_service_1.OperationalDocumentationService])
], FinalIntegrationTestingController);
//# sourceMappingURL=final-integration-testing.controller.js.map