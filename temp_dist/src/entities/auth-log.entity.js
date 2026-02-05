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
exports.AuthLog = exports.AuthEventType = void 0;
const typeorm_1 = require("typeorm");
var AuthEventType;
(function (AuthEventType) {
    AuthEventType["LOGIN_ATTEMPT"] = "login_attempt";
    AuthEventType["LOGIN_SUCCESS"] = "login_success";
    AuthEventType["LOGIN_FAILURE"] = "login_failure";
    AuthEventType["LOGOUT"] = "logout";
    AuthEventType["SESSION_EXPIRED"] = "session_expired";
    AuthEventType["TOKEN_REFRESH"] = "token_refresh";
    AuthEventType["UNAUTHORIZED_ACCESS"] = "unauthorized_access";
})(AuthEventType || (exports.AuthEventType = AuthEventType = {}));
let AuthLog = class AuthLog {
};
exports.AuthLog = AuthLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AuthLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: AuthEventType }),
    __metadata("design:type", String)
], AuthLog.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AuthLog.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AuthLog.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AuthLog.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AuthLog.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AuthLog.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AuthLog.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AuthLog.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AuthLog.prototype, "countryCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AuthLog.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], AuthLog.prototype, "success", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], AuthLog.prototype, "attemptDuration", void 0);
exports.AuthLog = AuthLog = __decorate([
    (0, typeorm_1.Entity)('auth_logs'),
    (0, typeorm_1.Index)(['userId', 'createdAt']),
    (0, typeorm_1.Index)(['ipAddress', 'createdAt']),
    (0, typeorm_1.Index)(['eventType', 'createdAt'])
], AuthLog);
//# sourceMappingURL=auth-log.entity.js.map