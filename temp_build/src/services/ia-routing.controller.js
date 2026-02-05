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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var IARoutingController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IARoutingController = exports.CompareModelsDto = exports.RouteMessageDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const azure_foundry_ia_router_service_1 = require("./azure-foundry-ia-router.service");
const chat_completion_request_dto_1 = require("./dto/chat-completion-request.dto");
const chat_completion_response_dto_1 = require("./dto/chat-completion-response.dto");
class RouteMessageDto {
}
exports.RouteMessageDto = RouteMessageDto;
class CompareModelsDto {
}
exports.CompareModelsDto = CompareModelsDto;
let IARoutingController = IARoutingController_1 = class IARoutingController {
    constructor(iaRouterService) {
        this.iaRouterService = iaRouterService;
        this.logger = new common_1.Logger(IARoutingController_1.name);
    }
    async processChatCompletion(request) {
        try {
            this.logger.log('Processing chat completion request');
            const response = await this.iaRouterService.processChatCompletion(request);
            return response;
        }
        catch (error) {
            this.logger.error(`Failed to process chat completion: ${error.message}`);
            throw error;
        }
    }
    async routeMessage(routeMessageDto) {
        try {
            this.logger.log(`Routing message: ${routeMessageDto.message.substring(0, 50)}...`);
            const routedModel = await this.iaRouterService.routeMessage(routeMessageDto.message, routeMessageDto.context);
            return { routedModel };
        }
        catch (error) {
            this.logger.error(`Failed to route message: ${error.message}`);
            throw error;
        }
    }
    async compareModels(compareModelsDto) {
        try {
            this.logger.log(`Comparing models for prompt: ${compareModelsDto.prompt.substring(0, 50)}...`);
            const comparisonResult = await this.iaRouterService.compareModels(compareModelsDto.prompt, compareModelsDto.models);
            return comparisonResult;
        }
        catch (error) {
            this.logger.error(`Failed to compare models: ${error.message}`);
            throw error;
        }
    }
    async getRateLimitStatus() {
        try {
            this.logger.log('Getting rate limit status');
            return this.iaRouterService.getRateLimitStatus();
        }
        catch (error) {
            this.logger.error(`Failed to get rate limit status: ${error.message}`);
            throw error;
        }
    }
};
exports.IARoutingController = IARoutingController;
__decorate([
    (0, common_1.Post)('chat-completion'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Process a chat completion request through Azure Foundry Model Router' }),
    (0, swagger_1.ApiBody)({ type: chat_completion_request_dto_1.ChatCompletionRequestDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Successful chat completion response',
        type: chat_completion_response_dto_1.ChatCompletionResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Rate limit exceeded' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_completion_request_dto_1.ChatCompletionRequestDto]),
    __metadata("design:returntype", Promise)
], IARoutingController.prototype, "processChatCompletion", null);
__decorate([
    (0, common_1.Post)('route-message'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Route a message to the most appropriate AI model' }),
    (0, swagger_1.ApiBody)({ type: RouteMessageDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Successfully routed message',
        schema: {
            type: 'object',
            properties: {
                routedModel: { type: 'string' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RouteMessageDto]),
    __metadata("design:returntype", Promise)
], IARoutingController.prototype, "routeMessage", null);
__decorate([
    (0, common_1.Post)('compare-models'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Compare multiple AI models\' responses to the same prompt' }),
    (0, swagger_1.ApiBody)({ type: CompareModelsDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Model comparison results',
        schema: {
            type: 'object',
            properties: {
                results: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            model: { type: 'string' },
                            response: { type: 'string' },
                            tokensUsed: { type: 'number' },
                            processingTime: { type: 'number' }
                        }
                    }
                },
                evaluation: {
                    type: 'object',
                    properties: {
                        bestModel: { type: 'string' },
                        reasoning: { type: 'string' },
                        scores: { type: 'object' }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CompareModelsDto]),
    __metadata("design:returntype", Promise)
], IARoutingController.prototype, "compareModels", null);
__decorate([
    (0, common_1.Post)('rate-limit-status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get current rate limit status' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Current rate limit status',
        schema: {
            type: 'object',
            properties: {
                requestsUsed: { type: 'number' },
                requestsLimit: { type: 'number' },
                tokensUsed: { type: 'number' },
                tokensLimit: { type: 'number' },
                resetTime: { type: 'number' }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IARoutingController.prototype, "getRateLimitStatus", null);
exports.IARoutingController = IARoutingController = IARoutingController_1 = __decorate([
    (0, common_1.Controller)('ia-routing'),
    (0, swagger_1.ApiTags)('IA Routing'),
    __metadata("design:paramtypes", [azure_foundry_ia_router_service_1.AzureFoundryIARouterService])
], IARoutingController);
//# sourceMappingURL=ia-routing.controller.js.map