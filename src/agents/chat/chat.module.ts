import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ChatController } from './controllers/chat.controller';
import { AdminModule } from '../admin/admin.module';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [HttpModule, AdminModule, StateModule, WebSocketModule],
  controllers: [ChatController],
})
export class ChatModule {}
