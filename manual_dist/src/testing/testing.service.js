"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TestingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestingService = void 0;
const common_1 = require("@nestjs/common");
let TestingService = TestingService_1 = class TestingService {
    constructor() {
        this.logger = new common_1.Logger(TestingService_1.name);
    }
    async runTestSuite(suiteName, tests) {
        this.logger.log(`Starting test suite: ${suiteName}`);
        const results = [];
        for (const test of tests) {
            const startTime = Date.now();
            try {
                await test.testFn();
                const duration = Date.now() - startTime;
                results.push({
                    testName: test.name,
                    status: 'passed',
                    duration,
                });
                this.logger.log(`Test passed: ${test.name} (${duration}ms)`);
            }
            catch (error) {
                const duration = Date.now() - startTime;
                results.push({
                    testName: test.name,
                    status: 'failed',
                    duration,
                    errorMessage: error.message,
                });
                this.logger.error(`Test failed: ${test.name}`, error.stack);
            }
        }
        const passedTests = results.filter(r => r.status === 'passed').length;
        const failedTests = results.filter(r => r.status === 'failed').length;
        this.logger.log(`Test suite ${suiteName} completed: ${passedTests} passed, ${failedTests} failed`);
        return results;
    }
    generateTestReport(suiteName, results) {
        const passedTests = results.filter(r => r.status === 'passed').length;
        const failedTests = results.filter(r => r.status === 'failed').length;
        const skippedTests = results.filter(r => r.status === 'skipped').length;
        const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
        let report = `=== Test Report: ${suiteName} ===\n`;
        report += `Total Tests: ${results.length}\n`;
        report += `Passed: ${passedTests}\n`;
        report += `Failed: ${failedTests}\n`;
        report += `Skipped: ${skippedTests}\n`;
        report += `Total Duration: ${totalDuration}ms\n`;
        report += `\n`;
        for (const result of results) {
            report += `${result.testName}: ${result.status.toUpperCase()} (${result.duration}ms)\n`;
            if (result.errorMessage) {
                report += `  Error: ${result.errorMessage}\n`;
            }
        }
        return report;
    }
};
exports.TestingService = TestingService;
exports.TestingService = TestingService = TestingService_1 = __decorate([
    (0, common_1.Injectable)()
], TestingService);
//# sourceMappingURL=testing.service.js.map