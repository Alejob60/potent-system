import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AgentConnectorService } from './agent-connector.service';

@Module({
  imports: [
    HttpModule,
  ],
  providers: [
    AgentConnectorService,
  ],
  exports: [
    AgentConnectorService,
  ],
})
export class AgentConnectorModule {}