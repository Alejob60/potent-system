import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ApiGatewayService } from './api-gateway.service';
import { ApiGatewayController } from './api-gateway.controller';
import { WhatsappBusinessModule } from './channels/whatsapp-business.module';
import { InstagramDmModule } from './channels/instagram-dm.module';
import { FacebookMessengerModule } from './channels/facebook-messenger.module';
import { EmailModule } from './channels/email.module';

@Module({
  imports: [
    HttpModule,
    WhatsappBusinessModule,
    InstagramDmModule,
    FacebookMessengerModule,
    EmailModule,
  ],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
  exports: [ApiGatewayService],
})
export class ApiGatewayModule {}