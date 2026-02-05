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
exports.DailyCoordinatorV2Controller = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const daily_coordinator_v2_service_1 = require("../services/daily-coordinator-v2.service");
let DailyCoordinatorV2Controller = class DailyCoordinatorV2Controller {
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
exports.DailyCoordinatorV2Controller = DailyCoordinatorV2Controller;
__decorate([
    (0, common_1.Post)('execute'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Execute daily coordination' }),
    (0, swagger_1.ApiBody)({ type: Object }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Daily coordination executed successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DailyCoordinatorV2Controller.prototype, "execute", null);
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
], DailyCoordinatorV2Controller.prototype, "getMetrics", null);
exports.DailyCoordinatorV2Controller = DailyCoordinatorV2Controller = __decorate([
    (0, swagger_1.ApiTags)('Agent - Daily Coordinator V2'),
    (0, common_1.Controller)('api/v2/agent/daily-coordinator'),
    __metadata("design:paramtypes", [daily_coordinator_v2_service_1.DailyCoordinatorV2Service])
], DailyCoordinatorV2Controller);
//# sourceMappingURL=daily-coordinator-v2.controller.js.map