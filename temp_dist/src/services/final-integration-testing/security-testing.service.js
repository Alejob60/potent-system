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
var SecurityTestingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityTestingService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let SecurityTestingService = SecurityTestingService_1 = class SecurityTestingService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(SecurityTestingService_1.name);
    }
    configure(config) {
        this.config = config;
        this.logger.log('Security testing service configured');
    }
    async executeSecurityTests() {
        const startTime = Date.now();
        this.logger.log('Starting security testing process');
        const vulnerabilityScanResults = [];
        for (const scan of this.config.vulnerabilityScans) {
            try {
                const vulnerabilities = await this.executeVulnerabilityScan(scan);
                vulnerabilityScanResults.push(...vulnerabilities);
            }
            catch (error) {
                this.logger.error(`Vulnerability scan ${scan.name} execution failed: ${error.message}`);
            }
        }
        const penetrationTestResults = [];
        for (const test of this.config.penetrationTests) {
            try {
                const result = await this.executePenetrationTest(test);
                penetrationTestResults.push(result);
            }
            catch (error) {
                const failedResult = {
                    testName: test.name,
                    status: 'failed',
                    message: `Penetration test execution failed: ${error.message}`,
                    timestamp: new Date(),
                };
                penetrationTestResults.push(failedResult);
                this.logger.error(`Penetration test ${test.name} execution failed: ${error.message}`);
            }
        }
        const complianceCheckResults = [];
        for (const check of this.config.complianceChecks) {
            try {
                const result = await this.executeComplianceCheck(check);
                complianceCheckResults.push(result);
            }
            catch (error) {
                const failedResult = {
                    checkName: check.name,
                    status: 'failed',
                    score: 0,
                    message: `Compliance check execution failed: ${error.message}`,
                    timestamp: new Date(),
                };
                complianceCheckResults.push(failedResult);
                this.logger.error(`Compliance check ${check.name} execution failed: ${error.message}`);
            }
        }
        const duration = Date.now() - startTime;
        const summary = this.generateSummary(vulnerabilityScanResults, penetrationTestResults, complianceCheckResults);
        const overallStatus = this.determineOverallStatus(summary);
        const report = {
            overallStatus,
            vulnerabilityScanResults,
            penetrationTestResults,
            complianceCheckResults,
            summary,
            timestamp: new Date(),
            duration,
        };
        this.logger.log(`Security testing completed: ${overallStatus}`);
        return report;
    }
    async executeVulnerabilityScan(scan) {
        this.logger.log(`Executing vulnerability scan: ${scan.name}`);
        const vulnerabilities = [];
        try {
            const testPayloads = this.generateTestPayloads(scan.testType);
            for (const payload of testPayloads) {
                try {
                    let response;
                    let requestPayload = scan.payload ? { ...scan.payload } : {};
                    if (scan.method === 'GET') {
                    }
                    else {
                        requestPayload = { ...requestPayload, ...payload };
                    }
                    switch (scan.method) {
                        case 'GET':
                            response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(scan.endpoint));
                            break;
                        case 'POST':
                            response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(scan.endpoint, requestPayload));
                            break;
                        case 'PUT':
                            response = await (0, rxjs_1.firstValueFrom)(this.httpService.put(scan.endpoint, requestPayload));
                            break;
                        case 'DELETE':
                            response = await (0, rxjs_1.firstValueFrom)(this.httpService.delete(scan.endpoint));
                            break;
                        case 'PATCH':
                            response = await (0, rxjs_1.firstValueFrom)(this.httpService.patch(scan.endpoint, requestPayload));
                            break;
                    }
                    const vulnerability = this.analyzeResponseForVulnerability(scan, response, payload);
                    if (vulnerability) {
                        vulnerabilities.push(vulnerability);
                    }
                }
                catch (error) {
                    this.logger.debug(`Request failed for payload in ${scan.name}, which may indicate protection: ${error.message}`);
                }
            }
        }
        catch (error) {
            this.logger.error(`Error executing vulnerability scan ${scan.name}: ${error.message}`);
        }
        this.logger.log(`Vulnerability scan ${scan.name} completed, found ${vulnerabilities.length} vulnerabilities`);
        return vulnerabilities;
    }
    generateTestPayloads(testType) {
        switch (testType) {
            case 'sql_injection':
                return [
                    { input: "1' OR '1'='1" },
                    { input: "1'; DROP TABLE users; --" },
                    { input: "' UNION SELECT * FROM users --" },
                    { input: "'; EXEC xp_cmdshell('dir') --" },
                ];
            case 'xss':
                return [
                    { input: '<script>alert("XSS")</script>' },
                    { input: '"><script>alert(document.cookie)</script>' },
                    { input: 'javascript:alert("XSS")' },
                    { input: 'onerror=alert("XSS")' },
                ];
            case 'csrf':
                return [
                    { csrf_token: 'invalid_token' },
                    { csrf_token: '' },
                    {},
                ];
            case 'command_injection':
                return [
                    { input: '; ls -la' },
                    { input: '| cat /etc/passwd' },
                    { input: '&& whoami' },
                    { input: '`cat /etc/passwd`' },
                ];
            case 'path_traversal':
                return [
                    { file: '../../../etc/passwd' },
                    { path: '..\\..\\..\\windows\\system32\\cmd.exe' },
                    { resource: '../../../../../../../../etc/shadow' },
                ];
            case 'authentication_bypass':
                return [
                    { username: 'admin\'--', password: 'anything' },
                    { username: 'admin', password: 'admin\'--' },
                    { auth_token: 'invalid_token' },
                ];
            default:
                return [];
        }
    }
    analyzeResponseForVulnerability(scan, response, payload) {
        const responseBody = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        if (scan.testType === 'sql_injection') {
            const sqlErrorIndicators = [
                'SQL syntax', 'mysql_fetch', 'ORA-', 'PostgreSQL', 'ODBC', 'JDBC'
            ];
            for (const indicator of sqlErrorIndicators) {
                if (responseBody.includes(indicator)) {
                    return {
                        id: `vuln_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        name: 'SQL Injection Vulnerability',
                        description: `Potential SQL injection vulnerability detected with payload: ${JSON.stringify(payload)}`,
                        severity: 'high',
                        category: 'sql_injection',
                        endpoint: scan.endpoint,
                        payload: JSON.stringify(payload),
                        detectedAt: new Date(),
                        remediation: 'Use parameterized queries and input validation',
                    };
                }
            }
        }
        if (scan.testType === 'xss') {
            const payloadString = JSON.stringify(payload);
            if (responseBody.includes(payloadString)) {
                return {
                    id: `vuln_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name: 'Cross-Site Scripting (XSS) Vulnerability',
                    description: `Potential XSS vulnerability detected with payload: ${payloadString}`,
                    severity: 'medium',
                    category: 'xss',
                    endpoint: scan.endpoint,
                    payload: payloadString,
                    detectedAt: new Date(),
                    remediation: 'Escape output and implement Content Security Policy',
                };
            }
        }
        if (scan.expectedResponse) {
            if (scan.expectedResponse.status && response.status !== scan.expectedResponse.status) {
                return {
                    id: `vuln_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name: 'Access Control Vulnerability',
                    description: `Unexpected status code ${response.status}, expected ${scan.expectedResponse.status}`,
                    severity: 'medium',
                    category: 'access_control',
                    endpoint: scan.endpoint,
                    payload: JSON.stringify(payload),
                    detectedAt: new Date(),
                    remediation: 'Implement proper access controls and authentication',
                };
            }
            if (scan.expectedResponse.bodyNotContains && responseBody.includes(scan.expectedResponse.bodyNotContains)) {
                return {
                    id: `vuln_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name: 'Information Disclosure',
                    description: `Forbidden content found in response: ${scan.expectedResponse.bodyNotContains}`,
                    severity: 'medium',
                    category: 'information_disclosure',
                    endpoint: scan.endpoint,
                    payload: JSON.stringify(payload),
                    detectedAt: new Date(),
                    remediation: 'Remove sensitive information from responses',
                };
            }
        }
        return null;
    }
    async executePenetrationTest(test) {
        this.logger.log(`Executing penetration test: ${test.name}`);
        try {
            let response;
            switch (test.method) {
                case 'GET':
                    response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(test.endpoint));
                    break;
                case 'POST':
                    response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(test.endpoint, test.payload));
                    break;
                case 'PUT':
                    response = await (0, rxjs_1.firstValueFrom)(this.httpService.put(test.endpoint, test.payload));
                    break;
                case 'DELETE':
                    response = await (0, rxjs_1.firstValueFrom)(this.httpService.delete(test.endpoint));
                    break;
                case 'PATCH':
                    response = await (0, rxjs_1.firstValueFrom)(this.httpService.patch(test.endpoint, test.payload));
                    break;
            }
            let status = 'skipped';
            let message = '';
            switch (test.expectedBehavior) {
                case 'authorized':
                    if (response.status >= 200 && response.status < 300) {
                        status = 'passed';
                        message = 'Access granted as expected for authorized request';
                    }
                    else {
                        status = 'failed';
                        message = `Expected authorized access but received status ${response.status}`;
                    }
                    break;
                case 'unauthorized':
                    if (response.status === 401 || response.status === 403) {
                        status = 'passed';
                        message = 'Access properly denied for unauthorized request';
                    }
                    else {
                        status = 'failed';
                        message = `Expected unauthorized access (401/403) but received status ${response.status}`;
                    }
                    break;
                case 'rate_limited':
                    if (response.status === 429) {
                        status = 'passed';
                        message = 'Rate limiting properly enforced';
                    }
                    else {
                        status = 'failed';
                        message = `Expected rate limiting (429) but received status ${response.status}`;
                    }
                    break;
            }
            const result = {
                testName: test.name,
                status,
                message,
                timestamp: new Date(),
                details: {
                    status: response.status,
                    headers: response.headers,
                },
            };
            this.logger.log(`Penetration test ${test.name} completed: ${status}`);
            return result;
        }
        catch (error) {
            if (test.expectedBehavior === 'unauthorized') {
                const result = {
                    testName: test.name,
                    status: 'passed',
                    message: 'Access properly denied for unauthorized request (request failed as expected)',
                    timestamp: new Date(),
                };
                this.logger.log(`Penetration test ${test.name} completed: passed`);
                return result;
            }
            else {
                const result = {
                    testName: test.name,
                    status: 'failed',
                    message: `Penetration test execution failed: ${error.message}`,
                    timestamp: new Date(),
                };
                this.logger.error(`Penetration test ${test.name} execution failed: ${error.message}`);
                return result;
            }
        }
    }
    async executeComplianceCheck(check) {
        this.logger.log(`Executing compliance check: ${check.name}`);
        try {
            let score = 100;
            const findings = [];
            switch (check.checkType) {
                case 'gdpr':
                    score = await this.checkGDPRCompliance(check);
                    break;
                case 'ccpa':
                    score = await this.checkCCPACompliance(check);
                    break;
                case 'hipaa':
                    score = await this.checkHIPAACompliance(check);
                    break;
                case 'pci_dss':
                    score = await this.checkPCIDSSCompliance(check);
                    break;
                case 'soc2':
                    score = await this.checkSOC2Compliance(check);
                    break;
            }
            const status = score >= this.config.securityMetrics.minComplianceScore ? 'passed' : 'failed';
            const message = status === 'passed'
                ? `Compliance check passed with score ${score}%`
                : `Compliance check failed with score ${score}% (minimum required: ${this.config.securityMetrics.minComplianceScore}%)`;
            const result = {
                checkName: check.name,
                status,
                score,
                message,
                timestamp: new Date(),
                findings,
            };
            this.logger.log(`Compliance check ${check.name} completed: ${status} (${score}%)`);
            return result;
        }
        catch (error) {
            const result = {
                checkName: check.name,
                status: 'failed',
                score: 0,
                message: `Compliance check execution failed: ${error.message}`,
                timestamp: new Date(),
            };
            this.logger.error(`Compliance check ${check.name} execution failed: ${error.message}`);
            return result;
        }
    }
    async checkGDPRCompliance(check) {
        let score = 100;
        const findings = [];
        if (check.endpoint) {
            try {
                await (0, rxjs_1.firstValueFrom)(this.httpService.get(check.endpoint));
            }
            catch (error) {
                score -= 20;
                findings.push('Privacy endpoint not accessible');
            }
        }
        return score;
    }
    async checkCCPACompliance(check) {
        let score = 100;
        const findings = [];
        if (check.endpoint) {
            try {
                await (0, rxjs_1.firstValueFrom)(this.httpService.get(check.endpoint));
            }
            catch (error) {
                score -= 25;
                findings.push('CCPA compliance endpoint not accessible');
            }
        }
        return score;
    }
    async checkHIPAACompliance(check) {
        let score = 100;
        const findings = [];
        if (check.endpoint) {
            try {
                const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(check.endpoint));
                const responseBody = JSON.stringify(response.data);
                if (responseBody.includes('ssn') || responseBody.includes('medical')) {
                    score -= 30;
                    findings.push('Potential PHI exposure detected');
                }
            }
            catch (error) {
                score -= 25;
                findings.push('HIPAA compliance endpoint not accessible');
            }
        }
        return score;
    }
    async checkPCIDSSCompliance(check) {
        let score = 100;
        const findings = [];
        if (check.endpoint) {
            try {
                const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(check.endpoint));
                const responseBody = JSON.stringify(response.data);
                if (responseBody.includes('card') || responseBody.includes('cvv')) {
                    score -= 40;
                    findings.push('Potential card data exposure detected');
                }
            }
            catch (error) {
                score -= 25;
                findings.push('PCI DSS compliance endpoint not accessible');
            }
        }
        return score;
    }
    async checkSOC2Compliance(check) {
        let score = 100;
        const findings = [];
        if (check.endpoint) {
            try {
                await (0, rxjs_1.firstValueFrom)(this.httpService.get(check.endpoint));
            }
            catch (error) {
                score -= 20;
                findings.push('SOC 2 compliance endpoint not accessible');
            }
        }
        return score;
    }
    generateSummary(vulnerabilities, penetrationTests, complianceChecks) {
        const criticalVulnerabilities = vulnerabilities.filter(v => v.severity === 'critical').length;
        const highVulnerabilities = vulnerabilities.filter(v => v.severity === 'high').length;
        const mediumVulnerabilities = vulnerabilities.filter(v => v.severity === 'medium').length;
        const lowVulnerabilities = vulnerabilities.filter(v => v.severity === 'low').length;
        const totalVulnerabilities = vulnerabilities.length;
        const passedPenetrationTests = penetrationTests.filter(t => t.status === 'passed').length;
        const failedPenetrationTests = penetrationTests.filter(t => t.status === 'failed').length;
        const passedComplianceChecks = complianceChecks.filter(c => c.status === 'passed').length;
        const failedComplianceChecks = complianceChecks.filter(c => c.status === 'failed').length;
        const totalComplianceScore = complianceChecks.reduce((sum, c) => sum + c.score, 0);
        const complianceScore = complianceChecks.length > 0 ? totalComplianceScore / complianceChecks.length : 100;
        return {
            totalVulnerabilities,
            criticalVulnerabilities,
            highVulnerabilities,
            mediumVulnerabilities,
            lowVulnerabilities,
            passedPenetrationTests,
            failedPenetrationTests,
            passedComplianceChecks,
            failedComplianceChecks,
            complianceScore,
        };
    }
    determineOverallStatus(summary) {
        if (summary.criticalVulnerabilities > this.config.securityMetrics.maxCriticalVulnerabilities) {
            return 'failed';
        }
        if (summary.totalVulnerabilities > this.config.securityMetrics.maxVulnerabilities) {
            return 'failed';
        }
        if (summary.complianceScore < this.config.securityMetrics.minComplianceScore) {
            return 'failed';
        }
        if (summary.failedPenetrationTests > 0 || summary.failedComplianceChecks > 0) {
            return 'partial';
        }
        if (summary.criticalVulnerabilities > 0 || summary.highVulnerabilities > 0) {
            return 'partial';
        }
        return 'passed';
    }
    getConfiguration() {
        return { ...this.config };
    }
    updateConfiguration(config) {
        this.config = { ...this.config, ...config };
        this.logger.log('Security testing configuration updated');
    }
    addVulnerabilityScan(scan) {
        this.config.vulnerabilityScans.push(scan);
        this.logger.log(`Added vulnerability scan ${scan.name}`);
    }
    addPenetrationTest(test) {
        this.config.penetrationTests.push(test);
        this.logger.log(`Added penetration test ${test.name}`);
    }
    addComplianceCheck(check) {
        this.config.complianceChecks.push(check);
        this.logger.log(`Added compliance check ${check.name}`);
    }
};
exports.SecurityTestingService = SecurityTestingService;
exports.SecurityTestingService = SecurityTestingService = SecurityTestingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], SecurityTestingService);
//# sourceMappingURL=security-testing.service.js.map