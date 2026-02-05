"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsiteAnalysisModule = void 0;
const common_1 = require("@nestjs/common");
const website_analysis_service_1 = require("./website-analysis.service");
let WebsiteAnalysisModule = class WebsiteAnalysisModule {
};
exports.WebsiteAnalysisModule = WebsiteAnalysisModule;
exports.WebsiteAnalysisModule = WebsiteAnalysisModule = __decorate([
    (0, common_1.Module)({
        providers: [website_analysis_service_1.WebsiteAnalysisService],
        exports: [website_analysis_service_1.WebsiteAnalysisService],
    })
], WebsiteAnalysisModule);
//# sourceMappingURL=website-analysis.module.js.map