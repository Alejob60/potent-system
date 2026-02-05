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
exports.ContextBundle = void 0;
const typeorm_1 = require("typeorm");
let ContextBundle = class ContextBundle {
    id;
    sessionId;
    userId;
    shortMemory; // Recent conversation turns
    longMemorySummary; // Compressed historical context
    createdAt;
    updatedAt;
    lastAccessedAt;
    expiresAt; // For retention policy
};
exports.ContextBundle = ContextBundle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ContextBundle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sessionid', unique: true }),
    __metadata("design:type", String)
], ContextBundle.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'userid' }),
    __metadata("design:type", String)
], ContextBundle.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'shortmemory', type: 'jsonb' }),
    __metadata("design:type", Object)
], ContextBundle.prototype, "shortMemory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'longmemorysummary', type: 'jsonb' }),
    __metadata("design:type", Object)
], ContextBundle.prototype, "longMemorySummary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'createdat', type: 'timestamp' }),
    __metadata("design:type", Date)
], ContextBundle.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updatedat', type: 'timestamp' }),
    __metadata("design:type", Date)
], ContextBundle.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lastaccessedat', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ContextBundle.prototype, "lastAccessedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expiresat', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ContextBundle.prototype, "expiresAt", void 0);
exports.ContextBundle = ContextBundle = __decorate([
    (0, typeorm_1.Entity)('context_bundles')
], ContextBundle);
