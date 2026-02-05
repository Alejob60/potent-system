import { Module } from '@nestjs/common';
import { ChatNotificationService } from './chat-notification.service';
import { RedisModule } from '../common/redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [ChatNotificationService],
  exports: [ChatNotificationService],
})
export class ChatModule {}