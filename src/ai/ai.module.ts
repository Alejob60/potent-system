import { Module } from '@nestjs/common';
import { AIDecisionEngine } from './ai-decision-engine.service';

@Module({
  providers: [AIDecisionEngine],
  exports: [AIDecisionEngine],
})
export class AIModule {}
