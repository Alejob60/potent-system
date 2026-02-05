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
exports.InteractionSchema = exports.Interaction = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Interaction = class Interaction {
};
exports.Interaction = Interaction;
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], Interaction.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], Interaction.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ['web', 'whatsapp', 'telegram', 'email', 'sms', 'api']
    }),
    __metadata("design:type", String)
], Interaction.prototype, "channel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Interaction.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ['user', 'assistant', 'system']
    }),
    __metadata("design:type", String)
], Interaction.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Number], index: '2dsphere' }),
    __metadata("design:type", Array)
], Interaction.prototype, "embedding", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Interaction.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Interaction.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Interaction.prototype, "updatedAt", void 0);
exports.Interaction = Interaction = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Interaction);
exports.InteractionSchema = mongoose_1.SchemaFactory.createForClass(Interaction);
exports.InteractionSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });
exports.InteractionSchema.index({ tenantId: 1, userId: 1, channel: 1 });
exports.InteractionSchema.index({ embedding: '2dsphere' });
exports.InteractionSchema.pre('save', function (next) {
    if (this.isModified()) {
        this.updatedAt = new Date();
    }
    next();
});
//# sourceMappingURL=interaction.schema.js.map