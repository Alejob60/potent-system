import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentContentEditor } from './entities/agent-content-editor.entity';
import { AgentContentEditorV2Service } from './services/agent-content-editor-v2.service';
import { AgentContentEditorV2Controller } from './controllers/agent-content-editor-v2.controller';
import { RedisModule } from '../../common/redis/redis.module';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentContentEditor]),
    RedisModule,
    StateModule,
    WebSocketModule,
  ],
  controllers: [AgentContentEditorV2Controller],
  providers: [AgentContentEditorV2Service],
  exports: [AgentContentEditorV2Service],
})
export class AgentContentEditorV2Module {}