"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PromptBuilderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptBuilderService = void 0;
const common_1 = require("@nestjs/common");
const commercial_conversation_prompt_service_1 = require("./commercial-conversation-prompt.service");
let PromptBuilderService = PromptBuilderService_1 = class PromptBuilderService {
    constructor() {
        this.logger = new common_1.Logger(PromptBuilderService_1.name);
        this.maxPromptTokens = 8000;
        this.safetyPolicy = `
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
        this.commercialPromptService = new commercial_conversation_prompt_service_1.CommercialConversationPromptService();
    }
    buildPrompt(tenantADN, sessionContext, retrievedDocs, userMessage) {
        this.logger.debug(`Building prompt for tenant: ${sessionContext.tenantId}`);
        const systemPrompt = this.buildSystemPrompt(tenantADN);
        const contextPrompt = this.buildContextPrompt(retrievedDocs, sessionContext);
        const conversationHistory = this.buildConversationHistory(sessionContext);
        const messages = [
            { role: 'system', content: systemPrompt },
        ];
        if (contextPrompt) {
            messages.push({ role: 'system', content: contextPrompt });
        }
        messages.push(...conversationHistory);
        messages.push({ role: 'user', content: userMessage });
        const guardedMessages = this.guardTokenLimit(messages);
        this.logger.debug(`Prompt built with ${guardedMessages.length} messages. Estimated tokens: ${this.estimateTokens(guardedMessages)}`);
        return guardedMessages;
    }
    buildSystemPrompt(tenantADN) {
        if (tenantADN.commercialMode?.enabled) {
            return this.buildCommercialSystemPrompt(tenantADN);
        }
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
        if (tenantADN.brandingConfig?.values && tenantADN.brandingConfig.values.length > 0) {
            systemPrompt += `\nVALORES DE LA MARCA:
${tenantADN.brandingConfig.values.map(v => `- ${v}`).join('\n')}
`;
        }
        if (tenantADN.policies?.safetyGuidelines && tenantADN.policies.safetyGuidelines.length > 0) {
            systemPrompt += `\nPOLÍTICAS ESPECÍFICAS:
${tenantADN.policies.safetyGuidelines.map(g => `- ${g}`).join('\n')}
`;
        }
        if (tenantADN.policies?.prohibitedTopics && tenantADN.policies.prohibitedTopics.length > 0) {
            systemPrompt += `\nTEMAS PROHIBIDOS (declina cortésmente si se solicita):
${tenantADN.policies.prohibitedTopics.map(t => `- ${t}`).join('\n')}
`;
        }
        systemPrompt += `\n${this.safetyPolicy}`;
        if (tenantADN.policies?.escalationRules && tenantADN.policies.escalationRules.length > 0) {
            systemPrompt += `\nREGLAS DE ESCALACIÓN:
${tenantADN.policies.escalationRules.map(r => `- ${r}`).join('\n')}
`;
        }
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
    buildCommercialSystemPrompt(tenantADN) {
        const businessName = tenantADN.businessProfile?.name || 'ColombiaTIC AI Ecosystem';
        const userFlowContext = tenantADN.commercialMode?.userFlowContext || {
            isAuthenticated: false,
            currentLocation: 'landing',
            intent: 'explore'
        };
        let commercialPrompt = this.commercialPromptService.generateCommercialPrompt(businessName, userFlowContext);
        commercialPrompt += this.commercialPromptService.getContextEnhancement(userFlowContext);
        commercialPrompt += `\n\n${this.safetyPolicy}`;
        this.logger.debug(`Commercial conversation prompt generated for tenant: ${businessName}`);
        return commercialPrompt;
    }
    buildContextPrompt(retrievedDocs, sessionContext) {
        if (retrievedDocs.length === 0) {
            return '';
        }
        let contextPrompt = 'CONTEXTO RELEVANTE DE LA BASE DE CONOCIMIENTO:\n\n';
        retrievedDocs.forEach((doc, idx) => {
            const source = doc.metadata?.source || 'knowledge_base';
            const score = (doc.score * 100).toFixed(1);
            contextPrompt += `[Documento ${idx + 1}] (Relevancia: ${score}%, Fuente: ${source})\n`;
            contextPrompt += `${doc.text}\n\n`;
        });
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
    buildConversationHistory(sessionContext) {
        const messages = [];
        const recentTurns = sessionContext.recentTurns.slice(-5);
        for (const turn of recentTurns) {
            messages.push({
                role: turn.role,
                content: turn.text
            });
        }
        return messages;
    }
    guardTokenLimit(messages) {
        const estimatedTokens = this.estimateTokens(messages);
        if (estimatedTokens <= this.maxPromptTokens) {
            return messages;
        }
        this.logger.warn(`Prompt exceeds token limit (${estimatedTokens} > ${this.maxPromptTokens}). Truncating...`);
        const systemMessages = messages.filter(m => m.role === 'system');
        const userMessages = messages.filter(m => m.role !== 'system');
        const lastUserMessage = userMessages[userMessages.length - 1];
        const historyMessages = userMessages.slice(0, -1);
        let truncatedHistory = historyMessages;
        let currentTokens = this.estimateTokens([...systemMessages, ...truncatedHistory, lastUserMessage]);
        while (currentTokens > this.maxPromptTokens && truncatedHistory.length > 0) {
            truncatedHistory = truncatedHistory.slice(1);
            currentTokens = this.estimateTokens([...systemMessages, ...truncatedHistory, lastUserMessage]);
        }
        this.logger.debug(`Truncated ${historyMessages.length - truncatedHistory.length} messages to fit token limit`);
        return [...systemMessages, ...truncatedHistory, lastUserMessage];
    }
    estimateTokens(messages) {
        let totalTokens = 0;
        for (const message of messages) {
            totalTokens += Math.ceil(message.content.length / 4) + 4;
        }
        return totalTokens;
    }
    getToneDescription(tone) {
        const toneMap = {
            professional: 'Profesional y directo',
            casual: 'Casual y relajado',
            friendly: 'Amigable y cercano',
            formal: 'Formal y respetuoso',
            enthusiastic: 'Entusiasta y motivador'
        };
        return toneMap[tone] || 'Amigable y profesional';
    }
    translateState(state) {
        const stateMap = {
            greeting: 'Saludo inicial',
            information_gathering: 'Recolectando información',
            processing: 'Procesando solicitud',
            closing: 'Finalizando conversación',
            escalated: 'Escalado a humano'
        };
        return stateMap[state] || state;
    }
    buildActionGuidance(availableActions) {
        if (availableActions.length === 0) {
            return '';
        }
        return `\nACCIONES DISPONIBLES PARA ESTA SESIÓN:
${availableActions.map(action => `- ${action}`).join('\n')}

Recuerda: Solo ejecuta acciones cuando el usuario lo confirme explícitamente.
`;
    }
    buildIntentClassificationPrompt(userMessage) {
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
};
exports.PromptBuilderService = PromptBuilderService;
exports.PromptBuilderService = PromptBuilderService = PromptBuilderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PromptBuilderService);
//# sourceMappingURL=prompt-builder.service.js.map