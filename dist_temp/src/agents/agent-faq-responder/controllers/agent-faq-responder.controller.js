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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentFaqResponderController = void 0;
const common_1 = require("@nestjs/common");
const agent_faq_responder_service_1 = require("../services/agent-faq-responder.service");
const create_agent_faq_responder_dto_1 = require("../dto/create-agent-faq-responder.dto");
const swagger_1 = require("@nestjs/swagger");
let AgentFaqResponderController = class AgentFaqResponderController {
    constructor(service) {
        this.service = service;
    }
    async create(dto) {
        return this.service.create(dto);
    }
    async findAll() {
        return this.service.findAll();
    }
    async findOne(id) {
        return this.service.findOne(id);
    }
};
exports.AgentFaqResponderController = AgentFaqResponderController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate FAQ responses',
        description: 'Create comprehensive FAQ responses based on provided topics or questions',
    }),
    (0, swagger_1.ApiBody)({
        description: 'FAQ generation parameters',
        schema: {
            type: 'object',
            properties: {
                sessionId: { type: 'string', example: 'user-session-123' },
                topic: {
                    type: 'string',
                    example: 'product returns and refunds',
                    description: 'Topic or category for FAQ generation',
                },
                question: {
                    type: 'string',
                    example: 'How do I return a product?',
                    description: 'Specific question to answer (optional if topic is provided)',
                },
                audience: {
                    type: 'string',
                    example: 'customers',
                    description: 'Target audience for the FAQ responses',
                },
                detailLevel: {
                    type: 'string',
                    example: 'comprehensive',
                    description: 'Level of detail (basic, standard, comprehensive)',
                },
                format: {
                    type: 'string',
                    example: 'list',
                    description: 'Response format (list, article, dialogue)',
                },
            },
            required: ['sessionId', 'topic'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'FAQ responses generated successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: 'uuid-123' },
                sessionId: { type: 'string', example: 'user-session-123' },
                status: { type: 'string', example: 'completed' },
                result: {
                    type: 'object',
                    properties: {
                        questions: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    question: { type: 'string' },
                                    answer: { type: 'string' },
                                    category: { type: 'string' },
                                    confidence: { type: 'number' },
                                },
                            },
                        },
                        summary: { type: 'string' },
                    },
                },
                createdAt: { type: 'string', format: 'date-time' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid parameters provided' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_agent_faq_responder_dto_1.CreateAgentFaqResponderDto]),
    __metadata("design:returntype", Promise)
], AgentFaqResponderController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all FAQ responses',
        description: 'Retrieve a list of all FAQ responses generated by this agent',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of FAQ responses',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    sessionId: { type: 'string' },
                    status: { type: 'string' },
                    result: { type: 'object' },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentFaqResponderController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get FAQ response by ID',
        description: 'Retrieve details of a specific FAQ response by its ID',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'FAQ response ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'FAQ response details',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                sessionId: { type: 'string' },
                status: { type: 'string' },
                result: { type: 'object' },
                createdAt: { type: 'string', format: 'date-time' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'FAQ response not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgentFaqResponderController.prototype, "findOne", null);
exports.AgentFaqResponderController = AgentFaqResponderController = __decorate([
    (0, swagger_1.ApiTags)('faq-responder'),
    (0, common_1.Controller)('agents/faq-responder'),
    __metadata("design:paramtypes", [agent_faq_responder_service_1.AgentFaqResponderService])
], AgentFaqResponderController);
//# sourceMappingURL=agent-faq-responder.controller.js.map