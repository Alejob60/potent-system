import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface PerformanceTestConfig {
  loadTests: Array<{
    name: string;
    description: string;
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    payload?: any;
    concurrency: number;
    duration: number; // in seconds
    rampUpTime: number; // in seconds
  }>;
  stressTests: Array<{
    name: string;
    description: string;
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    payload?: any;
    maxConcurrency: number;
    rampUpTime: number; // in seconds
  }>;
  scalabilityTests: Array<{
    name: string;
    description: string;
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    payload?: any;
    concurrencyLevels: number[];
    duration: number; // in seconds
  }>;
  metrics: {
    responseTimeThreshold: number; // in milliseconds
    errorRateThreshold: number; // percentage
    throughputThreshold: number; // requests per second
  };
}

export interface PerformanceMetrics {
  responseTime: {
    avg: number;
    min: number;
    max: number;
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSecond: number;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    errorRate: number;
  };
  concurrency: number;
  timestamp: Date;
}

export interface LoadTestResult {
  testName: string;
  status: 'passed' | 'failed';
  metrics: PerformanceMetrics;
  message: string;
  timestamp: Date;
  duration: number;
}

export interface StressTestResult {
  testName: string;
  status: 'passed' | 'failed';
  metrics: PerformanceMetrics;
  maxConcurrencyReached: number;
  message: string;
  timestamp: Date;
  duration: number;
}

export interface ScalabilityTestResult {
  testName: string;
  status: 'passed' | 'failed' | 'partial';
  concurrencyResults: Array<{
    concurrency: number;
    metrics: PerformanceMetrics;
    status: 'passed' | 'failed';
  }>;
  message: string;
  timestamp: Date;
  duration: number;
}

export interface PerformanceTestingReport {
  overallStatus: 'passed' | 'failed' | 'partial';
  loadTestResults: LoadTestResult[];
  stressTestResults: StressTestResult[];
  scalabilityTestResults: ScalabilityTestResult[];
  timestamp: Date;
  duration: number;
}

@Injectable()
export class PerformanceTestingService {
  private readonly logger = new Logger(PerformanceTestingService.name);
  private config: PerformanceTestConfig;

  constructor(private readonly httpService: HttpService) {}

  /**
   * Configure the performance testing service
   * @param config Performance test configuration
   */
  configure(config: PerformanceTestConfig): void {
    this.config = config;
    this.logger.log('Performance testing service configured');
  }

  /**
   * Execute performance tests
   * @returns Testing report
   */
  async executePerformanceTests(): Promise<PerformanceTestingReport> {
    const startTime = Date.now();
    this.logger.log('Starting performance testing process');

    // Execute load tests
    const loadTestResults: LoadTestResult[] = [];
    for (const test of this.config.loadTests) {
      try {
        const result = await this.executeLoadTest(test);
        loadTestResults.push(result);
      } catch (error) {
        const failedResult: LoadTestResult = {
          testName: test.name,
          status: 'failed',
          metrics: {
            responseTime: {
              avg: 0,
              min: 0,
              max: 0,
              p50: 0,
              p90: 0,
              p95: 0,
              p99: 0,
            },
            throughput: {
              requestsPerSecond: 0,
              totalRequests: 0,
              successfulRequests: 0,
              failedRequests: 0,
              errorRate: 0,
            },
            concurrency: test.concurrency,
            timestamp: new Date(),
          },
          message: `Load test execution failed: ${error.message}`,
          timestamp: new Date(),
          duration: 0,
        };
        loadTestResults.push(failedResult);
        this.logger.error(`Load test ${test.name} execution failed: ${error.message}`);
      }
    }

    // Execute stress tests
    const stressTestResults: StressTestResult[] = [];
    for (const test of this.config.stressTests) {
      try {
        const result = await this.executeStressTest(test);
        stressTestResults.push(result);
      } catch (error) {
        const failedResult: StressTestResult = {
          testName: test.name,
          status: 'failed',
          metrics: {
            responseTime: {
              avg: 0,
              min: 0,
              max: 0,
              p50: 0,
              p90: 0,
              p95: 0,
              p99: 0,
            },
            throughput: {
              requestsPerSecond: 0,
              totalRequests: 0,
              successfulRequests: 0,
              failedRequests: 0,
              errorRate: 0,
            },
            concurrency: 0,
            timestamp: new Date(),
          },
          maxConcurrencyReached: 0,
          message: `Stress test execution failed: ${error.message}`,
          timestamp: new Date(),
          duration: 0,
        };
        stressTestResults.push(failedResult);
        this.logger.error(`Stress test ${test.name} execution failed: ${error.message}`);
      }
    }

    // Execute scalability tests
    const scalabilityTestResults: ScalabilityTestResult[] = [];
    for (const test of this.config.scalabilityTests) {
      try {
        const result = await this.executeScalabilityTest(test);
        scalabilityTestResults.push(result);
      } catch (error) {
        const failedResult: ScalabilityTestResult = {
          testName: test.name,
          status: 'failed',
          concurrencyResults: [],
          message: `Scalability test execution failed: ${error.message}`,
          timestamp: new Date(),
          duration: 0,
        };
        scalabilityTestResults.push(failedResult);
        this.logger.error(`Scalability test ${test.name} execution failed: ${error.message}`);
      }
    }

    const duration = Date.now() - startTime;
    const overallStatus = this.determineOverallStatus(
      loadTestResults,
      stressTestResults,
      scalabilityTestResults
    );

    const report: PerformanceTestingReport = {
      overallStatus,
      loadTestResults,
      stressTestResults,
      scalabilityTestResults,
      timestamp: new Date(),
      duration,
    };

    this.logger.log(`Performance testing completed: ${overallStatus}`);
    return report;
  }

  /**
   * Execute load test
   * @param test Load test configuration
   * @returns Load test result
   */
  private async executeLoadTest(
    test: PerformanceTestConfig['loadTests'][0]
  ): Promise<LoadTestResult> {
    const startTime = Date.now();
    this.logger.log(`Executing load test: ${test.name}`);

    // Simulate load test with concurrency over duration
    const requests: Array<Promise<any>> = [];
    const responseTimes: number[] = [];
    let successfulRequests = 0;
    let failedRequests = 0;

    // Ramp up requests over time
    const interval = test.rampUpTime * 1000 / test.concurrency;
    const durationMs = test.duration * 1000;

    for (let i = 0; i < test.concurrency; i++) {
      setTimeout(() => {
        const requestStartTime = Date.now();
        let requestPromise: Promise<any>;
        
        switch (test.method) {
          case 'GET':
            requestPromise = firstValueFrom(this.httpService.get(test.endpoint));
            break;
          case 'POST':
            requestPromise = firstValueFrom(this.httpService.post(test.endpoint, test.payload));
            break;
          case 'PUT':
            requestPromise = firstValueFrom(this.httpService.put(test.endpoint, test.payload));
            break;
          case 'DELETE':
            requestPromise = firstValueFrom(this.httpService.delete(test.endpoint));
            break;
          case 'PATCH':
            requestPromise = firstValueFrom(this.httpService.patch(test.endpoint, test.payload));
            break;
        }

        requestPromise
          .then(() => {
            const responseTime = Date.now() - requestStartTime;
            responseTimes.push(responseTime);
            successfulRequests++;
          })
          .catch(() => {
            failedRequests++;
          });

        requests.push(requestPromise);
      }, i * interval);
    }

    // Wait for all requests to complete or timeout
    try {
      await Promise.all(requests);
    } catch (error) {
      // Some requests may have failed, but we continue
      this.logger.warn(`Some requests in load test ${test.name} failed: ${error.message}`);
    }

    const testDuration = Date.now() - startTime;
    const metrics = this.calculateMetrics(responseTimes, successfulRequests, failedRequests, test.concurrency);

    const status = this.validateMetrics(metrics);
    const message = status === 'passed' 
      ? 'Load test passed all performance criteria'
      : 'Load test failed one or more performance criteria';

    const result: LoadTestResult = {
      testName: test.name,
      status,
      metrics,
      message,
      timestamp: new Date(),
      duration: testDuration,
    };

    this.logger.log(`Load test ${test.name} completed: ${status}`);
    return result;
  }

  /**
   * Execute stress test
   * @param test Stress test configuration
   * @returns Stress test result
   */
  private async executeStressTest(
    test: PerformanceTestConfig['stressTests'][0]
  ): Promise<StressTestResult> {
    const startTime = Date.now();
    this.logger.log(`Executing stress test: ${test.name}`);

    // Gradually increase concurrency until system breaks or max is reached
    let currentConcurrency = 1;
    let maxConcurrencyReached = 0;
    const concurrencyResults: Array<{ concurrency: number; metrics: PerformanceMetrics }> = [];

    while (currentConcurrency <= test.maxConcurrency) {
      // Execute a small test at current concurrency level
      const requests: Array<Promise<any>> = [];
      const responseTimes: number[] = [];
      let successfulRequests = 0;
      let failedRequests = 0;

      // Execute requests at current concurrency
      for (let i = 0; i < currentConcurrency; i++) {
        const requestStartTime = Date.now();
        let requestPromise: Promise<any>;
        
        switch (test.method) {
          case 'GET':
            requestPromise = firstValueFrom(this.httpService.get(test.endpoint));
            break;
          case 'POST':
            requestPromise = firstValueFrom(this.httpService.post(test.endpoint, test.payload));
            break;
          case 'PUT':
            requestPromise = firstValueFrom(this.httpService.put(test.endpoint, test.payload));
            break;
          case 'DELETE':
            requestPromise = firstValueFrom(this.httpService.delete(test.endpoint));
            break;
          case 'PATCH':
            requestPromise = firstValueFrom(this.httpService.patch(test.endpoint, test.payload));
            break;
        }

        requestPromise
          .then(() => {
            const responseTime = Date.now() - requestStartTime;
            responseTimes.push(responseTime);
            successfulRequests++;
          })
          .catch(() => {
            failedRequests++;
          });

        requests.push(requestPromise);
      }

      // Wait for all requests to complete
      try {
        await Promise.all(requests);
        maxConcurrencyReached = currentConcurrency;
        
        // Calculate metrics for this concurrency level
        const metrics = this.calculateMetrics(responseTimes, successfulRequests, failedRequests, currentConcurrency);
        concurrencyResults.push({ concurrency: currentConcurrency, metrics });
        
        // Check if we should continue increasing concurrency
        if (this.validateMetrics(metrics) === 'failed') {
          break;
        }
      } catch (error) {
        // System is struggling, stop increasing concurrency
        break;
      }

      // Increase concurrency for next iteration
      currentConcurrency = Math.min(currentConcurrency * 2, test.maxConcurrency);
    }

    const testDuration = Date.now() - startTime;
    
    // Use metrics from the highest successful concurrency level
    const finalMetrics = concurrencyResults.length > 0 
      ? concurrencyResults[concurrencyResults.length - 1].metrics 
      : {
          responseTime: {
            avg: 0,
            min: 0,
            max: 0,
            p50: 0,
            p90: 0,
            p95: 0,
            p99: 0,
          },
          throughput: {
            requestsPerSecond: 0,
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            errorRate: 0,
          },
          concurrency: maxConcurrencyReached,
          timestamp: new Date(),
        };

    const status = maxConcurrencyReached >= test.maxConcurrency * 0.8 ? 'passed' : 'failed';
    const message = status === 'passed' 
      ? `Stress test passed, reached ${maxConcurrencyReached}/${test.maxConcurrency} concurrency`
      : `Stress test failed, only reached ${maxConcurrencyReached}/${test.maxConcurrency} concurrency`;

    const result: StressTestResult = {
      testName: test.name,
      status,
      metrics: finalMetrics,
      maxConcurrencyReached,
      message,
      timestamp: new Date(),
      duration: testDuration,
    };

    this.logger.log(`Stress test ${test.name} completed: ${status} (max concurrency: ${maxConcurrencyReached})`);
    return result;
  }

  /**
   * Execute scalability test
   * @param test Scalability test configuration
   * @returns Scalability test result
   */
  private async executeScalabilityTest(
    test: PerformanceTestConfig['scalabilityTests'][0]
  ): Promise<ScalabilityTestResult> {
    const startTime = Date.now();
    this.logger.log(`Executing scalability test: ${test.name}`);

    const concurrencyResults: Array<{
      concurrency: number;
      metrics: PerformanceMetrics;
      status: 'passed' | 'failed';
    }> = [];

    // Test at each concurrency level
    for (const concurrency of test.concurrencyLevels) {
      const requests: Array<Promise<any>> = [];
      const responseTimes: number[] = [];
      let successfulRequests = 0;
      let failedRequests = 0;

      // Execute requests at current concurrency level
      for (let i = 0; i < concurrency; i++) {
        const requestStartTime = Date.now();
        let requestPromise: Promise<any>;
        
        switch (test.method) {
          case 'GET':
            requestPromise = firstValueFrom(this.httpService.get(test.endpoint));
            break;
          case 'POST':
            requestPromise = firstValueFrom(this.httpService.post(test.endpoint, test.payload));
            break;
          case 'PUT':
            requestPromise = firstValueFrom(this.httpService.put(test.endpoint, test.payload));
            break;
          case 'DELETE':
            requestPromise = firstValueFrom(this.httpService.delete(test.endpoint));
            break;
          case 'PATCH':
            requestPromise = firstValueFrom(this.httpService.patch(test.endpoint, test.payload));
            break;
        }

        requestPromise
          .then(() => {
            const responseTime = Date.now() - requestStartTime;
            responseTimes.push(responseTime);
            successfulRequests++;
          })
          .catch(() => {
            failedRequests++;
          });

        requests.push(requestPromise);
      }

      // Wait for all requests to complete
      try {
        await Promise.all(requests);
      } catch (error) {
        // Some requests may have failed
        this.logger.warn(`Some requests failed at concurrency ${concurrency} in scalability test ${test.name}`);
      }

      // Calculate metrics for this concurrency level
      const metrics = this.calculateMetrics(responseTimes, successfulRequests, failedRequests, concurrency);
      const status = this.validateMetrics(metrics);
      
      concurrencyResults.push({
        concurrency,
        metrics,
        status,
      });
    }

    const testDuration = Date.now() - startTime;
    const failedLevels = concurrencyResults.filter(r => r.status === 'failed').length;
    const status = failedLevels === 0 ? 'passed' : failedLevels < concurrencyResults.length ? 'partial' : 'failed';
    
    const message = status === 'passed' 
      ? `Scalability test passed at all ${test.concurrencyLevels.length} concurrency levels`
      : `Scalability test failed at ${failedLevels}/${test.concurrencyLevels.length} concurrency levels`;

    const result: ScalabilityTestResult = {
      testName: test.name,
      status,
      concurrencyResults,
      message,
      timestamp: new Date(),
      duration: testDuration,
    };

    this.logger.log(`Scalability test ${test.name} completed: ${status}`);
    return result;
  }

  /**
   * Calculate performance metrics
   * @param responseTimes Response times
   * @param successfulRequests Successful requests
   * @param failedRequests Failed requests
   * @param concurrency Concurrency level
   * @returns Performance metrics
   */
  private calculateMetrics(
    responseTimes: number[],
    successfulRequests: number,
    failedRequests: number,
    concurrency: number
  ): PerformanceMetrics {
    // Calculate response time statistics
    const sortedTimes = [...responseTimes].sort((a, b) => a - b);
    const totalRequests = successfulRequests + failedRequests;
    const errorRate = totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0;
    
    const metrics: PerformanceMetrics = {
      responseTime: {
        avg: responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0,
        min: sortedTimes.length > 0 ? sortedTimes[0] : 0,
        max: sortedTimes.length > 0 ? sortedTimes[sortedTimes.length - 1] : 0,
        p50: this.percentile(sortedTimes, 50),
        p90: this.percentile(sortedTimes, 90),
        p95: this.percentile(sortedTimes, 95),
        p99: this.percentile(sortedTimes, 99),
      },
      throughput: {
        requestsPerSecond: responseTimes.length, // Simplified for this example
        totalRequests,
        successfulRequests,
        failedRequests,
        errorRate,
      },
      concurrency,
      timestamp: new Date(),
    };

    return metrics;
  }

  /**
   * Calculate percentile
   * @param sortedArray Sorted array of values
   * @param percentile Percentile to calculate (0-100)
   * @returns Percentile value
   */
  private percentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;
    
    const index = (percentile / 100) * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = lower + 1;
    const weight = index % 1;
    
    if (upper >= sortedArray.length) return sortedArray[lower];
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
  }

  /**
   * Validate performance metrics against thresholds
   * @param metrics Performance metrics
   * @returns Validation status
   */
  private validateMetrics(metrics: PerformanceMetrics): 'passed' | 'failed' {
    // Check response time threshold
    if (metrics.responseTime.avg > this.config.metrics.responseTimeThreshold) {
      return 'failed';
    }
    
    // Check error rate threshold
    if (metrics.throughput.errorRate > this.config.metrics.errorRateThreshold) {
      return 'failed';
    }
    
    // Check throughput threshold
    if (metrics.throughput.requestsPerSecond < this.config.metrics.throughputThreshold) {
      return 'failed';
    }
    
    return 'passed';
  }

  /**
   * Determine overall status from test results
   * @param loadTestResults Load test results
   * @param stressTestResults Stress test results
   * @param scalabilityTestResults Scalability test results
   * @returns Overall status
   */
  private determineOverallStatus(
    loadTestResults: LoadTestResult[],
    stressTestResults: StressTestResult[],
    scalabilityTestResults: ScalabilityTestResult[]
  ): 'passed' | 'failed' | 'partial' {
    const allResults = [
      ...loadTestResults.map(r => r.status),
      ...stressTestResults.map(r => r.status),
      ...scalabilityTestResults.flatMap(r => 
        r.concurrencyResults ? r.concurrencyResults.map(cr => cr.status) : [r.status]
      )
    ];
    
    const failedCount = allResults.filter(s => s === 'failed').length;
    const passedCount = allResults.filter(s => s === 'passed').length;
    
    if (failedCount === 0) return 'passed';
    if (passedCount > 0) return 'partial';
    return 'failed';
  }

  /**
   * Get performance testing configuration
   * @returns Performance testing configuration
   */
  getConfiguration(): PerformanceTestConfig {
    return { ...this.config };
  }

  /**
   * Update performance testing configuration
   * @param config New configuration
   */
  updateConfiguration(config: Partial<PerformanceTestConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.log('Performance testing configuration updated');
  }

  /**
   * Add load test
   * @param test Load test configuration
   */
  addLoadTest(test: PerformanceTestConfig['loadTests'][0]): void {
    this.config.loadTests.push(test);
    this.logger.log(`Added load test ${test.name}`);
  }

  /**
   * Add stress test
   * @param test Stress test configuration
   */
  addStressTest(test: PerformanceTestConfig['stressTests'][0]): void {
    this.config.stressTests.push(test);
    this.logger.log(`Added stress test ${test.name}`);
  }

  /**
   * Add scalability test
   * @param test Scalability test configuration
   */
  addScalabilityTest(test: PerformanceTestConfig['scalabilityTests'][0]): void {
    this.config.scalabilityTests.push(test);
    this.logger.log(`Added scalability test ${test.name}`);
  }
}