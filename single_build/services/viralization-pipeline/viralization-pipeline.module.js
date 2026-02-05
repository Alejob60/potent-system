"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViralizationPipelineModule = void 0;
const common_1 = require("@nestjs/common");
const viralization_pipeline_service_1 = require("./viralization-pipeline.service");
const event_bus_module_1 = require("../event-bus/event-bus.module");
const context_store_module_1 = require("../context-store/context-store.module");
let ViralizationPipelineModule = class ViralizationPipelineModule {
};
exports.ViralizationPipelineModule = ViralizationPipelineModule;
exports.ViralizationPipelineModule = ViralizationPipelineModule = __decorate([
    (0, common_1.Module)({
        imports: [
            event_bus_module_1.EventBusModule,
            context_store_module_1.ContextStoreModule,
        ],
        providers: [viralization_pipeline_service_1.ViralizationPipelineService],
        exports: [viralization_pipeline_service_1.ViralizationPipelineService],
    })
], ViralizationPipelineModule);
