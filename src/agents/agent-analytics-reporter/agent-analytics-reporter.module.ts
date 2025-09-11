import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentAnalyticsReporter } from './entities/agent-analytics-reporter.entity';
import { AgentAnalyticsReporterService } from './services/agent-analytics-reporter.service';
import { AgentAnalyticsReporterController } from './controllers/agent-analytics-reporter.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AgentAnalyticsReporter])],
  providers: [AgentAnalyticsReporterService],
  controllers: [AgentAnalyticsReporterController],
})
export class AgentAnalyticsReporterModule {}
