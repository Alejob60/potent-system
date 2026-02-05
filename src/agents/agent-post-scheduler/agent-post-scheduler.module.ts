import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentPostScheduler } from './entities/agent-post-scheduler.entity';
import { AgentPostSchedulerService } from './services/agent-post-scheduler.service';
import { AgentPostSchedulerController } from './controllers/agent-post-scheduler.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AgentPostScheduler])],
  providers: [AgentPostSchedulerService],
  controllers: [AgentPostSchedulerController],
  exports: [AgentPostSchedulerService],
})
export class AgentPostSchedulerModule {}
