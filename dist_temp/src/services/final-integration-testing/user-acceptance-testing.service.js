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
var UserAcceptanceTestingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAcceptanceTestingService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let UserAcceptanceTestingService = UserAcceptanceTestingService_1 = class UserAcceptanceTestingService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(UserAcceptanceTestingService_1.name);
    }
    configure(config) {
        this.config = config;
        this.logger.log(`UAT service configured with ${config.userStories.length} user stories`);
    }
    async executeUAT() {
        const startTime = Date.now();
        this.logger.log('Starting user acceptance testing process');
        const userStoryResults = [];
        let totalCriteria = 0;
        let passedCriteria = 0;
        let failedCriteria = 0;
        let blockedCriteria = 0;
        for (const userStory of this.config.userStories) {
            try {
                const storyResult = await this.executeUserStoryTests(userStory);
                userStoryResults.push(storyResult);
                totalCriteria += storyResult.totalCriteria;
                passedCriteria += storyResult.passedCriteria;
                failedCriteria += storyResult.failedCriteria;
                blockedCriteria += storyResult.blockedCriteria;
            }
            catch (error) {
                const failedStoryResult = {
                    userStoryId: userStory.id,
                    userStoryTitle: userStory.title,
                    status: 'failed',
                    totalCriteria: 0,
                    passedCriteria: 0,
                    failedCriteria: 0,
                    blockedCriteria: 0,
                    results: [{
                            userStoryId: userStory.id,
                            userStoryTitle: userStory.title,
                            criterionId: 'execution_failure',
                            status: 'failed',
                            message: `User story execution failed: ${error.message}`,
                            timestamp: new Date(),
                            tester: 'system',
                            executionTime: 0,
                        }],
                    priority: userStory.priority,
                };
                userStoryResults.push(failedStoryResult);
                this.logger.error(`User story ${userStory.id} execution failed: ${error.message}`);
            }
        }
        const duration = Date.now() - startTime;
        const summary = this.generateSummary(userStoryResults);
        const overallStatus = this.determineOverallStatus(summary, failedCriteria, blockedCriteria);
        const report = {
            overallStatus,
            totalUserStories: this.config.userStories.length,
            passedUserStories: userStoryResults.filter(s => s.status === 'passed').length,
            failedUserStories: userStoryResults.filter(s => s.status === 'failed').length,
            totalCriteria,
            passedCriteria,
            failedCriteria,
            blockedCriteria,
            userStoryResults,
            summary,
            timestamp: new Date(),
            duration,
        };
        this.logger.log(`User acceptance testing completed: ${overallStatus}`);
        return report;
    }
    async executeUserStoryTests(userStory) {
        this.logger.log(`Executing tests for user story: ${userStory.title}`);
        const results = [];
        let passedCriteria = 0;
        let failedCriteria = 0;
        let blockedCriteria = 0;
        for (const criterion of userStory.acceptanceCriteria) {
            try {
                const tester = this.config.testUsers.length > 0
                    ? this.config.testUsers[0].name
                    : 'default_tester';
                const result = await this.executeAcceptanceCriterion(criterion, tester);
                results.push(result);
                if (result.status === 'passed') {
                    passedCriteria++;
                }
                else if (result.status === 'failed') {
                    failedCriteria++;
                }
                else {
                    blockedCriteria++;
                }
            }
            catch (error) {
                const failureResult = {
                    userStoryId: userStory.id,
                    userStoryTitle: userStory.title,
                    criterionId: criterion.id,
                    status: 'failed',
                    message: `Acceptance criterion execution failed: ${error.message}`,
                    timestamp: new Date(),
                    tester: 'system',
                    executionTime: 0,
                };
                results.push(failureResult);
                failedCriteria++;
                this.logger.error(`Acceptance criterion ${criterion.id} execution failed: ${error.message}`);
            }
        }
        const status = this.determineUserStoryStatus(userStory.acceptanceCriteria.length, passedCriteria, failedCriteria, blockedCriteria);
        const storyResult = {
            userStoryId: userStory.id,
            userStoryTitle: userStory.title,
            status,
            totalCriteria: userStory.acceptanceCriteria.length,
            passedCriteria,
            failedCriteria,
            blockedCriteria,
            results,
            priority: userStory.priority,
        };
        this.logger.log(`User story ${userStory.id} completed: ${status} (${passedCriteria}/${userStory.acceptanceCriteria.length} criteria passed)`);
        return storyResult;
    }
    async executeAcceptanceCriterion(criterion, tester) {
        const startTime = Date.now();
        try {
            if (criterion.endpoint && criterion.method) {
                let lastError = null;
                for (let attempt = 1; attempt <= this.config.testEnvironment.retryAttempts; attempt++) {
                    try {
                        let response;
                        switch (criterion.method) {
                            case 'GET':
                                response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.config.testEnvironment.baseUrl}${criterion.endpoint}`, {
                                    timeout: this.config.testEnvironment.timeout,
                                }));
                                break;
                            case 'POST':
                                response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.config.testEnvironment.baseUrl}${criterion.endpoint}`, criterion.payload, {
                                    timeout: this.config.testEnvironment.timeout,
                                }));
                                break;
                            case 'PUT':
                                response = await (0, rxjs_1.firstValueFrom)(this.httpService.put(`${this.config.testEnvironment.baseUrl}${criterion.endpoint}`, criterion.payload, {
                                    timeout: this.config.testEnvironment.timeout,
                                }));
                                break;
                            case 'DELETE':
                                response = await (0, rxjs_1.firstValueFrom)(this.httpService.delete(`${this.config.testEnvironment.baseUrl}${criterion.endpoint}`, {
                                    timeout: this.config.testEnvironment.timeout,
                                }));
                                break;
                            case 'PATCH':
                                response = await (0, rxjs_1.firstValueFrom)(this.httpService.patch(`${this.config.testEnvironment.baseUrl}${criterion.endpoint}`, criterion.payload, {
                                    timeout: this.config.testEnvironment.timeout,
                                }));
                                break;
                        }
                        const executionTime = Date.now() - startTime;
                        if (criterion.expectedStatus && response.status !== criterion.expectedStatus) {
                            return {
                                userStoryId: '',
                                userStoryTitle: '',
                                criterionId: criterion.id,
                                status: 'failed',
                                message: `Expected status ${criterion.expectedStatus}, got ${response.status}`,
                                timestamp: new Date(),
                                tester,
                                executionTime,
                                details: {
                                    status: response.status,
                                    data: response.data,
                                },
                            };
                        }
                        return {
                            userStoryId: '',
                            userStoryTitle: '',
                            criterionId: criterion.id,
                            status: 'passed',
                            message: `Test passed with status ${response.status}`,
                            timestamp: new Date(),
                            tester,
                            executionTime,
                            details: {
                                status: response.status,
                                data: response.data,
                            },
                        };
                    }
                    catch (error) {
                        lastError = error;
                        if (attempt < this.config.testEnvironment.retryAttempts) {
                            this.logger.warn(`Criterion ${criterion.id} test failed (attempt ${attempt}/${this.config.testEnvironment.retryAttempts}), retrying in ${this.config.testEnvironment.retryDelay}ms: ${error.message}`);
                            await new Promise(resolve => setTimeout(resolve, this.config.testEnvironment.retryDelay));
                        }
                    }
                }
                const executionTime = Date.now() - startTime;
                return {
                    userStoryId: '',
                    userStoryTitle: '',
                    criterionId: criterion.id,
                    status: 'failed',
                    message: `Test failed after ${this.config.testEnvironment.retryAttempts} attempts: ${lastError ? lastError.message : 'Unknown error'}`,
                    timestamp: new Date(),
                    tester,
                    executionTime,
                };
            }
            else {
                const executionTime = Date.now() - startTime;
                return {
                    userStoryId: '',
                    userStoryTitle: '',
                    criterionId: criterion.id,
                    status: 'blocked',
                    message: 'Manual test criterion - requires human verification',
                    timestamp: new Date(),
                    tester,
                    executionTime,
                };
            }
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            return {
                userStoryId: '',
                userStoryTitle: '',
                criterionId: criterion.id,
                status: 'failed',
                message: `Test execution failed: ${error.message}`,
                timestamp: new Date(),
                tester,
                executionTime,
            };
        }
    }
    determineUserStoryStatus(totalCriteria, passedCriteria, failedCriteria, blockedCriteria) {
        if (passedCriteria === totalCriteria) {
            return 'passed';
        }
        if (failedCriteria > 0) {
            return 'failed';
        }
        if (passedCriteria > 0 && blockedCriteria > 0) {
            return 'partial';
        }
        return 'failed';
    }
    generateSummary(userStoryResults) {
        const criticalStories = userStoryResults.filter(s => s.priority === 'critical').length;
        const highPriorityStories = userStoryResults.filter(s => s.priority === 'high').length;
        const mediumPriorityStories = userStoryResults.filter(s => s.priority === 'medium').length;
        const lowPriorityStories = userStoryResults.filter(s => s.priority === 'low').length;
        const passedCriticalStories = userStoryResults.filter(s => s.priority === 'critical' && s.status === 'passed').length;
        const passedHighPriorityStories = userStoryResults.filter(s => s.priority === 'high' && s.status === 'passed').length;
        const criticalFailures = userStoryResults.filter(s => s.priority === 'critical' && s.status === 'failed').length;
        const highPriorityFailures = userStoryResults.filter(s => s.priority === 'high' && s.status === 'failed').length;
        return {
            criticalStories,
            highPriorityStories,
            mediumPriorityStories,
            lowPriorityStories,
            passedCriticalStories,
            passedHighPriorityStories,
            criticalFailures,
            highPriorityFailures,
        };
    }
    determineOverallStatus(summary, failedCriteria, blockedCriteria) {
        if (summary.criticalFailures > this.config.uatMetrics.maxCriticalFailures) {
            return 'failed';
        }
        if (summary.highPriorityFailures > this.config.uatMetrics.maxHighPriorityFailures) {
            return 'failed';
        }
        const totalCriteria = failedCriteria + blockedCriteria;
        const passRate = totalCriteria > 0 ? (1 - (failedCriteria / totalCriteria)) * 100 : 100;
        if (passRate < this.config.uatMetrics.minPassRate) {
            return 'failed';
        }
        if (failedCriteria > 0) {
            return 'partial';
        }
        if (blockedCriteria > 0) {
            return 'partial';
        }
        return 'passed';
    }
    getConfiguration() {
        return { ...this.config };
    }
    updateConfiguration(config) {
        this.config = { ...this.config, ...config };
        this.logger.log('UAT configuration updated');
    }
    addUserStory(userStory) {
        this.config.userStories.push(userStory);
        this.logger.log(`Added user story ${userStory.id}: ${userStory.title}`);
    }
    addTestUser(testUser) {
        this.config.testUsers.push(testUser);
        this.logger.log(`Added test user ${testUser.name}`);
    }
    removeUserStory(userStoryId) {
        this.config.userStories = this.config.userStories.filter(story => story.id !== userStoryId);
        this.logger.log(`Removed user story ${userStoryId}`);
    }
    removeTestUser(userId) {
        this.config.testUsers = this.config.testUsers.filter(user => user.id !== userId);
        this.logger.log(`Removed test user ${userId}`);
    }
};
exports.UserAcceptanceTestingService = UserAcceptanceTestingService;
exports.UserAcceptanceTestingService = UserAcceptanceTestingService = UserAcceptanceTestingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], UserAcceptanceTestingService);
//# sourceMappingURL=user-acceptance-testing.service.js.map