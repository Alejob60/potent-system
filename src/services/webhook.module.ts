import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';

@Module({
  imports: [HttpModule],
  providers: [WebhookService],
  controllers: [WebhookController],
  exports: [WebhookService],
})
export class WebhookModule {}