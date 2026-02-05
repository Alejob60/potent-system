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
exports.AuthLogController = void 0;
const common_1 = require("@nestjs/common");
const auth_log_service_1 = require("../../../services/auth-log.service");
const auth_log_entity_1 = require("../../../entities/auth-log.entity");
const swagger_1 = require("@nestjs/swagger");
let AuthLogController = class AuthLogController {
    constructor(authLogService) {
        this.authLogService = authLogService;
    }
    async getAuthLogs(userId, eventType, ipAddress, startDate, endDate, success, limit = 50, offset = 0) {
        const filters = {
            userId,
            eventType,
            ipAddress,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            success,
        };
        return this.authLogService.getAuthLogs(filters, limit, offset);
    }
    async getUserAuthLogs(userId, limit = 50, offset = 0) {
        const filters = { userId };
        return this.authLogService.getAuthLogs(filters, limit, offset);
    }
    async getIpAuthLogs(ipAddress, limit = 50, offset = 0) {
        const filters = { ipAddress };
        return this.authLogService.getAuthLogs(filters, limit, offset);
    }
    async getFailedAttemptsByIp(ipAddress, timeWindow = 60) {
        const count = await this.authLogService.getFailedAttemptsByIp(ipAddress, timeWindow);
        return { count, ipAddress, timeWindow };
    }
    async getFailedAttemptsByUser(userId, timeWindow = 60) {
        const count = await this.authLogService.getFailedAttemptsByUser(userId, timeWindow);
        return { count, userId, timeWindow };
    }
};
exports.AuthLogController = AuthLogController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get authentication logs',
        description: 'Retrieve authentication logs with optional filters',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'userId',
        required: false,
        description: 'Filter by user ID',
        example: 'user-123',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'eventType',
        required: false,
        description: 'Filter by event type',
        enum: auth_log_entity_1.AuthEventType,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'ipAddress',
        required: false,
        description: 'Filter by IP address',
        example: '192.168.1.1',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'startDate',
        required: false,
        description: 'Filter by start date (ISO format)',
        example: '2023-01-01T00:00:00Z',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'endDate',
        required: false,
        description: 'Filter by end date (ISO format)',
        example: '2023-12-31T23:59:59Z',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'success',
        required: false,
        description: 'Filter by success status',
        type: Boolean,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        description: 'Number of records to return (default: 50)',
        type: Number,
        example: 50,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'offset',
        required: false,
        description: 'Number of records to skip (default: 0)',
        type: Number,
        example: 0,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Authentication logs retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    eventType: { type: 'string', enum: Object.values(auth_log_entity_1.AuthEventType) },
                    userId: { type: 'string', nullable: true },
                    sessionId: { type: 'string', nullable: true },
                    ipAddress: { type: 'string', nullable: true },
                    userAgent: { type: 'string', nullable: true },
                    metadata: { type: 'object' },
                    errorMessage: { type: 'string', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    countryCode: { type: 'string', nullable: true },
                    city: { type: 'string', nullable: true },
                    success: { type: 'boolean' },
                    attemptDuration: { type: 'number', nullable: true },
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('eventType')),
    __param(2, (0, common_1.Query)('ipAddress')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __param(5, (0, common_1.Query)('success')),
    __param(6, (0, common_1.Query)('limit', common_1.ParseIntPipe)),
    __param(7, (0, common_1.Query)('offset', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Boolean, Number, Number]),
    __metadata("design:returntype", Promise)
], AuthLogController.prototype, "getAuthLogs", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get authentication logs for a specific user',
        description: 'Retrieve authentication logs for a specific user',
    }),
    (0, swagger_1.ApiParam)({
        name: 'userId',
        description: 'User ID',
        example: 'user-123',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        description: 'Number of records to return (default: 50)',
        type: Number,
        example: 50,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'offset',
        required: false,
        description: 'Number of records to skip (default: 0)',
        type: Number,
        example: 0,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Authentication logs retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('limit', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('offset', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], AuthLogController.prototype, "getUserAuthLogs", null);
__decorate([
    (0, common_1.Get)('ip/:ipAddress'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get authentication logs for a specific IP address',
        description: 'Retrieve authentication logs for a specific IP address',
    }),
    (0, swagger_1.ApiParam)({
        name: 'ipAddress',
        description: 'IP address',
        example: '192.168.1.1',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        description: 'Number of records to return (default: 50)',
        type: Number,
        example: 50,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'offset',
        required: false,
        description: 'Number of records to skip (default: 0)',
        type: Number,
        example: 0,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Authentication logs retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('ipAddress')),
    __param(1, (0, common_1.Query)('limit', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('offset', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], AuthLogController.prototype, "getIpAuthLogs", null);
__decorate([
    (0, common_1.Get)('failed-attempts/ip/:ipAddress'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get failed login attempts for IP address',
        description: 'Retrieve number of failed login attempts for a specific IP address in the last hour',
    }),
    (0, swagger_1.ApiParam)({
        name: 'ipAddress',
        description: 'IP address',
        example: '192.168.1.1',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'timeWindow',
        required: false,
        description: 'Time window in minutes (default: 60)',
        type: Number,
        example: 60,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Failed attempts count retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                count: { type: 'number' },
                ipAddress: { type: 'string' },
                timeWindow: { type: 'number' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('ipAddress')),
    __param(1, (0, common_1.Query)('timeWindow', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AuthLogController.prototype, "getFailedAttemptsByIp", null);
__decorate([
    (0, common_1.Get)('failed-attempts/user/:userId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get failed login attempts for user',
        description: 'Retrieve number of failed login attempts for a specific user in the last hour',
    }),
    (0, swagger_1.ApiParam)({
        name: 'userId',
        description: 'User ID',
        example: 'user-123',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'timeWindow',
        required: false,
        description: 'Time window in minutes (default: 60)',
        type: Number,
        example: 60,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Failed attempts count retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                count: { type: 'number' },
                userId: { type: 'string' },
                timeWindow: { type: 'number' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('timeWindow', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AuthLogController.prototype, "getFailedAttemptsByUser", null);
exports.AuthLogController = AuthLogController = __decorate([
    (0, swagger_1.ApiTags)('security'),
    (0, common_1.Controller)('auth-logs'),
    __metadata("design:paramtypes", [auth_log_service_1.AuthLogService])
], AuthLogController);
//# sourceMappingURL=auth-log.controller.js.map