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
exports.ConversationTurnEntity = void 0;
const typeorm_1 = require("typeorm");
let ConversationTurnEntity = class ConversationTurnEntity {
};
exports.ConversationTurnEntity = ConversationTurnEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ConversationTurnEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ConversationTurnEntity.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ConversationTurnEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ConversationTurnEntity.prototype, "correlationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], ConversationTurnEntity.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], ConversationTurnEntity.prototype, "text", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], ConversationTurnEntity.prototype, "actions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ConversationTurnEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], ConversationTurnEntity.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], ConversationTurnEntity.prototype, "turnNumber", void 0);
exports.ConversationTurnEntity = ConversationTurnEntity = __decorate([
    (0, typeorm_1.Entity)('conversation_turns_v2'),
    (0, typeorm_1.Index)(['sessionId', 'timestamp']),
    (0, typeorm_1.Index)(['tenantId', 'timestamp'])
], ConversationTurnEntity);
//# sourceMappingURL=conversation-turn.entity.js.map