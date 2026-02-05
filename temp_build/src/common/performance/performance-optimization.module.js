"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceOptimizationModule = void 0;
const common_1 = require("@nestjs/common");
const performance_optimization_service_1 = require("./performance-optimization.service");
const performance_optimization_controller_1 = require("./performance-optimization.controller");
const redis_module_1 = require("../redis/redis.module");
let PerformanceOptimizationModule = class PerformanceOptimizationModule {
};
exports.PerformanceOptimizationModule = PerformanceOptimizationModule;
exports.PerformanceOptimizationModule = PerformanceOptimizationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            redis_module_1.RedisModule,
        ],
        controllers: [performance_optimization_controller_1.PerformanceOptimizationController],
        providers: [performance_optimization_service_1.PerformanceOptimizationService],
        exports: [performance_optimization_service_1.PerformanceOptimizationService],
    })
], PerformanceOptimizationModule);
//# sourceMappingURL=performance-optimization.module.js.map