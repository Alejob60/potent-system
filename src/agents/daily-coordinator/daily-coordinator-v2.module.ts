import { Module } from '@nestjs/common';
import { DailyCoordinatorV2Service } from './services/daily-coordinator-v2.service';
import { DailyCoordinatorV2Controller } from './controllers/daily-coordinator-v2.controller';
import { RedisModule } from '../../common/redis/redis.module';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    RedisModule,
    StateModule,
    WebSocketModule,
  ],
  controllers: [DailyCoordinatorV2Controller],
  providers: [DailyCoordinatorV2Service],
  exports: [DailyCoordinatorV2Service],
})
export class DailyCoordinatorV2Module {}