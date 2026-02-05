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
exports.ProcessRequestDto = exports.InputDto = exports.InputType = exports.ChannelType = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
var ChannelType;
(function (ChannelType) {
    ChannelType["WEB"] = "web";
    ChannelType["WHATSAPP"] = "whatsapp";
    ChannelType["VOICE"] = "voice";
    ChannelType["INSTAGRAM"] = "instagram";
    ChannelType["TELEGRAM"] = "telegram";
})(ChannelType || (exports.ChannelType = ChannelType = {}));
var InputType;
(function (InputType) {
    InputType["TEXT"] = "text";
    InputType["SPEECH"] = "speech";
    InputType["EVENT"] = "event";
})(InputType || (exports.InputType = InputType = {}));
class InputDto {
}
exports.InputDto = InputDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: InputType,
        description: 'Type of input'
    }),
    (0, class_validator_1.IsEnum)(InputType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InputDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Text content for text type inputs'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], InputDto.prototype, "text", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'URL to speech file for speech type inputs'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], InputDto.prototype, "speechUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional metadata for the input'
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], InputDto.prototype, "metadata", void 0);
class ProcessRequestDto {
}
exports.ProcessRequestDto = ProcessRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tenant identifier',
        example: 'tenant-uuid-123'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ProcessRequestDto.prototype, "tenantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Session identifier',
        example: 'session-uuid-456'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ProcessRequestDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Correlation identifier for tracing',
        example: '550e8400-e29b-41d4-a716-446655440000'
    }),
    (0, class_validator_1.IsUUID)('4'),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ProcessRequestDto.prototype, "correlationId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User identifier (optional for anonymous sessions)',
        example: 'user-uuid-789'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProcessRequestDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: ChannelType,
        description: 'Communication channel'
    }),
    (0, class_validator_1.IsEnum)(ChannelType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ProcessRequestDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: InputDto,
        description: 'Input data from user'
    }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => InputDto),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", InputDto)
], ProcessRequestDto.prototype, "input", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Context hints for processing'
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ProcessRequestDto.prototype, "contextHints", void 0);
//# sourceMappingURL=process-request.dto.js.map