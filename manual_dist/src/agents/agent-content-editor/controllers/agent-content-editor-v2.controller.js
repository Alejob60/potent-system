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
exports.AgentContentEditorV2Controller = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const agent_content_editor_v2_service_1 = require("../services/agent-content-editor-v2.service");
const create_agent_content_editor_dto_1 = require("../dto/create-agent-content-editor.dto");
let AgentContentEditorV2Controller = class AgentContentEditorV2Controller {
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
exports.AgentContentEditorV2Controller = AgentContentEditorV2Controller;
__decorate([
    (0, common_1.Post)('execute'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Execute content editing' }),
    (0, swagger_1.ApiBody)({ type: create_agent_content_editor_dto_1.CreateAgentContentEditorDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Content editing executed successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_agent_content_editor_dto_1.CreateAgentContentEditorDto]),
    __metadata("design:returntype", Promise)
], AgentContentEditorV2Controller.prototype, "execute", null);
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
], AgentContentEditorV2Controller.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get content edit by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Content edit ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Content edit retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Content edit not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgentContentEditorV2Controller.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get all content edits' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'All content edits retrieved successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentContentEditorV2Controller.prototype, "findAll", null);
exports.AgentContentEditorV2Controller = AgentContentEditorV2Controller = __decorate([
    (0, swagger_1.ApiTags)('Agent - Content Editor V2'),
    (0, common_1.Controller)('api/v2/agent/content-editor'),
    __metadata("design:paramtypes", [agent_content_editor_v2_service_1.AgentContentEditorV2Service])
], AgentContentEditorV2Controller);
//# sourceMappingURL=agent-content-editor-v2.controller.js.map