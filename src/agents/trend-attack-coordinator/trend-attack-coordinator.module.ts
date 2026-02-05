import { Module } from '@nestjs/common';
import { TrendAttackCoordinatorController } from './controllers/trend-attack-coordinator.controller';
import { TrendAttackCoordinatorService } from './services/trend-attack-coordinator.service';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';
import { HttpModule } from '@nestjs/axios';
import { DailyCoordinatorModule } from '../daily-coordinator/daily-coordinator.module';
import { AgentPostSchedulerModule } from '../agent-post-scheduler/agent-post-scheduler.module';

@Module({
  imports: [
    StateModule,
    WebSocketModule,
    HttpModule,
    DailyCoordinatorModule,
    AgentPostSchedulerModule,
  ],
  controllers: [TrendAttackCoordinatorController],
  providers: [TrendAttackCoordinatorService],
  exports: [TrendAttackCoordinatorService],
})
export class TrendAttackCoordinatorModule {}
