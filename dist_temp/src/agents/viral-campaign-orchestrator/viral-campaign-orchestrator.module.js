"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViralCampaignOrchestratorModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const axios_1 = require("@nestjs/axios");
const viral_campaign_entity_1 = require("./entities/viral-campaign.entity");
const viral_campaign_orchestrator_service_1 = require("./services/viral-campaign-orchestrator.service");
const viral_campaign_orchestrator_controller_1 = require("./controllers/viral-campaign-orchestrator.controller");
let ViralCampaignOrchestratorModule = class ViralCampaignOrchestratorModule {
};
exports.ViralCampaignOrchestratorModule = ViralCampaignOrchestratorModule;
exports.ViralCampaignOrchestratorModule = ViralCampaignOrchestratorModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([viral_campaign_entity_1.ViralCampaign]), axios_1.HttpModule],
        providers: [viral_campaign_orchestrator_service_1.ViralCampaignOrchestratorService],
        controllers: [viral_campaign_orchestrator_controller_1.ViralCampaignOrchestratorController],
        exports: [viral_campaign_orchestrator_service_1.ViralCampaignOrchestratorService],
    })
], ViralCampaignOrchestratorModule);
//# sourceMappingURL=viral-campaign-orchestrator.module.js.map