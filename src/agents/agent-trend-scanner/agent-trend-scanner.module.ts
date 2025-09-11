import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentTrendScanner } from './entities/agent-trend-scanner.entity';
import { AgentTrendScannerService } from './services/agent-trend-scanner.service';
import { AgentTrendScannerController } from './controllers/agent-trend-scanner.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AgentTrendScanner])],
  providers: [AgentTrendScannerService],
  controllers: [AgentTrendScannerController],
})
export class AgentTrendScannerModule {}
