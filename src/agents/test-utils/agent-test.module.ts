import { Module } from '@nestjs/common';
import { AgentFunctionalityTestService } from './agent-functionality-test.service';
import { AgentTestController } from './agent-test.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
  ],
  controllers: [
    AgentTestController,
  ],
  providers: [
    AgentFunctionalityTestService,
  ],
  exports: [
    AgentFunctionalityTestService,
  ],
})
export class AgentTestModule {}