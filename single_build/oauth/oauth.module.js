"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const typeorm_1 = require("@nestjs/typeorm");
const oauth_service_1 = require("./oauth.service");
const oauth_controller_1 = require("./oauth.controller");
const state_module_1 = require("../state/state.module");
const websocket_module_1 = require("../websocket/websocket.module");
const encryption_service_1 = require("../common/encryption.service");
const secure_token_service_1 = require("./services/secure-token.service");
const oauth_account_entity_1 = require("./entities/oauth-account.entity");
let OAuthModule = class OAuthModule {
};
exports.OAuthModule = OAuthModule;
exports.OAuthModule = OAuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            state_module_1.StateModule,
            websocket_module_1.WebSocketModule,
            typeorm_1.TypeOrmModule.forFeature([
                oauth_account_entity_1.OAuthAccount,
                oauth_account_entity_1.OAuthRefreshLog,
                oauth_account_entity_1.IntegrationActivityLog,
            ]),
        ],
        controllers: [oauth_controller_1.OAuthController],
        providers: [
            oauth_service_1.OAuthService,
            oauth_controller_1.OAuthController,
            encryption_service_1.EncryptionService,
            secure_token_service_1.SecureTokenService,
        ],
        exports: [oauth_service_1.OAuthService, oauth_controller_1.OAuthController, secure_token_service_1.SecureTokenService],
    })
], OAuthModule);
