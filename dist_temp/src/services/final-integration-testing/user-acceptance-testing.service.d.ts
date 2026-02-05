import { HttpService } from '@nestjs/axios';
export interface UATConfig {
    userStories: Array<{
        id: string;
        title: string;
        description: string;
        priority: 'low' | 'medium' | 'high' | 'critical';
        acceptanceCriteria: Array<{
            id: string;
            description: string;
            testSteps: Array<{
                step: number;
                action: string;
                expectedOutcome: string;
            }>;
            endpoint?: string;
            method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
            payload?: any;
            expectedStatus?: number;
        }>;
    }>;
    testUsers: Array<{
        id: string;
        name: string;
        role: string;
        credentials: {
            username: string;
            password: string;
        };
    }>;
    testEnvironment: {
        baseUrl: string;
        timeout: number;
        retryAttempts: number;
        retryDelay: number;
    };
    uatMetrics: {
        minPassRate: number;
        maxCriticalFailures: number;
        maxHighPriorityFailures: number;
    };
}
export interface UATTestResult {
    userStoryId: string;
    userStoryTitle: string;
    criterionId: string;
    status: 'passed' | 'failed' | 'blocked';
    message: string;
    timestamp: Date;
    tester: string;
    executionTime: number;
    details?: any;
}
export interface UserStoryResult {
    userStoryId: string;
    userStoryTitle: string;
    status: 'passed' | 'failed' | 'partial';
    totalCriteria: number;
    passedCriteria: number;
    failedCriteria: number;
    blockedCriteria: number;
    results: UATTestResult[];
    priority: 'low' | 'medium' | 'high' | 'critical';
}
export interface UATTestingReport {
    overallStatus: 'passed' | 'failed' | 'partial';
    totalUserStories: number;
    passedUserStories: number;
    failedUserStories: number;
    totalCriteria: number;
    passedCriteria: number;
    failedCriteria: number;
    blockedCriteria: number;
    userStoryResults: UserStoryResult[];
    summary: {
        criticalStories: number;
        highPriorityStories: number;
        mediumPriorityStories: number;
        lowPriorityStories: number;
        passedCriticalStories: number;
        passedHighPriorityStories: number;
        criticalFailures: number;
        highPriorityFailures: number;
    };
    timestamp: Date;
    duration: number;
}
export declare class UserAcceptanceTestingService {
    private readonly httpService;
    private readonly logger;
    private config;
    constructor(httpService: HttpService);
    configure(config: UATConfig): void;
    executeUAT(): Promise<UATTestingReport>;
    private executeUserStoryTests;
    private executeAcceptanceCriterion;
    private determineUserStoryStatus;
    private generateSummary;
    private determineOverallStatus;
    getConfiguration(): UATConfig;
    updateConfiguration(config: Partial<UATConfig>): void;
    addUserStory(userStory: UATConfig['userStories'][0]): void;
    addTestUser(testUser: UATConfig['testUsers'][0]): void;
    removeUserStory(userStoryId: string): void;
    removeTestUser(userId: string): void;
}
