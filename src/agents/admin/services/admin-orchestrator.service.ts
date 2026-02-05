import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AgentOrchestrationDto } from '../dto/agent-orchestration.dto';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import {
  AIDecisionEngine,
  DecisionInput,
  AgentDecision,
} from '../../../ai/ai-decision-engine.service';
import {
  StateManagementService,
  SessionContext,
} from '../../../state/state-management.service';
import {
  WebSocketGatewayService,
  AgentUpdate,
} from '../../../websocket/websocket.gateway';
import { CampaignAgentService } from '../../campaign/campaign-agent.service';

// Interface para el resultado de cada agente - EXPORTADA
export interface AgentResult {
  agent: string;
  result?: unknown;
  error?: string;
}

@Injectable()
export class AdminOrchestratorService {
  private readonly logger = new Logger(AdminOrchestratorService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly aiDecisionEngine: AIDecisionEngine,
    private readonly stateManager: StateManagementService,
    private readonly websocketGateway: WebSocketGatewayService,
    private readonly campaignAgent?: CampaignAgentService,
  ) {}

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
    'front-desk':
      process.env.AGENT_FRONT_DESK_URL ||
      'http://localhost:3007/api/agents/front-desk',
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

  async intelligentOrchestrate(
    message: string,
    context: SessionContext,
    sessionId: string,
  ): Promise<PromiseSettledResult<AgentResult>[]> {
    this.logger.log(
      `Starting intelligent orchestration for session ${sessionId}`,
    );

    try {
      // Get session data for decision making
      const session = this.stateManager.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Prepare decision input
      const decisionInput: DecisionInput = {
        message,
        context,
        conversationHistory: this.stateManager.getConversationHistory(
          sessionId,
          10,
        ),
        userPreferences: session.preferences,
      };

      // Make intelligent decision
      const decision: AgentDecision =
        await this.aiDecisionEngine.makeDecision(decisionInput);

      this.logger.log(`AI Decision: ${decision.reasoning}`);

      // Update session context with decision
      this.stateManager.updateContext(sessionId, {
        campaignType: decision.taskType,
        currentObjective: message,
      });

      // Add conversation entry
      this.stateManager.addConversationEntry(sessionId, {
        type: 'user_message',
        content: message,
      });

      // Create task for tracking
      const task = this.stateManager.addTask(sessionId, {
        type: decision.taskType,
        status: 'in_progress',
        agentAssigned: decision.primaryAgent,
        data: {
          decision,
          message,
          context,
        },
      });

      // Notify client about decision
      this.websocketGateway.emitToSession(sessionId, 'decision_made', {
        decision,
        taskId: task?.id,
        estimatedDuration: decision.estimatedDuration,
      });

      // Prepare agents to execute
      const agentsToExecute = [
        decision.primaryAgent,
        ...decision.supportingAgents,
      ];

      // Update active agents in session
      agentsToExecute.forEach((agent) => {
        this.stateManager.addActiveAgent(sessionId, agent);
      });

      // Execute agents with real-time updates
      const results = await this.executeAgentsWithUpdates(
        agentsToExecute,
        { message, context, sessionId, decision },
        sessionId,
      );

      // Update task status
      if (task) {
        const hasErrors = results.some((r) => r.status === 'rejected');
        this.stateManager.updateTask(sessionId, task.id, {
          status: hasErrors ? 'failed' : 'completed',
          result: results,
        });
      }

      // Add response to conversation history
      const successfulResults = results.filter(
        (r): r is PromiseFulfilledResult<AgentResult> =>
          r.status === 'fulfilled',
      );

      if (successfulResults.length > 0) {
        this.stateManager.addConversationEntry(sessionId, {
          type: 'agent_response',
          content: 'Task completed successfully',
          agent: decision.primaryAgent,
          metadata: { results, decision },
        });
      }

      // Clean up active agents
      agentsToExecute.forEach((agent) => {
        this.stateManager.removeActiveAgent(sessionId, agent);
      });

      this.logger.log(
        `Completed intelligent orchestration for session ${sessionId}`,
      );
      return results;
    } catch (error) {
      this.logger.error(
        `Error in intelligent orchestration: ${error.message}`,
        error.stack,
      );

      // Notify client about error
      this.websocketGateway.emitToSession(sessionId, 'orchestration_error', {
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  }

  private async executeAgentsWithUpdates(
    agents: string[],
    params: any,
    sessionId: string,
  ): Promise<PromiseSettledResult<AgentResult>[]> {
    const results = await Promise.allSettled(
      agents.map(async (agent: string): Promise<AgentResult> => {
        const baseUrl = this.agentMap[agent];

        try {
          // Notify start
          const startUpdate: AgentUpdate = {
            type: 'agent_started',
            agent,
            sessionId,
            timestamp: new Date().toISOString(),
          };
          this.websocketGateway.emitAgentUpdate(startUpdate);

          // Execute agent
          const response = await firstValueFrom(
            this.httpService.post(baseUrl, params),
          );

          // Notify completion
          const completeUpdate: AgentUpdate = {
            type: 'agent_completed',
            agent,
            sessionId,
            data: response.data,
            timestamp: new Date().toISOString(),
          };
          this.websocketGateway.emitAgentUpdate(completeUpdate);

          return { agent, result: response.data };
        } catch (error) {
          const errorMessage = this.extractErrorMessage(error);

          // Notify error
          const errorUpdate: AgentUpdate = {
            type: 'agent_error',
            agent,
            sessionId,
            error: errorMessage,
            timestamp: new Date().toISOString(),
          };
          this.websocketGateway.emitAgentUpdate(errorUpdate);

          return { agent, error: errorMessage };
        }
      }),
    );

    return results;
  }

  // Method to handle campaign-specific orchestration
  async orchestrateCampaign(
    campaignData: any,
    sessionId: string,
  ): Promise<any> {
    this.logger.log(`Starting campaign orchestration for session ${sessionId}`);

    // Update context to campaign mode
    this.stateManager.updateContext(sessionId, {
      campaignType: 'campaign',
      currentObjective: 'Campaign Creation',
    });

    // Campaign-specific agent sequence
    const campaignAgents = [
      'trend-scanner',
      'video-scriptor',
      'post-scheduler',
    ];

    const results = await this.executeAgentsWithUpdates(
      campaignAgents,
      { ...campaignData, sessionId, type: 'campaign' },
      sessionId,
    );

    // Notify campaign completion
    this.websocketGateway.emitCampaignUpdate(sessionId, {
      status: 'completed',
      results,
      timestamp: new Date().toISOString(),
    });

    return results;
  }

  // Method to handle media generation orchestration
  async orchestrateMediaGeneration(
    mediaRequest: any,
    sessionId: string,
  ): Promise<any> {
    this.logger.log(`Starting media generation for session ${sessionId}`);

    // Update context to media generation mode
    this.stateManager.updateContext(sessionId, {
      campaignType: 'media_generation',
      currentObjective: 'Media Generation',
    });

    // Media-specific agent sequence
    const mediaAgents = ['video-scriptor', 'trend-scanner'];

    const results = await this.executeAgentsWithUpdates(
      mediaAgents,
      { ...mediaRequest, sessionId, type: 'media_generation' },
      sessionId,
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

  async checkAgentHealth(url: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${url}/health`),
      );
      return response.status === 200;
    } catch (error) {
      console.error(`Error checking health of agent at ${url}:`, error.message);
      return false;
    }
  }
}
