import { Controller, Post, Body, Logger, Inject } from '@nestjs/common';
import {
  AdminOrchestratorService,
  AgentResult,
} from '../../admin/services/admin-orchestrator.service';
import { ChatRequestDto } from '../dto/chat-request.dto';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
import { AgentDecision } from '../../../ai/ai-decision-engine.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
// Swagger imports
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(
    private readonly orchestrator: AdminOrchestratorService,
    private readonly stateManager: StateManagementService,
    private readonly websocketGateway: WebSocketGatewayService,
    private readonly httpService: HttpService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Handle chat request',
    description:
      'Process user chat requests and coordinate with AI agents to generate responses',
  })
  @ApiBody({
    description: 'Chat request parameters',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Create a social media campaign for our new product',
        },
        context: {
          type: 'object',
          properties: {
            sessionId: { type: 'string', example: 'user-session-123' },
            nombre: { type: 'string', example: 'John Doe' },
            negocio: { type: 'string', example: 'MisyBot' },
            ubicacion: { type: 'string', example: 'San Francisco, CA' },
            canales: {
              type: 'array',
              items: { type: 'string' },
              example: ['instagram', 'facebook', 'twitter'],
            },
            objetivo: { type: 'string', example: 'Increase brand awareness' },
            preferencias: {
              type: 'object',
              properties: {
                contenido: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['video', 'image', 'text'],
                },
                tono: { type: 'string', example: 'professional' },
                frecuencia: { type: 'string', example: 'daily' },
                language: { type: 'string', example: 'es' },
              },
            },
            language: { type: 'string', example: 'es' },
          },
        },
      },
      required: ['message'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Chat request processed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  async handleChat(@Body() body: ChatRequestDto) {
    const { message, context } = body;

    // Create or get session
    let sessionId = context?.sessionId;
    if (!sessionId) {
      const session = this.stateManager.createSession(uuidv4());
      sessionId = session.sessionId;
      // Update context with sessionId if context exists
      if (context) {
        context.sessionId = sessionId;
      }
    }

    // Update session with user preferences if provided
    if (context) {
      this.stateManager.updateContext(sessionId, {
        businessInfo: {
          name: context.negocio,
          location: context.ubicacion,
        },
        targetChannels: context.canales,
        currentObjective: context.objetivo,
      });

      // Extract language from context or preferences
      const userLanguage = context.language || context.preferencias?.language;

      if (context.preferencias) {
        this.stateManager.updatePreferences(sessionId, {
          contentTypes: context.preferencias.contenido,
          tone: context.preferencias.tono,
          frequency: context.preferencias.frecuencia,
          language: userLanguage,
        });
      } else if (userLanguage) {
        // Update language preference even if no other preferences are provided
        this.stateManager.updatePreferences(sessionId, {
          language: userLanguage,
        });
      }
    }

    try {
      // Check if this is a conversation that needs front desk assistance
      const needsFrontDesk = this.requiresFrontDeskAssistance(message);

      if (needsFrontDesk) {
        // Route through Front Desk Agent for detailed conversation management
        const frontDeskResponse = await this.processWithFrontDesk(
          message,
          sessionId,
          context,
        );

        // Send front desk response via WebSocket
        this.websocketGateway.emitChatResponse(sessionId, {
          reply: frontDeskResponse.conversation.agentResponse,
          sessionId,
          context: this.stateManager.getContext(sessionId) || {},
          frontDeskData: frontDeskResponse,
        });

        return {
          reply: frontDeskResponse.conversation.agentResponse,
          sessionId,
          context: this.stateManager.getContext(sessionId) || {},
          status: 'requires_confirmation',
          message:
            'Front desk assistance provided. Awaiting user confirmation.',
          frontDeskData: frontDeskResponse,
        };
      } else {
        // Use intelligent orchestration for direct requests
        const sessionContext = this.stateManager.getContext(sessionId) || {};
        const results = await this.orchestrator.intelligentOrchestrate(
          message,
          sessionContext,
          sessionId,
        );

        // Get the decision made by the AI engine
        const tasks = this.stateManager.getTasks(sessionId, 'in_progress');
        const completedTasks = this.stateManager.getTasks(
          sessionId,
          'completed',
        );
        const task = tasks[0] || completedTasks[0];
        let decision: AgentDecision | undefined = undefined;
        if (task && task.data) {
          decision = (task.data as { decision?: AgentDecision }).decision;
        }

        // Process results
        const successfulResults = results.filter(
          (r): r is PromiseFulfilledResult<AgentResult> =>
            r.status === 'fulfilled' && r.value.result !== undefined,
        );

        const reply =
          successfulResults.length > 0
            ? this.formatResponse(
                successfulResults,
                message,
                sessionId,
                decision,
              )
            : this.getDefaultResponse(message, sessionId, decision);

        // Send final response via WebSocket
        this.websocketGateway.emitChatResponse(sessionId, {
          reply,
          sessionId,
          context: sessionContext,
          results: results,
          decision: decision,
        });

        return {
          reply,
          sessionId,
          context: sessionContext,
          status: 'processing',
          message: 'Response sent via WebSocket. Check real-time updates.',
          decision: decision,
        };
      }
    } catch (error) {
      // Handle errors gracefully
      const errorMessage = this.formatErrorResponse(error as Error, sessionId);

      this.websocketGateway.emitChatResponse(sessionId, {
        reply: errorMessage,
        sessionId,
        error: true,
      });

      return {
        reply: errorMessage,
        sessionId,
        error: true,
      };
    }
  }

  private requiresFrontDeskAssistance(message: string): boolean {
    const lowerMessage = message.toLowerCase();

    // Check for conversational requests that need clarification
    const conversationalIndicators = [
      'quiero',
      'necesito',
      'podr as',
      'me gustar a',
      'ayuda',
      'como hago',
      'c mo hago',
    ];

    // Check for incomplete requests that need more information
    const incompleteIndicators = [
      'video',
      'publicaci n',
      'post',
      'tendencia',
      'an lisis',
      'reporte',
    ];

    // If message contains conversational language and references content creation
    return (
      conversationalIndicators.some((indicator) =>
        lowerMessage.includes(indicator),
      ) &&
      incompleteIndicators.some((indicator) => lowerMessage.includes(indicator))
    );
  }

  private async processWithFrontDesk(
    message: string,
    sessionId: string,
    context?: any,
  ) {
    try {
      // Call the Front Desk Agent service
      const frontDeskUrl =
        process.env.FRONT_DESK_AGENT_URL ||
        'http://localhost:3007/api/agents/front-desk';

      const response = await firstValueFrom(
        this.httpService.post(frontDeskUrl, {
          message,
          context: {
            sessionId,
            language: context?.language || 'es',
            ...context,
          },
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.error('Error calling Front Desk Agent:', error);
      // Fallback to default processing if Front Desk Agent fails
      throw error;
    }
  }

  private getDefaultResponse(
    message: string,
    sessionId: string,
    decision?: AgentDecision,
  ): string {
    // Get user language preference
    const session = this.stateManager.getSession(sessionId);
    const userLanguage = session?.preferences?.language || 'en';

    // If we have a decision from the AI engine, use it to provide more context
    if (decision) {
      // Spanish responses
      if (userLanguage === 'es') {
        switch (decision.taskType) {
          case 'campaign':
            return 'Estoy creando una estrategia de campa a integral para ti. Recibir s actualizaciones en tiempo real mientras coordino con agentes especializados para analizar tendencias, crear contenido y programar publicaciones.';
          case 'media_generation':
            return 'Estoy generando tu contenido multimedia. Los agentes especializados est n trabajando en la creaci n de contenido de alta calidad que se ajuste a tus requisitos. Te notificar  cuando est  listo.';
          case 'analysis':
            return 'Estoy analizando los datos solicitados. Los agentes especializados est n recopilando y procesando la informaci n para proporcionarte un informe detallado.';
          case 'planning':
            return 'Estoy elaborando un plan detallado seg n tus requisitos. Coordinar  con los agentes apropiados para organizar el calendario y los recursos necesarios.';
          case 'single_post':
            return 'Estoy preparando tu publicaci n. Los agentes especializados est n trabajando en crear contenido de alta calidad para ti.';
          default:
            return `He procesado tu solicitud y he coordinado con los agentes apropiados. El agente principal es ${decision.primaryAgent} con una confianza del ${(decision.confidence * 100).toFixed(1)}%. Recibir s actualizaciones detalladas y resultados en breve.`;
        }
      }

      // English responses
      switch (decision.taskType) {
        case 'campaign':
          return "I'm creating a comprehensive campaign strategy for you. You'll receive real-time updates as I coordinate with specialized agents to analyze trends, create content, and schedule posts.";
        case 'media_generation':
          return "I'm generating your media content. The specialized agents are working on creating high-quality content that matches your requirements. You'll be notified once it's ready.";
        case 'analysis':
          return "I'm analyzing the requested data. The specialized agents are collecting and processing information to provide you with a detailed report.";
        case 'planning':
          return "I'm developing a detailed plan based on your requirements. I'll coordinate with the appropriate agents to organize the schedule and necessary resources.";
        case 'single_post':
          return "I'm preparing your post. The specialized agents are working on creating high-quality content for you.";
        default:
          return `I've processed your request and coordinated with the appropriate agents. The primary agent is ${decision.primaryAgent} with ${(decision.confidence * 100).toFixed(1)}% confidence. You'll receive detailed updates and results shortly.`;
      }
    }

    // Fallback responses when no decision is available
    // Spanish response
    if (userLanguage === 'es') {
      return 'Entiendo tu solicitud. Estoy trabajando en ello y coordinando con los agentes apropiados.';
    }

    // Default English response
    return 'I understand your request. Let me work on that for you and coordinate with the appropriate agents.';
  }

  private formatErrorResponse(error: Error, sessionId: string): string {
    // Get user language preference
    const session = this.stateManager.getSession(sessionId);
    const userLanguage = session?.preferences?.language || 'en';

    // Spanish response
    if (userLanguage === 'es') {
      return `Encontr  un problema al procesar tu solicitud: ${error.message}`;
    }

    // Default English response
    return `I encountered an issue processing your request: ${error.message}`;
  }

  private formatResponse(
    results: PromiseFulfilledResult<AgentResult>[],
    originalMessage: string,
    sessionId: string,
    decision?: AgentDecision,
  ): string {
    // Get user language preference
    const session = this.stateManager.getSession(sessionId);
    const userLanguage = session?.preferences?.language || 'en';

    // If we have a decision from the AI engine, use it for more accurate responses
    if (decision) {
      // Spanish responses
      if (userLanguage === 'es') {
        switch (decision.taskType) {
          case 'campaign':
            return `Estoy creando una estrategia de campa a integral para ti. El agente principal es ${decision.primaryAgent} y los agentes de apoyo son ${decision.supportingAgents.join(', ')}. Recibir s actualizaciones en tiempo real mientras coordino con agentes especializados para analizar tendencias, crear contenido y programar publicaciones.`;
          case 'media_generation':
            return `Estoy generando tu contenido multimedia. El agente principal es ${decision.primaryAgent} y los agentes de apoyo son ${decision.supportingAgents.join(', ')}. Los agentes especializados est n trabajando en la creaci n de contenido de alta calidad que se ajuste a tus requisitos. Te notificar  cuando est  listo.`;
          case 'analysis':
            return `Estoy analizando los datos solicitados. El agente principal es ${decision.primaryAgent} y los agentes de apoyo son ${decision.supportingAgents.join(', ')}. Los agentes especializados est n recopilando y procesando la informaci n para proporcionarte un informe detallado.`;
          case 'planning':
            return `Estoy elaborando un plan detallado seg n tus requisitos. El agente principal es ${decision.primaryAgent} y los agentes de apoyo son ${decision.supportingAgents.join(', ')}. Coordinar  con los agentes apropiados para organizar el calendario y los recursos necesarios.`;
          case 'single_post':
            return `Estoy preparando tu publicaci n. El agente principal es ${decision.primaryAgent} y los agentes de apoyo son ${decision.supportingAgents.join(', ')}. Los agentes especializados est n trabajando en crear contenido de alta calidad para ti.`;
          default:
            return `He procesado tu solicitud y he coordinado con los agentes apropiados. El agente principal es ${decision.primaryAgent} con una confianza del ${(decision.confidence * 100).toFixed(1)}%. Los agentes de apoyo son ${decision.supportingAgents.join(', ')}. Recibir s actualizaciones detalladas y resultados en breve.`;
        }
      }

      // English responses
      switch (decision.taskType) {
        case 'campaign':
          return `I'm creating a comprehensive campaign strategy for you. The primary agent is ${decision.primaryAgent} and the supporting agents are ${decision.supportingAgents.join(', ')}. You'll receive real-time updates as I coordinate with specialized agents to analyze trends, create content, and schedule posts.`;
        case 'media_generation':
          return `I'm generating your media content. The primary agent is ${decision.primaryAgent} and the supporting agents are ${decision.supportingAgents.join(', ')}. The specialized agents are working on creating high-quality content that matches your requirements. You'll be notified once it's ready.`;
        case 'analysis':
          return `I'm analyzing the requested data. The primary agent is ${decision.primaryAgent} and the supporting agents are ${decision.supportingAgents.join(', ')}. The specialized agents are collecting and processing information to provide you with a detailed report.`;
        case 'planning':
          return `I'm developing a detailed plan based on your requirements. The primary agent is ${decision.primaryAgent} and the supporting agents are ${decision.supportingAgents.join(', ')}. I'll coordinate with the appropriate agents to organize the schedule and necessary resources.`;
        case 'single_post':
          return `I'm preparing your post. The primary agent is ${decision.primaryAgent} and the supporting agents are ${decision.supportingAgents.join(', ')}. The specialized agents are working on creating high-quality content for you.`;
        default:
          return `I've processed your request and coordinated with the appropriate agents. The primary agent is ${decision.primaryAgent} with ${(decision.confidence * 100).toFixed(1)}% confidence. The supporting agents are ${decision.supportingAgents.join(', ')}. You'll receive detailed updates and results shortly.`;
      }
    }

    // Fallback to message-based responses when no decision is available
    // Spanish responses
    if (userLanguage === 'es') {
      if (
        originalMessage.toLowerCase().includes('campa a') ||
        originalMessage.toLowerCase().includes('campaign')
      ) {
        return 'Estoy creando una estrategia de campa a integral para ti. Recibir s actualizaciones en tiempo real mientras coordino con agentes especializados para analizar tendencias, crear contenido y programar publicaciones.';
      }

      if (
        originalMessage.toLowerCase().includes('video') ||
        originalMessage.toLowerCase().includes('imagen') ||
        originalMessage.toLowerCase().includes('image') ||
        originalMessage.toLowerCase().includes('picture')
      ) {
        return 'Estoy generando tu contenido multimedia. Los agentes especializados est n trabajando en la creaci n de contenido de alta calidad que se ajuste a tus requisitos. Te notificar  cuando est  listo.';
      }

      return 'He procesado tu solicitud y he coordinado con los agentes apropiados. Recibir s actualizaciones detalladas y resultados en breve.';
    }

    // Default English responses
    if (
      originalMessage.toLowerCase().includes('campa a') ||
      originalMessage.toLowerCase().includes('campaign')
    ) {
      return "I'm creating a comprehensive campaign strategy for you. You'll receive real-time updates as I coordinate with specialized agents to analyze trends, create content, and schedule posts.";
    }

    if (
      originalMessage.toLowerCase().includes('video') ||
      originalMessage.toLowerCase().includes('imagen') ||
      originalMessage.toLowerCase().includes('image') ||
      originalMessage.toLowerCase().includes('picture')
    ) {
      return "I'm generating your media content. The specialized agents are working on creating high-quality content that matches your requirements. You'll be notified once it's ready.";
    }

    return "I've processed your request and coordinated with the appropriate agents. You'll receive detailed updates and results shortly.";
  }
}