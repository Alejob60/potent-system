"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignV2Module = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const campaign_entity_1 = require("./entities/campaign.entity");
const campaign_v2_service_1 = require("./services/campaign-v2.service");
const campaign_v2_controller_1 = require("./controllers/campaign-v2.controller");
const redis_module_1 = require("../../common/redis/redis.module");
const state_module_1 = require("../../state/state.module");
const websocket_module_1 = require("../../websocket/websocket.module");
let CampaignV2Module = class CampaignV2Module {
};
exports.CampaignV2Module = CampaignV2Module;
exports.CampaignV2Module = CampaignV2Module = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([campaign_entity_1.Campaign]),
            redis_module_1.RedisModule,
            state_module_1.StateModule,
            websocket_module_1.WebSocketModule,
        ],
        controllers: [campaign_v2_controller_1.CampaignV2Controller],
        providers: [campaign_v2_service_1.CampaignV2Service],
        exports: [campaign_v2_service_1.CampaignV2Service],
    })
], CampaignV2Module);
//# sourceMappingURL=campaign-v2.module.js.map