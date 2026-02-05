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
exports.ScrumTimelineV2Controller = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const scrum_timeline_v2_service_1 = require("../services/scrum-timeline-v2.service");
let ScrumTimelineV2Controller = class ScrumTimelineV2Controller {
    constructor(agentService) {
        this.agentService = agentService;
    }
    async execute(payload) {
        return this.agentService.execute(payload);
    }
    async getMetrics() {
        return this.agentService.getMetrics();
    }
};
exports.ScrumTimelineV2Controller = ScrumTimelineV2Controller;
__decorate([
    (0, common_1.Post)('execute'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Execute scrum timeline synchronization' }),
    (0, swagger_1.ApiBody)({ type: Object }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Scrum timeline synchronization executed successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScrumTimelineV2Controller.prototype, "execute", null);
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
], ScrumTimelineV2Controller.prototype, "getMetrics", null);
exports.ScrumTimelineV2Controller = ScrumTimelineV2Controller = __decorate([
    (0, swagger_1.ApiTags)('Agent - Scrum Timeline V2'),
    (0, common_1.Controller)('api/v2/agent/scrum-timeline'),
    __metadata("design:paramtypes", [scrum_timeline_v2_service_1.ScrumTimelineV2Service])
], ScrumTimelineV2Controller);
//# sourceMappingURL=scrum-timeline-v2.controller.js.map