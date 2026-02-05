"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AIDecisionEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIDecisionEngine = void 0;
const common_1 = require("@nestjs/common");
let AIDecisionEngine = AIDecisionEngine_1 = class AIDecisionEngine {
    constructor() {
        this.logger = new common_1.Logger(AIDecisionEngine_1.name);
        this.intentPatterns = {
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
        this.channelPatterns = {
            instagram: ['instagram', 'ig', 'insta', 'stories', 'reels'],
            facebook: ['facebook', 'fb', 'meta'],
            twitter: ['twitter', 'x', 'tweet', 'tweets'],
            tiktok: ['tiktok', 'tik tok'],
            linkedin: ['linkedin', 'professional'],
            youtube: ['youtube', 'video', 'canal'],
        };
        this.agentCapabilities = {
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
    }
    async analyzeIntent(input) {
        const message = input.message.toLowerCase();
        let detectedIntent = 'single_post';
        let maxScore = 0;
        for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
            const score = patterns.filter((pattern) => message.includes(pattern)).length;
            if (score > maxScore) {
                maxScore = score;
                detectedIntent = intent;
            }
        }
        const entities = {};
        const detectedChannels = [];
        for (const [channel, patterns] of Object.entries(this.channelPatterns)) {
            if (patterns.some((pattern) => message.includes(pattern))) {
                detectedChannels.push(channel);
            }
        }
        if (detectedChannels.length > 0) {
            entities.channels = detectedChannels.join(',');
        }
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
        const complexity = this.calculateComplexity(input);
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
        let sentiment = 'neutral';
        if (positiveWords.some((word) => message.includes(word))) {
            sentiment = 'positive';
        }
        else if (negativeWords.some((word) => message.includes(word))) {
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
    async makeDecision(input) {
        const intentAnalysis = await this.analyzeIntent(input);
        this.logger.log(`Analyzing decision for intent: ${intentAnalysis.intent}`);
        const primaryAgent = this.selectPrimaryAgent(intentAnalysis, input);
        const supportingAgents = this.selectSupportingAgents(primaryAgent, intentAnalysis, input);
        const confidence = this.calculateConfidence(intentAnalysis, input);
        const taskType = this.mapIntentToTaskType(intentAnalysis.intent);
        const priority = this.calculatePriority(intentAnalysis, input);
        const estimatedDuration = this.estimateDuration(primaryAgent, supportingAgents, intentAnalysis);
        const requiredResources = this.identifyRequiredResources(intentAnalysis, input);
        const reasoning = this.generateReasoning(intentAnalysis, primaryAgent, supportingAgents, input);
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
    selectPrimaryAgent(intent, input) {
        const { intent: intentType, entities } = intent;
        const isSalesWebsite = input.context?.siteType === 'colombiatic' ||
            (input.context?.origin && input.context.origin.includes('colombiatic'));
        if (isSalesWebsite) {
            if (['sales_inquiry', 'product_info', 'service_info'].includes(intentType)) {
                return 'sales-assistant';
            }
            if (intentType === 'website_analysis') {
                if (input.context?.products || input.context?.services) {
                    return 'customer-support';
                }
                return 'analytics-reporter';
            }
            if (intentType === 'single_post' && input.context?.products?.some(p => p.includes('content'))) {
                return 'video-scriptor';
            }
            if (intentType === 'service_info') {
                return 'customer-support';
            }
        }
        if (input.context.campaignType === 'campaign') {
            return 'post-scheduler';
        }
        if (entities.channels?.includes('instagram') &&
            intentType === 'media_generation') {
            return 'video-scriptor';
        }
        if (input.conversationHistory && input.conversationHistory.length > 0) {
            const recentAgentResponses = input.conversationHistory
                .filter(entry => entry.type === 'agent_response' && entry.agent)
                .slice(-3)
                .map(entry => entry.agent);
            if (recentAgentResponses.length >= 2) {
                const lastAgent = recentAgentResponses[recentAgentResponses.length - 1];
                const secondLastAgent = recentAgentResponses[recentAgentResponses.length - 2];
                if (lastAgent === secondLastAgent) {
                    const intentToAgentMap = {
                        campaign: 'marketing-automation',
                        single_post: 'faq-responder',
                        media_generation: 'faq-responder',
                        analysis: 'trend-scanner',
                        planning: 'trend-scanner',
                        sales_inquiry: 'faq-responder',
                        product_info: 'customer-support',
                        service_info: 'faq-responder',
                        website_analysis: 'trend-scanner',
                    };
                    const alternativeAgent = intentToAgentMap[intentType];
                    if (alternativeAgent && alternativeAgent !== lastAgent) {
                        return alternativeAgent;
                    }
                }
            }
        }
        const intentToAgentMap = {
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
    selectSupportingAgents(primaryAgent, intent, input) {
        const supportingAgents = [];
        const isSalesWebsite = input.context?.siteType === 'colombiatic' ||
            (input.context?.origin && input.context.origin.includes('colombiatic'));
        if (isSalesWebsite) {
            if (primaryAgent !== 'customer-support') {
                supportingAgents.push('customer-support');
            }
            if (intent.complexity > 6 && primaryAgent !== 'sales-assistant') {
                supportingAgents.push('sales-assistant');
            }
            if (intent.intent === 'website_analysis' && primaryAgent !== 'trend-scanner') {
                supportingAgents.push('trend-scanner');
            }
        }
        if (['campaign', 'planning'].includes(intent.intent) &&
            primaryAgent !== 'trend-scanner') {
            supportingAgents.push('trend-scanner');
        }
        if (intent.intent === 'analysis' && primaryAgent !== 'analytics-reporter') {
            supportingAgents.push('analytics-reporter');
        }
        if (intent.urgency > 7 &&
            !supportingAgents.includes('faq-responder') &&
            primaryAgent !== 'faq-responder') {
            supportingAgents.push('faq-responder');
        }
        if (intent.entities.channels?.split(',').length > 1 &&
            primaryAgent !== 'post-scheduler') {
            supportingAgents.push('post-scheduler');
        }
        return supportingAgents;
    }
    calculateConfidence(intent, input) {
        let confidence = 0.7;
        if (intent.urgency > 7)
            confidence += 0.1;
        if (intent.entities.channels)
            confidence += 0.1;
        if (input.context.campaignType)
            confidence += 0.1;
        if (input.conversationHistory.length > 3)
            confidence += 0.05;
        if (intent.complexity > 7)
            confidence -= 0.1;
        if (intent.sentiment === 'negative')
            confidence -= 0.05;
        const isSalesWebsite = input.context?.siteType === 'colombiatic' ||
            (input.context?.origin && input.context.origin.includes('colombiatic'));
        if (isSalesWebsite && (input.context?.products || input.context?.services)) {
            confidence += 0.1;
        }
        return Math.min(Math.max(confidence, 0.1), 0.95);
    }
    mapIntentToTaskType(intent) {
        const mapping = {
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
    calculatePriority(intent, input) {
        const isSalesWebsite = input.context?.siteType === 'colombiatic' ||
            (input.context?.origin && input.context.origin.includes('colombiatic'));
        if (isSalesWebsite && ['sales_inquiry', 'product_info', 'service_info'].includes(intent.intent)) {
            if (intent.urgency >= 7)
                return 'urgent';
            if (intent.urgency >= 5)
                return 'high';
        }
        if (intent.urgency >= 8)
            return 'urgent';
        if (intent.urgency >= 6)
            return 'high';
        if (intent.urgency >= 4)
            return 'medium';
        return 'low';
    }
    estimateDuration(primaryAgent, supportingAgents, intent) {
        const primaryTime = this.agentCapabilities[primaryAgent]?.processingTime || 5;
        const supportingTime = supportingAgents.reduce((total, agent) => {
            return total + (this.agentCapabilities[agent]?.processingTime || 3);
        }, 0);
        const maxSupportingTime = supportingAgents.length > 0
            ? Math.max(...supportingAgents.map((agent) => this.agentCapabilities[agent]?.processingTime || 3))
            : 0;
        const baseTime = primaryTime + maxSupportingTime;
        const complexityMultiplier = 1 + intent.complexity / 20;
        return Math.round(baseTime * complexityMultiplier);
    }
    identifyRequiredResources(intent, input) {
        const resources = [];
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
        const isSalesWebsite = input.context?.siteType === 'colombiatic' ||
            (input.context?.origin && input.context.origin.includes('colombiatic'));
        if (isSalesWebsite) {
            resources.push('product_catalog', 'pricing_api');
        }
        if (intent.intent === 'website_analysis') {
            resources.push('website_analysis_tools', 'seo_apis');
        }
        return resources;
    }
    isSalesWebsite(context) {
        return context?.siteType === 'colombiatic' ||
            (context?.origin && context.origin.includes('colombiatic')) ||
            (context?.siteType && context.siteType !== 'misybot-core');
    }
    getTenantType(context) {
        if (context?.siteType === 'colombiatic' ||
            (context?.origin && context.origin.includes('colombiatic'))) {
            return 'client';
        }
        if (context?.siteType === 'misybot-core' || !context?.siteType) {
            return 'core';
        }
        return 'unknown';
    }
    generateReasoning(intent, primaryAgent, supportingAgents, input) {
        const reasons = [];
        reasons.push(`Detected intent: ${intent.intent} with high confidence`);
        reasons.push(`Selected ${primaryAgent} as primary agent based on capability match`);
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
        if (input.conversationHistory && input.conversationHistory.length > 0) {
            const agentResponses = input.conversationHistory.filter(entry => entry.type === 'agent_response');
            if (agentResponses.length > 0) {
                const lastAgentResponse = agentResponses[agentResponses.length - 1];
                if (lastAgentResponse.agent === primaryAgent) {
                    reasons.push(`Continuing conversation with ${primaryAgent} for consistency`);
                }
                else {
                    reasons.push(`Switching to ${primaryAgent} for specialized handling of this ${intent.intent} request`);
                }
            }
        }
        if (supportingAgents.length > 0) {
            reasons.push(`Added supporting agents [${supportingAgents.join(', ')}] for comprehensive handling`);
        }
        if (intent.urgency > 7) {
            reasons.push(`High urgency detected (${intent.urgency}/10) - prioritizing speed`);
        }
        if (intent.entities.channels) {
            reasons.push(`Target channels identified: ${intent.entities.channels}`);
        }
        if (input.conversationHistory.length > 5) {
            reasons.push(`Ongoing conversation with ${input.conversationHistory.length} exchanges - maintaining context`);
        }
        return reasons.join('. ');
    }
    calculateComplexity(input) {
        let complexity = 5;
        if (input.message.length > 200)
            complexity += 2;
        if (input.message.length > 500)
            complexity += 2;
        const channelCount = Object.keys(this.channelPatterns).filter((channel) => this.channelPatterns[channel].some((pattern) => input.message.toLowerCase().includes(pattern))).length;
        complexity += channelCount;
        if (input.context.targetChannels && input.context.targetChannels.length > 2)
            complexity += 1;
        if (input.context.campaignType === 'campaign')
            complexity += 2;
        if (input.conversationHistory.length > 10)
            complexity += 1;
        const isSalesWebsite = input.context?.siteType === 'colombiatic' ||
            (input.context?.origin && input.context.origin.includes('colombiatic'));
        if (isSalesWebsite) {
            const productCount = (input.context?.products?.length || 0) + (input.context?.services?.length || 0);
            if (productCount > 5) {
                complexity += 1;
            }
            if (productCount > 10) {
                complexity += 1;
            }
        }
        if (input.context?.websiteUrl) {
            complexity += 2;
        }
        return Math.min(complexity, 10);
    }
};
exports.AIDecisionEngine = AIDecisionEngine;
exports.AIDecisionEngine = AIDecisionEngine = AIDecisionEngine_1 = __decorate([
    (0, common_1.Injectable)()
], AIDecisionEngine);
//# sourceMappingURL=ai-decision-engine.service.js.map