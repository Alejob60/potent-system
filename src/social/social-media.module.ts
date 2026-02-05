import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SocialMediaIntegrationService } from './social-media-integration.service';
import { SocialMediaController } from './controllers/social-media.controller';

@Module({
  imports: [HttpModule],
  controllers: [SocialMediaController],
  providers: [SocialMediaIntegrationService],
  exports: [SocialMediaIntegrationService],
})
export class SocialMediaModule {}
