"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesModule = void 0;
const common_1 = require("@nestjs/common");
const sales_mode_module_1 = require("./sales-mode.module");
const intention_detection_module_1 = require("./intention-detection.module");
const sales_mode_controller_1 = require("./controllers/sales-mode.controller");
let SalesModule = class SalesModule {
};
exports.SalesModule = SalesModule;
exports.SalesModule = SalesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sales_mode_module_1.SalesModeModule,
            intention_detection_module_1.IntentionDetectionModule,
        ],
        controllers: [sales_mode_controller_1.SalesModeController],
        exports: [
            sales_mode_module_1.SalesModeModule,
            intention_detection_module_1.IntentionDetectionModule,
        ],
    })
], SalesModule);
