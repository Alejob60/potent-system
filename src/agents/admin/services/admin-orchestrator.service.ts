import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AgentOrchestrationDto } from '../dto/agent-orchestration.dto';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

// Interface para el resultado de cada agente - EXPORTADA
export interface AgentResult {
  agent: string;
  result?: unknown;
  error?: string;
}

@Injectable()
export class AdminOrchestratorService {
  constructor(private readonly httpService: HttpService) {}

  private agentMap: Record<string, string> = {
    'trend-scanner':
      process.env.AGENT_TREND_SCANNER_URL ||
      'http://localhost:3000/agents/trend-scanner',
    'video-scriptor':
      process.env.AGENT_VIDEO_SCRIPTOR_URL ||
      'http://localhost:3000/agents/video-scriptor',
    'faq-responder':
      process.env.AGENT_FAQ_RESPONDER_URL ||
      'http://localhost:3000/agents/faq-responder',
    'post-scheduler':
      process.env.AGENT_POST_SCHEDULER_URL ||
      'http://localhost:3000/agents/post-scheduler',
    'analytics-reporter':
      process.env.AGENT_ANALYTICS_REPORTER_URL ||
      'http://localhost:3000/agents/analytics-reporter',
  };

  async orchestrate(
    dto: AgentOrchestrationDto,
  ): Promise<PromiseSettledResult<AgentResult>[]> {
    const results = await Promise.allSettled(
      dto.agents.map(async (agent: string): Promise<AgentResult> => {
        const baseUrl = this.agentMap[agent];
        try {
          const response = await firstValueFrom(
            this.httpService.post(baseUrl, dto.params || {}),
          );
          return { agent, result: response.data };
        } catch (error) {
          const errorMessage = this.extractErrorMessage(error);
          return { agent, error: errorMessage };
        }
      }),
    );
    return results;
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
      return error.message || 'HTTP request failed';
    }

    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    return 'Unknown error occurred';
  }
}
