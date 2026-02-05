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
exports.ContentEditTask = exports.ContentEditStatus = void 0;
const typeorm_1 = require("typeorm");
var ContentEditStatus;
(function (ContentEditStatus) {
    ContentEditStatus["RECEIVED"] = "received";
    ContentEditStatus["EDITING"] = "editing";
    ContentEditStatus["VALIDATED"] = "validated";
    ContentEditStatus["EDITED"] = "edited";
    ContentEditStatus["FAILED"] = "failed";
})(ContentEditStatus || (exports.ContentEditStatus = ContentEditStatus = {}));
let ContentEditTask = class ContentEditTask {
};
exports.ContentEditTask = ContentEditTask;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ContentEditTask.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ContentEditTask.prototype, "assetId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ContentEditTask.prototype, "platform", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ContentEditTask.prototype, "emotion", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ContentEditTask.prototype, "campaignId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], ContentEditTask.prototype, "editingProfile", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ContentEditStatus,
        default: ContentEditStatus.RECEIVED,
    }),
    __metadata("design:type", String)
], ContentEditTask.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ContentEditTask.prototype, "sasUrl", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ContentEditTask.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ContentEditTask.prototype, "updatedAt", void 0);
exports.ContentEditTask = ContentEditTask = __decorate([
    (0, typeorm_1.Entity)('content_edit_tasks')
], ContentEditTask);
//# sourceMappingURL=content-edit-task.entity.js.map