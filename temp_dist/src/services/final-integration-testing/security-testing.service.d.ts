import { HttpService } from '@nestjs/axios';
export interface SecurityTestConfig {
    vulnerabilityScans: Array<{
        name: string;
        description: string;
        endpoint: string;
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
        payload?: any;
        testType: 'sql_injection' | 'xss' | 'csrf' | 'command_injection' | 'path_traversal' | 'authentication_bypass';
        expectedResponse?: {
            status?: number;
            bodyContains?: string;
            bodyNotContains?: string;
        };
    }>;
    penetrationTests: Array<{
        name: string;
        description: string;
        endpoint: string;
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
        payload?: any;
        authRequired: boolean;
        expectedBehavior: 'authorized' | 'unauthorized' | 'rate_limited';
    }>;
    complianceChecks: Array<{
        name: string;
        description: string;
        checkType: 'gdpr' | 'ccpa' | 'hipaa' | 'pci_dss' | 'soc2';
        endpoint?: string;
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
        payload?: any;
    }>;
    securityMetrics: {
        maxVulnerabilities: number;
        maxCriticalVulnerabilities: number;
        minComplianceScore: number;
    };
}
export interface SecurityVulnerability {
    id: string;
    name: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    endpoint?: string;
    payload?: string;
    detectedAt: Date;
    remediation?: string;
}
export interface PenetrationTestResult {
    testName: string;
    status: 'passed' | 'failed' | 'skipped';
    message: string;
    timestamp: Date;
    details?: any;
}
export interface ComplianceCheckResult {
    checkName: string;
    status: 'passed' | 'failed' | 'partial';
    score: number;
    message: string;
    timestamp: Date;
    findings?: string[];
}
export interface SecurityTestingReport {
    overallStatus: 'passed' | 'failed' | 'partial';
    vulnerabilityScanResults: SecurityVulnerability[];
    penetrationTestResults: PenetrationTestResult[];
    complianceCheckResults: ComplianceCheckResult[];
    summary: {
        totalVulnerabilities: number;
        criticalVulnerabilities: number;
        highVulnerabilities: number;
        mediumVulnerabilities: number;
        lowVulnerabilities: number;
        passedPenetrationTests: number;
        failedPenetrationTests: number;
        passedComplianceChecks: number;
        failedComplianceChecks: number;
        complianceScore: number;
    };
    timestamp: Date;
    duration: number;
}
export declare class SecurityTestingService {
    private readonly httpService;
    private readonly logger;
    private config;
    constructor(httpService: HttpService);
    configure(config: SecurityTestConfig): void;
    executeSecurityTests(): Promise<SecurityTestingReport>;
    private executeVulnerabilityScan;
    private generateTestPayloads;
    private analyzeResponseForVulnerability;
    private executePenetrationTest;
    private executeComplianceCheck;
    private checkGDPRCompliance;
    private checkCCPACompliance;
    private checkHIPAACompliance;
    private checkPCIDSSCompliance;
    private checkSOC2Compliance;
    private generateSummary;
    private determineOverallStatus;
    getConfiguration(): SecurityTestConfig;
    updateConfiguration(config: Partial<SecurityTestConfig>): void;
    addVulnerabilityScan(scan: SecurityTestConfig['vulnerabilityScans'][0]): void;
    addPenetrationTest(test: SecurityTestConfig['penetrationTests'][0]): void;
    addComplianceCheck(check: SecurityTestConfig['complianceChecks'][0]): void;
}
