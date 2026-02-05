"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const mailer_1 = require("@nestjs-modules/mailer");
const integration_service_1 = require("./integration.service");
const integration_controller_1 = require("./integration.controller");
const oauth_module_1 = require("../oauth/oauth.module");
const whatsapp_business_module_1 = require("./channels/whatsapp-business.module");
const instagram_dm_module_1 = require("./channels/instagram-dm.module");
const facebook_messenger_module_1 = require("./channels/facebook-messenger.module");
const email_module_1 = require("./channels/email.module");
const api_gateway_module_1 = require("./api-gateway.module");
const webhook_management_module_1 = require("./webhook-management.module");
const rate_limiting_module_1 = require("./rate-limiting.module");
const channel_routing_module_1 = require("./channel-routing.module");
const context_management_module_1 = require("./context-management.module");
const conversation_continuity_module_1 = require("./conversation-continuity.module");
const response_formatting_module_1 = require("./response-formatting.module");
const media_handling_module_1 = require("./media-handling.module");
let IntegrationModule = class IntegrationModule {
};
exports.IntegrationModule = IntegrationModule;
exports.IntegrationModule = IntegrationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            mailer_1.MailerModule.forRoot({
                transport: {
                    host: process.env.EMAIL_HOST || 'smtp.example.com',
                    port: parseInt(process.env.EMAIL_PORT || '587'),
                    secure: process.env.EMAIL_SECURE === 'true',
                    auth: {
                        user: process.env.EMAIL_USER || '',
                        pass: process.env.EMAIL_PASSWORD || '',
                    },
                },
                defaults: {
                    from: process.env.EMAIL_FROM || '"MisyBot" <noreply@example.com>',
                },
            }),
            oauth_module_1.OAuthModule,
            whatsapp_business_module_1.WhatsappBusinessModule,
            instagram_dm_module_1.InstagramDmModule,
            facebook_messenger_module_1.FacebookMessengerModule,
            email_module_1.EmailModule,
            api_gateway_module_1.ApiGatewayModule,
            webhook_management_module_1.WebhookManagementModule,
            rate_limiting_module_1.RateLimitingModule,
            channel_routing_module_1.ChannelRoutingModule,
            context_management_module_1.ContextManagementModule,
            conversation_continuity_module_1.ConversationContinuityModule,
            response_formatting_module_1.ResponseFormattingModule,
            media_handling_module_1.MediaHandlingModule
        ],
        controllers: [integration_controller_1.IntegrationController],
        providers: [integration_service_1.IntegrationService],
        exports: [integration_service_1.IntegrationService, whatsapp_business_module_1.WhatsappBusinessModule, instagram_dm_module_1.InstagramDmModule, facebook_messenger_module_1.FacebookMessengerModule, email_module_1.EmailModule, api_gateway_module_1.ApiGatewayModule, webhook_management_module_1.WebhookManagementModule, rate_limiting_module_1.RateLimitingModule, channel_routing_module_1.ChannelRoutingModule, context_management_module_1.ContextManagementModule, conversation_continuity_module_1.ConversationContinuityModule, response_formatting_module_1.ResponseFormattingModule, media_handling_module_1.MediaHandlingModule],
    })
], IntegrationModule);
//# sourceMappingURL=integration.module.js.map