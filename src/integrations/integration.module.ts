import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MailerModule } from '@nestjs-modules/mailer';
import { IntegrationService } from './integration.service';
import { IntegrationController } from './integration.controller';
import { OAuthModule } from '../oauth/oauth.module';
import { WhatsappBusinessModule } from './channels/whatsapp-business.module';
import { InstagramDmModule } from './channels/instagram-dm.module';
import { FacebookMessengerModule } from './channels/facebook-messenger.module';
import { EmailModule } from './channels/email.module';
import { ApiGatewayModule } from './api-gateway.module';
import { WebhookManagementModule } from './webhook-management.module';
import { RateLimitingModule } from './rate-limiting.module';
import { ChannelRoutingModule } from './channel-routing.module';
import { ContextManagementModule } from './context-management.module';
import { ConversationContinuityModule } from './conversation-continuity.module';
import { ResponseFormattingModule } from './response-formatting.module';
import { MediaHandlingModule } from './media-handling.module';

@Module({
  imports: [
    HttpModule, 
    MailerModule.forRoot({
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
    OAuthModule, 
    WhatsappBusinessModule, 
    InstagramDmModule, 
    FacebookMessengerModule,
    EmailModule,
    ApiGatewayModule,
    WebhookManagementModule,
    RateLimitingModule,
    ChannelRoutingModule,
    ContextManagementModule,
    ConversationContinuityModule,
    ResponseFormattingModule,
    MediaHandlingModule
  ],
  controllers: [IntegrationController],
  providers: [IntegrationService],
  exports: [IntegrationService, WhatsappBusinessModule, InstagramDmModule, FacebookMessengerModule, EmailModule, ApiGatewayModule, WebhookManagementModule, RateLimitingModule, ChannelRoutingModule, ContextManagementModule, ConversationContinuityModule, ResponseFormattingModule, MediaHandlingModule],
})
export class IntegrationModule {}