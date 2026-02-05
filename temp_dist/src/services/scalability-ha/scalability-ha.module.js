"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScalabilityHaModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const typeorm_1 = require("@nestjs/typeorm");
const redis_module_1 = require("../../common/redis/redis.module");
const load_balancing_service_1 = require("./load-balancing.service");
const health_monitoring_service_1 = require("./health-monitoring.service");
const auto_scaling_service_1 = require("./auto-scaling.service");
const caching_strategy_service_1 = require("./caching-strategy.service");
const database_optimization_service_1 = require("./database-optimization.service");
const failover_mechanisms_service_1 = require("./failover-mechanisms.service");
const performance_monitoring_service_1 = require("./performance-monitoring.service");
let ScalabilityHaModule = class ScalabilityHaModule {
};
exports.ScalabilityHaModule = ScalabilityHaModule;
exports.ScalabilityHaModule = ScalabilityHaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            redis_module_1.RedisModule,
            typeorm_1.TypeOrmModule,
        ],
        providers: [
            load_balancing_service_1.LoadBalancingService,
            health_monitoring_service_1.HealthMonitoringService,
            auto_scaling_service_1.AutoScalingService,
            caching_strategy_service_1.CachingStrategyService,
            database_optimization_service_1.DatabaseOptimizationService,
            failover_mechanisms_service_1.FailoverMechanismsService,
            performance_monitoring_service_1.PerformanceMonitoringService,
        ],
        exports: [
            load_balancing_service_1.LoadBalancingService,
            health_monitoring_service_1.HealthMonitoringService,
            auto_scaling_service_1.AutoScalingService,
            caching_strategy_service_1.CachingStrategyService,
            database_optimization_service_1.DatabaseOptimizationService,
            failover_mechanisms_service_1.FailoverMechanismsService,
            performance_monitoring_service_1.PerformanceMonitoringService,
        ],
    })
], ScalabilityHaModule);
//# sourceMappingURL=scalability-ha.module.js.map