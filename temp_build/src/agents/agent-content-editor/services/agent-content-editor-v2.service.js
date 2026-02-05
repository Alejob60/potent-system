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
exports.AgentContentEditorV2Service = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_content_editor_entity_1 = require("../entities/agent-content-editor.entity");
const agent_base_1 = require("../../../common/agents/agent-base");
const redis_service_1 = require("../../../common/redis/redis.service");
const state_management_service_1 = require("../../../state/state-management.service");
const websocket_gateway_1 = require("../../../websocket/websocket.gateway");
let AgentContentEditorV2Service = class AgentContentEditorV2Service extends agent_base_1.AgentBase {
    constructor(repo, redisService, stateManager, websocketGateway) {
        super('content-editor-v2', 'Edit and optimize content for specific platforms with enhanced capabilities', ['content_editing', 'platform_optimization', 'quality_enhancement', 'format_adaptation'], redisService, stateManager, websocketGateway);
        this.repo = repo;
    }
    async execute(payload) {
        const startTime = Date.now();
        try {
            if (!(await this.validate(payload))) {
                return this.handleError(new Error('Invalid payload'), 'execute.validate');
            }
            this.logActivity(payload.sessionId, 'Starting content editing', payload);
            if (this.websocketGateway) {
                this.websocketGateway.broadcastSystemNotification({
                    type: 'agent_processing',
                    agent: this.config.name,
                    sessionId: payload.sessionId,
                    message: 'Editing content',
                    timestamp: new Date().toISOString(),
                });
            }
            const result = await this.editContent(payload);
            const savedResult = await this.saveToDatabase(payload, result);
            const processingTime = Date.now() - startTime;
            this.updateMetrics({
                avgResponseTime: processingTime,
            });
            this.logActivity(payload.sessionId, 'Content editing completed', { processingTime, editId: savedResult.id, qualityScore: result.qualityScore });
            return this.formatResponse({
                edit: savedResult,
                editId: savedResult.id,
                editedContent: result.editedContent,
                platformOptimizations: result.platformOptimizations,
                qualityScore: result.qualityScore,
            });
        }
        catch (error) {
            return this.handleError(error, 'execute');
        }
    }
    async validate(payload) {
        if (!payload)
            return false;
        if (!payload.sessionId)
            return false;
        if (!payload.content)
            return false;
        if (!payload.targetPlatforms)
            return false;
        return Array.isArray(payload.targetPlatforms) && payload.targetPlatforms.length > 0;
    }
    async editContent(payload) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const platformOptimizations = payload.targetPlatforms.map(platform => ({
            platform,
            optimizations: [
                `Optimized for ${platform} dimensions`,
                `Adjusted formatting for ${platform} audience`,
                `Enhanced engagement elements for ${platform}`
            ]
        }));
        const editedContent = {
            ...payload.content,
            edited: true,
            lastEdited: new Date().toISOString(),
            optimizations: platformOptimizations
        };
        const qualityScore = Math.floor(Math.random() * 40) + 60;
        return {
            editId: `edit-${Date.now()}`,
            editedContent,
            platformOptimizations,
            qualityScore,
        };
    }
    async saveToDatabase(payload, result) {
        const entity = this.repo.create({
            ...payload,
            editedContent: result.editedContent,
            qualityScore: result.qualityScore,
            status: 'completed',
        });
        return this.repo.save(entity);
    }
    async findAll() {
        return this.repo.find();
    }
    async findOne(id) {
        return this.repo.findOneBy({ id });
    }
    async getMetrics() {
        const total = await this.repo.count();
        const completed = await this.repo.count({ where: { status: 'completed' } });
        const failed = await this.repo.count({ where: { status: 'failed' } });
        const edits = await this.repo.find({ where: { status: 'completed' } });
        const avgQualityScore = edits.length > 0
            ? edits.reduce((sum, edit) => sum + (edit.qualityScore || 0), 0) / edits.length
            : 0;
        return {
            totalEdits: total,
            dbSuccessRate: total > 0 ? (completed / total) * 100 : 0,
            dbFailureRate: total > 0 ? (failed / total) * 100 : 0,
            averageQualityScore: avgQualityScore,
            databaseMetrics: true,
            ...this.metrics,
        };
    }
};
exports.AgentContentEditorV2Service = AgentContentEditorV2Service;
exports.AgentContentEditorV2Service = AgentContentEditorV2Service = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_content_editor_entity_1.AgentContentEditor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        redis_service_1.RedisService,
        state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService])
], AgentContentEditorV2Service);
//# sourceMappingURL=agent-content-editor-v2.service.js.map