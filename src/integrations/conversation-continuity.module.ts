import { Module } from '@nestjs/common';
import { ConversationContinuityService } from './conversation-continuity.service';
import { ConversationContinuityController } from './conversation-continuity.controller';

@Module({
  controllers: [ConversationContinuityController],
  providers: [ConversationContinuityService],
  exports: [ConversationContinuityService],
})
export class ConversationContinuityModule {}