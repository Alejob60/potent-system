import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AgentTrendScannerModule } from './agents/agent-trend-scanner/agent-trend-scanner.module';
import { AgentVideoScriptorModule } from './agents/agent-video-scriptor/agent-video-scriptor.module';
import { AgentFaqResponderModule } from './agents/agent-faq-responder/agent-faq-responder.module';
import { AgentPostSchedulerModule } from './agents/agent-post-scheduler/agent-post-scheduler.module';
import { AgentAnalyticsReporterModule } from './agents/agent-analytics-reporter/agent-analytics-reporter.module';
import { AdminModule } from './agents/admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl:
        process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      autoLoadEntities: true,
      synchronize: true, // Dev ONLY
    }),
    AgentTrendScannerModule,
    AgentVideoScriptorModule,
    AgentFaqResponderModule,
    AgentPostSchedulerModule,
    AgentAnalyticsReporterModule,
    AdminModule,
  ],
})
export class AppModule {}
