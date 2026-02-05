import { Module } from '@nestjs/common';
import { ChannelRoutingService } from './channel-routing.service';
import { ChannelRoutingController } from './channel-routing.controller';

@Module({
  controllers: [ChannelRoutingController],
  providers: [ChannelRoutingService],
  exports: [ChannelRoutingService],
})
export class ChannelRoutingModule {}