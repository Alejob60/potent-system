import { Injectable, Logger } from '@nestjs/common';

export interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  errorMessage?: string;
  details?: any;
}

@Injectable()
export class TestingService {
  private readonly logger = new Logger(TestingService.name);

  /**
   * Run a test suite
   * @param suiteName Name of the test suite
   * @param tests Array of test functions to run
   * @returns Promise resolving to array of test results
   */
  async runTestSuite(
    suiteName: string,
    tests: Array<{ name: string; testFn: () => Promise<void> }>
  ): Promise<TestResult[]> {
    this.logger.log(`Starting test suite: ${suiteName}`);
    
    const results: TestResult[] = [];
    
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
      } catch (error) {
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
    
    this.logger.log(
      `Test suite ${suiteName} completed: ${passedTests} passed, ${failedTests} failed`
    );
    
    return results;
  }

  /**
   * Generate test report
   * @param suiteName Name of the test suite
   * @param results Test results
   * @returns Formatted test report
   */
  generateTestReport(suiteName: string, results: TestResult[]): string {
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
}