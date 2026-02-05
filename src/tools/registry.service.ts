import { Injectable, Logger } from '@nestjs/common';
import { ToolDefinition } from './tools.interface';
import { AzureProxyService } from '../services/azure-proxy.service';
import { PipelineService, PipelineStep } from '../services/pipeline.service';
import { AutoOptimizationService } from '../agents/auto-optimization/services/auto-optimization.service';
import { InstagramViralService } from '../agents/viral-content-generator/services/instagram-viral.service';
import { LinkedInViralService } from '../agents/viral-content-generator/services/linkedin-viral.service';
import { WorkflowAutomationService } from '../agents/viral-content-generator/services/workflow-automation.service';

@Injectable()
export class ToolRegistryService {
  private readonly logger = new Logger(ToolRegistryService.name);
  private tools: Map<string, ToolDefinition> = new Map();

  constructor(
    private readonly azureProxy: AzureProxyService,
    private readonly pipelineService: PipelineService,
    private readonly autoOptAgent: AutoOptimizationService,
    private readonly igViralAgent: InstagramViralService,
    private readonly liViralAgent: LinkedInViralService,
    private readonly automationAgent: WorkflowAutomationService,
  ) {
    this.registerDefaultTools();
  }

  private registerDefaultTools() {
    this.registerTool({
      name: 'qualify_lead',
      description: 'Analiza datos de un prospecto y lo califica (Caliente/Tibio/Frío) integrándolo con el CRM.',
      parameters: {
        type: 'object',
        properties: {
          leadData: { type: 'object', description: 'Datos del lead (email, empresa, interés).' },
        },
        required: ['leadData'],
      },
      execute: async (params, tenantId) => {
        return this.automationAgent.qualifyLead({ tenantId, leadData: params.leadData });
      },
    });

    this.registerTool({
      name: 'process_document_automation',
      description: 'Extrae inteligencia de PDFs o Resumes y los categoriza automáticamente.',
      parameters: {
        type: 'object',
        properties: {
          documentUrl: { type: 'string', description: 'URL del documento a procesar.' },
        },
        required: ['documentUrl'],
      },
      execute: async (params, tenantId) => {
        return this.automationAgent.processDocument({ tenantId, documentUrl: params.documentUrl });
      },
    });

    this.registerTool({
      name: 'whatsapp_sales_closing',
      description: 'Genera mensajes de cierre persuasivos para WhatsApp basados en el historial del chat.',
      parameters: {
        type: 'object',
        properties: {
          chatHistory: { type: 'string', description: 'Últimos mensajes de la conversación.' },
        },
        required: ['chatHistory'],
      },
      execute: async (params, tenantId) => {
        return this.automationAgent.generateWhatsAppClosing({ tenantId, chatHistory: params.chatHistory });
      },
    });

    this.registerTool({
      name: 'generate_linkedin_strategy',
      description: 'Genera una estrategia de interacción y contenido para LinkedIn para viralizar la marca.',
      parameters: {
        type: 'object',
        properties: {
          targetAudience: { type: 'string', description: 'Público objetivo en LinkedIn.' },
        },
        required: ['targetAudience'],
      },
      execute: async (params, tenantId) => {
        return this.liViralAgent.execute({ tenantId, targetAudience: params.targetAudience });
      },
    });

    this.registerTool({
      name: 'generate_instagram_viral',
      description: 'Genera contenido viral para Instagram basado en tendencias actuales usando GPT-4o Vision y Flux.',
      parameters: {
        type: 'object',
        properties: {
          hashtag: { type: 'string', description: 'Hashtag de tendencia a analizar.' },
        },
        required: ['hashtag'],
      },
      execute: async (params, tenantId) => {
        return this.igViralAgent.execute({ tenantId, hashtag: params.hashtag });
      },
    });

    this.registerTool({
      name: 'optimize_viral_strategy',
      description: 'Aprende de los contenidos pasados para optimizar la próxima estrategia de marketing.',
      parameters: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'El tema para el cual optimizar.' },
        },
        required: ['topic'],
      },
      execute: async (params, tenantId) => {
        return this.autoOptAgent.execute({ tenantId, topic: params.topic });
      },
    });

    this.registerTool({
      name: 'analyze_trends',
      description: 'Analiza las tendencias actuales en redes sociales y buscadores para un tema específico.',
      parameters: {
        type: 'object',
        properties: {
          topic: {
            type: 'string',
            description: 'El tema sobre el cual buscar tendencias.',
          },
        },
        required: ['topic'],
      },
      execute: async (params, tenantId, userId, token) => {
        this.logger.log(`Executing analyze_trends for topic: ${params.topic}`);
        return this.azureProxy.callAzureEndpoint(
          'get',
          `/api/trends?topic=${encodeURIComponent(params.topic)}&tenantId=${tenantId}`,
          null,
          token,
        );
      },
    });

    this.registerTool({
      name: 'start_production_pipeline',
      description: 'Inicia la tubería de producción viral (Guion -> Voz -> Video -> Caption).',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          concept: { type: 'string' },
        },
        required: ['title', 'concept'],
      },
      execute: async (params, tenantId, userId, token) => {
        this.logger.log(`Starting production pipeline for: ${params.title}`);
        const wo = await this.pipelineService.createWorkOrder(tenantId, userId, params.title);
        
        // Simular inicio del primer paso en Azure
        this.azureProxy.callAzureEndpoint('post', '/api/production/start', { 
          workOrderId: wo.id,
          ...params 
        }, token).catch(e => this.logger.error(`Initial Azure call failed: ${e.message}`));

        return {
          message: `Pipeline iniciado. Orden de Trabajo: ${wo.id}`,
          workOrderId: wo.id,
          currentStep: wo.currentStep,
          status: 'Started'
        };
      },
    });

    this.registerTool({
      name: 'get_pipeline_status',
      description: 'Consulta el estado actual de una orden de producción.',
      parameters: {
        type: 'object',
        properties: {
          workOrderId: { type: 'string' },
        },
        required: ['workOrderId'],
      },
      execute: async (params) => {
        const wo = await this.pipelineService.getWorkOrder(params.workOrderId);
        if (!wo) return { error: 'Orden no encontrada' };
        
        const stepNum = this.pipelineService.getStepNumber(wo.currentStep);
        return {
          workOrderId: wo.id,
          statusText: `Estoy en el paso ${stepNum} de ${wo.totalSteps} (${wo.currentStep})`,
          currentStep: wo.currentStep,
          details: wo.steps[wo.currentStep]
        };
      },
    });
  }

  registerTool(tool: ToolDefinition) {
    this.tools.set(tool.name, tool);
    this.logger.log(`Registered tool: ${tool.name}`);
  }

  getToolDefinitionsForOpenAI() {
    return Array.from(this.tools.values()).map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }

  async executeTool(name: string, params: any, tenantId: string, userId: string, token: string) {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }
    return tool.execute(params, tenantId, userId, token);
  }
}
