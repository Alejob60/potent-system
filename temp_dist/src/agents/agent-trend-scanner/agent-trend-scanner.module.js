"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentTrendScannerModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const agent_trend_scanner_entity_1 = require("./entities/agent-trend-scanner.entity");
const agent_trend_scanner_service_1 = require("./services/agent-trend-scanner.service");
const agent_trend_scanner_controller_1 = require("./controllers/agent-trend-scanner.controller");
let AgentTrendScannerModule = class AgentTrendScannerModule {
};
exports.AgentTrendScannerModule = AgentTrendScannerModule;
exports.AgentTrendScannerModule = AgentTrendScannerModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([agent_trend_scanner_entity_1.AgentTrendScanner])],
        providers: [agent_trend_scanner_service_1.AgentTrendScannerService],
        controllers: [agent_trend_scanner_controller_1.AgentTrendScannerController],
    })
], AgentTrendScannerModule);
//# sourceMappingURL=agent-trend-scanner.module.js.map