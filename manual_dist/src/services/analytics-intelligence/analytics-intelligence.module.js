"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsIntelligenceModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const data_warehouse_service_1 = require("./data-warehouse.service");
const predictive_analytics_service_1 = require("./predictive-analytics.service");
const business_intelligence_service_1 = require("./business-intelligence.service");
const reporting_service_1 = require("./reporting.service");
const real_time_analytics_service_1 = require("./real-time-analytics.service");
const etl_service_1 = require("./etl.service");
const batch_processing_service_1 = require("./batch-processing.service");
const agent_analytics_reporting_entity_1 = require("../../agents/agent-analytics-reporting/entities/agent-analytics-reporting.entity");
const data_warehouse_entity_1 = require("../../entities/data-warehouse.entity");
const websocket_module_1 = require("../../websocket/websocket.module");
let AnalyticsIntelligenceModule = class AnalyticsIntelligenceModule {
};
exports.AnalyticsIntelligenceModule = AnalyticsIntelligenceModule;
exports.AnalyticsIntelligenceModule = AnalyticsIntelligenceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                agent_analytics_reporting_entity_1.AgentAnalyticsReporting,
                data_warehouse_entity_1.DataWarehouse,
            ]),
            websocket_module_1.WebSocketModule,
        ],
        providers: [
            data_warehouse_service_1.DataWarehouseService,
            predictive_analytics_service_1.PredictiveAnalyticsService,
            business_intelligence_service_1.BusinessIntelligenceService,
            reporting_service_1.ReportingService,
            real_time_analytics_service_1.RealTimeAnalyticsService,
            etl_service_1.ETLService,
            batch_processing_service_1.BatchProcessingService,
        ],
        exports: [
            data_warehouse_service_1.DataWarehouseService,
            predictive_analytics_service_1.PredictiveAnalyticsService,
            business_intelligence_service_1.BusinessIntelligenceService,
            reporting_service_1.ReportingService,
            real_time_analytics_service_1.RealTimeAnalyticsService,
            etl_service_1.ETLService,
            batch_processing_service_1.BatchProcessingService,
        ],
    })
], AnalyticsIntelligenceModule);
//# sourceMappingURL=analytics-intelligence.module.js.map