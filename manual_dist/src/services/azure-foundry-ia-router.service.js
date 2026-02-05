"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AzureFoundryIARouterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureFoundryIARouterService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let AzureFoundryIARouterService = AzureFoundryIARouterService_1 = class AzureFoundryIARouterService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(AzureFoundryIARouterService_1.name);
        this.requestCount = 0;
        this.tokenCount = 0;
        this.lastResetTime = Date.now();
        this.config = {
            baseUrl: process.env.AZURE_FOUNDY_MODEL_ROUTER_URI || '',
            apiKey: process.env.AZURE_FOUNDY_MODEL_ROUTER_KEY || '',
            modelName: process.env.AZURE_FOUNDY_MODEL_NAME || 'model-router',
            apiVersion: '2024-05-01-preview',
            tokensPerMinuteLimit: parseInt(process.env.TOKENS_PER_MINUTE_LIMIT || '200000', 10),
            requestsPerMinuteLimit: parseInt(process.env.REQUESTS_PER_MINUTE_LIMIT || '200', 10),
        };
        if (!this.config.baseUrl || !this.config.apiKey) {
            this.logger.error('Azure Foundry configuration is incomplete. Please check environment variables.');
        }
        setInterval(() => {
            this.resetCounters();
        }, 60000);
    }
    async processChatCompletion(request) {
        try {
            if (!this.checkRateLimits(request)) {
                throw new Error('Rate limit exceeded');
            }
            this.logger.log(`Processing chat completion request with model ${this.config.modelName}`);
            const headers = {
                'Content-Type': 'application/json',
                'api-key': this.config.apiKey,
            };
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(this.config.baseUrl, request, { headers }));
            this.updateCounters(response.data.usage.total_tokens);
            this.logger.log(`Chat completion processed successfully. Tokens used: ${response.data.usage.total_tokens}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to process chat completion: ${error.message}`);
            throw error;
        }
    }
    async routeMessage(message, context) {
        try {
            this.logger.log(`Routing message: ${message.substring(0, 50)}...`);
            const routingRequest = {
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
                temperature: 0.3,
                max_tokens: 50
            };
            const response = await this.processChatCompletion(routingRequest);
            const routedModel = response.choices[0].message.content.trim();
            this.logger.log(`Message routed to model: ${routedModel}`);
            return routedModel;
        }
        catch (error) {
            this.logger.error(`Failed to route message: ${error.message}`);
            return this.config.modelName;
        }
    }
    async compareModels(prompt, models) {
        try {
            this.logger.log(`Comparing ${models.length} models for prompt: ${prompt.substring(0, 50)}...`);
            const results = [];
            for (const model of models) {
                try {
                    const comparisonRequest = {
                        messages: [
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        temperature: 0.7,
                        max_tokens: 150
                    };
                    const originalBaseUrl = this.config.baseUrl;
                    this.config.baseUrl = originalBaseUrl.replace(this.config.modelName, model);
                    const response = await this.processChatCompletion(comparisonRequest);
                    results.push({
                        model,
                        response: response.choices[0].message.content,
                        tokensUsed: response.usage.total_tokens,
                        processingTime: response.usage.total_tokens
                    });
                    this.config.baseUrl = originalBaseUrl;
                }
                catch (modelError) {
                    this.logger.error(`Failed to get response from model ${model}: ${modelError.message}`);
                    results.push({
                        model,
                        error: modelError.message,
                        response: null
                    });
                }
            }
            const analysisRequest = {
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
                const evaluation = JSON.parse(analysisResponse.choices[0].message.content);
                return {
                    results,
                    evaluation
                };
            }
            catch (parseError) {
                this.logger.error(`Failed to parse evaluation response: ${parseError.message}`);
                return {
                    results,
                    evaluation: {
                        bestModel: models[0],
                        reasoning: 'Unable to parse evaluation, using first model as default',
                        scores: {}
                    }
                };
            }
        }
        catch (error) {
            this.logger.error(`Failed to compare models: ${error.message}`);
            throw error;
        }
    }
    checkRateLimits(request) {
        const now = Date.now();
        const timeSinceReset = now - this.lastResetTime;
        if (timeSinceReset > 60000) {
            this.resetCounters();
        }
        const estimatedTokens = request.messages.reduce((total, msg) => total + msg.content.length / 4, 0) + (request.max_tokens || 100);
        if (this.requestCount >= this.config.requestsPerMinuteLimit) {
            this.logger.warn(`Request rate limit exceeded: ${this.requestCount}/${this.config.requestsPerMinuteLimit}`);
            return false;
        }
        if (this.tokenCount + estimatedTokens > this.config.tokensPerMinuteLimit) {
            this.logger.warn(`Token rate limit exceeded: ${this.tokenCount + estimatedTokens}/${this.config.tokensPerMinuteLimit}`);
            return false;
        }
        return true;
    }
    updateCounters(tokens) {
        this.requestCount++;
        this.tokenCount += tokens;
    }
    resetCounters() {
        this.requestCount = 0;
        this.tokenCount = 0;
        this.lastResetTime = Date.now();
        this.logger.log('Rate limit counters reset');
    }
    getRateLimitStatus() {
        return {
            requestsUsed: this.requestCount,
            requestsLimit: this.config.requestsPerMinuteLimit,
            tokensUsed: this.tokenCount,
            tokensLimit: this.config.tokensPerMinuteLimit,
            resetTime: this.lastResetTime + 60000
        };
    }
};
exports.AzureFoundryIARouterService = AzureFoundryIARouterService;
exports.AzureFoundryIARouterService = AzureFoundryIARouterService = AzureFoundryIARouterService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], AzureFoundryIARouterService);
//# sourceMappingURL=azure-foundry-ia-router.service.js.map