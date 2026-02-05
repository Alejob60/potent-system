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
exports.ChatCompletionRequestDto = exports.MessageDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class MessageDto {
}
exports.MessageDto = MessageDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The role of the message sender',
        enum: ['system', 'user', 'assistant']
    }),
    __metadata("design:type", String)
], MessageDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The content of the message'
    }),
    __metadata("design:type", String)
], MessageDto.prototype, "content", void 0);
class ChatCompletionRequestDto {
}
exports.ChatCompletionRequestDto = ChatCompletionRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of messages in the conversation',
        type: [MessageDto]
    }),
    __metadata("design:type", Array)
], ChatCompletionRequestDto.prototype, "messages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Controls randomness in the response (0.0 to 1.0)',
        minimum: 0,
        maximum: 1,
        required: false
    }),
    __metadata("design:type", Number)
], ChatCompletionRequestDto.prototype, "temperature", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Maximum number of tokens to generate',
        minimum: 1,
        required: false
    }),
    __metadata("design:type", Number)
], ChatCompletionRequestDto.prototype, "max_tokens", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Controls diversity via nucleus sampling (0.0 to 1.0)',
        minimum: 0,
        maximum: 1,
        required: false
    }),
    __metadata("design:type", Number)
], ChatCompletionRequestDto.prototype, "top_p", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reduces repetition based on frequency of tokens',
        minimum: -2,
        maximum: 2,
        required: false
    }),
    __metadata("design:type", Number)
], ChatCompletionRequestDto.prototype, "frequency_penalty", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reduces repetition based on presence of tokens',
        minimum: -2,
        maximum: 2,
        required: false
    }),
    __metadata("design:type", Number)
], ChatCompletionRequestDto.prototype, "presence_penalty", void 0);
//# sourceMappingURL=chat-completion-request.dto.js.map