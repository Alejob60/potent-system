import { Injectable, Logger } from '@nestjs/common';
import { SessionContextEntity } from '../entities/session-context.entity';
import { ChatMessage } from './azure-openai-gpt5.service';
import { CommercialConversationPromptService, UserFlowContext } from './commercial-conversation-prompt.service';

export interface TenantADN {
  businessProfile?: {
    name: string;
    description: string;
    industry: string;
    tone: string; // 'professional' | 'casual' | 'friendly' | 'formal'
  };
  brandingConfig?: {
    values: string[];
    communicationStyle: string;
  };
  policies?: {
    safetyGuidelines: string[];
    prohibitedTopics: string[];
    escalationRules: string[];
  };
  // NEW: Commercial conversation mode
  commercialMode?: {
    enabled: boolean;
    catalogAvailable: boolean;
    userFlowContext?: UserFlowContext;
  };
}

export interface RetrievedDocument {
  text: string;
  score: number;
  metadata?: {
    source?: string;
    category?: string;
    lang?: string;
  };
}

@Injectable()
export class PromptBuilderService {
  private readonly logger = new Logger(PromptBuilderService.name);
  private readonly maxPromptTokens = 8000; // Límite seguro para GPT-5
  private readonly commercialPromptService: CommercialConversationPromptService;
  
  constructor() {
    this.commercialPromptService = new CommercialConversationPromptService();
  }
  private readonly safetyPolicy = `
DIRECTRICES DE SEGURIDAD Y COMPORTAMIENTO:

1. RESPETO Y PROFESIONALISMO
   - Mantén un tono respetuoso y profesional en todo momento
   - No uses lenguaje ofensivo, discriminatorio o inapropiado
   - Trata a todos los usuarios con cortesía y empatía

2. PRIVACIDAD Y DATOS SENSIBLES
   - No solicites ni compartas información personal sensible innecesariamente
   - No reveles datos confidenciales de otros usuarios o del sistema
   - Respeta la privacidad del usuario en todo momento

3. SEGURIDAD
   - Si detectas intención maliciosa o peligrosa, declina cortésmente
   - No proporciones instrucciones que puedan causar daño
   - Si el usuario solicita algo fuera de tu alcance, explica las limitaciones

4. HONESTIDAD Y TRANSPARENCIA
   - Si no estás seguro de una respuesta, admítelo
   - No inventes información o datos
   - Reconoce tus limitaciones como IA

5. ESCALACIÓN
   - Si la consulta requiere intervención humana, sugiere contactar soporte
   - Si detectas urgencia o emergencia, prioriza la derivación apropiada
   - Mantén registro de interacciones para mejora continua
`;

  /**
   * Build complete prompt messages for GPT-5
   * @param tenantADN Tenant DNA and configuration
   * @param sessionContext Current session context
   * @param retrievedDocs Documents from vector search
   * @param userMessage Current user message
   * @returns Array of chat messages
   */
  buildPrompt(
    tenantADN: TenantADN,
    sessionContext: SessionContextEntity,
    retrievedDocs: RetrievedDocument[],
    userMessage: string
  ): ChatMessage[] {
    this.logger.debug(`Building prompt for tenant: ${sessionContext.tenantId}`);

    // 1. Build system prompt
    const systemPrompt = this.buildSystemPrompt(tenantADN);

    // 2. Build context prompt with retrieved docs
    const contextPrompt = this.buildContextPrompt(retrievedDocs, sessionContext);

    // 3. Build conversation history
    const conversationHistory = this.buildConversationHistory(sessionContext);

    // 4. Assemble all messages
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Add context if available
    if (contextPrompt) {
      messages.push({ role: 'system', content: contextPrompt });
    }

    // Add conversation history
    messages.push(...conversationHistory);

    // Add current user message
    messages.push({ role: 'user', content: userMessage });

    // 5. Guard against token overflow
    const guardedMessages = this.guardTokenLimit(messages);

    this.logger.debug(
      `Prompt built with ${guardedMessages.length} messages. Estimated tokens: ${this.estimateTokens(guardedMessages)}`
    );

    return guardedMessages;
  }

  /**
   * Build system prompt with tenant ADN and safety policy
   */
  private buildSystemPrompt(tenantADN: TenantADN): string {
    // Check if commercial conversation mode is enabled
    if (tenantADN.commercialMode?.enabled) {
      return this.buildCommercialSystemPrompt(tenantADN);
    }
    
    // Default system prompt
    const businessName = tenantADN.businessProfile?.name || 'nuestra plataforma';
    const businessDescription = tenantADN.businessProfile?.description || 
      'Soy un asistente de IA diseñado para ayudarte con tus consultas.';
    const tone = tenantADN.businessProfile?.tone || 'friendly';

    let systemPrompt = `Eres un asistente de IA para ${businessName}.

${businessDescription}

PERSONALIDAD Y TONO:
- Tono de comunicación: ${this.getToneDescription(tone)}
- Mantén una actitud ${tone === 'professional' ? 'profesional y directa' : 'amigable y cercana'}
${tenantADN.brandingConfig?.communicationStyle ? `- Estilo de comunicación: ${tenantADN.brandingConfig.communicationStyle}` : ''}
`;

    // Add brand values if available
    if (tenantADN.brandingConfig?.values && tenantADN.brandingConfig.values.length > 0) {
      systemPrompt += `\nVALORES DE LA MARCA:
${tenantADN.brandingConfig.values.map(v => `- ${v}`).join('\n')}
`;
    }

    // Add custom safety guidelines if available
    if (tenantADN.policies?.safetyGuidelines && tenantADN.policies.safetyGuidelines.length > 0) {
      systemPrompt += `\nPOLÍTICAS ESPECÍFICAS:
${tenantADN.policies.safetyGuidelines.map(g => `- ${g}`).join('\n')}
`;
    }

    // Add prohibited topics if available
    if (tenantADN.policies?.prohibitedTopics && tenantADN.policies.prohibitedTopics.length > 0) {
      systemPrompt += `\nTEMAS PROHIBIDOS (declina cortésmente si se solicita):
${tenantADN.policies.prohibitedTopics.map(t => `- ${t}`).join('\n')}
`;
    }

    // Add standard safety policy
    systemPrompt += `\n${this.safetyPolicy}`;

    // Add escalation rules if available
    if (tenantADN.policies?.escalationRules && tenantADN.policies.escalationRules.length > 0) {
      systemPrompt += `\nREGLAS DE ESCALACIÓN:
${tenantADN.policies.escalationRules.map(r => `- ${r}`).join('\n')}
`;
    }

    // Add action format instruction
    systemPrompt += `\n
FORMATO DE ACCIONES:
Si necesitas ejecutar una acción (crear orden, generar video, etc.), incluye en tu respuesta:
<ACTION>{"type":"tipo_accion","params":{...},"target":"servicio_destino"}</ACTION>

Tipos de acciones disponibles:
- create_order: Crear una orden de compra
- generate_video: Generar un video
- schedule_post: Programar una publicación
- initiate_call: Iniciar una llamada
- escalate_to_human: Escalar a agente humano

IMPORTANTE: Solo incluye acciones cuando sea absolutamente necesario y el usuario haya confirmado.
`;

    return systemPrompt;
  }

  /**
   * Build commercial conversation system prompt
   */
  private buildCommercialSystemPrompt(tenantADN: TenantADN): string {
    const businessName = tenantADN.businessProfile?.name || 'ColombiaTIC AI Ecosystem';
    const userFlowContext = tenantADN.commercialMode?.userFlowContext || {
      isAuthenticated: false,
      currentLocation: 'landing' as const,
      intent: 'explore' as const
    };

    // Generate commercial prompt using specialized service
    let commercialPrompt = this.commercialPromptService.generateCommercialPrompt(
      businessName,
      userFlowContext
    );

    // Add context enhancement
    commercialPrompt += this.commercialPromptService.getContextEnhancement(userFlowContext);

    // Add standard safety policy
    commercialPrompt += `\n\n${this.safetyPolicy}`;

    this.logger.debug(`Commercial conversation prompt generated for tenant: ${businessName}`);

    return commercialPrompt;
  }

  /**
   * Build context prompt from retrieved documents
   */
  private buildContextPrompt(
    retrievedDocs: RetrievedDocument[],
    sessionContext: SessionContextEntity
  ): string {
    if (retrievedDocs.length === 0) {
      return '';
    }

    let contextPrompt = 'CONTEXTO RELEVANTE DE LA BASE DE CONOCIMIENTO:\n\n';

    // Add retrieved documents
    retrievedDocs.forEach((doc, idx) => {
      const source = doc.metadata?.source || 'knowledge_base';
      const score = (doc.score * 100).toFixed(1);
      
      contextPrompt += `[Documento ${idx + 1}] (Relevancia: ${score}%, Fuente: ${source})\n`;
      contextPrompt += `${doc.text}\n\n`;
    });

    // Add session state information
    const state = sessionContext.shortContext.conversationState;
    const lastIntent = sessionContext.shortContext.lastIntent;

    contextPrompt += `ESTADO DE LA CONVERSACIÓN:
- Estado actual: ${this.translateState(state)}
- Última intención detectada: ${lastIntent}
- Canal de comunicación: ${sessionContext.channel}
- Número de turnos en esta sesión: ${sessionContext.turnCount}

Usa esta información para mantener coherencia en la conversación y proporcionar respuestas contextualizadas.
`;

    return contextPrompt;
  }

  /**
   * Build conversation history from recent turns
   */
  private buildConversationHistory(sessionContext: SessionContextEntity): ChatMessage[] {
    const messages: ChatMessage[] = [];
    
    // Get last 5 turns (configurable)
    const recentTurns = sessionContext.recentTurns.slice(-5);
    
    for (const turn of recentTurns) {
      messages.push({
        role: turn.role as 'user' | 'assistant',
        content: turn.text
      });
    }

    return messages;
  }

  /**
   * Guard against token limit overflow
   */
  private guardTokenLimit(messages: ChatMessage[]): ChatMessage[] {
    const estimatedTokens = this.estimateTokens(messages);

    if (estimatedTokens <= this.maxPromptTokens) {
      return messages;
    }

    this.logger.warn(
      `Prompt exceeds token limit (${estimatedTokens} > ${this.maxPromptTokens}). Truncating...`
    );

    // Strategy: Keep system prompts, truncate conversation history
    const systemMessages = messages.filter(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    // Always keep the last user message
    const lastUserMessage = userMessages[userMessages.length - 1];
    const historyMessages = userMessages.slice(0, -1);

    // Truncate history from the beginning
    let truncatedHistory = historyMessages;
    let currentTokens = this.estimateTokens([...systemMessages, ...truncatedHistory, lastUserMessage]);

    while (currentTokens > this.maxPromptTokens && truncatedHistory.length > 0) {
      // Remove oldest message
      truncatedHistory = truncatedHistory.slice(1);
      currentTokens = this.estimateTokens([...systemMessages, ...truncatedHistory, lastUserMessage]);
    }

    this.logger.debug(
      `Truncated ${historyMessages.length - truncatedHistory.length} messages to fit token limit`
    );

    return [...systemMessages, ...truncatedHistory, lastUserMessage];
  }

  /**
   * Estimate token count (rough approximation)
   * Real implementation should use tiktoken library
   */
  private estimateTokens(messages: ChatMessage[]): number {
    let totalTokens = 0;

    for (const message of messages) {
      // Rough estimation: 1 token ≈ 4 characters
      // Add overhead for message formatting
      totalTokens += Math.ceil(message.content.length / 4) + 4;
    }

    return totalTokens;
  }

  /**
   * Get tone description in Spanish
   */
  private getToneDescription(tone: string): string {
    const toneMap: Record<string, string> = {
      professional: 'Profesional y directo',
      casual: 'Casual y relajado',
      friendly: 'Amigable y cercano',
      formal: 'Formal y respetuoso',
      enthusiastic: 'Entusiasta y motivador'
    };

    return toneMap[tone] || 'Amigable y profesional';
  }

  /**
   * Translate conversation state to Spanish
   */
  private translateState(state: string): string {
    const stateMap: Record<string, string> = {
      greeting: 'Saludo inicial',
      information_gathering: 'Recolectando información',
      processing: 'Procesando solicitud',
      closing: 'Finalizando conversación',
      escalated: 'Escalado a humano'
    };

    return stateMap[state] || state;
  }

  /**
   * Extract action instructions from prompt if needed
   */
  buildActionGuidance(availableActions: string[]): string {
    if (availableActions.length === 0) {
      return '';
    }

    return `\nACCIONES DISPONIBLES PARA ESTA SESIÓN:
${availableActions.map(action => `- ${action}`).join('\n')}

Recuerda: Solo ejecuta acciones cuando el usuario lo confirme explícitamente.
`;
  }

  /**
   * Build prompt for intent classification (helper)
   */
  buildIntentClassificationPrompt(userMessage: string): ChatMessage[] {
    return [
      {
        role: 'system',
        content: `Eres un clasificador de intenciones. Analiza el mensaje del usuario y clasifica su intención principal.

Intenciones posibles:
- product_inquiry: Consulta sobre productos/servicios
- checkout_flow: Proceso de compra/checkout
- support_request: Solicitud de soporte técnico
- information_request: Solicitud de información general
- complaint: Queja o reclamo
- greeting: Saludo o inicio de conversación
- farewell: Despedida
- other: Otra intención

Responde SOLO con el nombre de la intención, sin explicaciones adicionales.`
      },
      {
        role: 'user',
        content: userMessage
      }
    ];
  }
}
