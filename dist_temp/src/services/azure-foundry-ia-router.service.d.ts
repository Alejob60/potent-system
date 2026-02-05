import { HttpService } from '@nestjs/axios';
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
export declare class AzureFoundryIARouterService {
    private readonly httpService;
    private readonly logger;
    private readonly config;
    private requestCount;
    private tokenCount;
    private lastResetTime;
    constructor(httpService: HttpService);
    processChatCompletion(request: ChatCompletionRequestDto): Promise<ChatCompletionResponseDto>;
    routeMessage(message: string, context?: any): Promise<string>;
    compareModels(prompt: string, models: string[]): Promise<ComparisonResult>;
    private checkRateLimits;
    private updateCounters;
    private resetCounters;
    getRateLimitStatus(): {
        requestsUsed: number;
        requestsLimit: number;
        tokensUsed: number;
        tokensLimit: number;
        resetTime: number;
    };
}
export {};
