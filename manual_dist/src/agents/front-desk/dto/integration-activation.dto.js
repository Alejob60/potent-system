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
exports.IntegrationActivationDto = void 0;
const class_validator_1 = require("class-validator");
class IntegrationActivationDto {
}
exports.IntegrationActivationDto = IntegrationActivationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IntegrationActivationDto.prototype, "sessionId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(['google', 'tiktok', 'meta']),
    __metadata("design:type", String)
], IntegrationActivationDto.prototype, "platform", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(['create_campaign', 'publish_video', 'schedule_post']),
    __metadata("design:type", String)
], IntegrationActivationDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], IntegrationActivationDto.prototype, "payload", void 0);
//# sourceMappingURL=integration-activation.dto.js.map