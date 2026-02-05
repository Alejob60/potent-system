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
exports.AgentEventLog = void 0;
const typeorm_1 = require("typeorm");
let AgentEventLog = class AgentEventLog {
};
exports.AgentEventLog = AgentEventLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AgentEventLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AgentEventLog.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AgentEventLog.prototype, "correlationId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AgentEventLog.prototype, "agent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['started', 'progress', 'completed', 'failed'],
    }),
    __metadata("design:type", String)
], AgentEventLog.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb'),
    __metadata("design:type", Object)
], AgentEventLog.prototype, "payload", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], AgentEventLog.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], AgentEventLog.prototype, "timestamp", void 0);
exports.AgentEventLog = AgentEventLog = __decorate([
    (0, typeorm_1.Entity)('agent_events')
], AgentEventLog);
//# sourceMappingURL=agent-event-log.entity.js.map