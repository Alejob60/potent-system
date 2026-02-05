import { Injectable, Logger } from '@nestjs/common';
import {
  SessionContext,
  UserPreferences,
} from '../state/state-management.service';

export interface DecisionInput {
  message: string;
  context: SessionContext & { 
    siteType?: string; 
    products?: string[]; 
    services?: string[];
    origin?: string;
    websiteUrl?: string;
  };
  conversationHistory: Array<{ content: string; type: string; agent?: string }>;
  userPreferences: UserPreferences;
}

export interface AgentDecision {
  primaryAgent: string;
  supportingAgents: string[];
  confidence: number;
  reasoning: string;
  taskType:
    | 'single_post'
    | 'campaign'
    | 'media_generation'
    | 'analysis'
    | 'planning'
    | 'sales_inquiry'
    | 'product_info'
    | 'service_info'
    | 'website_analysis';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedDuration: number; // minutes
  requiredResources: string[];
}

export interface IntentAnalysis {
  intent: string;
  entities: { [key: string]: string };
  sentiment: 'positive' | 'neutral' | 'negative';
  urgency: number; // 0-10
  complexity: number; // 0-10
}

@Injectable()
export class AIDecisionEngine {
  private readonly logger = new Logger(AIDecisionEngine.name);

  // Keywords and patterns for intent recognition
  private readonly intentPatterns = {
    campaign: [
      'campa a',
      'campaign',
      'estrategia',
      'strategy',
      'plan de marketing',
      'marketing plan',
      'serie de posts',
      'multiple posts',
      'calendario',
      'schedule',
      'planificar',
      'organize',
    ],
    single_post: [
      'post',
      'publicaci n',
      'contenido',
      'content',
      'imagen',
      'image',
      'foto',
      'photo',
      'texto',
      'text',
      'ahora',
      'now',
      'r pido',
      'quick',
    ],
    media_generation: [
      'video',
      'audio',
      'imagen',
      'image',
      'crear',
      'generate',
      'generar',
      'producir',
      'produce',
      'dise ar',
      'design',
      'multimedia',
    ],
    analysis: [
      'analizar',
      'analyze',
      'reportar',
      'report',
      'estad sticas',
      'stats',
      'm tricas',
      'metrics',
      'rendimiento',
      'performance',
      'resultados',
    ],
    planning: [
      'planear',
      'plan',
      'organizar',
      'organize',
      'programar',
      'schedule',
      'calendario',
      'calendar',
      'fechas',
      'dates',
      'tiempo',
      'timing',
    ],
    sales_inquiry: [
      'comprar',
      'buy',
      'precio',
      'price',
      'costo',
      'cost',
      'presupuesto',
      'budget',
      'cotizaci n',
      'quote',
      'venta',
      'sale',
      'sitio web',
      'website',
      'desarrollo',
      'development',
      'cuanto',
      'how much',
      'interesado',
      'interested',
      'contratar',
      'hire',
      'necesito',
      'need',
    ],
    product_info: [
      'producto',
      'product',
      'servicio',
      'service',
      'caracter stica',
      'feature',
      'beneficio',
      'benefit',
      'detalles',
      'details',
      'informaci n',
      'information',
      'qu  es',
      'what is',
      'c mo funciona',
      'how does it work',
    ],
    service_info: [
      'servicio',
      'service',
      'soporte',
      'support',
      'ayuda',
      'help',
      'asistencia',
      'assistance',
      'mantenimiento',
      'maintenance',
      'actualizaci n',
      'update',
      'problema',
      'problem',
      'error',
    ],
    website_analysis: [
      'analizar sitio',
      'analyze website',
      'revisar sitio',
      'review website',
      'optimizar',
      'optimize',
      'seo',
      'posicionamiento',
      'ranking',
      'rendimiento',
      'performance',
      'velocidad',
      'speed',
    ],
  };

  private readonly channelPatterns = {
    instagram: ['instagram', 'ig', 'insta', 'stories', 'reels'],
    facebook: ['facebook', 'fb', 'meta'],
    twitter: ['twitter', 'x', 'tweet', 'tweets'],
    tiktok: ['tiktok', 'tik tok'],
    linkedin: ['linkedin', 'professional'],
    youtube: ['youtube', 'video', 'canal'],
  };

  private readonly agentCapabilities = {
    'trend-scanner': {
      capabilities: [
        'trend_analysis',
        'market_research',
        'competitor_analysis',
        'website_analysis',
      ],
      bestFor: ['analysis', 'planning', 'campaign', 'website_analysis'],
      processingTime: 5,
    },
    'video-scriptor': {
      capabilities: ['video_scripts', 'story_creation', 'content_writing'],
      bestFor: ['media_generation', 'single_post', 'campaign'],
      processingTime: 8,
    },
    'faq-responder': {
      capabilities: ['customer_service', 'quick_responses', 'information'],
      bestFor: ['single_post', 'analysis', 'product_info', 'service_info'],
      processingTime: 3,
    },
    'post-scheduler': {
      capabilities: [
        'scheduling',
        'calendar_management',
        'timing_optimization',
      ],
      bestFor: ['planning', 'campaign'],
      processingTime: 4,
    },
    'analytics-reporter': {
      capabilities: ['performance_analysis', 'reporting', 'metrics', 'website_analysis'],
      bestFor: ['analysis', 'website_analysis'],
      processingTime: 6,
    },
    'sales-assistant': {
      capabilities: ['lead_qualification', 'sales_recommendations', 'pricing_info', 'product_knowledge'],
      bestFor: ['sales_inquiry', 'product_info', 'service_info'],
      processingTime: 5,
    },
    'customer-support': {
      capabilities: ['customer_service', 'troubleshooting', 'faq', 'technical_support'],
      bestFor: ['service_info', 'product_info', 'website_analysis'],
      processingTime: 4,
    },
    'marketing-automation': {
      capabilities: ['campaign_management', 'lead_nurturing', 'email_marketing'],
      bestFor: ['campaign', 'sales_inquiry'],
      processingTime: 7,
    },
  };

  async analyzeIntent(input: DecisionInput): Promise<IntentAnalysis> {
    const message = input.message.toLowerCase();

    // Detect intent based on keywords
    let detectedIntent = 'single_post'; // default
    let maxScore = 0;

    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      const score = patterns.filter((pattern) =>
        message.includes(pattern),
      ).length;
      if (score > maxScore) {
        maxScore = score;
        detectedIntent = intent;
      }
    }

    // Extract entities (channels, dates, etc.)
    const entities: { [key: string]: string } = {};

    // Detect channels
    const detectedChannels: string[] = [];
    for (const [channel, patterns] of Object.entries(this.channelPatterns)) {
      if (patterns.some((pattern) => message.includes(pattern))) {
        detectedChannels.push(channel);
      }
    }
    if (detectedChannels.length > 0) {
      entities.channels = detectedChannels.join(',');
    }

    // Detect urgency keywords
    const urgencyKeywords = [
      'urgente',
      'urgent',
      'ahora',
      'now',
      'r pido',
      'quick',
      'ya',
      'immediately',
      'hoy',
      'today',
      'inmediato',
      'asap',
    ];
    const urgency = urgencyKeywords.some((keyword) => message.includes(keyword))
      ? 8
      : 5;

    // Detect complexity based on message length and context
    const complexity = this.calculateComplexity(input);

    // Simple sentiment analysis
    const positiveWords = [
      'excelente',
      'genial',
      'perfecto',
      'bien',
      'good',
      'great',
      'excellent',
      'gracias',
      'thank you',
      'satisfecho',
      'satisfied',
    ];
    const negativeWords = [
      'malo',
      'error',
      'problema',
      'bad',
      'problem',
      'issue',
      'frustrado',
      'frustrated',
      'enojado',
      'angry',
    ];

    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (positiveWords.some((word) => message.includes(word))) {
      sentiment = 'positive';
    } else if (negativeWords.some((word) => message.includes(word))) {
      sentiment = 'negative';
    }

    return {
      intent: detectedIntent,
      entities,
      sentiment,
      urgency,
      complexity,
    };
  }

  async makeDecision(input: DecisionInput): Promise<AgentDecision> {
    const intentAnalysis = await this.analyzeIntent(input);

    this.logger.log(`Analyzing decision for intent: ${intentAnalysis.intent}`);

    // Determine primary agent based on intent and context
    const primaryAgent = this.selectPrimaryAgent(intentAnalysis, input);

    // Determine supporting agents
    const supportingAgents = this.selectSupportingAgents(
      primaryAgent,
      intentAnalysis,
      input,
    );

    // Calculate confidence based on various factors
    const confidence = this.calculateConfidence(intentAnalysis, input);

    // Determine task type
    const taskType = this.mapIntentToTaskType(intentAnalysis.intent);

    // Determine priority
    const priority = this.calculatePriority(intentAnalysis, input);

    // Estimate duration
    const estimatedDuration = this.estimateDuration(
      primaryAgent,
      supportingAgents,
      intentAnalysis,
    );

    // Determine required resources
    const requiredResources = this.identifyRequiredResources(
      intentAnalysis,
      input,
    );

    // Generate reasoning
    const reasoning = this.generateReasoning(
      intentAnalysis,
      primaryAgent,
      supportingAgents,
      input,
    );

    return {
      primaryAgent,
      supportingAgents,
      confidence,
      reasoning,
      taskType,
      priority,
      estimatedDuration,
      requiredResources,
    };
  }

  private selectPrimaryAgent(
    intent: IntentAnalysis,
    input: DecisionInput,
  ): string {
    const { intent: intentType, entities } = intent;

    // Special handling for sales websites like colombiatic
    const isSalesWebsite = input.context?.siteType === 'colombiatic' || 
                          (input.context?.origin && input.context.origin.includes('colombiatic'));
    
    if (isSalesWebsite) {
      // For sales websites, prioritize sales-oriented agents
      if (['sales_inquiry', 'product_info', 'service_info'].includes(intentType)) {
        return 'sales-assistant'; // Prioritize sales assistant for sales-related inquiries
      }
      
      // For website analysis requests
      if (intentType === 'website_analysis') {
        // If they have products/services, use customer support for detailed info
        if (input.context?.products || input.context?.services) {
          return 'customer-support';
        }
        // Otherwise use analytics reporter for technical analysis
        return 'analytics-reporter';
      }
      
      // For other intents on sales websites, still use specialized agents
      if (intentType === 'single_post' && input.context?.products?.some(p => p.includes('content'))) {
        return 'video-scriptor'; // Content creation for websites
      }
      
      if (intentType === 'service_info') {
        return 'customer-support'; // Customer support for service inquiries
      }
    }

    // Special cases based on context
    if (input.context.campaignType === 'campaign') {
      return 'post-scheduler'; // Best for campaign coordination
    }

    if (
      entities.channels?.includes('instagram') &&
      intentType === 'media_generation'
    ) {
      return 'video-scriptor'; // Instagram often needs video content
    }

    // Check conversation history to avoid repetitive routing
    if (input.conversationHistory && input.conversationHistory.length > 0) {
      // Get the last few agent responses to avoid routing to the same agent repeatedly
      const recentAgentResponses = input.conversationHistory
        .filter(entry => entry.type === 'agent_response' && entry.agent)
        .slice(-3) // Last 3 agent responses
        .map(entry => entry.agent);
      
      // If we've been routing to the same agent repeatedly, try a different one
      if (recentAgentResponses.length >= 2) {
        const lastAgent = recentAgentResponses[recentAgentResponses.length - 1];
        const secondLastAgent = recentAgentResponses[recentAgentResponses.length - 2];
        
        // If last two agents were the same, try to select a different one
        if (lastAgent === secondLastAgent) {
          // Try to find a different agent based on intent
          const intentToAgentMap: { [key: string]: string } = {
            campaign: 'marketing-automation',
            single_post: 'faq-responder', // Try FAQ responder instead of video-scriptor
            media_generation: 'faq-responder', // Try FAQ responder instead of video-scriptor
            analysis: 'trend-scanner', // Try trend scanner instead of analytics-reporter
            planning: 'trend-scanner', // Try trend scanner instead of post-scheduler
            sales_inquiry: 'faq-responder', // Try FAQ responder instead of sales-assistant
            product_info: 'customer-support', // Try customer support instead of faq-responder
            service_info: 'faq-responder', // Try FAQ responder instead of customer-support
            website_analysis: 'trend-scanner', // Try trend scanner instead of analytics-reporter
          };
          
          const alternativeAgent = intentToAgentMap[intentType];
          if (alternativeAgent && alternativeAgent !== lastAgent) {
            return alternativeAgent;
          }
        }
      }
    }

    // Default mapping based on intent
    const intentToAgentMap: { [key: string]: string } = {
      campaign: 'marketing-automation',
      single_post: 'video-scriptor',
      media_generation: 'video-scriptor',
      analysis: 'analytics-reporter',
      planning: 'post-scheduler',
      sales_inquiry: 'sales-assistant',
      product_info: 'faq-responder',
      service_info: 'customer-support',
      website_analysis: 'analytics-reporter',
    };

    return intentToAgentMap[intentType] || 'faq-responder';
  }

  private selectSupportingAgents(
    primaryAgent: string,
    intent: IntentAnalysis,
    input: DecisionInput,
  ): string[] {
    const supportingAgents: string[] = [];

    // Special handling for sales websites
    const isSalesWebsite = input.context?.siteType === 'colombiatic' || 
                          (input.context?.origin && input.context.origin.includes('colombiatic'));
    
    if (isSalesWebsite) {
      // For sales websites, always include customer support as supporting agent
      if (primaryAgent !== 'customer-support') {
        supportingAgents.push('customer-support');
      }
      
      // Include sales assistant for complex inquiries
      if (intent.complexity > 6 && primaryAgent !== 'sales-assistant') {
        supportingAgents.push('sales-assistant');
      }
      
      // For website analysis, include trend scanner for market insights
      if (intent.intent === 'website_analysis' && primaryAgent !== 'trend-scanner') {
        supportingAgents.push('trend-scanner');
      }
    }

    // Always include trend scanner for campaigns and planning
    if (
      ['campaign', 'planning'].includes(intent.intent) &&
      primaryAgent !== 'trend-scanner'
    ) {
      supportingAgents.push('trend-scanner');
    }

    // Include analytics for performance-related tasks
    if (intent.intent === 'analysis' && primaryAgent !== 'analytics-reporter') {
      supportingAgents.push('analytics-reporter');
    }

    // Include FAQ responder for quick information needs
    if (
      intent.urgency > 7 &&
      !supportingAgents.includes('faq-responder') &&
      primaryAgent !== 'faq-responder'
    ) {
      supportingAgents.push('faq-responder');
    }

    // Include post scheduler for multi-channel tasks
    if (
      intent.entities.channels?.split(',').length > 1 &&
      primaryAgent !== 'post-scheduler'
    ) {
      supportingAgents.push('post-scheduler');
    }

    return supportingAgents;
  }

  private calculateConfidence(
    intent: IntentAnalysis,
    input: DecisionInput,
  ): number {
    let confidence = 0.7; // Base confidence

    // Increase confidence based on clear intent indicators
    if (intent.urgency > 7) confidence += 0.1;
    if (intent.entities.channels) confidence += 0.1;
    if (input.context.campaignType) confidence += 0.1;
    if (input.conversationHistory.length > 3) confidence += 0.05;

    // Decrease confidence for complex or ambiguous requests
    if (intent.complexity > 7) confidence -= 0.1;
    if (intent.sentiment === 'negative') confidence -= 0.05;

    // Increase confidence for sales websites with clear product context
    const isSalesWebsite = input.context?.siteType === 'colombiatic' || 
                          (input.context?.origin && input.context.origin.includes('colombiatic'));
    if (isSalesWebsite && (input.context?.products || input.context?.services)) {
      confidence += 0.1;
    }

    return Math.min(Math.max(confidence, 0.1), 0.95);
  }

  private mapIntentToTaskType(intent: string): AgentDecision['taskType'] {
    const mapping: { [key: string]: AgentDecision['taskType'] } = {
      campaign: 'campaign',
      single_post: 'single_post',
      media_generation: 'media_generation',
      analysis: 'analysis',
      planning: 'planning',
      sales_inquiry: 'sales_inquiry',
      product_info: 'product_info',
      service_info: 'service_info',
      website_analysis: 'website_analysis',
    };

    return mapping[intent] || 'single_post';
  }

  private calculatePriority(
    intent: IntentAnalysis,
    input: DecisionInput,
  ): AgentDecision['priority'] {
    // Special handling for sales websites
    const isSalesWebsite = input.context?.siteType === 'colombiatic' || 
                          (input.context?.origin && input.context.origin.includes('colombiatic'));
    
    if (isSalesWebsite && ['sales_inquiry', 'product_info', 'service_info'].includes(intent.intent)) {
      // Sales inquiries get higher priority on sales websites
      if (intent.urgency >= 7) return 'urgent';
      if (intent.urgency >= 5) return 'high';
    }

    if (intent.urgency >= 8) return 'urgent';
    if (intent.urgency >= 6) return 'high';
    if (intent.urgency >= 4) return 'medium';
    return 'low';
  }

  private estimateDuration(
    primaryAgent: string,
    supportingAgents: string[],
    intent: IntentAnalysis,
  ): number {
    const primaryTime =
      this.agentCapabilities[primaryAgent]?.processingTime || 5;
    const supportingTime = supportingAgents.reduce((total, agent) => {
      return total + (this.agentCapabilities[agent]?.processingTime || 3);
    }, 0);

    // Supporting agents can work in parallel, so take max instead of sum
    const maxSupportingTime =
      supportingAgents.length > 0
        ? Math.max(
            ...supportingAgents.map(
              (agent) => this.agentCapabilities[agent]?.processingTime || 3,
            ),
          )
        : 0;

    const baseTime = primaryTime + maxSupportingTime;

    // Adjust based on complexity
    const complexityMultiplier = 1 + intent.complexity / 20;

    return Math.round(baseTime * complexityMultiplier);
  }

  private identifyRequiredResources(
    intent: IntentAnalysis,
    input: DecisionInput,
  ): string[] {
    const resources: string[] = [];

    if (intent.entities.channels) {
      resources.push('social_media_apis');
    }

    if (intent.intent === 'media_generation') {
      resources.push('external_media_backend', 'token_management');
    }

    if (intent.intent === 'campaign') {
      resources.push('calendar_service', 'database_storage');
    }

    if (intent.intent === 'analysis') {
      resources.push('analytics_apis', 'database_queries');
    }

    // Special resources for sales websites
    const isSalesWebsite = input.context?.siteType === 'colombiatic' || 
                          (input.context?.origin && input.context.origin.includes('colombiatic'));
    
    if (isSalesWebsite) {
      resources.push('product_catalog', 'pricing_api');
    }

    // Resources for website analysis
    if (intent.intent === 'website_analysis') {
      resources.push('website_analysis_tools', 'seo_apis');
    }

    return resources;
  }

  /**
   * Check if tenant is a sales website
   * @param context Decision input context
   * @returns Boolean indicating if tenant is a sales website
   */
  private isSalesWebsite(context: any): boolean {
    return context?.siteType === 'colombiatic' || 
           (context?.origin && context.origin.includes('colombiatic')) ||
           (context?.siteType && context.siteType !== 'misybot-core');
  }

  /**
   * Get tenant type from context
   * @param context Decision input context
   * @returns Tenant type ('client' | 'core' | 'unknown')
   */
  private getTenantType(context: any): 'client' | 'core' | 'unknown' {
    if (context?.siteType === 'colombiatic' || 
        (context?.origin && context.origin.includes('colombiatic'))) {
      return 'client';
    }
    
    if (context?.siteType === 'misybot-core' || !context?.siteType) {
      return 'core';
    }
    
    return 'unknown';
  }

  private generateReasoning(
    intent: IntentAnalysis,
    primaryAgent: string,
    supportingAgents: string[],
    input: DecisionInput,
  ): string {
    const reasons: string[] = [];

    reasons.push(`Detected intent: ${intent.intent} with high confidence`);
    reasons.push(
      `Selected ${primaryAgent} as primary agent based on capability match`,
    );

    // Special reasoning for sales websites
    const isSalesWebsite = input.context?.siteType === 'colombiatic' || 
                          (input.context?.origin && input.context.origin.includes('colombiatic'));
    
    if (isSalesWebsite) {
      reasons.push(`Identified as sales website (${input.context?.siteType || input.context?.origin})`);
      
      if (input.context?.products) {
        reasons.push(`Available products: ${input.context.products.join(', ')}`);
      }
      
      if (input.context?.services) {
        reasons.push(`Available services: ${input.context.services.join(', ')}`);
      }
    }

    // Check conversation history for context
    if (input.conversationHistory && input.conversationHistory.length > 0) {
      const agentResponses = input.conversationHistory.filter(entry => entry.type === 'agent_response');
      if (agentResponses.length > 0) {
        const lastAgentResponse = agentResponses[agentResponses.length - 1];
        if (lastAgentResponse.agent === primaryAgent) {
          reasons.push(`Continuing conversation with ${primaryAgent} for consistency`);
        } else {
          reasons.push(`Switching to ${primaryAgent} for specialized handling of this ${intent.intent} request`);
        }
      }
    }

    if (supportingAgents.length > 0) {
      reasons.push(
        `Added supporting agents [${supportingAgents.join(', ')}] for comprehensive handling`,
      );
    }

    if (intent.urgency > 7) {
      reasons.push(
        `High urgency detected (${intent.urgency}/10) - prioritizing speed`,
      );
    }

    if (intent.entities.channels) {
      reasons.push(`Target channels identified: ${intent.entities.channels}`);
    }

    // Add context about conversation flow
    if (input.conversationHistory.length > 5) {
      reasons.push(`Ongoing conversation with ${input.conversationHistory.length} exchanges - maintaining context`);
    }

    return reasons.join('. ');
  }

  private calculateComplexity(input: DecisionInput): number {
    let complexity = 5; // Base complexity

    // Message length contributes to complexity
    if (input.message.length > 200) complexity += 2;
    if (input.message.length > 500) complexity += 2;

    // Multiple channels increase complexity
    const channelCount = Object.keys(this.channelPatterns).filter((channel) =>
      this.channelPatterns[channel].some((pattern) =>
        input.message.toLowerCase().includes(pattern),
      ),
    ).length;
    complexity += channelCount;

    // Context complexity
    if (input.context.targetChannels && input.context.targetChannels.length > 2)
      complexity += 1;
    if (input.context.campaignType === 'campaign') complexity += 2;
    if (input.conversationHistory.length > 10) complexity += 1;

    // Special complexity for sales websites
    const isSalesWebsite = input.context?.siteType === 'colombiatic' || 
                          (input.context?.origin && input.context.origin.includes('colombiatic'));
    
    if (isSalesWebsite) {
      // Sales inquiries can be complex
      const productCount = (input.context?.products?.length || 0) + (input.context?.services?.length || 0);
      if (productCount > 5) {
        complexity += 1;
      }
      if (productCount > 10) {
        complexity += 1;
      }
    }

    // Website analysis is inherently complex
    if (input.context?.websiteUrl) {
      complexity += 2;
    }

    return Math.min(complexity, 10);
  }
}