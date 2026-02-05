"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinalIntegrationTestingModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const final_integration_service_1 = require("./final-integration.service");
const e2e_testing_service_1 = require("./e2e-testing.service");
const performance_testing_service_1 = require("./performance-testing.service");
const security_testing_service_1 = require("./security-testing.service");
const user_acceptance_testing_service_1 = require("./user-acceptance-testing.service");
const production_deployment_service_1 = require("./production-deployment.service");
const monitoring_implementation_service_1 = require("./monitoring-implementation.service");
const maintenance_procedures_service_1 = require("./maintenance-procedures.service");
const operational_documentation_service_1 = require("./operational-documentation.service");
const final_integration_testing_controller_1 = require("./final-integration-testing.controller");
let FinalIntegrationTestingModule = class FinalIntegrationTestingModule {
};
exports.FinalIntegrationTestingModule = FinalIntegrationTestingModule;
exports.FinalIntegrationTestingModule = FinalIntegrationTestingModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule],
        controllers: [final_integration_testing_controller_1.FinalIntegrationTestingController],
        providers: [
            final_integration_service_1.FinalIntegrationService,
            e2e_testing_service_1.E2ETestingService,
            performance_testing_service_1.PerformanceTestingService,
            security_testing_service_1.SecurityTestingService,
            user_acceptance_testing_service_1.UserAcceptanceTestingService,
            production_deployment_service_1.ProductionDeploymentService,
            monitoring_implementation_service_1.MonitoringImplementationService,
            maintenance_procedures_service_1.MaintenanceProceduresService,
            operational_documentation_service_1.OperationalDocumentationService,
        ],
        exports: [
            final_integration_service_1.FinalIntegrationService,
            e2e_testing_service_1.E2ETestingService,
            performance_testing_service_1.PerformanceTestingService,
            security_testing_service_1.SecurityTestingService,
            user_acceptance_testing_service_1.UserAcceptanceTestingService,
            production_deployment_service_1.ProductionDeploymentService,
            monitoring_implementation_service_1.MonitoringImplementationService,
            maintenance_procedures_service_1.MaintenanceProceduresService,
            operational_documentation_service_1.OperationalDocumentationService,
        ],
    })
], FinalIntegrationTestingModule);
//# sourceMappingURL=final-integration-testing.module.js.map