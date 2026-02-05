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
exports.FrontDeskConversation = void 0;
const typeorm_1 = require("typeorm");
let FrontDeskConversation = class FrontDeskConversation {
};
exports.FrontDeskConversation = FrontDeskConversation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FrontDeskConversation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'session_id' }),
    __metadata("design:type", String)
], FrontDeskConversation.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', nullable: true }),
    __metadata("design:type", String)
], FrontDeskConversation.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_message' }),
    __metadata("design:type", String)
], FrontDeskConversation.prototype, "userMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'agent_response' }),
    __metadata("design:type", String)
], FrontDeskConversation.prototype, "agentResponse", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'objective' }),
    __metadata("design:type", String)
], FrontDeskConversation.prototype, "objective", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'target_agent' }),
    __metadata("design:type", String)
], FrontDeskConversation.prototype, "targetAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'collected_info', type: 'jsonb' }),
    __metadata("design:type", Object)
], FrontDeskConversation.prototype, "collectedInfo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'missing_info', type: 'jsonb' }),
    __metadata("design:type", Array)
], FrontDeskConversation.prototype, "missingInfo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'language', nullable: true }),
    __metadata("design:type", String)
], FrontDeskConversation.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'confidence', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], FrontDeskConversation.prototype, "confidence", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'emotion', nullable: true }),
    __metadata("design:type", String)
], FrontDeskConversation.prototype, "emotion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entities', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], FrontDeskConversation.prototype, "entities", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'context', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], FrontDeskConversation.prototype, "context", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'integration_id', nullable: true }),
    __metadata("design:type", String)
], FrontDeskConversation.prototype, "integrationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'integration_status', nullable: true }),
    __metadata("design:type", String)
], FrontDeskConversation.prototype, "integrationStatus", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], FrontDeskConversation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], FrontDeskConversation.prototype, "updatedAt", void 0);
exports.FrontDeskConversation = FrontDeskConversation = __decorate([
    (0, typeorm_1.Entity)('front_desk_conversations')
], FrontDeskConversation);
//# sourceMappingURL=front-desk-conversation.entity.js.map