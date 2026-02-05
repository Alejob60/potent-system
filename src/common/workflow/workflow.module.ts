import { Module } from '@nestjs/common';
import { WorkflowEngineService } from './workflow-engine.service';
import { WebSocketModule } from '../../websocket/websocket.module';
import { StateModule } from '../../state/state.module';
import { AgentConnectorModule } from '../orchestrator/agent-connector.module';

@Module({
  imports: [
    WebSocketModule,
    StateModule,
    AgentConnectorModule,
  ],
  providers: [
    WorkflowEngineService,
  ],
  exports: [
    WorkflowEngineService,
  ],
})
export class WorkflowModule {}