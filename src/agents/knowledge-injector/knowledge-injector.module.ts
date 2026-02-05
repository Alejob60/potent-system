import { Module } from '@nestjs/common';
import { KnowledgeInjectorController } from './controllers/knowledge-injector.controller';
import { KnowledgeInjectorService } from './services/knowledge-injector.service';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [StateModule, WebSocketModule, HttpModule],
  controllers: [KnowledgeInjectorController],
  providers: [KnowledgeInjectorService],
  exports: [KnowledgeInjectorService],
})
export class KnowledgeInjectorModule {}
