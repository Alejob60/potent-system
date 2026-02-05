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
exports.ChatCompletionResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ChoiceDto {
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ChoiceDto.prototype, "index", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'object',
        properties: {
            role: { type: 'string' },
            content: { type: 'string' }
        }
    }),
    __metadata("design:type", Object)
], ChoiceDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ChoiceDto.prototype, "finish_reason", void 0);
class UsageDto {
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], UsageDto.prototype, "prompt_tokens", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], UsageDto.prototype, "completion_tokens", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], UsageDto.prototype, "total_tokens", void 0);
class ChatCompletionResponseDto {
}
exports.ChatCompletionResponseDto = ChatCompletionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ChatCompletionResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ChatCompletionResponseDto.prototype, "object", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ChatCompletionResponseDto.prototype, "created", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ChatCompletionResponseDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ChoiceDto] }),
    __metadata("design:type", Array)
], ChatCompletionResponseDto.prototype, "choices", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: UsageDto }),
    __metadata("design:type", UsageDto)
], ChatCompletionResponseDto.prototype, "usage", void 0);
//# sourceMappingURL=chat-completion-response.dto.js.map