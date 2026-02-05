"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationContinuityModule = void 0;
const common_1 = require("@nestjs/common");
const conversation_continuity_service_1 = require("./conversation-continuity.service");
const conversation_continuity_controller_1 = require("./conversation-continuity.controller");
let ConversationContinuityModule = class ConversationContinuityModule {
};
exports.ConversationContinuityModule = ConversationContinuityModule;
exports.ConversationContinuityModule = ConversationContinuityModule = __decorate([
    (0, common_1.Module)({
        controllers: [conversation_continuity_controller_1.ConversationContinuityController],
        providers: [conversation_continuity_service_1.ConversationContinuityService],
        exports: [conversation_continuity_service_1.ConversationContinuityService],
    })
], ConversationContinuityModule);
//# sourceMappingURL=conversation-continuity.module.js.map