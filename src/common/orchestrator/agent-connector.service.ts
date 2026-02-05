import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';

export interface AgentConnectorConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

export interface AgentExecutionResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    status?: number;
    details?: any;
  };
  metadata: {
    duration: number;
    timestamp: Date;
    retries: number;
  };
}

@Injectable()
export class AgentConnectorService {
  private readonly logger = new Logger(AgentConnectorService.name);
  private readonly agentConfigs: Record<string, AgentConnectorConfig> = {};

  constructor(private readonly httpService: HttpService) {
    // Initialize with default agent configurations
    this.initializeAgentConfigs();
  }

  /**
   * Initialize agent configurations from environment variables
   */
  private initializeAgentConfigs(): void {
    this.agentConfigs['trend-scanner'] = {
      baseUrl: process.env.AGENT_TREND_SCANNER_URL || 'http://localhost:3007/api/v1/agents/trend-scanner',
      timeout: 30000,
      retries: 3,
    };

    this.agentConfigs['video-scriptor'] = {
      baseUrl: process.env.AGENT_VIDEO_SCRIPTOR_URL || 'http://localhost:3007/api/v1/agents/video-scriptor',
      timeout: 45000,
      retries: 3,
    };

    this.agentConfigs['faq-responder'] = {
      baseUrl: process.env.AGENT_FAQ_RESPONDER_URL || 'http://localhost:3007/api/v1/agents/faq-responder',
      timeout: 20000,
      retries: 2,
    };

    this.agentConfigs['post-scheduler'] = {
      baseUrl: process.env.AGENT_POST_SCHEDULER_URL || 'http://localhost:3007/api/v1/agents/post-scheduler',
      timeout: 25000,
      retries: 2,
    };

    this.agentConfigs['analytics-reporter'] = {
      baseUrl: process.env.AGENT_ANALYTICS_REPORTER_URL || 'http://localhost:3007/api/v1/agents/analytics-reporter',
      timeout: 40000,
      retries: 3,
    };

    this.agentConfigs['front-desk'] = {
      baseUrl: process.env.AGENT_FRONT_DESK_URL || 'http://localhost:3007/api/v1/agents/front-desk',
      timeout: 15000,
      retries: 2,
    };
  }

  /**
   * Execute a request to an agent
   * @param agentName Name of the agent
   * @param method HTTP method
   * @param path Path to append to the base URL
   * @param data Request data
   * @param config Optional configuration overrides
   * @returns Promise resolving to execution result
   */
  async execute<T = any>(
    agentName: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string = '',
    data?: any,
    config?: Partial<AgentConnectorConfig>
  ): Promise<AgentExecutionResult<T>> {
    const startTime = Date.now();
    const agentConfig = { ...this.agentConfigs[agentName], ...config };
    
    if (!agentConfig) {
      return {
        success: false,
        error: {
          message: `Agent ${agentName} not configured`,
          code: 'AGENT_NOT_CONFIGURED'
        },
        metadata: {
          duration: 0,
          timestamp: new Date(),
          retries: 0
        }
      };
    }

    const url = `${agentConfig.baseUrl}${path}`;
    let retries = 0;
    let lastError: Error | undefined;

    while (retries <= (agentConfig.retries || 0)) {
      try {
        this.logger.log(`Executing ${method} request to ${agentName} at ${url} (attempt ${retries + 1})`);

        let response: AxiosResponse<T>;
        
        switch (method) {
          case 'GET':
            response = await firstValueFrom(
              this.httpService.get<T>(url, {
                headers: agentConfig.headers,
                timeout: agentConfig.timeout
              }).pipe(
                timeout(agentConfig.timeout || 30000),
                catchError((error: AxiosError) => {
                  throw error;
                })
              )
            );
            break;
            
          case 'POST':
            response = await firstValueFrom(
              this.httpService.post<T>(url, data, {
                headers: agentConfig.headers,
                timeout: agentConfig.timeout
              }).pipe(
                timeout(agentConfig.timeout || 30000),
                catchError((error: AxiosError) => {
                  throw error;
                })
              )
            );
            break;
            
          case 'PUT':
            response = await firstValueFrom(
              this.httpService.put<T>(url, data, {
                headers: agentConfig.headers,
                timeout: agentConfig.timeout
              }).pipe(
                timeout(agentConfig.timeout || 30000),
                catchError((error: AxiosError) => {
                  throw error;
                })
              )
            );
            break;
            
          case 'DELETE':
            response = await firstValueFrom(
              this.httpService.delete<T>(url, {
                headers: agentConfig.headers,
                timeout: agentConfig.timeout
              }).pipe(
                timeout(agentConfig.timeout || 30000),
                catchError((error: AxiosError) => {
                  throw error;
                })
              )
            );
            break;
            
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }

        const duration = Date.now() - startTime;

        this.logger.log(`Successfully executed ${method} request to ${agentName} in ${duration}ms`);

        return {
          success: true,
          data: response.data,
          metadata: {
            duration,
            timestamp: new Date(),
            retries
          }
        };
      } catch (error) {
        retries++;
        lastError = error;
        
        this.logger.warn(`Attempt ${retries} failed for ${agentName}: ${error.message}`);
        
        // If we've exhausted retries, break
        if (retries > (agentConfig.retries || 0)) {
          break;
        }
        
        // Wait before retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, retries - 1), 10000); // Max 10 seconds
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // If we get here, all retries failed
    const duration = Date.now() - startTime;
    
    const errorMessage = lastError ? lastError.message : 'Unknown error';
    this.logger.error(`All attempts failed for ${agentName}: ${errorMessage}`, lastError?.stack);

    return {
      success: false,
      error: {
        message: errorMessage,
        code: lastError ? (lastError as AxiosError).code : undefined,
        status: lastError ? (lastError as AxiosError).response?.status : undefined,
        details: lastError
      },
      metadata: {
        duration,
        timestamp: new Date(),
        retries: agentConfig.retries || 0
      }
    };
  }

  /**
   * Execute a POST request to an agent
   * @param agentName Name of the agent
   * @param data Request data
   * @param path Path to append to the base URL
   * @param config Optional configuration overrides
   * @returns Promise resolving to execution result
   */
  async post<T = any>(
    agentName: string,
    data: any,
    path: string = '',
    config?: Partial<AgentConnectorConfig>
  ): Promise<AgentExecutionResult<T>> {
    return this.execute<T>(agentName, 'POST', path, data, config);
  }

  /**
   * Execute a GET request to an agent
   * @param agentName Name of the agent
   * @param path Path to append to the base URL
   * @param config Optional configuration overrides
   * @returns Promise resolving to execution result
   */
  async get<T = any>(
    agentName: string,
    path: string = '',
    config?: Partial<AgentConnectorConfig>
  ): Promise<AgentExecutionResult<T>> {
    return this.execute<T>(agentName, 'GET', path, undefined, config);
  }

  /**
   * Execute a PUT request to an agent
   * @param agentName Name of the agent
   * @param data Request data
   * @param path Path to append to the base URL
   * @param config Optional configuration overrides
   * @returns Promise resolving to execution result
   */
  async put<T = any>(
    agentName: string,
    data: any,
    path: string = '',
    config?: Partial<AgentConnectorConfig>
  ): Promise<AgentExecutionResult<T>> {
    return this.execute<T>(agentName, 'PUT', path, data, config);
  }

  /**
   * Execute a DELETE request to an agent
   * @param agentName Name of the agent
   * @param path Path to append to the base URL
   * @param config Optional configuration overrides
   * @returns Promise resolving to execution result
   */
  async delete<T = any>(
    agentName: string,
    path: string = '',
    config?: Partial<AgentConnectorConfig>
  ): Promise<AgentExecutionResult<T>> {
    return this.execute<T>(agentName, 'DELETE', path, undefined, config);
  }

  /**
   * Check if an agent is healthy
   * @param agentName Name of the agent
   * @returns Promise resolving to health status
   */
  async checkHealth(agentName: string): Promise<boolean> {
    try {
      const result = await this.get(agentName, '/health');
      return result.success && result.data && (result.data as any).status === 'healthy';
    } catch (error) {
      this.logger.error(`Health check failed for ${agentName}: ${error.message}`);
      return false;
    }
  }

  /**
   * Get agent configuration
   * @param agentName Name of the agent
   * @returns Agent configuration or undefined
   */
  getAgentConfig(agentName: string): AgentConnectorConfig | undefined {
    return this.agentConfigs[agentName];
  }

  /**
   * Update agent configuration
   * @param agentName Name of the agent
   * @param config Configuration to update
   */
  updateAgentConfig(agentName: string, config: Partial<AgentConnectorConfig>): void {
    if (this.agentConfigs[agentName]) {
      this.agentConfigs[agentName] = { ...this.agentConfigs[agentName], ...config };
    } else {
      this.agentConfigs[agentName] = config as AgentConnectorConfig;
    }
  }
}