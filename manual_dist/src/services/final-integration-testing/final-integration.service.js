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
var FinalIntegrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinalIntegrationService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let FinalIntegrationService = FinalIntegrationService_1 = class FinalIntegrationService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(FinalIntegrationService_1.name);
    }
    configure(config) {
        this.config = config;
        this.logger.log(`Final integration service configured with ${config.services.length} services`);
    }
    async executeSystemIntegration() {
        const startTime = Date.now();
        this.logger.log('Starting system integration process');
        const results = [];
        let successfulServices = 0;
        let failedServices = 0;
        for (const service of this.config.services) {
            try {
                const result = await this.testService(service);
                results.push(result);
                if (result.status === 'success') {
                    successfulServices++;
                }
                else {
                    failedServices++;
                }
            }
            catch (error) {
                const failureResult = {
                    service: service.name,
                    status: 'failure',
                    message: `Integration test failed: ${error.message}`,
                    timestamp: new Date(),
                    responseTime: 0,
                };
                results.push(failureResult);
                failedServices++;
                this.logger.error(`Service ${service.name} integration failed: ${error.message}`);
            }
        }
        const duration = Date.now() - startTime;
        const overallStatus = failedServices === 0 ? 'success' :
            successfulServices > 0 ? 'partial' : 'failure';
        const report = {
            overallStatus,
            totalServices: this.config.services.length,
            successfulServices,
            failedServices,
            results,
            timestamp: new Date(),
            duration,
        };
        this.logger.log(`System integration completed: ${overallStatus} (${successfulServices}/${this.config.services.length} services successful)`);
        return report;
    }
    async testService(service) {
        const startTime = Date.now();
        try {
            let lastError = null;
            for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
                try {
                    const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(service.url, {
                        timeout: service.timeout,
                    }));
                    const responseTime = Date.now() - startTime;
                    if (response.status === service.expectedStatus) {
                        return {
                            service: service.name,
                            status: 'success',
                            message: `Service is accessible and returned expected status ${response.status}`,
                            timestamp: new Date(),
                            responseTime,
                            details: {
                                status: response.status,
                                headers: response.headers,
                            },
                        };
                    }
                    else {
                        return {
                            service: service.name,
                            status: 'failure',
                            message: `Service returned unexpected status ${response.status}, expected ${service.expectedStatus}`,
                            timestamp: new Date(),
                            responseTime,
                            details: {
                                status: response.status,
                                headers: response.headers,
                            },
                        };
                    }
                }
                catch (error) {
                    lastError = error;
                    if (attempt < this.config.retryAttempts) {
                        this.logger.warn(`Service ${service.name} test failed (attempt ${attempt}/${this.config.retryAttempts}), retrying in ${this.config.retryDelay}ms: ${error.message}`);
                        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
                    }
                }
            }
            const responseTime = Date.now() - startTime;
            return {
                service: service.name,
                status: 'failure',
                message: `Service test failed after ${this.config.retryAttempts} attempts: ${lastError ? lastError.message : 'Unknown error'}`,
                timestamp: new Date(),
                responseTime,
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                service: service.name,
                status: 'failure',
                message: `Service test failed: ${error.message}`,
                timestamp: new Date(),
                responseTime,
            };
        }
    }
    validateIntegration(report) {
        return report.overallStatus === 'success';
    }
    getConfiguration() {
        return { ...this.config };
    }
    updateConfiguration(config) {
        this.config = { ...this.config, ...config };
        this.logger.log('Integration configuration updated');
    }
    addService(service) {
        this.config.services.push(service);
        this.logger.log(`Added service ${service.name} to integration test`);
    }
    removeService(serviceName) {
        this.config.services = this.config.services.filter(service => service.name !== serviceName);
        this.logger.log(`Removed service ${serviceName} from integration test`);
    }
};
exports.FinalIntegrationService = FinalIntegrationService;
exports.FinalIntegrationService = FinalIntegrationService = FinalIntegrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], FinalIntegrationService);
//# sourceMappingURL=final-integration.service.js.map