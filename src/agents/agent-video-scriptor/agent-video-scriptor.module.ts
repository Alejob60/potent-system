import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentVideoScriptor } from './entities/agent-video-scriptor.entity';
import { AgentVideoScriptorService } from './services/agent-video-scriptor.service';
import { AgentVideoScriptorController } from './controllers/agent-video-scriptor.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AgentVideoScriptor])],
  providers: [AgentVideoScriptorService],
  controllers: [AgentVideoScriptorController],
})
export class AgentVideoScriptorModule {}
