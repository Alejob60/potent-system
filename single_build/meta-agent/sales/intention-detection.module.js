"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntentionDetectionModule = void 0;
const common_1 = require("@nestjs/common");
const intention_detection_service_1 = require("./intention-detection.service");
const sales_mode_module_1 = require("./sales-mode.module");
let IntentionDetectionModule = class IntentionDetectionModule {
};
exports.IntentionDetectionModule = IntentionDetectionModule;
exports.IntentionDetectionModule = IntentionDetectionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sales_mode_module_1.SalesModeModule,
        ],
        providers: [intention_detection_service_1.IntentionDetectionService],
        exports: [intention_detection_service_1.IntentionDetectionService],
    })
], IntentionDetectionModule);
