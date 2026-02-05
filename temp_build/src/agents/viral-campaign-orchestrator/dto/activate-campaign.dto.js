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
exports.ActivateCampaignDto = void 0;
const class_validator_1 = require("class-validator");
class ActivateCampaignDto {
}
exports.ActivateCampaignDto = ActivateCampaignDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)([
        'product_launch',
        'event_promotion',
        'content_campaign',
        'brand_awareness',
    ]),
    __metadata("design:type", String)
], ActivateCampaignDto.prototype, "campaignType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ActivateCampaignDto.prototype, "sessionId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ActivateCampaignDto.prototype, "emotion", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ActivateCampaignDto.prototype, "platforms", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ActivateCampaignDto.prototype, "durationDays", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ActivateCampaignDto.prototype, "objective", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ActivateCampaignDto.prototype, "agents", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ActivateCampaignDto.prototype, "schedule", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ActivateCampaignDto.prototype, "metadata", void 0);
//# sourceMappingURL=activate-campaign.dto.js.map