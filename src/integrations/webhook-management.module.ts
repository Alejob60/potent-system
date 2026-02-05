import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WebhookManagementService } from './webhook-management.service';
import { WebhookManagementController } from './webhook-management.controller';

@Module({
  imports: [HttpModule],
  controllers: [WebhookManagementController],
  providers: [WebhookManagementService],
  exports: [WebhookManagementService],
})
export class WebhookManagementModule {}