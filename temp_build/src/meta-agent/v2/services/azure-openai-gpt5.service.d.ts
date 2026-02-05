import { HttpService } from '@nestjs/axios';
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
export declare class AzureOpenAIGPT5Service {
    private readonly httpService;
    private readonly logger;
    private readonly endpoint;
    private readonly apiKey;
    private readonly deployment;
    private readonly apiVersion;
    private readonly maxRetries;
    private readonly retryDelay;
    constructor(httpService: HttpService);
    chatCompletion(request: ChatCompletionRequest, tenantId?: string): Promise<ChatCompletionResponse>;
    private buildUrl;
    private executeWithRetry;
    private isRetriableError;
    private sleep;
    private trackMetrics;
    generateEmbedding(text: string, tenantId?: string): Promise<number[]>;
    healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        message?: string;
    }>;
}
