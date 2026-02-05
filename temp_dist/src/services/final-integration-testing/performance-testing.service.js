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
var PerformanceTestingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceTestingService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let PerformanceTestingService = PerformanceTestingService_1 = class PerformanceTestingService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(PerformanceTestingService_1.name);
    }
    configure(config) {
        this.config = config;
        this.logger.log('Performance testing service configured');
    }
    async executePerformanceTests() {
        const startTime = Date.now();
        this.logger.log('Starting performance testing process');
        const loadTestResults = [];
        for (const test of this.config.loadTests) {
            try {
                const result = await this.executeLoadTest(test);
                loadTestResults.push(result);
            }
            catch (error) {
                const failedResult = {
                    testName: test.name,
                    status: 'failed',
                    metrics: {
                        responseTime: {
                            avg: 0,
                            min: 0,
                            max: 0,
                            p50: 0,
                            p90: 0,
                            p95: 0,
                            p99: 0,
                        },
                        throughput: {
                            requestsPerSecond: 0,
                            totalRequests: 0,
                            successfulRequests: 0,
                            failedRequests: 0,
                            errorRate: 0,
                        },
                        concurrency: test.concurrency,
                        timestamp: new Date(),
                    },
                    message: `Load test execution failed: ${error.message}`,
                    timestamp: new Date(),
                    duration: 0,
                };
                loadTestResults.push(failedResult);
                this.logger.error(`Load test ${test.name} execution failed: ${error.message}`);
            }
        }
        const stressTestResults = [];
        for (const test of this.config.stressTests) {
            try {
                const result = await this.executeStressTest(test);
                stressTestResults.push(result);
            }
            catch (error) {
                const failedResult = {
                    testName: test.name,
                    status: 'failed',
                    metrics: {
                        responseTime: {
                            avg: 0,
                            min: 0,
                            max: 0,
                            p50: 0,
                            p90: 0,
                            p95: 0,
                            p99: 0,
                        },
                        throughput: {
                            requestsPerSecond: 0,
                            totalRequests: 0,
                            successfulRequests: 0,
                            failedRequests: 0,
                            errorRate: 0,
                        },
                        concurrency: 0,
                        timestamp: new Date(),
                    },
                    maxConcurrencyReached: 0,
                    message: `Stress test execution failed: ${error.message}`,
                    timestamp: new Date(),
                    duration: 0,
                };
                stressTestResults.push(failedResult);
                this.logger.error(`Stress test ${test.name} execution failed: ${error.message}`);
            }
        }
        const scalabilityTestResults = [];
        for (const test of this.config.scalabilityTests) {
            try {
                const result = await this.executeScalabilityTest(test);
                scalabilityTestResults.push(result);
            }
            catch (error) {
                const failedResult = {
                    testName: test.name,
                    status: 'failed',
                    concurrencyResults: [],
                    message: `Scalability test execution failed: ${error.message}`,
                    timestamp: new Date(),
                    duration: 0,
                };
                scalabilityTestResults.push(failedResult);
                this.logger.error(`Scalability test ${test.name} execution failed: ${error.message}`);
            }
        }
        const duration = Date.now() - startTime;
        const overallStatus = this.determineOverallStatus(loadTestResults, stressTestResults, scalabilityTestResults);
        const report = {
            overallStatus,
            loadTestResults,
            stressTestResults,
            scalabilityTestResults,
            timestamp: new Date(),
            duration,
        };
        this.logger.log(`Performance testing completed: ${overallStatus}`);
        return report;
    }
    async executeLoadTest(test) {
        const startTime = Date.now();
        this.logger.log(`Executing load test: ${test.name}`);
        const requests = [];
        const responseTimes = [];
        let successfulRequests = 0;
        let failedRequests = 0;
        const interval = test.rampUpTime * 1000 / test.concurrency;
        const durationMs = test.duration * 1000;
        for (let i = 0; i < test.concurrency; i++) {
            setTimeout(() => {
                const requestStartTime = Date.now();
                let requestPromise;
                switch (test.method) {
                    case 'GET':
                        requestPromise = (0, rxjs_1.firstValueFrom)(this.httpService.get(test.endpoint));
                        break;
                    case 'POST':
                        requestPromise = (0, rxjs_1.firstValueFrom)(this.httpService.post(test.endpoint, test.payload));
                        break;
                    case 'PUT':
                        requestPromise = (0, rxjs_1.firstValueFrom)(this.httpService.put(test.endpoint, test.payload));
                        break;
                    case 'DELETE':
                        requestPromise = (0, rxjs_1.firstValueFrom)(this.httpService.delete(test.endpoint));
                        break;
                    case 'PATCH':
                        requestPromise = (0, rxjs_1.firstValueFrom)(this.httpService.patch(test.endpoint, test.payload));
                        break;
                }
                requestPromise
                    .then(() => {
                    const responseTime = Date.now() - requestStartTime;
                    responseTimes.push(responseTime);
                    successfulRequests++;
                })
                    .catch(() => {
                    failedRequests++;
                });
                requests.push(requestPromise);
            }, i * interval);
        }
        try {
            await Promise.all(requests);
        }
        catch (error) {
            this.logger.warn(`Some requests in load test ${test.name} failed: ${error.message}`);
        }
        const testDuration = Date.now() - startTime;
        const metrics = this.calculateMetrics(responseTimes, successfulRequests, failedRequests, test.concurrency);
        const status = this.validateMetrics(metrics);
        const message = status === 'passed'
            ? 'Load test passed all performance criteria'
            : 'Load test failed one or more performance criteria';
        const result = {
            testName: test.name,
            status,
            metrics,
            message,
            timestamp: new Date(),
            duration: testDuration,
        };
        this.logger.log(`Load test ${test.name} completed: ${status}`);
        return result;
    }
    async executeStressTest(test) {
        const startTime = Date.now();
        this.logger.log(`Executing stress test: ${test.name}`);
        let currentConcurrency = 1;
        let maxConcurrencyReached = 0;
        const concurrencyResults = [];
        while (currentConcurrency <= test.maxConcurrency) {
            const requests = [];
            const responseTimes = [];
            let successfulRequests = 0;
            let failedRequests = 0;
            for (let i = 0; i < currentConcurrency; i++) {
                const requestStartTime = Date.now();
                let requestPromise;
                switch (test.method) {
                    case 'GET':
                        requestPromise = (0, rxjs_1.firstValueFrom)(this.httpService.get(test.endpoint));
                        break;
                    case 'POST':
                        requestPromise = (0, rxjs_1.firstValueFrom)(this.httpService.post(test.endpoint, test.payload));
                        break;
                    case 'PUT':
                        requestPromise = (0, rxjs_1.firstValueFrom)(this.httpService.put(test.endpoint, test.payload));
                        break;
                    case 'DELETE':
                        requestPromise = (0, rxjs_1.firstValueFrom)(this.httpService.delete(test.endpoint));
                        break;
                    case 'PATCH':
                        requestPromise = (0, rxjs_1.firstValueFrom)(this.httpService.patch(test.endpoint, test.payload));
                        break;
                }
                requestPromise
                    .then(() => {
                    const responseTime = Date.now() - requestStartTime;
                    responseTimes.push(responseTime);
                    successfulRequests++;
                })
                    .catch(() => {
                    failedRequests++;
                });
                requests.push(requestPromise);
            }
            try {
                await Promise.all(requests);
                maxConcurrencyReached = currentConcurrency;
                const metrics = this.calculateMetrics(responseTimes, successfulRequests, failedRequests, currentConcurrency);
                concurrencyResults.push({ concurrency: currentConcurrency, metrics });
                if (this.validateMetrics(metrics) === 'failed') {
                    break;
                }
            }
            catch (error) {
                break;
            }
            currentConcurrency = Math.min(currentConcurrency * 2, test.maxConcurrency);
        }
        const testDuration = Date.now() - startTime;
        const finalMetrics = concurrencyResults.length > 0
            ? concurrencyResults[concurrencyResults.length - 1].metrics
            : {
                responseTime: {
                    avg: 0,
                    min: 0,
                    max: 0,
                    p50: 0,
                    p90: 0,
                    p95: 0,
                    p99: 0,
                },
                throughput: {
                    requestsPerSecond: 0,
                    totalRequests: 0,
                    successfulRequests: 0,
                    failedRequests: 0,
                    errorRate: 0,
                },
                concurrency: maxConcurrencyReached,
                timestamp: new Date(),
            };
        const status = maxConcurrencyReached >= test.maxConcurrency * 0.8 ? 'passed' : 'failed';
        const message = status === 'passed'
            ? `Stress test passed, reached ${maxConcurrencyReached}/${test.maxConcurrency} concurrency`
            : `Stress test failed, only reached ${maxConcurrencyReached}/${test.maxConcurrency} concurrency`;
        const result = {
            testName: test.name,
            status,
            metrics: finalMetrics,
            maxConcurrencyReached,
            message,
            timestamp: new Date(),
            duration: testDuration,
        };
        this.logger.log(`Stress test ${test.name} completed: ${status} (max concurrency: ${maxConcurrencyReached})`);
        return result;
    }
    async executeScalabilityTest(test) {
        const startTime = Date.now();
        this.logger.log(`Executing scalability test: ${test.name}`);
        const concurrencyResults = [];
        for (const concurrency of test.concurrencyLevels) {
            const requests = [];
            const responseTimes = [];
            let successfulRequests = 0;
            let failedRequests = 0;
            for (let i = 0; i < concurrency; i++) {
                const requestStartTime = Date.now();
                let requestPromise;
                switch (test.method) {
                    case 'GET':
                        requestPromise = (0, rxjs_1.firstValueFrom)(this.httpService.get(test.endpoint));
                        break;
                    case 'POST':
                        requestPromise = (0, rxjs_1.firstValueFrom)(this.httpService.post(test.endpoint, test.payload));
                        break;
                    case 'PUT':
                        requestPromise = (0, rxjs_1.firstValueFrom)(this.httpService.put(test.endpoint, test.payload));
                        break;
                    case 'DELETE':
                        requestPromise = (0, rxjs_1.firstValueFrom)(this.httpService.delete(test.endpoint));
                        break;
                    case 'PATCH':
                        requestPromise = (0, rxjs_1.firstValueFrom)(this.httpService.patch(test.endpoint, test.payload));
                        break;
                }
                requestPromise
                    .then(() => {
                    const responseTime = Date.now() - requestStartTime;
                    responseTimes.push(responseTime);
                    successfulRequests++;
                })
                    .catch(() => {
                    failedRequests++;
                });
                requests.push(requestPromise);
            }
            try {
                await Promise.all(requests);
            }
            catch (error) {
                this.logger.warn(`Some requests failed at concurrency ${concurrency} in scalability test ${test.name}`);
            }
            const metrics = this.calculateMetrics(responseTimes, successfulRequests, failedRequests, concurrency);
            const status = this.validateMetrics(metrics);
            concurrencyResults.push({
                concurrency,
                metrics,
                status,
            });
        }
        const testDuration = Date.now() - startTime;
        const failedLevels = concurrencyResults.filter(r => r.status === 'failed').length;
        const status = failedLevels === 0 ? 'passed' : failedLevels < concurrencyResults.length ? 'partial' : 'failed';
        const message = status === 'passed'
            ? `Scalability test passed at all ${test.concurrencyLevels.length} concurrency levels`
            : `Scalability test failed at ${failedLevels}/${test.concurrencyLevels.length} concurrency levels`;
        const result = {
            testName: test.name,
            status,
            concurrencyResults,
            message,
            timestamp: new Date(),
            duration: testDuration,
        };
        this.logger.log(`Scalability test ${test.name} completed: ${status}`);
        return result;
    }
    calculateMetrics(responseTimes, successfulRequests, failedRequests, concurrency) {
        const sortedTimes = [...responseTimes].sort((a, b) => a - b);
        const totalRequests = successfulRequests + failedRequests;
        const errorRate = totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0;
        const metrics = {
            responseTime: {
                avg: responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0,
                min: sortedTimes.length > 0 ? sortedTimes[0] : 0,
                max: sortedTimes.length > 0 ? sortedTimes[sortedTimes.length - 1] : 0,
                p50: this.percentile(sortedTimes, 50),
                p90: this.percentile(sortedTimes, 90),
                p95: this.percentile(sortedTimes, 95),
                p99: this.percentile(sortedTimes, 99),
            },
            throughput: {
                requestsPerSecond: responseTimes.length,
                totalRequests,
                successfulRequests,
                failedRequests,
                errorRate,
            },
            concurrency,
            timestamp: new Date(),
        };
        return metrics;
    }
    percentile(sortedArray, percentile) {
        if (sortedArray.length === 0)
            return 0;
        const index = (percentile / 100) * (sortedArray.length - 1);
        const lower = Math.floor(index);
        const upper = lower + 1;
        const weight = index % 1;
        if (upper >= sortedArray.length)
            return sortedArray[lower];
        return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
    }
    validateMetrics(metrics) {
        if (metrics.responseTime.avg > this.config.metrics.responseTimeThreshold) {
            return 'failed';
        }
        if (metrics.throughput.errorRate > this.config.metrics.errorRateThreshold) {
            return 'failed';
        }
        if (metrics.throughput.requestsPerSecond < this.config.metrics.throughputThreshold) {
            return 'failed';
        }
        return 'passed';
    }
    determineOverallStatus(loadTestResults, stressTestResults, scalabilityTestResults) {
        const allResults = [
            ...loadTestResults.map(r => r.status),
            ...stressTestResults.map(r => r.status),
            ...scalabilityTestResults.flatMap(r => r.concurrencyResults ? r.concurrencyResults.map(cr => cr.status) : [r.status])
        ];
        const failedCount = allResults.filter(s => s === 'failed').length;
        const passedCount = allResults.filter(s => s === 'passed').length;
        if (failedCount === 0)
            return 'passed';
        if (passedCount > 0)
            return 'partial';
        return 'failed';
    }
    getConfiguration() {
        return { ...this.config };
    }
    updateConfiguration(config) {
        this.config = { ...this.config, ...config };
        this.logger.log('Performance testing configuration updated');
    }
    addLoadTest(test) {
        this.config.loadTests.push(test);
        this.logger.log(`Added load test ${test.name}`);
    }
    addStressTest(test) {
        this.config.stressTests.push(test);
        this.logger.log(`Added stress test ${test.name}`);
    }
    addScalabilityTest(test) {
        this.config.scalabilityTests.push(test);
        this.logger.log(`Added scalability test ${test.name}`);
    }
};
exports.PerformanceTestingService = PerformanceTestingService;
exports.PerformanceTestingService = PerformanceTestingService = PerformanceTestingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], PerformanceTestingService);
//# sourceMappingURL=performance-testing.service.js.map