import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../common/redis/redis.service';

export interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  throughput: number;
  errorRate: number;
}

export interface PerformanceTestResult {
  testName: string;
  metrics: PerformanceMetrics;
  baseline?: PerformanceMetrics;
  deviation?: number;
  status: 'passed' | 'failed' | 'warning';
}

@Injectable()
export class PerformanceTestingService {
  private readonly logger = new Logger(PerformanceTestingService.name);

  constructor(private readonly redisService: RedisService) {}

  /**
   * Run performance test
   * @param testName Name of the test
   * @param testFn Function to test
   * @param iterations Number of iterations to run
   * @returns Promise resolving to performance test result
   */
  async runPerformanceTest(
    testName: string,
    testFn: () => Promise<any>,
    iterations: number = 100
  ): Promise<PerformanceTestResult> {
    this.logger.log(`Running performance test: ${testName}`);
    
    const responseTimes: number[] = [];
    const startTime = Date.now();
    
    // Run the test multiple times
    for (let i = 0; i < iterations; i++) {
      const iterationStart = Date.now();
      try {
        await testFn();
        const iterationTime = Date.now() - iterationStart;
        responseTimes.push(iterationTime);
      } catch (error) {
        this.logger.error(`Error in performance test iteration ${i}: ${error.message}`);
      }
    }
    
    const totalTime = Date.now() - startTime;
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const minResponseTime = Math.min(...responseTimes);
    const maxResponseTime = Math.max(...responseTimes);
    
    // Get memory usage
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    
    // Calculate throughput
    const throughput = (iterations / totalTime) * 1000; // requests per second
    
    const metrics: PerformanceMetrics = {
      responseTime: avgResponseTime,
      memoryUsage,
      cpuUsage: 0, // Would need a library like pidusage for real CPU usage
      throughput,
      errorRate: 0, // Would need to track actual errors
    };
    
    // Compare with baseline if available
    const baseline = await this.getBaseline(testName);
    let deviation = 0;
    let status: 'passed' | 'failed' | 'warning' = 'passed';
    
    if (baseline) {
      deviation = Math.abs(avgResponseTime - baseline.responseTime) / baseline.responseTime;
      if (deviation > 0.2) { // 20% deviation
        status = 'warning';
      }
      if (deviation > 0.5) { // 50% deviation
        status = 'failed';
      }
    }
    
    const result: PerformanceTestResult = {
      testName,
      metrics,
      baseline: baseline || undefined,
      deviation: baseline ? deviation : undefined,
      status,
    };
    
    // Save current metrics as baseline
    await this.saveBaseline(testName, metrics);
    
    this.logger.log(
      `Performance test ${testName} completed: avg=${avgResponseTime}ms, min=${minResponseTime}ms, max=${maxResponseTime}ms`
    );
    
    return result;
  }

  /**
   * Get baseline metrics for a test
   * @param testName Name of the test
   * @returns Promise resolving to baseline metrics or null
   */
  private async getBaseline(testName: string): Promise<PerformanceMetrics | null> {
    try {
      const key = `performance_baseline:${testName}`;
      const baselineJson = await this.redisService.get(key);
      return baselineJson ? JSON.parse(baselineJson) : null;
    } catch (error) {
      this.logger.error(`Error retrieving baseline for ${testName}: ${error.message}`);
      return null;
    }
  }

  /**
   * Save baseline metrics for a test
   * @param testName Name of the test
   * @param metrics Performance metrics
   * @returns Promise resolving to boolean indicating success
   */
  private async saveBaseline(testName: string, metrics: PerformanceMetrics): Promise<boolean> {
    try {
      const key = `performance_baseline:${testName}`;
      await this.redisService.setex(key, 86400, JSON.stringify(metrics)); // 24 hours
      return true;
    } catch (error) {
      this.logger.error(`Error saving baseline for ${testName}: ${error.message}`);
      return false;
    }
  }

  /**
   * Generate performance report
   * @param results Performance test results
   * @returns Formatted performance report
   */
  generatePerformanceReport(results: PerformanceTestResult[]): string {
    let report = '=== Performance Test Report ===\n';
    
    for (const result of results) {
      report += `\n${result.testName}:\n`;
      report += `  Status: ${result.status.toUpperCase()}\n`;
      report += `  Average Response Time: ${result.metrics.responseTime.toFixed(2)}ms\n`;
      report += `  Memory Usage: ${result.metrics.memoryUsage.toFixed(2)}MB\n`;
      report += `  Throughput: ${result.metrics.throughput.toFixed(2)} req/sec\n`;
      
      if (result.baseline && result.deviation !== undefined) {
        report += `  Baseline Response Time: ${result.baseline.responseTime.toFixed(2)}ms\n`;
        report += `  Deviation: ${(result.deviation * 100).toFixed(2)}%\n`;
      }
    }
    
    return report;
  }
}