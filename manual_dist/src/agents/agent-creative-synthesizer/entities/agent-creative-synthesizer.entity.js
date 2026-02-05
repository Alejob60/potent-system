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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentCreativeSynthesizer = void 0;
const typeorm_1 = require("typeorm");
let AgentCreativeSynthesizer = class AgentCreativeSynthesizer {
};
exports.AgentCreativeSynthesizer = AgentCreativeSynthesizer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AgentCreativeSynthesizer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], AgentCreativeSynthesizer.prototype, "intention", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], AgentCreativeSynthesizer.prototype, "emotion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Array)
], AgentCreativeSynthesizer.prototype, "entities", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], AgentCreativeSynthesizer.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], AgentCreativeSynthesizer.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AgentCreativeSynthesizer.prototype, "assetUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AgentCreativeSynthesizer.prototype, "assetType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        default: 'pending'
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], AgentCreativeSynthesizer.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'double precision',
        nullable: true,
        name: 'generation_time'
    }),
    __metadata("design:type", Number)
], AgentCreativeSynthesizer.prototype, "generationTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
        nullable: true,
        name: 'quality_score'
    }),
    __metadata("design:type", Number)
], AgentCreativeSynthesizer.prototype, "qualityScore", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'jsonb',
        nullable: true
    }),
    __metadata("design:type", Object)
], AgentCreativeSynthesizer.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'jsonb',
        nullable: true
    }),
    __metadata("design:type", Array)
], AgentCreativeSynthesizer.prototype, "assets", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: 'timestamptz',
        name: 'created_at'
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], AgentCreativeSynthesizer.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: 'timestamptz',
        name: 'updated_at'
    }),
    __metadata("design:type", Date)
], AgentCreativeSynthesizer.prototype, "updatedAt", void 0);
exports.AgentCreativeSynthesizer = AgentCreativeSynthesizer = __decorate([
    (0, typeorm_1.Entity)('agent_creative_synthesizer_creations')
], AgentCreativeSynthesizer);
//# sourceMappingURL=agent-creative-synthesizer.entity.js.map