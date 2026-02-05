import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ChatCompletionRequestDto } from './dto/chat-completion-request.dto';
import { ChatCompletionResponseDto } from './dto/chat-completion-response.dto';

export interface AzureFoundryConfig {
  baseUrl: string;
  apiKey: string;
  modelName: string;
  apiVersion: string;
  tokensPerMinuteLimit: number;
  requestsPerMinuteLimit: number;
}

// Definir interfaces para los objetos de resultado
interface ModelComparisonResult {
  model: string;
  response?: string | null;
  tokensUsed?: number;
  processingTime?: number;
  error?: string;
}

interface ModelEvaluation {
  bestModel: string;
  reasoning: string;
  scores: Record<string, number>;
}

interface ComparisonResult {
  results: ModelComparisonResult[];
  evaluation: ModelEvaluation;
}

@Injectable()
export class AzureFoundryIARouterService {
  private readonly logger = new Logger(AzureFoundryIARouterService.name);
  private readonly config: AzureFoundryConfig;
  private requestCount = 0;
  private tokenCount = 0;
  private lastResetTime = Date.now();

  constructor(private readonly httpService: HttpService) {
    // Load configuration from environment variables
    this.config = {
      baseUrl: process.env.AZURE_FOUNDY_MODEL_ROUTER_URI || '',
      apiKey: process.env.AZURE_FOUNDY_MODEL_ROUTER_KEY || '',
      modelName: process.env.AZURE_FOUNDY_MODEL_NAME || 'model-router',
      apiVersion: '2024-05-01-preview', // Fixed version as per requirements
      tokensPerMinuteLimit: parseInt(process.env.TOKENS_PER_MINUTE_LIMIT || '200000', 10),
      requestsPerMinuteLimit: parseInt(process.env.REQUESTS_PER_MINUTE_LIMIT || '200', 10),
    };

    // Validate configuration
    if (!this.config.baseUrl || !this.config.apiKey) {
      this.logger.error('Azure Foundry configuration is incomplete. Please check environment variables.');
    }

    // Reset counters every minute
    setInterval(() => {
      this.resetCounters();
    }, 60000);
  }

  /**
   * Process a chat completion request through Azure Foundry Model Router
   * @param request Chat completion request
   * @returns Chat completion response
   */
  async processChatCompletion(request: ChatCompletionRequestDto): Promise<ChatCompletionResponseDto> {
    try {
      // Check rate limits
      if (!this.checkRateLimits(request)) {
        throw new Error('Rate limit exceeded');
      }

      this.logger.log(`Processing chat completion request with model ${this.config.modelName}`);

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
        'api-key': this.config.apiKey,
      };

      // Send request to Azure Foundry Model Router
      const response = await firstValueFrom(
        this.httpService.post<ChatCompletionResponseDto>(
          this.config.baseUrl,
          request,
          { headers }
        )
      );

      // Update counters
      this.updateCounters(response.data.usage.total_tokens);

      this.logger.log(`Chat completion processed successfully. Tokens used: ${response.data.usage.total_tokens}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to process chat completion: ${error.message}`);
      throw error;
    }
  }

  /**
   * Route a message to the most appropriate AI model based on content and context
   * @param message User message
   * @param context Additional context
   * @returns Routed response
   */
  async routeMessage(message: string, context?: any): Promise<string> {
    try {
      this.logger.log(`Routing message: ${message.substring(0, 50)}...`);

      // Prepare the routing request
      const routingRequest: ChatCompletionRequestDto = {
        messages: [
          {
            role: 'system',
            content: `You are an AI model router. Your task is to analyze the user message and context, 
            then determine which AI model would be most appropriate to handle this request. 
            Consider factors like:
            - Message complexity
            - Request type (informational, creative, analytical, etc.)
            - Domain expertise required
            - Urgency
            
            Respond with ONLY the name of the most appropriate model.`
          },
          {
            role: 'user',
            content: `Message: ${message}\nContext: ${JSON.stringify(context || {})}` 
          }
        ],
        temperature: 0.3, // Low temperature for consistent routing
        max_tokens: 50
      };

      const response = await this.processChatCompletion(routingRequest);
      const routedModel = response.choices[0].message.content.trim();

      this.logger.log(`Message routed to model: ${routedModel}`);
      return routedModel;
    } catch (error) {
      this.logger.error(`Failed to route message: ${error.message}`);
      // Fallback to default model
      return this.config.modelName;
    }
  }

  /**
   * Compare multiple AI models' responses to the same prompt for quality assurance
   * @param prompt User prompt
   * @param models List of models to compare
   * @returns Comparison results
   */
  async compareModels(prompt: string, models: string[]): Promise<ComparisonResult> {
    try {
      this.logger.log(`Comparing ${models.length} models for prompt: ${prompt.substring(0, 50)}...`);

      const results: ModelComparisonResult[] = [];

      for (const model of models) {
        try {
          const comparisonRequest: ChatCompletionRequestDto = {
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 150
          };

          // Temporarily override model name for comparison
          const originalBaseUrl = this.config.baseUrl;
          this.config.baseUrl = originalBaseUrl.replace(this.config.modelName, model);
          
          const response = await this.processChatCompletion(comparisonRequest);
          
          results.push({
            model,
            response: response.choices[0].message.content,
            tokensUsed: response.usage.total_tokens,
            processingTime: response.usage.total_tokens // Simplified timing
          });

          // Restore original base URL
          this.config.baseUrl = originalBaseUrl;
        } catch (modelError) {
          this.logger.error(`Failed to get response from model ${model}: ${modelError.message}`);
          results.push({
            model,
            error: modelError.message,
            response: null
          });
        }
      }

      // Analyze results to determine best model
      const analysisRequest: ChatCompletionRequestDto = {
        messages: [
          {
            role: 'system',
            content: `You are an AI model evaluator. Analyze the responses from different models and determine which one is the best for the given prompt. Consider factors like:
            - Accuracy
            - Relevance
            - Clarity
            - Completeness
            
            Respond with a JSON object containing:
            {
              "bestModel": "name_of_best_model",
              "reasoning": "brief explanation of why this model was chosen",
              "scores": {
                "model1": score,
                "model2": score
              }
            }`
          },
          {
            role: 'user',
            content: `Prompt: ${prompt}\n\nResults: ${JSON.stringify(results)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      };

      const analysisResponse = await this.processChatCompletion(analysisRequest);
      
      try {
        const evaluation: ModelEvaluation = JSON.parse(analysisResponse.choices[0].message.content);
        return {
          results,
          evaluation
        };
      } catch (parseError) {
        this.logger.error(`Failed to parse evaluation response: ${parseError.message}`);
        return {
          results,
          evaluation: {
            bestModel: models[0], // Fallback to first model
            reasoning: 'Unable to parse evaluation, using first model as default',
            scores: {}
          }
        };
      }
    } catch (error) {
      this.logger.error(`Failed to compare models: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if rate limits have been exceeded
   * @param request Chat completion request
   * @returns True if within limits, false otherwise
   */
  private checkRateLimits(request: ChatCompletionRequestDto): boolean {
    const now = Date.now();
    const timeSinceReset = now - this.lastResetTime;
    
    // Reset counters if more than a minute has passed
    if (timeSinceReset > 60000) {
      this.resetCounters();
    }

    // Estimate tokens that will be used (rough estimation)
    const estimatedTokens = request.messages.reduce((total, msg) => 
      total + msg.content.length / 4, 0) + (request.max_tokens || 100);

    // Check request limit
    if (this.requestCount >= this.config.requestsPerMinuteLimit) {
      this.logger.warn(`Request rate limit exceeded: ${this.requestCount}/${this.config.requestsPerMinuteLimit}`);
      return false;
    }

    // Check token limit
    if (this.tokenCount + estimatedTokens > this.config.tokensPerMinuteLimit) {
      this.logger.warn(`Token rate limit exceeded: ${this.tokenCount + estimatedTokens}/${this.config.tokensPerMinuteLimit}`);
      return false;
    }

    return true;
  }

  /**
   * Update counters after successful request
   * @param tokens Tokens used in request
   */
  private updateCounters(tokens: number): void {
    this.requestCount++;
    this.tokenCount += tokens;
  }

  /**
   * Reset rate limit counters
   */
  private resetCounters(): void {
    this.requestCount = 0;
    this.tokenCount = 0;
    this.lastResetTime = Date.now();
    this.logger.log('Rate limit counters reset');
  }

  /**
   * Get current rate limit status
   * @returns Rate limit status
   */
  getRateLimitStatus(): {
    requestsUsed: number;
    requestsLimit: number;
    tokensUsed: number;
    tokensLimit: number;
    resetTime: number;
  } {
    return {
      requestsUsed: this.requestCount,
      requestsLimit: this.config.requestsPerMinuteLimit,
      tokensUsed: this.tokenCount,
      tokensLimit: this.config.tokensPerMinuteLimit,
      resetTime: this.lastResetTime + 60000
    };
  }
}