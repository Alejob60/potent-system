import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

// Entities
import { SessionContextEntity } from './entities/session-context.entity';
import { ConversationTurnEntity } from './entities/conversation-turn.entity';

// Services
import { AzureOpenAIGPT5Service } from './services/azure-openai-gpt5.service';
import { SessionContextService } from './services/session-context.service';
import { MetaAgentProcessService } from './services/meta-agent-process.service';
import { PromptBuilderService } from './services/prompt-builder.service';
import { ActionParserService } from './services/action-parser.service';
import { ServiceBusPublisherService } from './services/service-bus-publisher.service';
import { AzureSpeechService } from './services/azure-speech.service';
import { VoiceConsentService } from './services/voice-consent.service';
import { CommercialConversationPromptService } from './services/commercial-conversation-prompt.service';

// Controllers
import { MetaAgentV2Controller } from './controllers/meta-agent-v2.controller';

// Guards
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TenantGuard } from './guards/tenant.guard';

// Common modules
import { MongoDbModule } from '../../common/mongodb/mongodb.module';
import { RedisModule } from '../../common/redis/redis.module';

// Security modules
import { TenantContextModule } from '../security/tenant-context.module';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      SessionContextEntity,
      ConversationTurnEntity
    ]),
    MongoDbModule,
    RedisModule,
    TenantContextModule
  ],
  controllers: [
    MetaAgentV2Controller
  ],
  providers: [
    AzureOpenAIGPT5Service,
    SessionContextService,
    MetaAgentProcessService,
    PromptBuilderService,
    ActionParserService,
    ServiceBusPublisherService,
    AzureSpeechService,
    VoiceConsentService,
    CommercialConversationPromptService,
    JwtAuthGuard,
    TenantGuard
  ],
  exports: [
    AzureOpenAIGPT5Service,
    SessionContextService,
    MetaAgentProcessService,
    PromptBuilderService,
    ActionParserService,
    ServiceBusPublisherService,
    AzureSpeechService,
    VoiceConsentService
  ]
})
export class MetaAgentV2Module {}
