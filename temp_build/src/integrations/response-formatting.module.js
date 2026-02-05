"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseFormattingModule = void 0;
const common_1 = require("@nestjs/common");
const response_formatting_service_1 = require("./response-formatting.service");
const response_formatting_controller_1 = require("./response-formatting.controller");
let ResponseFormattingModule = class ResponseFormattingModule {
};
exports.ResponseFormattingModule = ResponseFormattingModule;
exports.ResponseFormattingModule = ResponseFormattingModule = __decorate([
    (0, common_1.Module)({
        controllers: [response_formatting_controller_1.ResponseFormattingController],
        providers: [response_formatting_service_1.ResponseFormattingService],
        exports: [response_formatting_service_1.ResponseFormattingService],
    })
], ResponseFormattingModule);
//# sourceMappingURL=response-formatting.module.js.map