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
var FrontDeskV2Controller_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrontDeskV2Controller = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const front_desk_v2_service_1 = require("../services/front-desk-v2.service");
const front_desk_request_dto_1 = require("../dto/front-desk-request.dto");
let FrontDeskV2Controller = FrontDeskV2Controller_1 = class FrontDeskV2Controller {
    constructor(agentService) {
        this.agentService = agentService;
        this.logger = new common_1.Logger(FrontDeskV2Controller_1.name);
    }
    async create(req, dto) {
        this.logger.log('Received front desk request', { dto });
        try {
            const tenantContext = req.tenantContext;
            const enrichedDto = {
                ...dto,
                tenantContext,
            };
            const result = await this.agentService.execute(enrichedDto);
            this.logger.log('Front desk service executed successfully', {
                hasResult: !!result,
                resultType: typeof result,
                resultKeys: result ? Object.keys(result) : null
            });
            return result;
        }
        catch (error) {
            this.logger.error('Error in front desk controller', error.stack);
            throw error;
        }
    }
    async getMetrics() {
        return this.agentService.reportMetrics();
    }
};
exports.FrontDeskV2Controller = FrontDeskV2Controller;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Process front desk request (V2)' }),
    (0, swagger_1.ApiBody)({ type: front_desk_request_dto_1.FrontDeskRequestDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Front desk processing executed successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, front_desk_request_dto_1.FrontDeskRequestDto]),
    __metadata("design:returntype", Promise)
], FrontDeskV2Controller.prototype, "create", null);
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
], FrontDeskV2Controller.prototype, "getMetrics", null);
exports.FrontDeskV2Controller = FrontDeskV2Controller = FrontDeskV2Controller_1 = __decorate([
    (0, swagger_1.ApiTags)('Agent - Front Desk V2'),
    (0, common_1.Controller)('v2/agents/front-desk'),
    __metadata("design:paramtypes", [front_desk_v2_service_1.FrontDeskV2Service])
], FrontDeskV2Controller);
//# sourceMappingURL=front-desk-v2.controller.js.map