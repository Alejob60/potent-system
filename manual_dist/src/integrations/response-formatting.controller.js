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
exports.ResponseFormattingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const response_formatting_service_1 = require("./response-formatting.service");
let ResponseFormattingController = class ResponseFormattingController {
    constructor(formattingService) {
        this.formattingService = formattingService;
    }
    async addTemplate(template) {
        try {
            this.formattingService.addTemplate(template);
            return {
                success: true,
                message: 'Formatting template added successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to add formatting template',
            };
        }
    }
    async getTemplate(templateId) {
        try {
            const data = this.formattingService.getTemplate(templateId);
            if (data) {
                return {
                    success: true,
                    data,
                    message: 'Formatting template retrieved successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Template not found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve formatting template',
            };
        }
    }
    async removeTemplate(templateId) {
        try {
            const result = this.formattingService.removeTemplate(templateId);
            if (result) {
                return {
                    success: true,
                    message: 'Formatting template removed successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Template not found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to remove formatting template',
            };
        }
    }
    async addFormatRule(rule) {
        try {
            this.formattingService.addFormatRule(rule);
            return {
                success: true,
                message: 'Response format rule added successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to add response format rule',
            };
        }
    }
    async getFormatRule(ruleId) {
        try {
            const data = this.formattingService.getFormatRule(ruleId);
            if (data) {
                return {
                    success: true,
                    data,
                    message: 'Response format rule retrieved successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Rule not found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve response format rule',
            };
        }
    }
    async removeFormatRule(ruleId) {
        try {
            const result = this.formattingService.removeFormatRule(ruleId);
            if (result) {
                return {
                    success: true,
                    message: 'Response format rule removed successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Rule not found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to remove response format rule',
            };
        }
    }
    async formatResponse(channel, content, context) {
        try {
            const data = this.formattingService.formatResponse(channel, content, context);
            return {
                success: true,
                data,
                message: 'Response formatted successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to format response',
            };
        }
    }
    async formatWithTemplate(templateId, variables) {
        try {
            const data = this.formattingService.formatWithTemplate(templateId, variables);
            return {
                success: true,
                data,
                message: 'Response formatted with template successfully',
            };
        }
        catch (error) {
            if (error.message.includes('not found')) {
                return {
                    success: false,
                    error: error.message,
                    message: 'Template not found',
                };
            }
            return {
                success: false,
                error: error.message,
                message: 'Failed to format response with template',
            };
        }
    }
    async getTemplatesForChannel(channel) {
        try {
            const data = this.formattingService.getTemplatesForChannel(channel);
            return {
                success: true,
                data,
                message: 'Templates retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve templates',
            };
        }
    }
};
exports.ResponseFormattingController = ResponseFormattingController;
__decorate([
    (0, common_1.Post)('templates'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Add a formatting template' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: 'template-1' },
                name: { type: 'string', example: 'Welcome Message' },
                channel: { type: 'string', example: 'whatsapp' },
                template: { type: 'string', example: 'Hello {{name}}! Welcome to our service.' },
                variables: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['name'],
                },
            },
            required: ['id', 'name', 'channel', 'template', 'variables'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Formatting template added successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResponseFormattingController.prototype, "addTemplate", null);
__decorate([
    (0, common_1.Get)('templates/:templateId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get a formatting template' }),
    (0, swagger_1.ApiParam)({
        name: 'templateId',
        required: true,
        type: 'string',
        example: 'template-1',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Formatting template retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Template not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResponseFormattingController.prototype, "getTemplate", null);
__decorate([
    (0, common_1.Delete)('templates/:templateId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a formatting template' }),
    (0, swagger_1.ApiParam)({
        name: 'templateId',
        required: true,
        type: 'string',
        example: 'template-1',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Formatting template removed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Template not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResponseFormattingController.prototype, "removeTemplate", null);
__decorate([
    (0, common_1.Post)('rules'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Add a response format rule' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: 'rule-1' },
                name: { type: 'string', example: 'Uppercase for Premium Users' },
                conditions: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            field: { type: 'string', example: 'context.customerTier' },
                            operator: { type: 'string', example: 'equals' },
                            value: { type: 'string', example: 'premium' },
                        },
                    },
                },
                formatter: {
                    type: 'object',
                    properties: {
                        type: { type: 'string', example: 'transformation' },
                        transformation: { type: 'string', example: 'uppercase' },
                    },
                },
                priority: { type: 'number', example: 1 },
                active: { type: 'boolean', example: true },
            },
            required: ['id', 'name', 'conditions', 'formatter', 'priority', 'active'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Response format rule added successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResponseFormattingController.prototype, "addFormatRule", null);
__decorate([
    (0, common_1.Get)('rules/:ruleId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get a response format rule' }),
    (0, swagger_1.ApiParam)({
        name: 'ruleId',
        required: true,
        type: 'string',
        example: 'rule-1',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Response format rule retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rule not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('ruleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResponseFormattingController.prototype, "getFormatRule", null);
__decorate([
    (0, common_1.Delete)('rules/:ruleId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a response format rule' }),
    (0, swagger_1.ApiParam)({
        name: 'ruleId',
        required: true,
        type: 'string',
        example: 'rule-1',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Response format rule removed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rule not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('ruleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResponseFormattingController.prototype, "removeFormatRule", null);
__decorate([
    (0, common_1.Post)('format'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Format a response for a specific channel' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                channel: { type: 'string', example: 'whatsapp' },
                content: { type: 'string', example: 'Hello, how can I help you?' },
                context: {
                    type: 'object',
                    example: {
                        customerTier: 'premium',
                        language: 'en',
                    },
                },
            },
            required: ['channel', 'content'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Response formatted successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)('channel')),
    __param(1, (0, common_1.Body)('content')),
    __param(2, (0, common_1.Body)('context')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ResponseFormattingController.prototype, "formatResponse", null);
__decorate([
    (0, common_1.Post)('format-template/:templateId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Format a response using a template' }),
    (0, swagger_1.ApiParam)({
        name: 'templateId',
        required: true,
        type: 'string',
        example: 'template-1',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                variables: {
                    type: 'object',
                    example: { name: 'John', orderNumber: '12345' },
                },
            },
            required: ['variables'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Response formatted with template successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Template not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Body)('variables')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ResponseFormattingController.prototype, "formatWithTemplate", null);
__decorate([
    (0, common_1.Get)('templates/channel/:channel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get all templates for a channel' }),
    (0, swagger_1.ApiParam)({
        name: 'channel',
        required: true,
        type: 'string',
        example: 'whatsapp',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Templates retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: { type: 'object' },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('channel')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResponseFormattingController.prototype, "getTemplatesForChannel", null);
exports.ResponseFormattingController = ResponseFormattingController = __decorate([
    (0, swagger_1.ApiTags)('Response Formatting'),
    (0, common_1.Controller)('formatting'),
    __metadata("design:paramtypes", [response_formatting_service_1.ResponseFormattingService])
], ResponseFormattingController);
//# sourceMappingURL=response-formatting.controller.js.map