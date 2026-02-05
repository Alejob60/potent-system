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
exports.ViralizationRouteEngineController = void 0;
const common_1 = require("@nestjs/common");
const viralization_route_engine_service_1 = require("../services/viralization-route-engine.service");
const activate_route_dto_1 = require("../dto/activate-route.dto");
const swagger_1 = require("@nestjs/swagger");
let ViralizationRouteEngineController = class ViralizationRouteEngineController {
    constructor(viralizationRouteEngineService) {
        this.viralizationRouteEngineService = viralizationRouteEngineService;
    }
    async activateRoute(activateRouteDto, authHeader) {
        try {
            const userId = this.extractUserIdFromToken(authHeader);
            return await this.viralizationRouteEngineService.activateRoute(activateRouteDto, userId);
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: `Failed to activate viralization route: ${error.message}`,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getRouteStatus(routeId) {
        try {
            return await this.viralizationRouteEngineService.getRouteStatus(routeId);
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: `Failed to retrieve route status: ${error.message}`,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getRoutesBySession(sessionId) {
        try {
            return await this.viralizationRouteEngineService.getAllRoutesBySession(sessionId);
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: `Failed to retrieve routes by session: ${error.message}`,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    extractUserIdFromToken(authHeader) {
        if (!authHeader) {
            throw new Error('Authorization header is required');
        }
        return 'user_1234567890';
    }
};
exports.ViralizationRouteEngineController = ViralizationRouteEngineController;
__decorate([
    (0, common_1.Post)('activate'),
    (0, swagger_1.ApiOperation)({
        summary: 'Activate viralization route',
        description: 'Activate a predefined viralization route for a campaign',
    }),
    (0, swagger_1.ApiHeader)({
        name: 'Authorization',
        description: 'User JWT token',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Route activation parameters',
        type: activate_route_dto_1.ActivateRouteDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Viralization route activated successfully',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'route_activated' },
                routeId: { type: 'string', example: 'route-123' },
                message: {
                    type: 'string',
                    example: 'Viralization route activated successfully',
                },
                sessionId: { type: 'string', example: 'user-session-123' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [activate_route_dto_1.ActivateRouteDto, String]),
    __metadata("design:returntype", Promise)
], ViralizationRouteEngineController.prototype, "activateRoute", null);
__decorate([
    (0, common_1.Get)('status/:routeId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get route status',
        description: 'Retrieve the current status of a viralization route',
    }),
    (0, swagger_1.ApiParam)({
        name: 'routeId',
        description: 'Route ID',
        example: 'route-123',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Route status information',
    }),
    __param(0, (0, common_1.Param)('routeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ViralizationRouteEngineController.prototype, "getRouteStatus", null);
__decorate([
    (0, common_1.Get)('session/:sessionId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get routes by session',
        description: 'Retrieve all viralization routes for a session',
    }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'Session ID',
        example: 'user-session-123',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of session routes',
    }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ViralizationRouteEngineController.prototype, "getRoutesBySession", null);
exports.ViralizationRouteEngineController = ViralizationRouteEngineController = __decorate([
    (0, swagger_1.ApiTags)('viralization-route-engine'),
    (0, common_1.Controller)('agents/viralization-route-engine'),
    __metadata("design:paramtypes", [viralization_route_engine_service_1.ViralizationRouteEngineService])
], ViralizationRouteEngineController);
//# sourceMappingURL=viralization-route-engine.controller.js.map