import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface IntegrationConfig {
  services: Array<{
    name: string;
    url: string;
    expectedStatus: number;
    timeout: number;
  }>;
  integrationTimeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface IntegrationResult {
  service: string;
  status: 'success' | 'failure';
  message: string;
  timestamp: Date;
  responseTime: number;
  details?: any;
}

export interface SystemIntegrationReport {
  overallStatus: 'success' | 'partial' | 'failure';
  totalServices: number;
  successfulServices: number;
  failedServices: number;
  results: IntegrationResult[];
  timestamp: Date;
  duration: number;
}

@Injectable()
export class FinalIntegrationService {
  private readonly logger = new Logger(FinalIntegrationService.name);
  private config: IntegrationConfig;

  constructor(private readonly httpService: HttpService) {}

  /**
   * Configure the integration service
   * @param config Integration configuration
   */
  configure(config: IntegrationConfig): void {
    this.config = config;
    this.logger.log(`Final integration service configured with ${config.services.length} services`);
  }

  /**
   * Execute system integration
   * @returns Integration report
   */
  async executeSystemIntegration(): Promise<SystemIntegrationReport> {
    const startTime = Date.now();
    this.logger.log('Starting system integration process');

    const results: IntegrationResult[] = [];
    let successfulServices = 0;
    let failedServices = 0;

    // Test each service
    for (const service of this.config.services) {
      try {
        const result = await this.testService(service);
        results.push(result);
        
        if (result.status === 'success') {
          successfulServices++;
        } else {
          failedServices++;
        }
      } catch (error) {
        const failureResult: IntegrationResult = {
          service: service.name,
          status: 'failure',
          message: `Integration test failed: ${error.message}`,
          timestamp: new Date(),
          responseTime: 0,
        };
        results.push(failureResult);
        failedServices++;
        this.logger.error(`Service ${service.name} integration failed: ${error.message}`);
      }
    }

    const duration = Date.now() - startTime;
    const overallStatus = 
      failedServices === 0 ? 'success' : 
      successfulServices > 0 ? 'partial' : 'failure';

    const report: SystemIntegrationReport = {
      overallStatus,
      totalServices: this.config.services.length,
      successfulServices,
      failedServices,
      results,
      timestamp: new Date(),
      duration,
    };

    this.logger.log(`System integration completed: ${overallStatus} (${successfulServices}/${this.config.services.length} services successful)`);
    return report;
  }

  /**
   * Test individual service
   * @param service Service configuration
   * @returns Integration result
   */
  private async testService(service: IntegrationConfig['services'][0]): Promise<IntegrationResult> {
    const startTime = Date.now();
    
    try {
      // Attempt to connect to the service with retries
      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
        try {
          const response = await firstValueFrom(
            this.httpService.get(service.url, {
              timeout: service.timeout,
            })
          );
          
          const responseTime = Date.now() - startTime;
          
          if (response.status === service.expectedStatus) {
            return {
              service: service.name,
              status: 'success',
              message: `Service is accessible and returned expected status ${response.status}`,
              timestamp: new Date(),
              responseTime,
              details: {
                status: response.status,
                headers: response.headers,
              },
            };
          } else {
            return {
              service: service.name,
              status: 'failure',
              message: `Service returned unexpected status ${response.status}, expected ${service.expectedStatus}`,
              timestamp: new Date(),
              responseTime,
              details: {
                status: response.status,
                headers: response.headers,
              },
            };
          }
        } catch (error) {
          lastError = error;
          
          if (attempt < this.config.retryAttempts) {
            this.logger.warn(`Service ${service.name} test failed (attempt ${attempt}/${this.config.retryAttempts}), retrying in ${this.config.retryDelay}ms: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
          }
        }
      }
      
      // All retries failed
      const responseTime = Date.now() - startTime;
      return {
        service: service.name,
        status: 'failure',
        message: `Service test failed after ${this.config.retryAttempts} attempts: ${lastError ? lastError.message : 'Unknown error'}`,
        timestamp: new Date(),
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        service: service.name,
        status: 'failure',
        message: `Service test failed: ${error.message}`,
        timestamp: new Date(),
        responseTime,
      };
    }
  }

  /**
   * Validate system integration
   * @param report Integration report
   * @returns Boolean indicating if integration is valid
   */
  validateIntegration(report: SystemIntegrationReport): boolean {
    // Integration is valid if all services are successful
    return report.overallStatus === 'success';
  }

  /**
   * Get integration configuration
   * @returns Integration configuration
   */
  getConfiguration(): IntegrationConfig {
    return { ...this.config };
  }

  /**
   * Update integration configuration
   * @param config New configuration
   */
  updateConfiguration(config: Partial<IntegrationConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.log('Integration configuration updated');
  }

  /**
   * Add service to integration test
   * @param service Service configuration
   */
  addService(service: IntegrationConfig['services'][0]): void {
    this.config.services.push(service);
    this.logger.log(`Added service ${service.name} to integration test`);
  }

  /**
   * Remove service from integration test
   * @param serviceName Service name
   */
  removeService(serviceName: string): void {
    this.config.services = this.config.services.filter(service => service.name !== serviceName);
    this.logger.log(`Removed service ${serviceName} from integration test`);
  }
}