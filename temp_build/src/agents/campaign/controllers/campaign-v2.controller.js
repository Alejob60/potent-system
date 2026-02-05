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
exports.CampaignV2Controller = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const campaign_v2_service_1 = require("../services/campaign-v2.service");
const create_campaign_dto_1 = require("../dto/create-campaign.dto");
let CampaignV2Controller = class CampaignV2Controller {
    constructor(agentService) {
        this.agentService = agentService;
    }
    async execute(dto) {
        return this.agentService.execute(dto);
    }
    async getMetrics() {
        return this.agentService.getMetrics();
    }
    async findOne(id) {
        return this.agentService.findOne(id);
    }
    async findAll() {
        return this.agentService.findAll();
    }
};
exports.CampaignV2Controller = CampaignV2Controller;
__decorate([
    (0, common_1.Post)('execute'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Execute campaign management' }),
    (0, swagger_1.ApiBody)({ type: create_campaign_dto_1.CreateCampaignDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Campaign management executed successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_campaign_dto_1.CreateCampaignDto]),
    __metadata("design:returntype", Promise)
], CampaignV2Controller.prototype, "execute", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get agent metrics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Agent metrics retrieved successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CampaignV2Controller.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get campaign by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Campaign ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Campaign retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Campaign not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CampaignV2Controller.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get all campaigns' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'All campaigns retrieved successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CampaignV2Controller.prototype, "findAll", null);
exports.CampaignV2Controller = CampaignV2Controller = __decorate([
    (0, swagger_1.ApiTags)('Agent - Campaign V2'),
    (0, common_1.Controller)('api/v2/agent/campaign'),
    __metadata("design:paramtypes", [campaign_v2_service_1.CampaignV2Service])
], CampaignV2Controller);
//# sourceMappingURL=campaign-v2.controller.js.map