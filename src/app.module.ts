import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Middleware
import { ContextMiddleware } from './common/middleware/context.middleware';

// Core Modules
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';
import { StateModule } from './state/state.module';
import { WebSocketModule } from './websocket/websocket.module';
import { AIModule } from './ai/ai.module';
import { OAuthModule } from './oauth/oauth.module';
import { AuthModule } from './auth/auth.module';
import { ServicesModule } from './services/services.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { OrchestratorModule } from './orchestrator/orchestrator.module';
import { OmnichannelModule } from './integrations/channels/omnichannel.module';

// Integration Modules
import { ColombiaTICIntegrationModule } from './integrations/colombiatic/colombiatic.integration.module';

// Services
import { AppService } from './app.service';
import { AppController } from './app.controller';

// Controllers
import { ChatController } from './controllers/chat.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
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
        synchronize: false, // Desactivado por seguridad y compatibilidad con Azure
        logging: process.env.NODE_ENV === 'development' ? true : false,
      }),
    }),
    DatabaseModule,
    EventEmitterModule.forRoot(),
    // Core Modules
    CommonModule,
    StateModule,
    WebSocketModule,
    AIModule,
    OAuthModule,
    AuthModule,
    ServicesModule,
    WorkspaceModule,
    KnowledgeModule,
    OrchestratorModule,
    OmnichannelModule,
    // Integration Modules
    ColombiaTICIntegrationModule,
  ],
  controllers: [
    AppController,
    ChatController,
  ],
  providers: [
    AppService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ContextMiddleware)
      .forRoutes('*');
  }
}
