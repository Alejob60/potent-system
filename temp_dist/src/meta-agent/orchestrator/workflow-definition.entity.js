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
exports.WorkflowDefinitionEntity = void 0;
const typeorm_1 = require("typeorm");
let WorkflowDefinitionEntity = class WorkflowDefinitionEntity {
};
exports.WorkflowDefinitionEntity = WorkflowDefinitionEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], WorkflowDefinitionEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], WorkflowDefinitionEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], WorkflowDefinitionEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Array)
], WorkflowDefinitionEntity.prototype, "steps", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'draft' }),
    __metadata("design:type", String)
], WorkflowDefinitionEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], WorkflowDefinitionEntity.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 36, name: 'tenant_id' }),
    __metadata("design:type", String)
], WorkflowDefinitionEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, name: 'created_by' }),
    __metadata("design:type", String)
], WorkflowDefinitionEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'metadata', nullable: true }),
    __metadata("design:type", Object)
], WorkflowDefinitionEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], WorkflowDefinitionEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], WorkflowDefinitionEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', name: 'activated_at', nullable: true }),
    __metadata("design:type", Date)
], WorkflowDefinitionEntity.prototype, "activatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', name: 'deactivated_at', nullable: true }),
    __metadata("design:type", Date)
], WorkflowDefinitionEntity.prototype, "deactivatedAt", void 0);
exports.WorkflowDefinitionEntity = WorkflowDefinitionEntity = __decorate([
    (0, typeorm_1.Entity)('meta_agent_workflows'),
    (0, typeorm_1.Index)(['tenantId', 'name']),
    (0, typeorm_1.Index)(['status'])
], WorkflowDefinitionEntity);
//# sourceMappingURL=workflow-definition.entity.js.map