import { Injectable, Logger } from '@nestjs/common';
import { VectorMemoryService } from '../memory/vector-memory.service';
// Importaciones temporales - se deben reemplazar con servicios reales
// import { VideoService } from '../../agents/video/video.service';
// import { WebsiteAnalysisService } from '../../agents/website-analysis/website-analysis.service';
// import { ViralPipelineService } from '../../agents/viral-pipeline/viral-pipeline.service';
import { AzureClient } from '../../lib/api/azure-client';

export interface UserInput {
  text: string;
  channel: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface SecretaryResponse {
  action: 'INIT_TOOL' | 'EXECUTE_TASK' | 'CHAT' | 'UI_SHOW_LOADER' | 'UI_ASK_INPUT' | 'UI_RENDER_NODE';
  content?: string;
  tool?: string;
  jobId?: string;
  nodeId?: string;
  data?: any;
  requiresInput?: boolean;
}

@Injectable()
export class SecretaryService {
  private readonly logger = new Logger(SecretaryService.name);

  constructor(
    private readonly vectorMemoryService: VectorMemoryService,
    // private readonly videoService: VideoService,
    // private readonly websiteAnalysisService: WebsiteAnalysisService,
    // private readonly viralPipelineService: ViralPipelineService,
    private readonly azureClient: AzureClient
  ) {}

  /**
   * Método maestro: procesa la solicitud del usuario
   */
  async processUserRequest(
    userId: string,
    tenantId: string,
    input: UserInput
  ): Promise<SecretaryResponse> {
    try {
      this.logger.log(`Processing request from user ${userId} in tenant ${tenantId}`);

      // 1. Recuperar contexto relevante
      const context = await this.vectorMemoryService.findRelevantContext(
        tenantId,
        userId,
        input.text,
        5,
        input.channel
      );

      // 2. Analizar intención usando LLM
      const intent = await this.analyzeIntent(input.text, context);

      // 3. Guardar la interacción en memoria vectorial
      await this.vectorMemoryService.saveInteraction(
        tenantId,
        userId,
        input.channel,
        input.text,
        'user',
        {
          sessionId: input.sessionId,
          intent: intent.type,
          ...input.metadata
        }
      );

      // 4. Ejecutar acción según la intención
      let response: SecretaryResponse;

      switch (intent.type) {
        case 'INIT_TOOL':
          response = await this.handleInitTool(intent.tool || '', input);
          break;
        case 'EXECUTE_TASK':
          response = await this.handleExecuteTask(intent.task || '', input, context);
          break;
        case 'CHAT':
          response = await this.handleChat(input.text, context);
          break;
        default:
          response = await this.handleChat(input.text, context);
      }

      // 5. Guardar respuesta del sistema
      await this.vectorMemoryService.saveInteraction(
        tenantId,
        userId,
        input.channel,
        response.content || '',
        'assistant',
        {
          sessionId: input.sessionId,
          action: response.action,
          tool: response.tool,
          jobId: response.jobId
        }
      );

      return response;
    } catch (error) {
      this.logger.error(`Error processing user request: ${error.message}`);
      return {
        action: 'CHAT',
        content: 'Lo siento, ocurrió un error al procesar tu solicitud. Por favor intenta nuevamente.'
      };
    }
  }

  /**
   * Analiza la intención del usuario usando Azure OpenAI
   */
  private async analyzeIntent(text: string, context: any[]): Promise<{ type: string; tool?: string; task?: string }> {
    try {
      const contextSummary = context.map(c => c.content).join('\n');
      
      const prompt = `
      Analiza la siguiente solicitud del usuario y determina la intención:
      
      Texto del usuario: "${text}"
      
      Contexto reciente:
      ${contextSummary}
      
      Determina una de estas acciones:
      - INIT_TOOL: Si el usuario quiere iniciar una herramienta (video, análisis web, etc.)
      - EXECUTE_TASK: Si el usuario quiere ejecutar una tarea específica
      - CHAT: Si es una conversación general
      
      Responde SOLO con un JSON en este formato:
      {
        "type": "INIT_TOOL|EXECUTE_TASK|CHAT",
        "tool": "nombre_de_la_herramienta_si_aplica",
        "task": "descripcion_de_la_tarea_si_aplica"
      }
      `;

      const completion = await this.azureClient.chat.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 200
      });

      const response = completion.choices[0]?.message?.content;
      
      if (response) {
        try {
          return JSON.parse(response);
        } catch (parseError) {
          this.logger.warn('Failed to parse LLM response, using default');
        }
      }

      // Fallback por seguridad
      return { type: 'CHAT' };
    } catch (error) {
      this.logger.error(`Intent analysis failed: ${error.message}`);
      return { type: 'CHAT' }; // Fallback seguro
    }
  }

  /**
   * Maneja la inicialización de herramientas
   */
  private async handleInitTool(tool: string, input: UserInput): Promise<SecretaryResponse> {
    const toolMap: Record<string, string> = {
      'video': 'VIDEO',
      'vídeo': 'VIDEO',
      'crear video': 'VIDEO',
      'generar video': 'VIDEO',
      'website': 'WEBSITE_ANALYSIS',
      'sitio web': 'WEBSITE_ANALYSIS',
      'analizar web': 'WEBSITE_ANALYSIS',
      'viral': 'VIRAL_PIPELINE',
      'contenido viral': 'VIRAL_PIPELINE'
    };

    const normalizedTool = toolMap[tool?.toLowerCase()] || 'VIDEO';

    return {
      action: 'UI_RENDER_NODE',
      tool: normalizedTool,
      content: `Inicializando herramienta ${normalizedTool}`,
      data: {
        type: normalizedTool,
        status: 'initializing',
        userInput: input.text
      }
    };
  }

  /**
   * Maneja la ejecución de tareas
   */
  private async handleExecuteTask(task: string, input: UserInput, context: any[]): Promise<SecretaryResponse> {
    // Aquí iría la lógica para ejecutar tareas específicas
    // Por ahora simulamos con placeholders
    
    if (task?.includes('video')) {
      const jobId = `video_${Date.now()}`;
      return {
        action: 'EXECUTE_TASK',
        tool: 'VIDEO',
        jobId,
        content: 'Iniciando generación de video...',
        data: {
          jobId,
          status: 'processing',
          estimatedTime: '2-3 minutos'
        }
      };
    }

    return {
      action: 'CHAT',
      content: 'Tarea ejecutada correctamente'
    };
  }

  /**
   * Maneja conversaciones generales
   */
  private async handleChat(text: string, context: any[]): Promise<SecretaryResponse> {
    // Aquí iría la lógica de chat con contexto
    return {
      action: 'CHAT',
      content: `Entendido: "${text}". ¿En qué más puedo ayudarte?`
    };
  }
}