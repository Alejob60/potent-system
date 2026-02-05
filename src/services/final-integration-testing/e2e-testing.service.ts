import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface E2ETestConfig {
  testSuites: Array<{
    name: string;
    description: string;
    tests: Array<{
      name: string;
      description: string;
      endpoint: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      payload?: any;
      expectedStatus: number;
      timeout: number;
      validation?: (response: any) => boolean;
    }>;
  }>;
  parallelExecution: boolean;
  maxConcurrency: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface E2ETestResult {
  testName: string;
  testSuite: string;
  status: 'passed' | 'failed' | 'skipped';
  message: string;
  timestamp: Date;
  responseTime: number;
  details?: any;
}

export interface E2ETestSuiteResult {
  suiteName: string;
  status: 'passed' | 'failed' | 'partial';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  results: E2ETestResult[];
  timestamp: Date;
  duration: number;
}

export interface E2ETestingReport {
  overallStatus: 'passed' | 'failed' | 'partial';
  totalSuites: number;
  passedSuites: number;
  failedSuites: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  suiteResults: E2ETestSuiteResult[];
  timestamp: Date;
  duration: number;
}

@Injectable()
export class E2ETestingService {
  private readonly logger = new Logger(E2ETestingService.name);
  private config: E2ETestConfig;

  constructor(private readonly httpService: HttpService) {}

  /**
   * Configure the E2E testing service
   * @param config E2E test configuration
   */
  configure(config: E2ETestConfig): void {
    this.config = config;
    this.logger.log(`E2E testing service configured with ${config.testSuites.length} test suites`);
  }

  /**
   * Execute end-to-end tests
   * @returns Testing report
   */
  async executeE2ETests(): Promise<E2ETestingReport> {
    const startTime = Date.now();
    this.logger.log('Starting end-to-end testing process');

    const suiteResults: E2ETestSuiteResult[] = [];
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;
    let passedSuites = 0;
    let failedSuites = 0;

    // Execute test suites
    for (const suite of this.config.testSuites) {
      try {
        const suiteResult = await this.executeTestSuite(suite);
        suiteResults.push(suiteResult);
        
        totalTests += suiteResult.totalTests;
        passedTests += suiteResult.passedTests;
        failedTests += suiteResult.failedTests;
        skippedTests += suiteResult.skippedTests;
        
        if (suiteResult.status === 'passed') {
          passedSuites++;
        } else if (suiteResult.status === 'failed') {
          failedSuites++;
        }
      } catch (error) {
        const failedSuiteResult: E2ETestSuiteResult = {
          suiteName: suite.name,
          status: 'failed',
          totalTests: 0,
          passedTests: 0,
          failedTests: 0,
          skippedTests: 0,
          results: [{
            testName: 'Suite Execution',
            testSuite: suite.name,
            status: 'failed',
            message: `Test suite execution failed: ${error.message}`,
            timestamp: new Date(),
            responseTime: 0,
          }],
          timestamp: new Date(),
          duration: 0,
        };
        suiteResults.push(failedSuiteResult);
        failedSuites++;
        this.logger.error(`Test suite ${suite.name} execution failed: ${error.message}`);
      }
    }

    const duration = Date.now() - startTime;
    const overallStatus = 
      failedSuites === 0 ? 'passed' : 
      passedSuites > 0 ? 'partial' : 'failed';

    const report: E2ETestingReport = {
      overallStatus,
      totalSuites: this.config.testSuites.length,
      passedSuites,
      failedSuites,
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      suiteResults,
      timestamp: new Date(),
      duration,
    };

    this.logger.log(`E2E testing completed: ${overallStatus} (${passedTests}/${totalTests} tests passed)`);
    return report;
  }

  /**
   * Execute individual test suite
   * @param suite Test suite
   * @returns Test suite result
   */
  private async executeTestSuite(suite: E2ETestConfig['testSuites'][0]): Promise<E2ETestSuiteResult> {
    const startTime = Date.now();
    this.logger.log(`Executing test suite: ${suite.name}`);

    const results: E2ETestResult[] = [];
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;

    // Execute tests in the suite
    for (const test of suite.tests) {
      try {
        const result = await this.executeTest(test, suite.name);
        results.push(result);
        
        if (result.status === 'passed') {
          passedTests++;
        } else if (result.status === 'failed') {
          failedTests++;
        } else {
          skippedTests++;
        }
      } catch (error) {
        const failureResult: E2ETestResult = {
          testName: test.name,
          testSuite: suite.name,
          status: 'failed',
          message: `Test execution failed: ${error.message}`,
          timestamp: new Date(),
          responseTime: 0,
        };
        results.push(failureResult);
        failedTests++;
        this.logger.error(`Test ${test.name} execution failed: ${error.message}`);
      }
    }

    const duration = Date.now() - startTime;
    const status = 
      failedTests === 0 ? 'passed' : 
      passedTests > 0 ? 'partial' : 'failed';

    const suiteResult: E2ETestSuiteResult = {
      suiteName: suite.name,
      status,
      totalTests: suite.tests.length,
      passedTests,
      failedTests,
      skippedTests,
      results,
      timestamp: new Date(),
      duration,
    };

    this.logger.log(`Test suite ${suite.name} completed: ${status} (${passedTests}/${suite.tests.length} tests passed)`);
    return suiteResult;
  }

  /**
   * Execute individual test
   * @param test Test configuration
   * @param suiteName Suite name
   * @returns Test result
   */
  private async executeTest(
    test: E2ETestConfig['testSuites'][0]['tests'][0],
    suiteName: string
  ): Promise<E2ETestResult> {
    const startTime = Date.now();
    
    try {
      // Attempt to execute the test with retries
      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
        try {
          let response: any;
          
          switch (test.method) {
            case 'GET':
              response = await firstValueFrom(
                this.httpService.get(test.endpoint, {
                  timeout: test.timeout,
                })
              );
              break;
            case 'POST':
              response = await firstValueFrom(
                this.httpService.post(test.endpoint, test.payload, {
                  timeout: test.timeout,
                })
              );
              break;
            case 'PUT':
              response = await firstValueFrom(
                this.httpService.put(test.endpoint, test.payload, {
                  timeout: test.timeout,
                })
              );
              break;
            case 'DELETE':
              response = await firstValueFrom(
                this.httpService.delete(test.endpoint, {
                  timeout: test.timeout,
                })
              );
              break;
            case 'PATCH':
              response = await firstValueFrom(
                this.httpService.patch(test.endpoint, test.payload, {
                  timeout: test.timeout,
                })
              );
              break;
          }
          
          const responseTime = Date.now() - startTime;
          
          // Check expected status
          if (response.status === test.expectedStatus) {
            // Run custom validation if provided
            if (test.validation) {
              const isValid = test.validation(response.data);
              if (!isValid) {
                return {
                  testName: test.name,
                  testSuite: suiteName,
                  status: 'failed',
                  message: 'Test validation failed',
                  timestamp: new Date(),
                  responseTime,
                  details: {
                    status: response.status,
                    data: response.data,
                  },
                };
              }
            }
            
            return {
              testName: test.name,
              testSuite: suiteName,
              status: 'passed',
              message: `Test passed with status ${response.status}`,
              timestamp: new Date(),
              responseTime,
              details: {
                status: response.status,
                data: response.data,
              },
            };
          } else {
            return {
              testName: test.name,
              testSuite: suiteName,
              status: 'failed',
              message: `Test failed: expected status ${test.expectedStatus}, got ${response.status}`,
              timestamp: new Date(),
              responseTime,
              details: {
                status: response.status,
                data: response.data,
              },
            };
          }
        } catch (error) {
          lastError = error;
          
          if (attempt < this.config.retryAttempts) {
            this.logger.warn(`Test ${test.name} failed (attempt ${attempt}/${this.config.retryAttempts}), retrying in ${this.config.retryDelay}ms: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
          }
        }
      }
      
      // All retries failed
      const responseTime = Date.now() - startTime;
      return {
        testName: test.name,
        testSuite: suiteName,
        status: 'failed',
        message: `Test failed after ${this.config.retryAttempts} attempts: ${lastError ? lastError.message : 'Unknown error'}`,
        timestamp: new Date(),
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        testName: test.name,
        testSuite: suiteName,
        status: 'failed',
        message: `Test execution failed: ${error.message}`,
        timestamp: new Date(),
        responseTime,
      };
    }
  }

  /**
   * Validate E2E testing results
   * @param report Testing report
   * @returns Boolean indicating if testing is valid
   */
  validateE2ETesting(report: E2ETestingReport): boolean {
    // Testing is valid if all tests pass
    return report.overallStatus === 'passed';
  }

  /**
   * Get E2E testing configuration
   * @returns E2E testing configuration
   */
  getConfiguration(): E2ETestConfig {
    return { ...this.config };
  }

  /**
   * Update E2E testing configuration
   * @param config New configuration
   */
  updateConfiguration(config: Partial<E2ETestConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.log('E2E testing configuration updated');
  }

  /**
   * Add test suite
   * @param suite Test suite
   */
  addTestSuite(suite: E2ETestConfig['testSuites'][0]): void {
    this.config.testSuites.push(suite);
    this.logger.log(`Added test suite ${suite.name}`);
  }

  /**
   * Remove test suite
   * @param suiteName Suite name
   */
  removeTestSuite(suiteName: string): void {
    this.config.testSuites = this.config.testSuites.filter(suite => suite.name !== suiteName);
    this.logger.log(`Removed test suite ${suiteName}`);
  }
}