import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ChannelAdapterFactory } from './channel-adapter.factory';
import { WhatsappBusinessModule } from './whatsapp-business.module';
import { InstagramDmModule } from './instagram-dm.module';
import { FacebookMessengerModule } from './facebook-messenger.module';
import { EmailModule } from './email.module';
import { FrontDeskV2Module } from '../../agents/front-desk/front-desk-v2.module';
import { OmnichannelController } from './omnichannel.controller';

@Module({
  imports: [
    HttpModule,
    WhatsappBusinessModule,
    InstagramDmModule,
    FacebookMessengerModule,
    EmailModule,
    FrontDeskV2Module,
  ],
  controllers: [OmnichannelController],
  providers: [ChannelAdapterFactory],
  exports: [ChannelAdapterFactory],
})
export class OmnichannelModule {}
