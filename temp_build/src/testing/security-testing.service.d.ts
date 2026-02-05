export interface SecurityTestResult {
    testName: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'passed' | 'failed' | 'warning';
    description: string;
    recommendation?: string;
    details?: any;
}
export declare class SecurityTestingService {
    private readonly logger;
    runSecurityTests(): Promise<SecurityTestResult[]>;
    private testEnvironmentVariables;
    private testPasswordPolicies;
    private testInputValidation;
    private testAuthentication;
    private testAuthorization;
    private testSecureHeaders;
    private testErrorHandling;
    private testRateLimiting;
    generateSecurityReport(results: SecurityTestResult[]): string;
}
