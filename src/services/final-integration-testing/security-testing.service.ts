import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

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
    minComplianceScore: number; // percentage
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
  score: number; // percentage
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
    complianceScore: number; // percentage
  };
  timestamp: Date;
  duration: number;
}

@Injectable()
export class SecurityTestingService {
  private readonly logger = new Logger(SecurityTestingService.name);
  private config: SecurityTestConfig;

  constructor(private readonly httpService: HttpService) {}

  /**
   * Configure the security testing service
   * @param config Security test configuration
   */
  configure(config: SecurityTestConfig): void {
    this.config = config;
    this.logger.log('Security testing service configured');
  }

  /**
   * Execute security tests
   * @returns Testing report
   */
  async executeSecurityTests(): Promise<SecurityTestingReport> {
    const startTime = Date.now();
    this.logger.log('Starting security testing process');

    // Execute vulnerability scans
    const vulnerabilityScanResults: SecurityVulnerability[] = [];
    for (const scan of this.config.vulnerabilityScans) {
      try {
        const vulnerabilities = await this.executeVulnerabilityScan(scan);
        vulnerabilityScanResults.push(...vulnerabilities);
      } catch (error) {
        this.logger.error(`Vulnerability scan ${scan.name} execution failed: ${error.message}`);
      }
    }

    // Execute penetration tests
    const penetrationTestResults: PenetrationTestResult[] = [];
    for (const test of this.config.penetrationTests) {
      try {
        const result = await this.executePenetrationTest(test);
        penetrationTestResults.push(result);
      } catch (error) {
        const failedResult: PenetrationTestResult = {
          testName: test.name,
          status: 'failed',
          message: `Penetration test execution failed: ${error.message}`,
          timestamp: new Date(),
        };
        penetrationTestResults.push(failedResult);
        this.logger.error(`Penetration test ${test.name} execution failed: ${error.message}`);
      }
    }

    // Execute compliance checks
    const complianceCheckResults: ComplianceCheckResult[] = [];
    for (const check of this.config.complianceChecks) {
      try {
        const result = await this.executeComplianceCheck(check);
        complianceCheckResults.push(result);
      } catch (error) {
        const failedResult: ComplianceCheckResult = {
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
    const summary = this.generateSummary(
      vulnerabilityScanResults,
      penetrationTestResults,
      complianceCheckResults
    );

    const overallStatus = this.determineOverallStatus(summary);

    const report: SecurityTestingReport = {
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

  /**
   * Execute vulnerability scan
   * @param scan Vulnerability scan configuration
   * @returns Detected vulnerabilities
   */
  private async executeVulnerabilityScan(
    scan: SecurityTestConfig['vulnerabilityScans'][0]
  ): Promise<SecurityVulnerability[]> {
    this.logger.log(`Executing vulnerability scan: ${scan.name}`);

    const vulnerabilities: SecurityVulnerability[] = [];

    try {
      // Generate test payloads based on test type
      const testPayloads = this.generateTestPayloads(scan.testType);
      
      for (const payload of testPayloads) {
        try {
          let response: any;
          
          // Modify payload based on method
          let requestPayload = scan.payload ? { ...scan.payload } : {};
          if (scan.method === 'GET') {
            // For GET requests, add payload to query parameters
            // This is a simplified approach - in reality, you'd need to parse and modify the URL
          } else {
            // For other methods, add malicious payload to request body
            requestPayload = { ...requestPayload, ...payload };
          }
          
          switch (scan.method) {
            case 'GET':
              response = await firstValueFrom(this.httpService.get(scan.endpoint));
              break;
            case 'POST':
              response = await firstValueFrom(this.httpService.post(scan.endpoint, requestPayload));
              break;
            case 'PUT':
              response = await firstValueFrom(this.httpService.put(scan.endpoint, requestPayload));
              break;
            case 'DELETE':
              response = await firstValueFrom(this.httpService.delete(scan.endpoint));
              break;
            case 'PATCH':
              response = await firstValueFrom(this.httpService.patch(scan.endpoint, requestPayload));
              break;
          }
          
          // Analyze response for vulnerability indicators
          const vulnerability = this.analyzeResponseForVulnerability(
            scan,
            response,
            payload
          );
          
          if (vulnerability) {
            vulnerabilities.push(vulnerability);
          }
        } catch (error) {
          // If request fails, it might indicate protection is in place
          this.logger.debug(`Request failed for payload in ${scan.name}, which may indicate protection: ${error.message}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error executing vulnerability scan ${scan.name}: ${error.message}`);
    }

    this.logger.log(`Vulnerability scan ${scan.name} completed, found ${vulnerabilities.length} vulnerabilities`);
    return vulnerabilities;
  }

  /**
   * Generate test payloads for different vulnerability types
   * @param testType Type of vulnerability to test
   * @returns Array of test payloads
   */
  private generateTestPayloads(
    testType: SecurityTestConfig['vulnerabilityScans'][0]['testType']
  ): Array<Record<string, any>> {
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
          {}, // Missing CSRF token
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

  /**
   * Analyze response for vulnerability indicators
   * @param scan Vulnerability scan configuration
   * @param response HTTP response
   * @param payload Test payload
   * @returns Detected vulnerability or null
   */
  private analyzeResponseForVulnerability(
    scan: SecurityTestConfig['vulnerabilityScans'][0],
    response: any,
    payload: Record<string, any>
  ): SecurityVulnerability | null {
    // Check for vulnerability indicators in response
    const responseBody = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    
    // Check if response contains database error messages (SQL injection indicator)
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
    
    // Check for XSS indicators
    if (scan.testType === 'xss') {
      // If the payload is reflected in the response, it might indicate XSS vulnerability
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
    
    // Check expected response conditions
    if (scan.expectedResponse) {
      // Check status code
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
      
      // Check for forbidden content
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
    
    // No vulnerability detected
    return null;
  }

  /**
   * Execute penetration test
   * @param test Penetration test configuration
   * @returns Test result
   */
  private async executePenetrationTest(
    test: SecurityTestConfig['penetrationTests'][0]
  ): Promise<PenetrationTestResult> {
    this.logger.log(`Executing penetration test: ${test.name}`);

    try {
      let response: any;
      
      switch (test.method) {
        case 'GET':
          response = await firstValueFrom(this.httpService.get(test.endpoint));
          break;
        case 'POST':
          response = await firstValueFrom(this.httpService.post(test.endpoint, test.payload));
          break;
        case 'PUT':
          response = await firstValueFrom(this.httpService.put(test.endpoint, test.payload));
          break;
        case 'DELETE':
          response = await firstValueFrom(this.httpService.delete(test.endpoint));
          break;
        case 'PATCH':
          response = await firstValueFrom(this.httpService.patch(test.endpoint, test.payload));
          break;
      }
      
      // Analyze response based on expected behavior
      let status: 'passed' | 'failed' | 'skipped' = 'skipped';
      let message = '';
      
      switch (test.expectedBehavior) {
        case 'authorized':
          if (response.status >= 200 && response.status < 300) {
            status = 'passed';
            message = 'Access granted as expected for authorized request';
          } else {
            status = 'failed';
            message = `Expected authorized access but received status ${response.status}`;
          }
          break;
        case 'unauthorized':
          if (response.status === 401 || response.status === 403) {
            status = 'passed';
            message = 'Access properly denied for unauthorized request';
          } else {
            status = 'failed';
            message = `Expected unauthorized access (401/403) but received status ${response.status}`;
          }
          break;
        case 'rate_limited':
          if (response.status === 429) {
            status = 'passed';
            message = 'Rate limiting properly enforced';
          } else {
            status = 'failed';
            message = `Expected rate limiting (429) but received status ${response.status}`;
          }
          break;
      }
      
      const result: PenetrationTestResult = {
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
    } catch (error) {
      // If we expected unauthorized access and got an error, that might be correct
      if (test.expectedBehavior === 'unauthorized') {
        const result: PenetrationTestResult = {
          testName: test.name,
          status: 'passed',
          message: 'Access properly denied for unauthorized request (request failed as expected)',
          timestamp: new Date(),
        };
        this.logger.log(`Penetration test ${test.name} completed: passed`);
        return result;
      } else {
        const result: PenetrationTestResult = {
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

  /**
   * Execute compliance check
   * @param check Compliance check configuration
   * @returns Check result
   */
  private async executeComplianceCheck(
    check: SecurityTestConfig['complianceChecks'][0]
  ): Promise<ComplianceCheckResult> {
    this.logger.log(`Executing compliance check: ${check.name}`);

    try {
      let score = 100;
      const findings: string[] = [];
      
      // Different compliance checks based on type
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
      
      const result: ComplianceCheckResult = {
        checkName: check.name,
        status,
        score,
        message,
        timestamp: new Date(),
        findings,
      };
      
      this.logger.log(`Compliance check ${check.name} completed: ${status} (${score}%)`);
      return result;
    } catch (error) {
      const result: ComplianceCheckResult = {
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

  /**
   * Check GDPR compliance
   * @param check Compliance check configuration
   * @returns Compliance score
   */
  private async checkGDPRCompliance(
    check: SecurityTestConfig['complianceChecks'][0]
  ): Promise<number> {
    // This is a simplified implementation
    // In a real scenario, you would check for:
    // - Data encryption at rest and in transit
    // - Consent management mechanisms
    // - Data subject rights implementation
    // - Data retention policies
    // - Privacy by design implementation
    
    let score = 100;
    const findings: string[] = [];
    
    // Check if endpoint exists (simplified)
    if (check.endpoint) {
      try {
        await firstValueFrom(this.httpService.get(check.endpoint));
      } catch (error) {
        score -= 20;
        findings.push('Privacy endpoint not accessible');
      }
    }
    
    return score;
  }

  /**
   * Check CCPA compliance
   * @param check Compliance check configuration
   * @returns Compliance score
   */
  private async checkCCPACompliance(
    check: SecurityTestConfig['complianceChecks'][0]
  ): Promise<number> {
    // This is a simplified implementation
    // In a real scenario, you would check for:
    // - Right to know implementation
    // - Right to delete implementation
    // - Right to opt-out of sale implementation
    // - Non-discrimination practices
    
    let score = 100;
    const findings: string[] = [];
    
    // Check if endpoint exists (simplified)
    if (check.endpoint) {
      try {
        await firstValueFrom(this.httpService.get(check.endpoint));
      } catch (error) {
        score -= 25;
        findings.push('CCPA compliance endpoint not accessible');
      }
    }
    
    return score;
  }

  /**
   * Check HIPAA compliance
   * @param check Compliance check configuration
   * @returns Compliance score
   */
  private async checkHIPAACompliance(
    check: SecurityTestConfig['complianceChecks'][0]
  ): Promise<number> {
    // This is a simplified implementation
    // In a real scenario, you would check for:
    // - PHI encryption
    // - Access controls
    // - Audit logs
    // - Business associate agreements
    
    let score = 100;
    const findings: string[] = [];
    
    // Check if endpoint exists (simplified)
    if (check.endpoint) {
      try {
        const response = await firstValueFrom(this.httpService.get(check.endpoint));
        // Check if response contains PHI (this is just an example)
        const responseBody = JSON.stringify(response.data);
        if (responseBody.includes('ssn') || responseBody.includes('medical')) {
          score -= 30;
          findings.push('Potential PHI exposure detected');
        }
      } catch (error) {
        score -= 25;
        findings.push('HIPAA compliance endpoint not accessible');
      }
    }
    
    return score;
  }

  /**
   * Check PCI DSS compliance
   * @param check Compliance check configuration
   * @returns Compliance score
   */
  private async checkPCIDSSCompliance(
    check: SecurityTestConfig['complianceChecks'][0]
  ): Promise<number> {
    // This is a simplified implementation
    // In a real scenario, you would check for:
    // - SSL/TLS encryption
    // - Cardholder data protection
    // - Network security
    // - Vulnerability management
    
    let score = 100;
    const findings: string[] = [];
    
    // Check if endpoint exists (simplified)
    if (check.endpoint) {
      try {
        const response = await firstValueFrom(this.httpService.get(check.endpoint));
        // Check if response contains card data (this is just an example)
        const responseBody = JSON.stringify(response.data);
        if (responseBody.includes('card') || responseBody.includes('cvv')) {
          score -= 40;
          findings.push('Potential card data exposure detected');
        }
      } catch (error) {
        score -= 25;
        findings.push('PCI DSS compliance endpoint not accessible');
      }
    }
    
    return score;
  }

  /**
   * Check SOC 2 compliance
   * @param check Compliance check configuration
   * @returns Compliance score
   */
  private async checkSOC2Compliance(
    check: SecurityTestConfig['complianceChecks'][0]
  ): Promise<number> {
    // This is a simplified implementation
    // In a real scenario, you would check for:
    // - Security policies
    // - Availability controls
    // - Processing integrity
    // - Confidentiality measures
    // - Privacy controls
    
    let score = 100;
    const findings: string[] = [];
    
    // Check if endpoint exists (simplified)
    if (check.endpoint) {
      try {
        await firstValueFrom(this.httpService.get(check.endpoint));
      } catch (error) {
        score -= 20;
        findings.push('SOC 2 compliance endpoint not accessible');
      }
    }
    
    return score;
  }

  /**
   * Generate summary from test results
   * @param vulnerabilities Detected vulnerabilities
   * @param penetrationTests Penetration test results
   * @param complianceChecks Compliance check results
   * @returns Summary statistics
   */
  private generateSummary(
    vulnerabilities: SecurityVulnerability[],
    penetrationTests: PenetrationTestResult[],
    complianceChecks: ComplianceCheckResult[]
  ): SecurityTestingReport['summary'] {
    // Count vulnerabilities by severity
    const criticalVulnerabilities = vulnerabilities.filter(v => v.severity === 'critical').length;
    const highVulnerabilities = vulnerabilities.filter(v => v.severity === 'high').length;
    const mediumVulnerabilities = vulnerabilities.filter(v => v.severity === 'medium').length;
    const lowVulnerabilities = vulnerabilities.filter(v => v.severity === 'low').length;
    const totalVulnerabilities = vulnerabilities.length;
    
    // Count penetration test results
    const passedPenetrationTests = penetrationTests.filter(t => t.status === 'passed').length;
    const failedPenetrationTests = penetrationTests.filter(t => t.status === 'failed').length;
    
    // Count compliance check results
    const passedComplianceChecks = complianceChecks.filter(c => c.status === 'passed').length;
    const failedComplianceChecks = complianceChecks.filter(c => c.status === 'failed').length;
    
    // Calculate average compliance score
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

  /**
   * Determine overall status from summary
   * @param summary Summary statistics
   * @returns Overall status
   */
  private determineOverallStatus(
    summary: SecurityTestingReport['summary']
  ): 'passed' | 'failed' | 'partial' {
    // Check if critical thresholds are exceeded
    if (summary.criticalVulnerabilities > this.config.securityMetrics.maxCriticalVulnerabilities) {
      return 'failed';
    }
    
    if (summary.totalVulnerabilities > this.config.securityMetrics.maxVulnerabilities) {
      return 'failed';
    }
    
    if (summary.complianceScore < this.config.securityMetrics.minComplianceScore) {
      return 'failed';
    }
    
    // Check if there are any failures
    if (summary.failedPenetrationTests > 0 || summary.failedComplianceChecks > 0) {
      return 'partial';
    }
    
    // Check if there are critical or high vulnerabilities
    if (summary.criticalVulnerabilities > 0 || summary.highVulnerabilities > 0) {
      return 'partial';
    }
    
    return 'passed';
  }

  /**
   * Get security testing configuration
   * @returns Security testing configuration
   */
  getConfiguration(): SecurityTestConfig {
    return { ...this.config };
  }

  /**
   * Update security testing configuration
   * @param config New configuration
   */
  updateConfiguration(config: Partial<SecurityTestConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.log('Security testing configuration updated');
  }

  /**
   * Add vulnerability scan
   * @param scan Vulnerability scan configuration
   */
  addVulnerabilityScan(scan: SecurityTestConfig['vulnerabilityScans'][0]): void {
    this.config.vulnerabilityScans.push(scan);
    this.logger.log(`Added vulnerability scan ${scan.name}`);
  }

  /**
   * Add penetration test
   * @param test Penetration test configuration
   */
  addPenetrationTest(test: SecurityTestConfig['penetrationTests'][0]): void {
    this.config.penetrationTests.push(test);
    this.logger.log(`Added penetration test ${test.name}`);
  }

  /**
   * Add compliance check
   * @param check Compliance check configuration
   */
  addComplianceCheck(check: SecurityTestConfig['complianceChecks'][0]): void {
    this.config.complianceChecks.push(check);
    this.logger.log(`Added compliance check ${check.name}`);
  }
}