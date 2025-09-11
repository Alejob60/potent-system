import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // Cambio principal aquí
import { AdminOrchestratorController } from './controllers/admin-orchestrator.controller';
import { AdminOrchestratorService } from './services/admin-orchestrator.service';

@Module({
  imports: [HttpModule],
  controllers: [AdminOrchestratorController],
  providers: [AdminOrchestratorService],
})
export class AdminModule {}
