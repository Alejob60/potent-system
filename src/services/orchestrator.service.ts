import { Injectable, Logger } from '@nestjs/common';
import { KnowledgeService } from './knowledge/knowledge.service';
import { AzureProxyService } from './azure-proxy.service';
import { AzureCognitiveClient } from '../lib/azure-cognitive';
import { ToolRegistryService } from '../tools/registry.service';

const MARKETING_SYSTEM_PROMPT = `
Eres MisyBot Enterprise, un Director de Marketing Digital Senior.
TU OBJETIVO: Generar ESTRATEGIAS DE VENTA completas y accionables.

REGLAS DE FORMATO OBLIGATORIAS:
1. Usa EMOJIS en todos los puntos clave.
2. Si el usuario pide vender algo, genera un CALENDARIO TÁCTICO usando una TABLA Markdown.
3. Estructura los textos de venta con el método AIDA (Atención, Interés, Deseo, Acción).
4. Sé proactivo: No preguntes "¿qué quieres?", propón un plan.

TU TONO:
Profesional, experto, orientado a resultados (ROAS), pero cercano.
`;

const DEMO_CONTEXT = `
[CONTEXTO DE NEGOCIO ACTIVO - MODO DEMO]
- Negocio: "Calzado El Comandante" (Tienda de Botas de Cuero).
- Producto Estrella: Botas Todo-Terreno "Indestructibles".
- Precio: $150.000 COP.
- Promoción Vigente: Envío Gratis + 10% Descuento si compran en 24h.
- Público Objetivo: Hombres trabajadores, motociclistas, ingenieros.
`;

@Injectable()
export class OrchestratorService {
  private readonly logger = new Logger(OrchestratorService.name);

  constructor(
    private readonly knowledgeService: KnowledgeService,
    private readonly azureProxy: AzureProxyService,
    private readonly toolRegistry: ToolRegistryService,
  ) {}

  /**
   * Main logic for MetaOS: Intent -> Knowledge -> Tools/Azure Proxy -> UI Action
   */
  async processInteractiveIntent(params: {
    userId: string;
    tenantId: string;
    message: string;
    token: string;
  }) {
    const { userId, tenantId, message, token } = params;
    this.logger.log(`Orchestrating intent for user: ${userId}`);

    // 1. RAG: Buscar contexto en MongoDB Vectorial
    const relevantKnowledge = await this.knowledgeService.findRelevant({
      userId,
      tenantId,
      query: message,
    });

    // 2. Analizar Intención con LLM y Tools (Azure OpenAI)
    const response = await this.analyzeWithTools(message, relevantKnowledge, tenantId, userId, token);

    // 3. Formatear respuesta estandarizada para la UI de MetaOS
    return {
      text: response.text,
      intent: response.uiIntent || 'NONE',
      payload: response.uiPayload || {},
      relevantKnowledge: relevantKnowledge.map(k => ({ source: k.source, snippet: k.text.substring(0, 100) }))
    };
  }

  private async analyzeWithTools(message: string, knowledge: any[], tenantId: string, userId: string, token: string) {
    const openai = AzureCognitiveClient.getOpenAIClient();
    const contextStr = knowledge.map(k => k.text).join('\n---\n');
    const tools = this.toolRegistry.getToolDefinitionsForOpenAI();

    const messages: any[] = [
      {
        role: 'system',
        content: `${MARKETING_SYSTEM_PROMPT}\n\n--- DATOS DE MEMORIA ---\n${contextStr}\n\n${DEMO_CONTEXT}`
      },
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
      messages,
      tools: tools as any[],
      tool_choice: 'auto',
    });

    const responseMessage = completion.choices[0].message;

    if (responseMessage.tool_calls) {
      this.logger.log(`IA decided to call tools: ${responseMessage.tool_calls.length}`);
      
      const toolResults: any[] = [];
      for (const toolCall of responseMessage.tool_calls) {
        if (toolCall.type !== 'function') continue;
        
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        
        const result = await this.toolRegistry.executeTool(
          functionName,
          functionArgs,
          tenantId,
          userId,
          token
        );
        
        toolResults.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          name: functionName,
          content: JSON.stringify(result),
        });
      }

      // Volver a llamar al LLM con los resultados de las herramientas
      const secondResponse = await openai.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
        messages: [...messages, responseMessage, ...toolResults] as any[],
      });

      return {
        text: secondResponse.choices[0].message.content || '',
        uiIntent: 'UI_SHOW_STRATEGY',
        uiPayload: { results: toolResults.map(r => JSON.parse(r.content)) }
      };
    }

    return {
      text: responseMessage.content,
      uiIntent: 'NONE',
      uiPayload: {}
    };
  }
}
