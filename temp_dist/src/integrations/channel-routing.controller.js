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
exports.ChannelRoutingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const channel_routing_service_1 = require("./channel-routing.service");
let ChannelRoutingController = class ChannelRoutingController {
    constructor(routingService) {
        this.routingService = routingService;
    }
    async addRoutingRule(rule) {
        try {
            this.routingService.addRoutingRule(rule);
            return {
                success: true,
                message: 'Routing rule added successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to add routing rule',
            };
        }
    }
    async removeRoutingRule(ruleId) {
        try {
            this.routingService.removeRoutingRule(ruleId);
            return {
                success: true,
                message: 'Routing rule removed successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to remove routing rule',
            };
        }
    }
    async getRoutingRules() {
        try {
            const data = this.routingService.getRoutingRules();
            return {
                success: true,
                data,
                message: 'Routing rules retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve routing rules',
            };
        }
    }
    async routeMessage(context) {
        try {
            const data = this.routingService.routeMessage(context);
            return {
                success: true,
                data,
                message: 'Message routed successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to route message',
            };
        }
    }
    async setChannelPriority(channel, priority) {
        try {
            this.routingService.setChannelPriority(channel, priority);
            return {
                success: true,
                message: 'Channel priority set successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to set channel priority',
            };
        }
    }
    async getChannelPriorities() {
        try {
            const data = this.routingService.getChannelPriorities();
            return {
                success: true,
                data: Object.fromEntries(data),
                message: 'Channel priorities retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve channel priorities',
            };
        }
    }
};
exports.ChannelRoutingController = ChannelRoutingController;
__decorate([
    (0, common_1.Post)('rules'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Add a routing rule' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: 'rule-1' },
                name: { type: 'string', example: 'High Priority Customers' },
                conditions: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            field: { type: 'string', example: 'metadata.customerTier' },
                            operator: { type: 'string', example: 'equals' },
                            value: { type: 'string', example: 'premium' },
                        },
                    },
                },
                actions: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            type: { type: 'string', example: 'route' },
                            channel: { type: 'string', example: 'whatsapp' },
                            template: { type: 'string', example: 'premium-customer-template' },
                        },
                    },
                },
                priority: { type: 'number', example: 1 },
                active: { type: 'boolean', example: true },
            },
            required: ['id', 'name', 'conditions', 'actions', 'priority', 'active'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Routing rule added successfully',
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
], ChannelRoutingController.prototype, "addRoutingRule", null);
__decorate([
    (0, common_1.Post)('remove-rule/:ruleId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a routing rule' }),
    (0, swagger_1.ApiParam)({
        name: 'ruleId',
        required: true,
        type: 'string',
        example: 'rule-1',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Routing rule removed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rule not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('ruleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChannelRoutingController.prototype, "removeRoutingRule", null);
__decorate([
    (0, common_1.Get)('rules'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get all routing rules' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Routing rules retrieved successfully',
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
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChannelRoutingController.prototype, "getRoutingRules", null);
__decorate([
    (0, common_1.Post)('route'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Route a message based on context and rules' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                channelId: { type: 'string', example: 'whatsapp' },
                recipient: { type: 'string', example: '+1234567890' },
                message: { type: 'string', example: 'Hello from MisyBot!' },
                metadata: {
                    type: 'object',
                    example: {
                        customerTier: 'premium',
                        language: 'en',
                    },
                },
            },
            required: ['recipient', 'message'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Message routed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        channel: { type: 'string' },
                        template: { type: 'string' },
                        parameters: { type: 'object' },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChannelRoutingController.prototype, "routeMessage", null);
__decorate([
    (0, common_1.Post)('priority/:channel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Set channel priority for fallback routing' }),
    (0, swagger_1.ApiParam)({
        name: 'channel',
        required: true,
        type: 'string',
        example: 'whatsapp',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                priority: { type: 'number', example: 1 },
            },
            required: ['priority'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Channel priority set successfully',
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
    __param(0, (0, common_1.Param)('channel')),
    __param(1, (0, common_1.Body)('priority')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ChannelRoutingController.prototype, "setChannelPriority", null);
__decorate([
    (0, common_1.Get)('priorities'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get channel priorities' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Channel priorities retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChannelRoutingController.prototype, "getChannelPriorities", null);
exports.ChannelRoutingController = ChannelRoutingController = __decorate([
    (0, swagger_1.ApiTags)('Channel Routing'),
    (0, common_1.Controller)('routing'),
    __metadata("design:paramtypes", [channel_routing_service_1.ChannelRoutingService])
], ChannelRoutingController);
//# sourceMappingURL=channel-routing.controller.js.map