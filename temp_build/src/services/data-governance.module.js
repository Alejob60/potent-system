"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataGovernanceModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const data_governance_service_1 = require("./data-governance.service");
const data_governance_controller_1 = require("./data-governance.controller");
let DataGovernanceModule = class DataGovernanceModule {
};
exports.DataGovernanceModule = DataGovernanceModule;
exports.DataGovernanceModule = DataGovernanceModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule],
        providers: [data_governance_service_1.DataGovernanceService],
        controllers: [data_governance_controller_1.DataGovernanceController],
        exports: [data_governance_service_1.DataGovernanceService],
    })
], DataGovernanceModule);
//# sourceMappingURL=data-governance.module.js.map