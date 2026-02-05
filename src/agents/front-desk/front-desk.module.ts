import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { FrontDeskController } from './controllers/front-desk.controller';
import { FrontDeskService } from './services/front-desk.service';
import { FrontDeskConversation } from './entities/front-desk-conversation.entity';
import { ContextCompressionService } from './services/context-compression.service';
import { CreativeSynthesizerIntegrationService } from './services/creative-synthesizer.integration.service';

@Module({
  imports: [TypeOrmModule.forFeature([FrontDeskConversation]), HttpModule],
  controllers: [FrontDeskController],
  providers: [
    FrontDeskService,
    ContextCompressionService,
    CreativeSynthesizerIntegrationService,
  ],
  exports: [FrontDeskService, ContextCompressionService],
})
export class FrontDeskModule {}
