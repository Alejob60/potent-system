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
exports.WorkflowExecutionEntity = void 0;
const typeorm_1 = require("typeorm");
const workflow_definition_entity_1 = require("./workflow-definition.entity");
let WorkflowExecutionEntity = class WorkflowExecutionEntity {
};
exports.WorkflowExecutionEntity = WorkflowExecutionEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], WorkflowExecutionEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 36, name: 'workflow_id' }),
    __metadata("design:type", String)
], WorkflowExecutionEntity.prototype, "workflowId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => workflow_definition_entity_1.WorkflowDefinitionEntity, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'workflow_id' }),
    __metadata("design:type", workflow_definition_entity_1.WorkflowDefinitionEntity)
], WorkflowExecutionEntity.prototype, "workflow", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], WorkflowExecutionEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 36, name: 'tenant_id' }),
    __metadata("design:type", String)
], WorkflowExecutionEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 36, name: 'session_id' }),
    __metadata("design:type", String)
], WorkflowExecutionEntity.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'input_data' }),
    __metadata("design:type", Object)
], WorkflowExecutionEntity.prototype, "inputData", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'step_results', nullable: true }),
    __metadata("design:type", Array)
], WorkflowExecutionEntity.prototype, "stepResults", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', name: 'total_steps' }),
    __metadata("design:type", Number)
], WorkflowExecutionEntity.prototype, "totalSteps", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', name: 'completed_steps', default: 0 }),
    __metadata("design:type", Number)
], WorkflowExecutionEntity.prototype, "completedSteps", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', name: 'duration_ms', default: 0 }),
    __metadata("design:type", Number)
], WorkflowExecutionEntity.prototype, "durationMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], WorkflowExecutionEntity.prototype, "error", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'metadata', nullable: true }),
    __metadata("design:type", Object)
], WorkflowExecutionEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], WorkflowExecutionEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], WorkflowExecutionEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', name: 'started_at', nullable: true }),
    __metadata("design:type", Date)
], WorkflowExecutionEntity.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', name: 'completed_at', nullable: true }),
    __metadata("design:type", Date)
], WorkflowExecutionEntity.prototype, "completedAt", void 0);
exports.WorkflowExecutionEntity = WorkflowExecutionEntity = __decorate([
    (0, typeorm_1.Entity)('meta_agent_workflow_executions'),
    (0, typeorm_1.Index)(['workflowId', 'status']),
    (0, typeorm_1.Index)(['tenantId']),
    (0, typeorm_1.Index)(['createdAt'])
], WorkflowExecutionEntity);
//# sourceMappingURL=workflow-execution.entity.js.map