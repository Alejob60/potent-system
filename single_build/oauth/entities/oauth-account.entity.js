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
exports.IntegrationActivityLog = exports.OAuthRefreshLog = exports.OAuthAccount = void 0;
const typeorm_1 = require("typeorm");
let OAuthAccount = class OAuthAccount {
    id;
    sessionId;
    platform;
    encryptedAccessToken; // Almacenado cifrado
    encryptedRefreshToken; // Almacenado cifrado
    expiresAt;
    userInfo;
    scopes;
    isActive;
    createdAt;
    updatedAt;
    lastUsedAt;
    tokenHash;
};
exports.OAuthAccount = OAuthAccount;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], OAuthAccount.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'session_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], OAuthAccount.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OAuthAccount.prototype, "platform", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'access_token', type: 'text' }),
    __metadata("design:type", String)
], OAuthAccount.prototype, "encryptedAccessToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'refresh_token', type: 'text', nullable: true }),
    __metadata("design:type", String)
], OAuthAccount.prototype, "encryptedRefreshToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], OAuthAccount.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_info', type: 'jsonb' }),
    __metadata("design:type", Object)
], OAuthAccount.prototype, "userInfo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'scopes', type: 'simple-array' }),
    __metadata("design:type", Array)
], OAuthAccount.prototype, "scopes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], OAuthAccount.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], OAuthAccount.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], OAuthAccount.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_used_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], OAuthAccount.prototype, "lastUsedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'token_hash' }) // Hash del token para validaci n sin descifrar
    ,
    __metadata("design:type", String)
], OAuthAccount.prototype, "tokenHash", void 0);
exports.OAuthAccount = OAuthAccount = __decorate([
    (0, typeorm_1.Entity)('oauth_accounts'),
    (0, typeorm_1.Index)(['sessionId', 'platform'], { unique: true })
], OAuthAccount);
let OAuthRefreshLog = class OAuthRefreshLog {
    id;
    accountId;
    platform;
    refreshReason;
    status;
    errorMessage;
    createdAt;
    oldExpiresAt;
    newExpiresAt;
};
exports.OAuthRefreshLog = OAuthRefreshLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], OAuthRefreshLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], OAuthRefreshLog.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OAuthRefreshLog.prototype, "platform", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'refresh_reason' }),
    __metadata("design:type", String)
], OAuthRefreshLog.prototype, "refreshReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'success' }),
    __metadata("design:type", String)
], OAuthRefreshLog.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', nullable: true }),
    __metadata("design:type", String)
], OAuthRefreshLog.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], OAuthRefreshLog.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'old_expires_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], OAuthRefreshLog.prototype, "oldExpiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'new_expires_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], OAuthRefreshLog.prototype, "newExpiresAt", void 0);
exports.OAuthRefreshLog = OAuthRefreshLog = __decorate([
    (0, typeorm_1.Entity)('oauth_refresh_logs')
], OAuthRefreshLog);
let IntegrationActivityLog = class IntegrationActivityLog {
    id;
    accountId;
    sessionId;
    platform;
    action; // 'email_sent', 'post_published', 'event_created', 'video_uploaded'
    result;
    metadata;
    errorDetails;
    createdAt;
    executionTimeMs;
    apiResponseCode;
};
exports.IntegrationActivityLog = IntegrationActivityLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], IntegrationActivityLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], IntegrationActivityLog.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'session_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], IntegrationActivityLog.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], IntegrationActivityLog.prototype, "platform", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], IntegrationActivityLog.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'success' }),
    __metadata("design:type", String)
], IntegrationActivityLog.prototype, "result", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'metadata', type: 'jsonb' }),
    __metadata("design:type", Object)
], IntegrationActivityLog.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_details', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], IntegrationActivityLog.prototype, "errorDetails", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], IntegrationActivityLog.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'execution_time_ms', nullable: true }),
    __metadata("design:type", Number)
], IntegrationActivityLog.prototype, "executionTimeMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'api_response_code', nullable: true }),
    __metadata("design:type", Number)
], IntegrationActivityLog.prototype, "apiResponseCode", void 0);
exports.IntegrationActivityLog = IntegrationActivityLog = __decorate([
    (0, typeorm_1.Entity)('integration_activity_logs')
], IntegrationActivityLog);
