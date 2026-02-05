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
exports.ViralCampaignOrchestratorController = void 0;
const common_1 = require("@nestjs/common");
const viral_campaign_orchestrator_service_1 = require("../services/viral-campaign-orchestrator.service");
const activate_campaign_dto_1 = require("../dto/activate-campaign.dto");
const swagger_1 = require("@nestjs/swagger");
let ViralCampaignOrchestratorController = class ViralCampaignOrchestratorController {
    constructor(viralCampaignOrchestratorService) {
        this.viralCampaignOrchestratorService = viralCampaignOrchestratorService;
    }
    async activateCampaign(activateCampaignDto, authHeader) {
        try {
            const userId = this.extractUserIdFromToken(authHeader);
            return await this.viralCampaignOrchestratorService.activateCampaign(activateCampaignDto, userId);
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: `Failed to activate viral campaign: ${error.message}`,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCampaignStatus(campaignId) {
        try {
            return await this.viralCampaignOrchestratorService.getCampaignStatus(campaignId);
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: `Failed to retrieve campaign status: ${error.message}`,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCampaignsBySession(sessionId) {
        try {
            return await this.viralCampaignOrchestratorService.getAllCampaignsBySession(sessionId);
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: `Failed to retrieve campaigns by session: ${error.message}`,
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
exports.ViralCampaignOrchestratorController = ViralCampaignOrchestratorController;
__decorate([
    (0, common_1.Post)('activate'),
    (0, swagger_1.ApiOperation)({
        summary: 'Activate viral campaign',
        description: 'Activate a modular viral campaign with Scrum methodology',
    }),
    (0, swagger_1.ApiHeader)({
        name: 'Authorization',
        description: 'User JWT token',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Campaign activation parameters',
        type: activate_campaign_dto_1.ActivateCampaignDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Viral campaign activated successfully',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'campaign_activated' },
                campaignId: { type: 'string', example: 'campaign-123' },
                message: {
                    type: 'string',
                    example: 'Viral campaign activated successfully',
                },
                sessionId: { type: 'string', example: 'user-session-123' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [activate_campaign_dto_1.ActivateCampaignDto, String]),
    __metadata("design:returntype", Promise)
], ViralCampaignOrchestratorController.prototype, "activateCampaign", null);
__decorate([
    (0, common_1.Get)('status/:campaignId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get campaign status',
        description: 'Retrieve the current status of a viral campaign',
    }),
    (0, swagger_1.ApiParam)({
        name: 'campaignId',
        description: 'Campaign ID',
        example: 'campaign-123',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Campaign status information',
        schema: {
            type: 'object',
            properties: {
                campaignId: { type: 'string' },
                campaignType: { type: 'string' },
                status: { type: 'string' },
                currentStage: { type: 'number' },
                stages: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            order: { type: 'number' },
                            name: { type: 'string' },
                            agent: { type: 'string' },
                            status: { type: 'string' },
                            startedAt: { type: 'string', format: 'date-time' },
                            completedAt: { type: 'string', format: 'date-time' },
                            output: { type: 'object' },
                        },
                    },
                },
                metrics: { type: 'object' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('campaignId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ViralCampaignOrchestratorController.prototype, "getCampaignStatus", null);
__decorate([
    (0, common_1.Get)('session/:sessionId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get campaigns by session',
        description: 'Retrieve all viral campaigns for a session',
    }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'Session ID',
        example: 'user-session-123',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of session campaigns',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    campaignType: { type: 'string' },
                    sessionId: { type: 'string' },
                    userId: { type: 'string' },
                    emotion: { type: 'string' },
                    platforms: { type: 'array', items: { type: 'string' } },
                    agents: { type: 'array', items: { type: 'string' } },
                    durationDays: { type: 'number' },
                    schedule: { type: 'object' },
                    stages: { type: 'array' },
                    currentStage: { type: 'number' },
                    status: { type: 'string' },
                    metrics: { type: 'object' },
                    metadata: { type: 'object' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ViralCampaignOrchestratorController.prototype, "getCampaignsBySession", null);
exports.ViralCampaignOrchestratorController = ViralCampaignOrchestratorController = __decorate([
    (0, swagger_1.ApiTags)('viral-campaign-orchestrator'),
    (0, common_1.Controller)('agents/viral-campaign-orchestrator'),
    __metadata("design:paramtypes", [viral_campaign_orchestrator_service_1.ViralCampaignOrchestratorService])
], ViralCampaignOrchestratorController);
//# sourceMappingURL=viral-campaign-orchestrator.controller.js.map