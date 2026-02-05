import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FacebookMessengerService } from './facebook-messenger.service';
import { FacebookMessengerController } from './facebook-messenger.controller';

@Module({
  imports: [HttpModule],
  controllers: [FacebookMessengerController],
  providers: [FacebookMessengerService],
  exports: [FacebookMessengerService],
})
export class FacebookMessengerModule {}