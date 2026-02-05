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
var E2ETestingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.E2ETestingService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let E2ETestingService = E2ETestingService_1 = class E2ETestingService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(E2ETestingService_1.name);
    }
    configure(config) {
        this.config = config;
        this.logger.log(`E2E testing service configured with ${config.testSuites.length} test suites`);
    }
    async executeE2ETests() {
        const startTime = Date.now();
        this.logger.log('Starting end-to-end testing process');
        const suiteResults = [];
        let totalTests = 0;
        let passedTests = 0;
        let failedTests = 0;
        let skippedTests = 0;
        let passedSuites = 0;
        let failedSuites = 0;
        for (const suite of this.config.testSuites) {
            try {
                const suiteResult = await this.executeTestSuite(suite);
                suiteResults.push(suiteResult);
                totalTests += suiteResult.totalTests;
                passedTests += suiteResult.passedTests;
                failedTests += suiteResult.failedTests;
                skippedTests += suiteResult.skippedTests;
                if (suiteResult.status === 'passed') {
                    passedSuites++;
                }
                else if (suiteResult.status === 'failed') {
                    failedSuites++;
                }
            }
            catch (error) {
                const failedSuiteResult = {
                    suiteName: suite.name,
                    status: 'failed',
                    totalTests: 0,
                    passedTests: 0,
                    failedTests: 0,
                    skippedTests: 0,
                    results: [{
                            testName: 'Suite Execution',
                            testSuite: suite.name,
                            status: 'failed',
                            message: `Test suite execution failed: ${error.message}`,
                            timestamp: new Date(),
                            responseTime: 0,
                        }],
                    timestamp: new Date(),
                    duration: 0,
                };
                suiteResults.push(failedSuiteResult);
                failedSuites++;
                this.logger.error(`Test suite ${suite.name} execution failed: ${error.message}`);
            }
        }
        const duration = Date.now() - startTime;
        const overallStatus = failedSuites === 0 ? 'passed' :
            passedSuites > 0 ? 'partial' : 'failed';
        const report = {
            overallStatus,
            totalSuites: this.config.testSuites.length,
            passedSuites,
            failedSuites,
            totalTests,
            passedTests,
            failedTests,
            skippedTests,
            suiteResults,
            timestamp: new Date(),
            duration,
        };
        this.logger.log(`E2E testing completed: ${overallStatus} (${passedTests}/${totalTests} tests passed)`);
        return report;
    }
    async executeTestSuite(suite) {
        const startTime = Date.now();
        this.logger.log(`Executing test suite: ${suite.name}`);
        const results = [];
        let passedTests = 0;
        let failedTests = 0;
        let skippedTests = 0;
        for (const test of suite.tests) {
            try {
                const result = await this.executeTest(test, suite.name);
                results.push(result);
                if (result.status === 'passed') {
                    passedTests++;
                }
                else if (result.status === 'failed') {
                    failedTests++;
                }
                else {
                    skippedTests++;
                }
            }
            catch (error) {
                const failureResult = {
                    testName: test.name,
                    testSuite: suite.name,
                    status: 'failed',
                    message: `Test execution failed: ${error.message}`,
                    timestamp: new Date(),
                    responseTime: 0,
                };
                results.push(failureResult);
                failedTests++;
                this.logger.error(`Test ${test.name} execution failed: ${error.message}`);
            }
        }
        const duration = Date.now() - startTime;
        const status = failedTests === 0 ? 'passed' :
            passedTests > 0 ? 'partial' : 'failed';
        const suiteResult = {
            suiteName: suite.name,
            status,
            totalTests: suite.tests.length,
            passedTests,
            failedTests,
            skippedTests,
            results,
            timestamp: new Date(),
            duration,
        };
        this.logger.log(`Test suite ${suite.name} completed: ${status} (${passedTests}/${suite.tests.length} tests passed)`);
        return suiteResult;
    }
    async executeTest(test, suiteName) {
        const startTime = Date.now();
        try {
            let lastError = null;
            for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
                try {
                    let response;
                    switch (test.method) {
                        case 'GET':
                            response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(test.endpoint, {
                                timeout: test.timeout,
                            }));
                            break;
                        case 'POST':
                            response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(test.endpoint, test.payload, {
                                timeout: test.timeout,
                            }));
                            break;
                        case 'PUT':
                            response = await (0, rxjs_1.firstValueFrom)(this.httpService.put(test.endpoint, test.payload, {
                                timeout: test.timeout,
                            }));
                            break;
                        case 'DELETE':
                            response = await (0, rxjs_1.firstValueFrom)(this.httpService.delete(test.endpoint, {
                                timeout: test.timeout,
                            }));
                            break;
                        case 'PATCH':
                            response = await (0, rxjs_1.firstValueFrom)(this.httpService.patch(test.endpoint, test.payload, {
                                timeout: test.timeout,
                            }));
                            break;
                    }
                    const responseTime = Date.now() - startTime;
                    if (response.status === test.expectedStatus) {
                        if (test.validation) {
                            const isValid = test.validation(response.data);
                            if (!isValid) {
                                return {
                                    testName: test.name,
                                    testSuite: suiteName,
                                    status: 'failed',
                                    message: 'Test validation failed',
                                    timestamp: new Date(),
                                    responseTime,
                                    details: {
                                        status: response.status,
                                        data: response.data,
                                    },
                                };
                            }
                        }
                        return {
                            testName: test.name,
                            testSuite: suiteName,
                            status: 'passed',
                            message: `Test passed with status ${response.status}`,
                            timestamp: new Date(),
                            responseTime,
                            details: {
                                status: response.status,
                                data: response.data,
                            },
                        };
                    }
                    else {
                        return {
                            testName: test.name,
                            testSuite: suiteName,
                            status: 'failed',
                            message: `Test failed: expected status ${test.expectedStatus}, got ${response.status}`,
                            timestamp: new Date(),
                            responseTime,
                            details: {
                                status: response.status,
                                data: response.data,
                            },
                        };
                    }
                }
                catch (error) {
                    lastError = error;
                    if (attempt < this.config.retryAttempts) {
                        this.logger.warn(`Test ${test.name} failed (attempt ${attempt}/${this.config.retryAttempts}), retrying in ${this.config.retryDelay}ms: ${error.message}`);
                        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
                    }
                }
            }
            const responseTime = Date.now() - startTime;
            return {
                testName: test.name,
                testSuite: suiteName,
                status: 'failed',
                message: `Test failed after ${this.config.retryAttempts} attempts: ${lastError ? lastError.message : 'Unknown error'}`,
                timestamp: new Date(),
                responseTime,
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                testName: test.name,
                testSuite: suiteName,
                status: 'failed',
                message: `Test execution failed: ${error.message}`,
                timestamp: new Date(),
                responseTime,
            };
        }
    }
    validateE2ETesting(report) {
        return report.overallStatus === 'passed';
    }
    getConfiguration() {
        return { ...this.config };
    }
    updateConfiguration(config) {
        this.config = { ...this.config, ...config };
        this.logger.log('E2E testing configuration updated');
    }
    addTestSuite(suite) {
        this.config.testSuites.push(suite);
        this.logger.log(`Added test suite ${suite.name}`);
    }
    removeTestSuite(suiteName) {
        this.config.testSuites = this.config.testSuites.filter(suite => suite.name !== suiteName);
        this.logger.log(`Removed test suite ${suiteName}`);
    }
};
exports.E2ETestingService = E2ETestingService;
exports.E2ETestingService = E2ETestingService = E2ETestingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], E2ETestingService);
//# sourceMappingURL=e2e-testing.service.js.map