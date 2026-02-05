import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ColombiaTICAgentService } from './colombiatic-agent.service';
import { ColombiaTICAgentController } from './colombiatic-agent.controller';

@Module({
  imports: [HttpModule],
  providers: [ColombiaTICAgentService],
  controllers: [ColombiaTICAgentController],
  exports: [ColombiaTICAgentService],
})
export class ColombiaTICAgentModule {}