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
exports.ActivateRouteDto = void 0;
const class_validator_1 = require("class-validator");
class ActivateRouteDto {
}
exports.ActivateRouteDto = ActivateRouteDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)([
        'product_launch',
        'event_promotion',
        'content_campaign',
        'brand_awareness',
    ]),
    __metadata("design:type", String)
], ActivateRouteDto.prototype, "routeType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ActivateRouteDto.prototype, "sessionId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ActivateRouteDto.prototype, "emotion", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ActivateRouteDto.prototype, "platforms", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ActivateRouteDto.prototype, "agents", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ActivateRouteDto.prototype, "schedule", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ActivateRouteDto.prototype, "metadata", void 0);
//# sourceMappingURL=activate-route.dto.js.map