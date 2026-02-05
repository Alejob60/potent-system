"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrontDeskModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const axios_1 = require("@nestjs/axios");
const front_desk_controller_1 = require("./controllers/front-desk.controller");
const front_desk_service_1 = require("./services/front-desk.service");
const front_desk_conversation_entity_1 = require("./entities/front-desk-conversation.entity");
const context_compression_service_1 = require("./services/context-compression.service");
const creative_synthesizer_integration_service_1 = require("./services/creative-synthesizer.integration.service");
let FrontDeskModule = class FrontDeskModule {
};
exports.FrontDeskModule = FrontDeskModule;
exports.FrontDeskModule = FrontDeskModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([front_desk_conversation_entity_1.FrontDeskConversation]), axios_1.HttpModule],
        controllers: [front_desk_controller_1.FrontDeskController],
        providers: [
            front_desk_service_1.FrontDeskService,
            context_compression_service_1.ContextCompressionService,
            creative_synthesizer_integration_service_1.CreativeSynthesizerIntegrationService,
        ],
        exports: [front_desk_service_1.FrontDeskService, context_compression_service_1.ContextCompressionService],
    })
], FrontDeskModule);
//# sourceMappingURL=front-desk.module.js.map