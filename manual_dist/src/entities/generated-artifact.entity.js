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
exports.GeneratedArtifact = void 0;
const typeorm_1 = require("typeorm");
let GeneratedArtifact = class GeneratedArtifact {
};
exports.GeneratedArtifact = GeneratedArtifact;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GeneratedArtifact.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GeneratedArtifact.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GeneratedArtifact.prototype, "correlationId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GeneratedArtifact.prototype, "agent", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GeneratedArtifact.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GeneratedArtifact.prototype, "storageRef", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], GeneratedArtifact.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], GeneratedArtifact.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], GeneratedArtifact.prototype, "expiresAt", void 0);
exports.GeneratedArtifact = GeneratedArtifact = __decorate([
    (0, typeorm_1.Entity)('generated_artifacts')
], GeneratedArtifact);
//# sourceMappingURL=generated-artifact.entity.js.map