"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaAgentV2Module = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const axios_1 = require("@nestjs/axios");
const session_context_entity_1 = require("./entities/session-context.entity");
const conversation_turn_entity_1 = require("./entities/conversation-turn.entity");
const azure_openai_gpt5_service_1 = require("./services/azure-openai-gpt5.service");
const session_context_service_1 = require("./services/session-context.service");
const meta_agent_process_service_1 = require("./services/meta-agent-process.service");
const prompt_builder_service_1 = require("./services/prompt-builder.service");
const action_parser_service_1 = require("./services/action-parser.service");
const service_bus_publisher_service_1 = require("./services/service-bus-publisher.service");
const azure_speech_service_1 = require("./services/azure-speech.service");
const voice_consent_service_1 = require("./services/voice-consent.service");
const commercial_conversation_prompt_service_1 = require("./services/commercial-conversation-prompt.service");
const meta_agent_v2_controller_1 = require("./controllers/meta-agent-v2.controller");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const tenant_guard_1 = require("./guards/tenant.guard");
const mongodb_module_1 = require("../../common/mongodb/mongodb.module");
const redis_module_1 = require("../../common/redis/redis.module");
const tenant_context_module_1 = require("../security/tenant-context.module");
let MetaAgentV2Module = class MetaAgentV2Module {
};
exports.MetaAgentV2Module = MetaAgentV2Module;
exports.MetaAgentV2Module = MetaAgentV2Module = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            typeorm_1.TypeOrmModule.forFeature([
                session_context_entity_1.SessionContextEntity,
                conversation_turn_entity_1.ConversationTurnEntity
            ]),
            mongodb_module_1.MongoDbModule,
            redis_module_1.RedisModule,
            tenant_context_module_1.TenantContextModule
        ],
        controllers: [
            meta_agent_v2_controller_1.MetaAgentV2Controller
        ],
        providers: [
            azure_openai_gpt5_service_1.AzureOpenAIGPT5Service,
            session_context_service_1.SessionContextService,
            meta_agent_process_service_1.MetaAgentProcessService,
            prompt_builder_service_1.PromptBuilderService,
            action_parser_service_1.ActionParserService,
            service_bus_publisher_service_1.ServiceBusPublisherService,
            azure_speech_service_1.AzureSpeechService,
            voice_consent_service_1.VoiceConsentService,
            commercial_conversation_prompt_service_1.CommercialConversationPromptService,
            jwt_auth_guard_1.JwtAuthGuard,
            tenant_guard_1.TenantGuard
        ],
        exports: [
            azure_openai_gpt5_service_1.AzureOpenAIGPT5Service,
            session_context_service_1.SessionContextService,
            meta_agent_process_service_1.MetaAgentProcessService,
            prompt_builder_service_1.PromptBuilderService,
            action_parser_service_1.ActionParserService,
            service_bus_publisher_service_1.ServiceBusPublisherService,
            azure_speech_service_1.AzureSpeechService,
            voice_consent_service_1.VoiceConsentService
        ]
    })
], MetaAgentV2Module);
//# sourceMappingURL=meta-agent-v2.module.js.map