import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from './entities/campaign.entity';
import { CampaignV2Service } from './services/campaign-v2.service';
import { CampaignV2Controller } from './controllers/campaign-v2.controller';
import { RedisModule } from '../../common/redis/redis.module';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Campaign]),
    RedisModule,
    StateModule,
    WebSocketModule,
  ],
  controllers: [CampaignV2Controller],
  providers: [CampaignV2Service],
  exports: [CampaignV2Service],
})
export class CampaignV2Module {}