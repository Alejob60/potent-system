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
var AzureOpenAIGPT5Service_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureOpenAIGPT5Service = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let AzureOpenAIGPT5Service = AzureOpenAIGPT5Service_1 = class AzureOpenAIGPT5Service {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(AzureOpenAIGPT5Service_1.name);
        this.maxRetries = 3;
        this.retryDelay = 1000;
        this.endpoint = process.env.AZURE_OPENAI_GPT5_ENDPOINT || process.env.OPENAI_API_ENDPOINT || '';
        this.apiKey = process.env.AZURE_OPENAI_GPT5_KEY || process.env.OPENAI_API_KEY || '';
        this.deployment = process.env.AZURE_OPENAI_GPT5_DEPLOYMENT || process.env.OPENAI_DEPLOYMENT_NAME || 'gpt-5-chat';
        this.apiVersion = process.env.AZURE_OPENAI_GPT5_API_VERSION || process.env.OPENAI_API_VERSION || '2024-12-01-preview';
        if (!this.endpoint || !this.apiKey || !this.deployment) {
            this.logger.error('Azure OpenAI GPT-5 credentials not configured');
            throw new Error('Azure OpenAI GPT-5 environment variables missing');
        }
        this.logger.log(`Initialized Azure OpenAI GPT-5 Service with deployment: ${this.deployment}`);
    }
    async chatCompletion(request, tenantId) {
        const startTime = Date.now();
        const url = this.buildUrl();
        this.logger.debug(`Calling GPT-5 chat completion for tenant: ${tenantId || 'unknown'}`);
        try {
            const response = await this.executeWithRetry(async () => {
                const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, request, {
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': this.apiKey
                    },
                    timeout: 30000
                }));
                return data;
            });
            const duration = (Date.now() - startTime) / 1000;
            this.trackMetrics(tenantId, response, duration, 'success');
            this.logger.debug(`GPT-5 completion successful. Tokens used: ${response.usage.total_tokens}, Duration: ${duration}s`);
            return response;
        }
        catch (error) {
            const duration = (Date.now() - startTime) / 1000;
            this.trackMetrics(tenantId, null, duration, 'error');
            this.logger.error(`GPT-5 chat completion failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    buildUrl() {
        const baseUrl = this.endpoint.endsWith('/') ? this.endpoint.slice(0, -1) : this.endpoint;
        if (baseUrl.includes('/deployments/')) {
            return `${baseUrl}/chat/completions?api-version=${this.apiVersion}`;
        }
        return `${baseUrl}/openai/deployments/${this.deployment}/chat/completions?api-version=${this.apiVersion}`;
    }
    async executeWithRetry(fn, retryCount = 0) {
        try {
            return await fn();
        }
        catch (error) {
            if (retryCount >= this.maxRetries) {
                throw error;
            }
            if (this.isRetriableError(error)) {
                const delay = this.retryDelay * Math.pow(2, retryCount);
                this.logger.warn(`Request failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})...`);
                await this.sleep(delay);
                return this.executeWithRetry(fn, retryCount + 1);
            }
            throw error;
        }
    }
    isRetriableError(error) {
        const retriableStatusCodes = [429, 500, 502, 503, 504];
        const statusCode = error?.response?.status;
        return retriableStatusCodes.includes(statusCode);
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    trackMetrics(tenantId, response, duration, status) {
        const tenant = tenantId || 'unknown';
        const model = this.deployment;
        try {
            if (response?.usage) {
            }
        }
        catch (error) {
            this.logger.error(`Failed to track metrics: ${error.message}`);
        }
    }
    async generateEmbedding(text, tenantId) {
        const embeddingDeployment = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || 'text-embedding-3-small';
        const embeddingUrl = this.endpoint.includes('/deployments/')
            ? `${this.endpoint}/embeddings?api-version=${this.apiVersion}`
            : `${this.endpoint}/openai/deployments/${embeddingDeployment}/embeddings?api-version=${this.apiVersion}`;
        try {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.post(embeddingUrl, { input: text }, {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': this.apiKey
                }
            }));
            return data.data[0].embedding;
        }
        catch (error) {
            this.logger.error(`Failed to generate embedding: ${error.message}`);
            throw error;
        }
    }
    async healthCheck() {
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
        }
        catch (error) {
            return {
                status: 'unhealthy',
                message: error.message
            };
        }
    }
};
exports.AzureOpenAIGPT5Service = AzureOpenAIGPT5Service;
exports.AzureOpenAIGPT5Service = AzureOpenAIGPT5Service = AzureOpenAIGPT5Service_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], AzureOpenAIGPT5Service);
//# sourceMappingURL=azure-openai-gpt5.service.js.map