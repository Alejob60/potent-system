import { Controller, Post, Body } from '@nestjs/common';
import {
  AdminOrchestratorService,
  AgentResult,
} from '../services/admin-orchestrator.service';
import { AgentOrchestrationDto } from '../dto/agent-orchestration.dto';

@Controller('admin/orchestrate')
export class AdminOrchestratorController {
  constructor(private readonly service: AdminOrchestratorService) {}

  @Post()
  async orchestrate(
    @Body() dto: AgentOrchestrationDto,
  ): Promise<PromiseSettledResult<AgentResult>[]> {
    return this.service.orchestrate(dto);
  }
}
