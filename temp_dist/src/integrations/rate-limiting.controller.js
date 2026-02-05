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
exports.RateLimitingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rate_limiting_service_1 = require("./rate-limiting.service");
let RateLimitingController = class RateLimitingController {
    constructor(rateLimitingService) {
        this.rateLimitingService = rateLimitingService;
    }
    async setChannelConfig(channel, config) {
        try {
            this.rateLimitingService.setChannelConfig(channel, config);
            return {
                success: true,
                message: 'Rate limit configuration set successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to set rate limit configuration',
            };
        }
    }
    async getRateLimitInfo(channel, identifier) {
        try {
            const data = this.rateLimitingService.getRateLimitInfo(channel, identifier);
            if (data) {
                return {
                    success: true,
                    data,
                    message: 'Rate limit information retrieved successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'No rate limit information found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve rate limit information',
            };
        }
    }
    async resetRateLimit(channel, identifier) {
        try {
            this.rateLimitingService.resetRateLimit(channel, identifier);
            return {
                success: true,
                message: 'Rate limit reset successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to reset rate limit',
            };
        }
    }
    async unbanIdentifier(channel, identifier) {
        try {
            this.rateLimitingService.unbanIdentifier(channel, identifier);
            return {
                success: true,
                message: 'Identifier unbanned successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to unban identifier',
            };
        }
    }
    async getAllConfigurations() {
        try {
            const data = this.rateLimitingService.getAllConfigurations();
            return {
                success: true,
                data: Object.fromEntries(data),
                message: 'Rate limit configurations retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve rate limit configurations',
            };
        }
    }
};
exports.RateLimitingController = RateLimitingController;
__decorate([
    (0, common_1.Post)('config/:channel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Set rate limit configuration for a channel' }),
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
                windowMs: { type: 'number', example: 60000 },
                maxRequests: { type: 'number', example: 10 },
                banThreshold: { type: 'number', example: 5 },
                banDuration: { type: 'number', example: 3600000 },
            },
            required: ['windowMs', 'maxRequests'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Rate limit configuration set successfully',
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
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RateLimitingController.prototype, "setChannelConfig", null);
__decorate([
    (0, common_1.Get)('info/:channel/:identifier'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get rate limit information for an identifier on a channel' }),
    (0, swagger_1.ApiParam)({
        name: 'channel',
        required: true,
        type: 'string',
        example: 'whatsapp',
    }),
    (0, swagger_1.ApiParam)({
        name: 'identifier',
        required: true,
        type: 'string',
        example: '+1234567890',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Rate limit information retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'No rate limit information found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('channel')),
    __param(1, (0, common_1.Param)('identifier')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RateLimitingController.prototype, "getRateLimitInfo", null);
__decorate([
    (0, common_1.Post)('reset/:channel/:identifier'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reset rate limit for an identifier on a channel' }),
    (0, swagger_1.ApiParam)({
        name: 'channel',
        required: true,
        type: 'string',
        example: 'whatsapp',
    }),
    (0, swagger_1.ApiParam)({
        name: 'identifier',
        required: true,
        type: 'string',
        example: '+1234567890',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Rate limit reset successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('channel')),
    __param(1, (0, common_1.Param)('identifier')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RateLimitingController.prototype, "resetRateLimit", null);
__decorate([
    (0, common_1.Post)('unban/:channel/:identifier'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Unban an identifier on a channel' }),
    (0, swagger_1.ApiParam)({
        name: 'channel',
        required: true,
        type: 'string',
        example: 'whatsapp',
    }),
    (0, swagger_1.ApiParam)({
        name: 'identifier',
        required: true,
        type: 'string',
        example: '+1234567890',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Identifier unbanned successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('channel')),
    __param(1, (0, common_1.Param)('identifier')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RateLimitingController.prototype, "unbanIdentifier", null);
__decorate([
    (0, common_1.Get)('configs'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get all rate limit configurations' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Rate limit configurations retrieved successfully',
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
], RateLimitingController.prototype, "getAllConfigurations", null);
exports.RateLimitingController = RateLimitingController = __decorate([
    (0, swagger_1.ApiTags)('Rate Limiting'),
    (0, common_1.Controller)('rate-limit'),
    __metadata("design:paramtypes", [rate_limiting_service_1.RateLimitingService])
], RateLimitingController);
//# sourceMappingURL=rate-limiting.controller.js.map