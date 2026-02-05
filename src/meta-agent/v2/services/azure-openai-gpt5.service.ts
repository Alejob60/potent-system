import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class AzureOpenAIGPT5Service {
  private readonly logger = new Logger(AzureOpenAIGPT5Service.name);
  private readonly endpoint: string;
  private readonly apiKey: string;
  private readonly deployment: string;
  private readonly apiVersion: string;
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 1000; // ms

  constructor(private readonly httpService: HttpService) {
    this.endpoint = process.env.AZURE_OPENAI_GPT5_ENDPOINT || process.env.OPENAI_API_ENDPOINT || '';
    this.apiKey = process.env.AZURE_OPENAI_GPT5_KEY || process.env.OPENAI_API_KEY || '';
    this.deployment = process.env.AZURE_OPENAI_GPT5_DEPLOYMENT || process.env.OPENAI_DEPLOYMENT_NAME || 'gpt-5-chat';
    this.apiVersion = process.env.AZURE_OPENAI_GPT5_API_VERSION || process.env.OPENAI_API_VERSION || '2024-12-01-preview';

    if (!this.endpoint || !this.apiKey || !this.deployment) {
      this.logger.error('Azure OpenAI GPT-5 credentials not configured');
      throw new Error('Azure OpenAI GPT-5 environment variables missing');
    }

    this.logger.log(`Initialized Azure OpenAI GPT-5 Service with deployment: ${this.deployment}`);

    // Initialize metrics (these would be registered in a metrics service in production)

  }

  /**
   * Chat completion with GPT-5
   * @param request Chat completion request
   * @param tenantId Tenant identifier for metrics
   * @returns Chat completion response
   */
  async chatCompletion(
    request: ChatCompletionRequest,
    tenantId?: string
  ): Promise<ChatCompletionResponse> {
    const startTime = Date.now();
    const url = this.buildUrl();

    this.logger.debug(`Calling GPT-5 chat completion for tenant: ${tenantId || 'unknown'}`);

    try {
      const response = await this.executeWithRetry(async () => {
        const { data } = await firstValueFrom(
          this.httpService.post<ChatCompletionResponse>(url, request, {
            headers: {
              'Content-Type': 'application/json',
              'api-key': this.apiKey
            },
            timeout: 30000 // 30s timeout
          })
        );
        return data;
      });

      // Track metrics
      const duration = (Date.now() - startTime) / 1000;
      this.trackMetrics(tenantId, response, duration, 'success');

      this.logger.debug(
        `GPT-5 completion successful. Tokens used: ${response.usage.total_tokens}, Duration: ${duration}s`
      );

      return response;
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      this.trackMetrics(tenantId, null, duration, 'error');

      this.logger.error(`GPT-5 chat completion failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Build full API URL
   */
  private buildUrl(): string {
    const baseUrl = this.endpoint.endsWith('/') ? this.endpoint.slice(0, -1) : this.endpoint;
    
    // Check if endpoint already contains deployment path
    if (baseUrl.includes('/deployments/')) {
      return `${baseUrl}/chat/completions?api-version=${this.apiVersion}`;
    }
    
    return `${baseUrl}/openai/deployments/${this.deployment}/chat/completions?api-version=${this.apiVersion}`;
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    retryCount: number = 0
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retryCount >= this.maxRetries) {
        throw error;
      }

      // Only retry on specific errors
      if (this.isRetriableError(error)) {
        const delay = this.retryDelay * Math.pow(2, retryCount); // Exponential backoff
        this.logger.warn(
          `Request failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})...`
        );
        
        await this.sleep(delay);
        return this.executeWithRetry(fn, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Check if error is retriable
   */
  private isRetriableError(error: any): boolean {
    const retriableStatusCodes = [429, 500, 502, 503, 504];
    const statusCode = error?.response?.status;
    return retriableStatusCodes.includes(statusCode);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Track metrics for the request
   */
  private trackMetrics(
    tenantId: string | undefined,
    response: ChatCompletionResponse | null,
    duration: number,
    status: 'success' | 'error'
  ): void {
    const tenant = tenantId || 'unknown';
    const model = this.deployment;

    try {
      // Track request counter

      // Track request duration

      // Track token usage
      if (response?.usage) {

      }
    } catch (error) {
      this.logger.error(`Failed to track metrics: ${error.message}`);
    }
  }

  /**
   * Generate embeddings using Azure OpenAI
   * @param text Text to embed
   * @param tenantId Tenant identifier
   * @returns Embedding vector
   */
  async generateEmbedding(text: string, tenantId?: string): Promise<number[]> {
    const embeddingDeployment = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || 'text-embedding-3-small';
    const embeddingUrl = this.endpoint.includes('/deployments/')
      ? `${this.endpoint}/embeddings?api-version=${this.apiVersion}`
      : `${this.endpoint}/openai/deployments/${embeddingDeployment}/embeddings?api-version=${this.apiVersion}`;

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          embeddingUrl,
          { input: text },
          {
            headers: {
              'Content-Type': 'application/json',
              'api-key': this.apiKey
            }
          }
        )
      );

      return data.data[0].embedding;
    } catch (error) {
      this.logger.error(`Failed to generate embedding: ${error.message}`);
      throw error;
    }
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; message?: string }> {
    try {
      const response = await this.chatCompletion({
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say "OK"' }
        ],
        max_tokens: 5,
        temperature: 0
      });

      return { status: 'healthy' };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message
      };
    }
  }
}
