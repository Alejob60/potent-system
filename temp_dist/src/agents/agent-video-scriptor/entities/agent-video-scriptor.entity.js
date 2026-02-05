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
exports.AgentVideoScriptor = void 0;
const typeorm_1 = require("typeorm");
let AgentVideoScriptor = class AgentVideoScriptor {
};
exports.AgentVideoScriptor = AgentVideoScriptor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AgentVideoScriptor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AgentVideoScriptor.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AgentVideoScriptor.prototype, "emotion", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AgentVideoScriptor.prototype, "platform", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AgentVideoScriptor.prototype, "format", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AgentVideoScriptor.prototype, "objective", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], AgentVideoScriptor.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], AgentVideoScriptor.prototype, "script", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], AgentVideoScriptor.prototype, "narrative", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], AgentVideoScriptor.prototype, "suggestions", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'initiated' }),
    __metadata("design:type", String)
], AgentVideoScriptor.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], AgentVideoScriptor.prototype, "visualStyle", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], AgentVideoScriptor.prototype, "compressedScript", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], AgentVideoScriptor.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], AgentVideoScriptor.prototype, "updatedAt", void 0);
exports.AgentVideoScriptor = AgentVideoScriptor = __decorate([
    (0, typeorm_1.Entity)('agent_video_scripts')
], AgentVideoScriptor);
//# sourceMappingURL=agent-video-scriptor.entity.js.map