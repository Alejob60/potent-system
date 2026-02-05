"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestingModule = void 0;
const common_1 = require("@nestjs/common");
const testing_service_1 = require("./testing.service");
const performance_testing_service_1 = require("./performance-testing.service");
const security_testing_service_1 = require("./security-testing.service");
const integration_testing_service_1 = require("./integration-testing.service");
const bug_fixing_service_1 = require("./bug-fixing.service");
let TestingModule = class TestingModule {
};
exports.TestingModule = TestingModule;
exports.TestingModule = TestingModule = __decorate([
    (0, common_1.Module)({
        providers: [
            testing_service_1.TestingService,
            performance_testing_service_1.PerformanceTestingService,
            security_testing_service_1.SecurityTestingService,
            integration_testing_service_1.IntegrationTestingService,
            bug_fixing_service_1.BugFixingService,
        ],
        exports: [
            testing_service_1.TestingService,
            performance_testing_service_1.PerformanceTestingService,
            security_testing_service_1.SecurityTestingService,
            integration_testing_service_1.IntegrationTestingService,
            bug_fixing_service_1.BugFixingService,
        ],
    })
], TestingModule);
//# sourceMappingURL=testing.module.js.map