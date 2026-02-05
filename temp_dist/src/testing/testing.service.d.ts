export interface TestResult {
    testName: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    errorMessage?: string;
    details?: any;
}
export declare class TestingService {
    private readonly logger;
    runTestSuite(suiteName: string, tests: Array<{
        name: string;
        testFn: () => Promise<void>;
    }>): Promise<TestResult[]>;
    generateTestReport(suiteName: string, results: TestResult[]): string;
}
