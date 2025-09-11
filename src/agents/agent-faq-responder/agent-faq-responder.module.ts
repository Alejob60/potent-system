import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentFaqResponder } from './entities/agent-faq-responder.entity';
import { AgentFaqResponderService } from './services/agent-faq-responder.service';
import { AgentFaqResponderController } from './controllers/agent-faq-responder.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AgentFaqResponder])],
  providers: [AgentFaqResponderService],
  controllers: [AgentFaqResponderController],
})
export class AgentFaqResponderModule {}
