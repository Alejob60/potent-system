import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WhatsappBusinessService } from './whatsapp-business.service';
import { WhatsappBusinessController } from './whatsapp-business.controller';

@Module({
  imports: [HttpModule],
  controllers: [WhatsappBusinessController],
  providers: [WhatsappBusinessService],
  exports: [WhatsappBusinessService],
})
export class WhatsappBusinessModule {}