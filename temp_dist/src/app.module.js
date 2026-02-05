"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const database_module_1 = require("./database/database.module");
const common_module_1 = require("./common/common.module");
const state_module_1 = require("./state/state.module");
const websocket_module_1 = require("./websocket/websocket.module");
const ai_module_1 = require("./ai/ai.module");
const oauth_module_1 = require("./oauth/oauth.module");
const auth_module_1 = require("./auth/auth.module");
const services_module_1 = require("./services/services.module");
const colombiatic_integration_module_1 = require("./integrations/colombiatic/colombiatic.integration.module");
const app_service_1 = require("./app.service");
const app_controller_1 = require("./app.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: () => ({
                    type: 'postgres',
                    host: process.env.DB_HOST || 'localhost',
                    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
                    username: process.env.DB_USERNAME || 'postgres',
                    password: process.env.DB_PASSWORD || '1234',
                    database: process.env.DB_NAME || 'postgres',
                    ssl: process.env.DB_SSL === 'true' ? {
                        rejectUnauthorized: false
                    } : false,
                    autoLoadEntities: true,
                    synchronize: false,
                    logging: process.env.NODE_ENV === 'development' ? true : false,
                }),
            }),
            database_module_1.DatabaseModule,
            event_emitter_1.EventEmitterModule.forRoot(),
            common_module_1.CommonModule,
            state_module_1.StateModule,
            websocket_module_1.WebSocketModule,
            ai_module_1.AIModule,
            oauth_module_1.OAuthModule,
            auth_module_1.AuthModule,
            services_module_1.ServicesModule,
            colombiatic_integration_module_1.ColombiaTICIntegrationModule,
        ],
        controllers: [
            app_controller_1.AppController,
        ],
        providers: [
            app_service_1.AppService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map