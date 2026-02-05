import { Module } from '@nestjs/common';
import { MetaMetricsV2Service } from './services/meta-metrics-v2.service';
import { MetaMetricsV2Controller } from './controllers/meta-metrics-v2.controller';
import { RedisModule } from '../../common/redis/redis.module';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    RedisModule,
    StateModule,
    WebSocketModule,
  ],
  controllers: [MetaMetricsV2Controller],
  providers: [MetaMetricsV2Service],
  exports: [MetaMetricsV2Service],
})
export class MetaMetricsV2Module {}