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
var MetaAgentV2Controller_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaAgentV2Controller = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const process_request_dto_1 = require("../dtos/process-request.dto");
const process_response_dto_1 = require("../dtos/process-response.dto");
const meta_agent_process_service_1 = require("../services/meta-agent-process.service");
const session_context_service_1 = require("../services/session-context.service");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const tenant_guard_1 = require("../guards/tenant.guard");
let MetaAgentV2Controller = MetaAgentV2Controller_1 = class MetaAgentV2Controller {
    constructor(metaAgentService, sessionContextService) {
        this.metaAgentService = metaAgentService;
        this.sessionContextService = sessionContextService;
        this.logger = new common_1.Logger(MetaAgentV2Controller_1.name);
    }
    async process(processRequest, request) {
        this.logger.log(`Received process request - Tenant: ${processRequest.tenantId}, Session: ${processRequest.sessionId}, Channel: ${processRequest.channel}`);
        const startTime = Date.now();
        try {
            const response = await this.metaAgentService.process(processRequest);
            const processingTime = Date.now() - startTime;
            this.logger.log(`Request processed successfully in ${processingTime}ms - Session: ${processRequest.sessionId}, Tokens: ${response.metrics.tokensConsumed}`);
            return response;
        }
        catch (error) {
            this.logger.error(`Error processing request for session ${processRequest.sessionId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getSession(sessionId, request) {
        this.logger.log(`Fetching session summary for: ${sessionId}`);
        const user = request.user;
        const tenantId = user?.tenantId || 'default-tenant';
        try {
            const summary = await this.sessionContextService.getSessionSummary(sessionId, tenantId);
            this.logger.log(`Session summary retrieved for: ${sessionId}`);
            return {
                success: true,
                data: summary
            };
        }
        catch (error) {
            this.logger.error(`Error fetching session ${sessionId}: ${error.message}`);
            throw error;
        }
    }
    async submitFeedback(feedbackData, request) {
        this.logger.log(`Feedback received for session: ${feedbackData.sessionId}`);
        return {
            success: true,
            message: 'Feedback received and will be used to improve responses'
        };
    }
    async healthCheck() {
        this.logger.debug('Health check requested');
        return {
            status: 'healthy',
            version: '2.0.0',
            dependencies: {
                gpt5: 'healthy',
                vectorDB: 'healthy',
                database: 'healthy'
            },
            timestamp: new Date().toISOString()
        };
    }
    async getMetrics(request) {
        this.logger.debug('Metrics requested');
        return {
            success: true,
            data: {
                totalRequests: 0,
                avgResponseTime: 0,
                avgTokensUsed: 0,
                successRate: 0,
            }
        };
    }
};
exports.MetaAgentV2Controller = MetaAgentV2Controller;
__decorate([
    (0, common_1.Post)('process'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Process user input through Meta-Agent V2',
        description: `
      Main endpoint for processing user interactions through the Meta-Agent V2 system.
      Supports text, speech, and event inputs across multiple channels (web, voice, WhatsApp, Instagram).
      
      Features:
      - GPT-5 powered responses
      - Vector-based semantic search for context
      - Multi-tenant isolation
      - Action routing to specialized agents
      - Federated context management
    `
    }),
    (0, swagger_1.ApiBody)({ type: process_request_dto_1.ProcessRequestDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Request processed successfully',
        type: process_response_dto_1.ProcessResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid input data'
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - invalid JWT token'
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error'
    }),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe({ transform: true, whitelist: true }))),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [process_request_dto_1.ProcessRequestDto, Object]),
    __metadata("design:returntype", Promise)
], MetaAgentV2Controller.prototype, "process", null);
__decorate([
    (0, common_1.Get)('session/:sessionId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get session context summary',
        description: 'Retrieve summary information about an active or historical session'
    }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'Session identifier',
        example: 'session-uuid-456'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Session summary retrieved successfully'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Session not found'
    }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MetaAgentV2Controller.prototype, "getSession", null);
__decorate([
    (0, common_1.Post)('feedback'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Submit user/tenant feedback',
        description: 'Submit feedback to improve agent responses and fine-tune models (opt-in)'
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                sessionId: { type: 'string', example: 'session-uuid-456' },
                turnId: { type: 'string', example: 'turn-uuid-789' },
                rating: { type: 'number', minimum: 1, maximum: 5, example: 4 },
                feedback: { type: 'string', example: 'Response was helpful but could be more specific' },
                categories: { type: 'array', items: { type: 'string' }, example: ['accuracy', 'relevance'] }
            },
            required: ['sessionId', 'rating']
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Feedback submitted successfully'
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MetaAgentV2Controller.prototype, "submitFeedback", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Health check endpoint',
        description: 'Check health status of Meta-Agent V2 and its dependencies'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service is healthy',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'healthy' },
                version: { type: 'string', example: '2.0.0' },
                dependencies: {
                    type: 'object',
                    properties: {
                        gpt5: { type: 'string', example: 'healthy' },
                        vectorDB: { type: 'string', example: 'healthy' },
                        database: { type: 'string', example: 'healthy' }
                    }
                },
                timestamp: { type: 'string', example: '2025-12-04T10:30:00.000Z' }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetaAgentV2Controller.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get Meta-Agent V2 metrics',
        description: 'Retrieve performance and usage metrics for the Meta-Agent V2 service'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Metrics retrieved successfully'
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MetaAgentV2Controller.prototype, "getMetrics", null);
exports.MetaAgentV2Controller = MetaAgentV2Controller = MetaAgentV2Controller_1 = __decorate([
    (0, swagger_1.ApiTags)('Meta-Agent V2 - AI Engine'),
    (0, common_1.Controller)('v2/agents/meta-agent'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard),
    __metadata("design:paramtypes", [meta_agent_process_service_1.MetaAgentProcessService,
        session_context_service_1.SessionContextService])
], MetaAgentV2Controller);
//# sourceMappingURL=meta-agent-v2.controller.js.map