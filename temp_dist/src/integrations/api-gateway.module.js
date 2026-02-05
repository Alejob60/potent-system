"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiGatewayModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const api_gateway_service_1 = require("./api-gateway.service");
const api_gateway_controller_1 = require("./api-gateway.controller");
const whatsapp_business_module_1 = require("./channels/whatsapp-business.module");
const instagram_dm_module_1 = require("./channels/instagram-dm.module");
const facebook_messenger_module_1 = require("./channels/facebook-messenger.module");
const email_module_1 = require("./channels/email.module");
let ApiGatewayModule = class ApiGatewayModule {
};
exports.ApiGatewayModule = ApiGatewayModule;
exports.ApiGatewayModule = ApiGatewayModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            whatsapp_business_module_1.WhatsappBusinessModule,
            instagram_dm_module_1.InstagramDmModule,
            facebook_messenger_module_1.FacebookMessengerModule,
            email_module_1.EmailModule,
        ],
        controllers: [api_gateway_controller_1.ApiGatewayController],
        providers: [api_gateway_service_1.ApiGatewayService],
        exports: [api_gateway_service_1.ApiGatewayService],
    })
], ApiGatewayModule);
//# sourceMappingURL=api-gateway.module.js.map