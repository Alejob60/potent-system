"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const chat_controller_1 = require("./controllers/chat.controller");
const admin_module_1 = require("../admin/admin.module");
const state_module_1 = require("../../state/state.module");
const websocket_module_1 = require("../../websocket/websocket.module");
let ChatModule = class ChatModule {
};
exports.ChatModule = ChatModule;
exports.ChatModule = ChatModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule, admin_module_1.AdminModule, state_module_1.StateModule, websocket_module_1.WebSocketModule],
        controllers: [chat_controller_1.ChatController],
    })
], ChatModule);
//# sourceMappingURL=chat.module.js.map