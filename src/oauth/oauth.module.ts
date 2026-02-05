import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OAuthService } from './oauth.service';
import { OAuthController } from './oauth.controller';
import { StateModule } from '../state/state.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { EncryptionService } from '../common/encryption.service';
import { SecureTokenService } from './services/secure-token.service';
import {
  OAuthAccount,
  OAuthRefreshLog,
  IntegrationActivityLog,
} from './entities/oauth-account.entity';

@Module({
  imports: [
    HttpModule,
    StateModule,
    WebSocketModule,
    TypeOrmModule.forFeature([
      OAuthAccount,
      OAuthRefreshLog,
      IntegrationActivityLog,
    ]),
  ],
  controllers: [OAuthController],
  providers: [
    OAuthService,
    OAuthController,
    EncryptionService,
    SecureTokenService,
  ],
  exports: [OAuthService, OAuthController, SecureTokenService],
})
export class OAuthModule {}
