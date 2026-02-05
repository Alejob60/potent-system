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
const redis_service_1 = require("../common/redis/redis.service");
let PerformanceTestingService = PerformanceTestingService_1 = class PerformanceTestingService {
    constructor(redisService) {
        this.redisService = redisService;
        this.logger = new common_1.Logger(PerformanceTestingService_1.name);
    }
    async runPerformanceTest(testName, testFn, iterations = 100) {
        this.logger.log(`Running performance test: ${testName}`);
        const responseTimes = [];
        const startTime = Date.now();
        for (let i = 0; i < iterations; i++) {
            const iterationStart = Date.now();
            try {
                await testFn();
                const iterationTime = Date.now() - iterationStart;
                responseTimes.push(iterationTime);
            }
            catch (error) {
                this.logger.error(`Error in performance test iteration ${i}: ${error.message}`);
            }
        }
        const totalTime = Date.now() - startTime;
        const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const minResponseTime = Math.min(...responseTimes);
        const maxResponseTime = Math.max(...responseTimes);
        const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
        const throughput = (iterations / totalTime) * 1000;
        const metrics = {
            responseTime: avgResponseTime,
            memoryUsage,
            cpuUsage: 0,
            throughput,
            errorRate: 0,
        };
        const baseline = await this.getBaseline(testName);
        let deviation = 0;
        let status = 'passed';
        if (baseline) {
            deviation = Math.abs(avgResponseTime - baseline.responseTime) / baseline.responseTime;
            if (deviation > 0.2) {
                status = 'warning';
            }
            if (deviation > 0.5) {
                status = 'failed';
            }
        }
        const result = {
            testName,
            metrics,
            baseline: baseline || undefined,
            deviation: baseline ? deviation : undefined,
            status,
        };
        await this.saveBaseline(testName, metrics);
        this.logger.log(`Performance test ${testName} completed: avg=${avgResponseTime}ms, min=${minResponseTime}ms, max=${maxResponseTime}ms`);
        return result;
    }
    async getBaseline(testName) {
        try {
            const key = `performance_baseline:${testName}`;
            const baselineJson = await this.redisService.get(key);
            return baselineJson ? JSON.parse(baselineJson) : null;
        }
        catch (error) {
            this.logger.error(`Error retrieving baseline for ${testName}: ${error.message}`);
            return null;
        }
    }
    async saveBaseline(testName, metrics) {
        try {
            const key = `performance_baseline:${testName}`;
            await this.redisService.setex(key, 86400, JSON.stringify(metrics));
            return true;
        }
        catch (error) {
            this.logger.error(`Error saving baseline for ${testName}: ${error.message}`);
            return false;
        }
    }
    generatePerformanceReport(results) {
        let report = '=== Performance Test Report ===\n';
        for (const result of results) {
            report += `\n${result.testName}:\n`;
            report += `  Status: ${result.status.toUpperCase()}\n`;
            report += `  Average Response Time: ${result.metrics.responseTime.toFixed(2)}ms\n`;
            report += `  Memory Usage: ${result.metrics.memoryUsage.toFixed(2)}MB\n`;
            report += `  Throughput: ${result.metrics.throughput.toFixed(2)} req/sec\n`;
            if (result.baseline && result.deviation !== undefined) {
                report += `  Baseline Response Time: ${result.baseline.responseTime.toFixed(2)}ms\n`;
                report += `  Deviation: ${(result.deviation * 100).toFixed(2)}%\n`;
            }
        }
        return report;
    }
};
exports.PerformanceTestingService = PerformanceTestingService;
exports.PerformanceTestingService = PerformanceTestingService = PerformanceTestingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], PerformanceTestingService);
//# sourceMappingURL=performance-testing.service.js.map