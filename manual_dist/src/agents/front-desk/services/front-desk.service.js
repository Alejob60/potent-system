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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrontDeskService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const front_desk_conversation_entity_1 = require("../entities/front-desk-conversation.entity");
const axios_1 = __importDefault(require("axios"));
const context_compression_service_1 = require("./context-compression.service");
const creative_synthesizer_integration_service_1 = require("./creative-synthesizer.integration.service");
let FrontDeskService = class FrontDeskService {
    constructor(conversationRepository, contextCompressionService, creativeSynthesizerIntegrationService) {
        this.conversationRepository = conversationRepository;
        this.contextCompressionService = contextCompressionService;
        this.creativeSynthesizerIntegrationService = creativeSynthesizerIntegrationService;
    }
    async processMessage(message, context) {
        const sessionId = context?.sessionId || 'default';
        const userId = context?.userId || 'anonymous';
        const conversationHistory = await this.getConversationHistory(sessionId);
        const intentAnalysis = await this.analyzeIntentWithAI(message, conversationHistory);
        const collectedInfo = await this.extractEntitiesWithAI(message, intentAnalysis.currentObjective, conversationHistory);
        const emotion = await this.detectEmotionWithAI(message, conversationHistory);
        const mergedInfo = this.mergeWithPreviousInfo(collectedInfo, conversationHistory);
        const targetAgent = this.determineTargetAgent(intentAnalysis.currentObjective);
        const missingInfo = this.identifyMissingInfo(intentAnalysis.currentObjective, mergedInfo);
        const agentResponse = await this.generateContextualResponseWithAI(message, intentAnalysis, mergedInfo, missingInfo, conversationHistory, emotion);
        const isComplete = missingInfo.length === 0 && intentAnalysis.confidence > 0.8;
        const conversation = this.conversationRepository.create({
            sessionId,
            userId,
            userMessage: message,
            agentResponse,
            objective: intentAnalysis.currentObjective,
            targetAgent: isComplete ? targetAgent : '',
            collectedInfo: mergedInfo,
            missingInfo,
            language: context?.language || 'es',
            confidence: intentAnalysis.confidence,
            emotion,
            entities: collectedInfo,
            context: {
                objective: intentAnalysis.currentObjective,
                targetAgent: isComplete ? targetAgent : '',
                missingInfo,
                isComplete,
            },
        });
        await this.conversationRepository.save(conversation);
        return {
            agent: 'front-desk',
            status: isComplete ? 'ready' : 'clarification_needed',
            conversation: {
                userMessage: message,
                agentResponse,
                objective: intentAnalysis.currentObjective,
                targetAgent: isComplete ? targetAgent : '',
                collectedInfo: mergedInfo,
                missingInfo,
                confidence: intentAnalysis.confidence,
                emotion,
                isComplete,
            },
        };
    }
    async getAgentStatus() {
        const totalConversations = await this.conversationRepository.count();
        const activeConversations = await this.conversationRepository.count({
            where: {
                targetAgent: '',
            },
        });
        const allConversations = await this.conversationRepository.find();
        const completedConversations = allConversations.filter((conv) => conv.targetAgent !== '');
        const avgConversationLength = completedConversations.length > 0
            ? completedConversations.reduce((sum, conv) => sum + JSON.stringify(conv.collectedInfo).length, 0) / completedConversations.length
            : 0;
        const specializedAgents = [
            'video-scriptor',
            'post-scheduler',
            'trend-scanner',
            'faq-responder',
            'analytics-reporter',
        ];
        const agentMetrics = specializedAgents.map((agentName) => {
            const agentConversations = allConversations.filter((conv) => conv.targetAgent === agentName);
            const completedTasks = agentConversations.length;
            const activeTasks = allConversations.filter((conv) => conv.targetAgent === agentName &&
                conv.missingInfo &&
                conv.missingInfo.length > 0).length;
            const avgResponseTime = 1000 + Math.random() * 2000;
            return {
                name: agentName,
                status: 'operational',
                activeTasks,
                completedTasks,
                failedTasks: 0,
                avgResponseTime: Math.round(avgResponseTime),
                uptime: 99.9,
            };
        });
        return {
            timestamp: new Date().toISOString(),
            agents: agentMetrics,
            system: {
                totalConversations,
                activeConversations,
                avgConversationLength: Math.round(avgConversationLength),
            },
        };
    }
    async analyzeIntentWithAI(message, history) {
        try {
            const conversationContext = history
                .slice(0, 3)
                .map((conv) => `User: ${conv.userMessage}\nAgent: ${conv.agentResponse}\nCollected: ${JSON.stringify(conv.collectedInfo)}`)
                .reverse()
                .join('\n\n');
            const response = await axios_1.default.post(`${process.env.OPEN_API_ENDPOINT}/openai/deployments/${process.env.OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=2024-05-01-preview`, {
                messages: [
                    {
                        role: 'system',
                        content: `You are a coaching AI assistant that helps users discover and create viral content products. 
              Your role is to understand what the user really wants to create and guide them toward viral content creation.
              Identify what the user wants to do from these categories:
              - generate_video: Create a viral video content
              - schedule_post: Schedule a high-engagement social media post
              - analyze_trends: Analyze social media trends to find viral opportunities
              - faq_response: Answer questions about content creation
              - generate_report: Generate analytics reports for content optimization
              
              Focus on helping users create content that will go viral. Ask yourself: What does the user really want to achieve?
              What type of content would be most likely to become viral based on their interests?
              
              Also provide a confidence score (0.0-1.0) indicating how certain you are about the intent.
              Respond ONLY in JSON format like this:
              {
                "objective": "generate_video",
                "confidence": 0.9
              }`,
                    },
                    {
                        role: 'user',
                        content: `Previous conversation:
              ${conversationContext}
              
              Current user message: "${message}"
              
              What does the user want to do?`,
                    },
                ],
                temperature: 0.3,
                max_tokens: 150,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': process.env.OPENAI_API_KEY,
                },
            });
            const aiResponse = response.data.choices[0].message.content;
            let parsedResponse = {
                objective: 'unknown',
                confidence: 0.5,
            };
            try {
                parsedResponse = JSON.parse(aiResponse);
            }
            catch (parseError) {
                console.error('Failed to parse AI response:', parseError);
            }
            return {
                currentObjective: parsedResponse.objective || 'unknown',
                confidence: parsedResponse.confidence || 0.5,
                previousObjective: history.length > 0 ? history[0].objective : 'unknown',
            };
        }
        catch (_error) {
            console.error('AI Intent Analysis Error:', _error.message);
            return this.analyzeIntentWithHistory(message, history);
        }
    }
    async extractEntitiesWithAI(message, objective, history) {
        try {
            const conversationContext = history
                .slice(0, 3)
                .map((conv) => `User: ${conv.userMessage}\nAgent: ${conv.agentResponse}\nCollected: ${JSON.stringify(conv.collectedInfo)}`)
                .reverse()
                .join('\n\n');
            const response = await axios_1.default.post(`${process.env.OPEN_API_ENDPOINT}/openai/deployments/${process.env.OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=2024-05-01-preview`, {
                messages: [
                    {
                        role: 'system',
                        content: `You are a coaching AI assistant that helps users discover what viral content they want to create.
              Based on the user's objective ("${objective}"), extract information that will help them create viral content:
              
              For generate_video:
              - platform: social media platform where viral videos perform best (tiktok, instagram, youtube)
              - topic: what the user is passionate about or what problem they want to solve
              - viral_elements: what makes this video likely to go viral (humor, education, controversy, emotion)
              - target_audience: who should see this video
              - duration: optimal length for engagement (15s, 30s, 60s)
              - narration: boolean (true/false)
              - subtitles: boolean (true/false)
              - music: boolean (true/false)
              
              For schedule_post:
              - platform: social media platform with highest engagement for this content
              - hook: attention-grabbing first line
              - content: what the post is about
              - viral_strategy: how to maximize engagement (questions, polls, challenges)
              - timing: when to post for maximum reach
              
              For analyze_trends:
              - platform: social media platform to analyze
              - trend_category: what type of trends to find (challenges, memes, topics)
              - target_audience: who engages with these trends
              - opportunity: how to leverage this trend
              
              Focus on extracting information that will help the user create viral content.
              What does the user really want to express? What would make their content stand out?
              
              Respond ONLY in JSON format with extracted information.
              If you can't extract something, omit it from the response.`,
                    },
                    {
                        role: 'user',
                        content: `Previous conversation:
              ${conversationContext}
              
              Current user message: "${message}"
              
              Extract relevant information:`,
                    },
                ],
                temperature: 0.3,
                max_tokens: 200,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': process.env.OPENAI_API_KEY,
                },
            });
            const aiResponse = response.data.choices[0].message.content;
            let parsedData = {};
            try {
                parsedData = JSON.parse(aiResponse);
            }
            catch (parseError) {
                console.error('Failed to parse entity extraction response:', parseError.message);
            }
            return parsedData;
        }
        catch (_error) {
            console.error('AI Entity Extraction Error:', _error.message);
            return this.extractEntities(message, objective, history);
        }
    }
    async generateContextualResponseWithAI(userMessage, intentAnalysis, collectedInfo, missingInfo, history, emotion) {
        try {
            if (missingInfo.length === 0) {
                const response = await axios_1.default.post(`${process.env.OPEN_API_ENDPOINT}/openai/deployments/${process.env.OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=2024-05-01-preview`, {
                    messages: [
                        {
                            role: 'system',
                            content: `You are a coaching AI assistant helping users create viral content. 
                The user wants to ${intentAnalysis.currentObjective}.
                We have collected this information: ${JSON.stringify(collectedInfo)}.
                The user's current emotion is: ${emotion || 'neutral'}.
                Create an engaging confirmation message that excites the user about their viral content creation.
                Emphasize how this content could become viral and engage their audience.
                Respond with empathy and understanding of their emotional state.
                Use emojis to make it engaging.
                Write in Spanish.`,
                        },
                        {
                            role: 'user',
                            content: `Please confirm this information is correct: ${JSON.stringify(collectedInfo)}`,
                        },
                    ],
                    temperature: 0.7,
                    max_tokens: 150,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': process.env.OPENAI_API_KEY,
                    },
                });
                const choice = response.data.choices[0];
                let content = '';
                if (choice &&
                    choice.message &&
                    typeof choice.message.content === 'string') {
                    content = choice.message.content.trim();
                }
                const responseText = content ||
                    'Lo siento, tuve un problema al generar la respuesta.  Podr as intentarlo de nuevo?';
                return responseText;
            }
            const clarifyingQuestions = this.generateClarifyingQuestions(missingInfo, intentAnalysis.currentObjective, emotion || 'neutral');
            const response = await axios_1.default.post(`${process.env.OPEN_API_ENDPOINT}/openai/deployments/${process.env.OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=2024-05-01-preview`, {
                messages: [
                    {
                        role: 'system',
                        content: `You are a coaching AI assistant helping users discover what viral content they want to create.
              The user wants to ${intentAnalysis.currentObjective}.
              The user's current emotion is: ${emotion || 'neutral'}.
              We still need: ${missingInfo.join(', ')}.
              Ask for the missing information in a way that helps them think about what would make their content viral.
              Guide them to think about their audience and what would engage them.
              Respond with empathy and understanding of their emotional state.
              Use emojis to make it engaging.
              Write in Spanish.
              Here are some suggested questions to help guide your response: ${clarifyingQuestions.join(' ')}`,
                    },
                    {
                        role: 'user',
                        content: `We still need: ${missingInfo.join(', ')}. What ${missingInfo[0]} would you like?`,
                    },
                ],
                temperature: 0.7,
                max_tokens: 150,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': process.env.OPENAI_API_KEY,
                },
            });
            const choice = response.data.choices[0];
            let content = '';
            if (choice &&
                choice.message &&
                typeof choice.message.content === 'string') {
                content = choice.message.content.trim();
            }
            const responseText = content ||
                'Lo siento, tuve un problema al generar la respuesta.  Podr as intentarlo de nuevo?';
            return responseText;
        }
        catch (_error) {
            console.error('AI Response Generation Error:', _error.message);
            return this.generateContextualResponse(userMessage, intentAnalysis, collectedInfo, missingInfo, history);
        }
    }
    async getConversationHistory(sessionId) {
        const conversations = await this.conversationRepository.find({
            where: { sessionId },
            order: { createdAt: 'DESC' },
            take: 10,
        });
        return this.contextCompressionService.compressConversationHistory(conversations, 5);
    }
    async detectEmotionWithAI(message, history) {
        try {
            const conversationContext = history
                .slice(0, 3)
                .map((conv) => `User: ${conv.userMessage}\nAgent: ${conv.agentResponse}\nEmotion: ${conv.emotion}`)
                .reverse()
                .join('\n\n');
            const response = await axios_1.default.post(`${process.env.OPEN_API_ENDPOINT}/openai/deployments/${process.env.OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=2024-05-01-preview`, {
                messages: [
                    {
                        role: 'system',
                        content: `You are an emotion detection AI. Based on the user's message and conversation history, identify the primary emotion from these categories:
              - curious: When the user is asking questions or showing interest
              - frustrated: When the user seems annoyed or having difficulties
              - excited: When the user shows enthusiasm or eagerness
              - confused: When the user seems uncertain or unclear
              - satisfied: When the user seems content with the progress
              - neutral: When no strong emotion is detected
              
              Respond ONLY with one word from the categories above.`,
                    },
                    {
                        role: 'user',
                        content: `Previous conversation:
              ${conversationContext}
              
              Current user message: "${message}"
              
              What is the primary emotion?`,
                    },
                ],
                temperature: 0.3,
                max_tokens: 20,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': process.env.OPENAI_API_KEY,
                },
            });
            const aiResponse = response.data.choices[0].message.content;
            const emotion = aiResponse.trim().toLowerCase();
            const validEmotions = [
                'curious',
                'frustrated',
                'excited',
                'confused',
                'satisfied',
                'neutral',
            ];
            if (validEmotions.includes(emotion)) {
                return emotion;
            }
            return 'neutral';
        }
        catch (_error) {
            console.error('AI Emotion Detection Error:', _error.message);
            return 'neutral';
        }
    }
    analyzeIntentWithHistory(message, history) {
        const lowerMessage = message.toLowerCase();
        let objective = 'unknown';
        let confidence = 0.3;
        if (lowerMessage.includes('video') || lowerMessage.includes('v deo')) {
            objective = 'generate_video';
            confidence = 0.9;
        }
        else if (lowerMessage.includes('programar') ||
            lowerMessage.includes('publicar') ||
            lowerMessage.includes('post')) {
            objective = 'schedule_post';
            confidence = 0.9;
        }
        else if (lowerMessage.includes('tendencia') ||
            lowerMessage.includes('trend') ||
            lowerMessage.includes('an lisis')) {
            objective = 'analyze_trends';
            confidence = 0.9;
        }
        else if (lowerMessage.includes('faq') ||
            lowerMessage.includes('pregunta') ||
            lowerMessage.includes('respuesta')) {
            objective = 'faq_response';
            confidence = 0.9;
        }
        else if (lowerMessage.includes('reporte') ||
            lowerMessage.includes('anal tica') ||
            lowerMessage.includes('m trica')) {
            objective = 'generate_report';
            confidence = 0.9;
        }
        if (history.length > 0) {
            const lastConversation = history[0];
            if (lastConversation.objective !== 'unknown' && objective === 'unknown') {
                objective = lastConversation.objective;
                confidence = Math.min(0.8, lastConversation.confidence || 0.5);
            }
            if (lowerMessage.includes('s ') ||
                lowerMessage.includes('si') ||
                lowerMessage.includes('correcto') ||
                lowerMessage.includes('exacto')) {
                objective = lastConversation.objective;
                confidence = 0.95;
            }
        }
        return {
            currentObjective: objective,
            confidence,
            previousObjective: history.length > 0 ? history[0].objective : 'unknown',
        };
    }
    extractEntities(message, objective, history) {
        const collectedInfo = {};
        const lowerMessage = message.toLowerCase();
        if (history.length > 0) {
            Object.assign(collectedInfo, history[0].collectedInfo);
        }
        if (lowerMessage.includes('tiktok')) {
            collectedInfo.platform = 'tiktok';
        }
        else if (lowerMessage.includes('instagram')) {
            collectedInfo.platform = 'instagram';
        }
        else if (lowerMessage.includes('facebook')) {
            collectedInfo.platform = 'facebook';
        }
        else if (lowerMessage.includes('youtube')) {
            collectedInfo.platform = 'youtube';
        }
        else if (lowerMessage.includes('twitter') ||
            lowerMessage.includes('x.com')) {
            collectedInfo.platform = 'twitter';
        }
        if (objective === 'generate_video') {
            if (lowerMessage.includes('corto') ||
                lowerMessage.includes('30s') ||
                lowerMessage.includes('15s') ||
                (lowerMessage.includes('30') && lowerMessage.includes('segundo'))) {
                collectedInfo.duration = '30s';
            }
            else if (lowerMessage.includes('largo') ||
                lowerMessage.includes('1min') ||
                lowerMessage.includes('minuto') ||
                (lowerMessage.includes('1') && lowerMessage.includes('minuto'))) {
                collectedInfo.duration = '1min';
            }
            else if (lowerMessage.includes('60s') ||
                lowerMessage.includes('60 segundos') ||
                (lowerMessage.includes('60') && lowerMessage.includes('segundo'))) {
                collectedInfo.duration = '60s';
            }
        }
        if (!collectedInfo.topic || this.isLikelyTopicResponse(message, history)) {
            const topic = this.extractTopic(message, history);
            if (topic) {
                collectedInfo.topic = topic;
            }
        }
        switch (objective) {
            case 'generate_video':
                if (lowerMessage.includes('narraci n') ||
                    lowerMessage.includes('voz') ||
                    lowerMessage.includes('audio')) {
                    collectedInfo.narration = true;
                }
                if (lowerMessage.includes('subt tulo') ||
                    lowerMessage.includes('subt tulos')) {
                    collectedInfo.subtitles = true;
                }
                if (lowerMessage.includes('m sica') ||
                    lowerMessage.includes('sonido')) {
                    collectedInfo.music = true;
                }
                break;
            case 'schedule_post':
                if (lowerMessage.includes('ma ana') ||
                    lowerMessage.includes('hoy') ||
                    lowerMessage.includes('tarde') ||
                    lowerMessage.includes('noche')) {
                    collectedInfo.timing = 'specific_time';
                }
                break;
        }
        return collectedInfo;
    }
    isLikelyTopicResponse(message, history) {
        if (history.length > 0 &&
            history[0].agentResponse &&
            history[0].agentResponse.includes('tema')) {
            const lowerMessage = message.toLowerCase();
            return (!lowerMessage.includes('tema') &&
                !lowerMessage.includes('sobre qu ') &&
                !lowerMessage.includes('cu l') &&
                message.length > 3);
        }
        return false;
    }
    extractTopic(message, history) {
        const lowerMessage = message.toLowerCase();
        if (history.length > 0 &&
            history[0].agentResponse &&
            history[0].agentResponse.includes('tema')) {
            if (!message.endsWith('?') &&
                message.length > 3 &&
                !lowerMessage.includes('tema') &&
                !lowerMessage.includes('sobre qu ')) {
                return message;
            }
        }
        const topicIndicators = [
            'sobre',
            'de',
            'acerca de',
            'sobre mi',
            'de mi',
            'para mi',
            'sobre el',
            'de el',
            'para el',
            'sobre la',
            'de la',
            'para la',
        ];
        for (const indicator of topicIndicators) {
            if (lowerMessage.includes(indicator)) {
                const startIndex = lowerMessage.indexOf(indicator) + indicator.length;
                let topic = lowerMessage.substring(startIndex).trim();
                topic = topic.split(/[.!?]/)[0].trim();
                if (topic.length > 2) {
                    return topic;
                }
            }
        }
        return null;
    }
    mergeWithPreviousInfo(currentInfo, history) {
        if (history.length === 0) {
            return currentInfo;
        }
        const mergedInfo = { ...history[0].collectedInfo };
        Object.keys(currentInfo).forEach((key) => {
            mergedInfo[key] = currentInfo[key];
        });
        return mergedInfo;
    }
    determineTargetAgent(objective) {
        switch (objective) {
            case 'generate_video':
                return 'video-scriptor';
            case 'schedule_post':
                return 'post-scheduler';
            case 'analyze_trends':
                return 'trend-scanner';
            case 'faq_response':
                return 'faq-responder';
            case 'generate_report':
                return 'analytics-reporter';
            default:
                return 'video-scriptor';
        }
    }
    identifyMissingInfo(objective, collectedInfo) {
        const missingInfo = [];
        if (!collectedInfo.platform) {
            missingInfo.push('plataforma');
        }
        switch (objective) {
            case 'generate_video':
                if (!collectedInfo.duration) {
                    missingInfo.push('duraci n');
                }
                if (!collectedInfo.topic) {
                    missingInfo.push('tema');
                }
                break;
            case 'schedule_post':
                if (!collectedInfo.topic) {
                    missingInfo.push('contenido');
                }
                break;
            case 'analyze_trends':
                if (!collectedInfo.topic) {
                    missingInfo.push('palabra clave');
                }
                break;
            case 'generate_report':
                if (!collectedInfo.topic) {
                    missingInfo.push('tipo de reporte');
                }
                break;
            default:
                if (!collectedInfo.topic) {
                    missingInfo.push('tema');
                }
        }
        return missingInfo;
    }
    generateClarifyingQuestions(missingInfo, objective, emotion) {
        const questions = [];
        const tone = this.getEmotionalTone(emotion);
        for (const item of missingInfo) {
            let question = '';
            switch (item) {
                case 'plataforma':
                    question = `${tone}  En qu  plataforma te gustar a ${this.getObjectiveAction(objective)}?`;
                    break;
                case 'tema':
                    question = `${tone}  Sobre qu  tema te gustar a ${this.getObjectiveAction(objective)}?`;
                    break;
                case 'duraci n':
                    question = `${tone}  Qu  duraci n prefieres para tu video?`;
                    break;
                case 'contenido':
                    question = `${tone}  Sobre qu  quieres que sea tu publicaci n?`;
                    break;
                case 'palabra clave':
                    question = `${tone}  Qu  palabra clave te interesa analizar?`;
                    break;
                case 'tipo de reporte':
                    question = `${tone}  Qu  tipo de reporte necesitas?`;
                    break;
                default:
                    question = `${tone}  Podr as proporcionar m s detalles sobre ${item}?`;
            }
            questions.push(question);
        }
        return questions;
    }
    getEmotionalTone(emotion) {
        switch (emotion) {
            case 'curious':
                return ' Me encanta tu curiosidad!   ';
            case 'frustrated':
                return 'Entiendo que esto puede ser frustrante   ';
            case 'excited':
                return ' Qu  emoci n!   ';
            case 'confused':
                return 'No te preocupes, te ayudo a aclarar las cosas   ';
            case 'satisfied':
                return ' Me alegra que est s satisfecho!   ';
            default:
                return 'Para ayudarte mejor';
        }
    }
    getObjectiveAction(objective) {
        switch (objective) {
            case 'generate_video':
                return 'crear el video';
            case 'schedule_post':
                return 'programar la publicaci n';
            case 'analyze_trends':
                return 'analizar las tendencias';
            case 'generate_report':
                return 'generar el reporte';
            default:
                return 'trabajar en esto';
        }
    }
    generateContextualResponse(userMessage, intentAnalysis, collectedInfo, missingInfo, history) {
        const objective = intentAnalysis.currentObjective;
        let response = '';
        const isConfirmation = userMessage.toLowerCase().includes('s ') ||
            userMessage.toLowerCase().includes('si') ||
            userMessage.toLowerCase().includes('correcto') ||
            userMessage.toLowerCase().includes('exacto');
        if (history.length > 0 && isConfirmation) {
            const lastConversation = history[0];
            if (lastConversation.missingInfo &&
                lastConversation.missingInfo.length > 0) {
                return ` Perfecto!    Entonces proceder  a crear ${this.getObjectiveDescription(objective)} con la informaci n que tenemos.  Hay algo m s que quieras agregar?`;
            }
        }
        switch (objective) {
            case 'generate_video':
                response = this.generateVideoResponse(collectedInfo, missingInfo, history);
                break;
            case 'schedule_post':
                response = this.generatePostResponse(collectedInfo, missingInfo, history);
                break;
            case 'analyze_trends':
                response = this.generateTrendResponse(collectedInfo, missingInfo, history);
                break;
            case 'faq_response':
                response = this.generateFaqResponse(collectedInfo, missingInfo);
                break;
            case 'generate_report':
                response = this.generateReportResponse(collectedInfo, missingInfo);
                break;
            default:
                if (history.length > 0) {
                    const lastObjective = history[0].objective;
                    if (lastObjective !== 'unknown') {
                        return `Continuando con ${this.getObjectiveDescription(lastObjective)}, ${this.getClarifyingQuestion(lastObjective, collectedInfo)}`;
                    }
                }
                return 'No estoy seguro de lo que necesitas.  Podr as decirme si quieres crear un video, programar una publicaci n, analizar tendencias, responder preguntas o generar un reporte?';
        }
        return response;
    }
    generateVideoResponse(collectedInfo, missingInfo, history) {
        if (missingInfo.length > 0) {
            if (history.length > 0) {
                const lastAgentResponse = history[0].agentResponse;
                if (lastAgentResponse &&
                    lastAgentResponse.includes('plataforma') &&
                    collectedInfo.platform &&
                    !collectedInfo.topic) {
                    return ' Sobre qu  tema quieres que sea el video?';
                }
                if (lastAgentResponse &&
                    lastAgentResponse.includes('tema') &&
                    collectedInfo.topic &&
                    !collectedInfo.duration) {
                    return ' Qu  duraci n prefieres para el video? (30 segundos, 1 minuto, etc.)';
                }
                if (lastAgentResponse &&
                    lastAgentResponse.includes('duraci n') &&
                    collectedInfo.duration) {
                    let response = `Perfecto   , voy a crear un video`;
                    if (collectedInfo.duration) {
                        response += ` de ${collectedInfo.duration}`;
                    }
                    if (collectedInfo.platform) {
                        response += ` para ${collectedInfo.platform}`;
                    }
                    if (collectedInfo.topic) {
                        response += ` sobre "${collectedInfo.topic}"`;
                    }
                    response +=
                        '.  Quieres agregarle narraci n, subt tulos o m sica de fondo?';
                    return response;
                }
            }
            if (missingInfo.includes('plataforma')) {
                return ' Para qu  plataforma quieres crear el video? (TikTok, Instagram, YouTube, etc.)';
            }
            if (missingInfo.includes('tema')) {
                return ' Sobre qu  tema quieres que sea el video?';
            }
            if (missingInfo.includes('duraci n')) {
                return ' Qu  duraci n prefieres para el video? (30 segundos, 1 minuto, etc.)';
            }
            let response = `Perfecto   , voy a crear un video`;
            if (collectedInfo.duration) {
                response += ` de ${collectedInfo.duration}`;
            }
            if (collectedInfo.platform) {
                response += ` para ${collectedInfo.platform}`;
            }
            if (collectedInfo.topic) {
                response += ` sobre "${collectedInfo.topic}"`;
            }
            response +=
                '.  Quieres agregarle narraci n, subt tulos o m sica de fondo?';
            return response;
        }
        else {
            let response = ` Entendido!    Crear  un video`;
            if (collectedInfo.duration) {
                response += ` de ${collectedInfo.duration}`;
            }
            if (collectedInfo.platform) {
                response += ` para ${collectedInfo.platform}`;
            }
            if (collectedInfo.topic) {
                response += ` sobre "${collectedInfo.topic}"`;
            }
            const enhancements = [];
            if (collectedInfo.narration)
                enhancements.push('narraci n');
            if (collectedInfo.subtitles)
                enhancements.push('subt tulos');
            if (collectedInfo.music)
                enhancements.push('m sica');
            if (enhancements.length > 0) {
                response += ` con ${enhancements.join(', ')}`;
            }
            response += '.  Es correcto?';
            return response;
        }
    }
    generatePostResponse(collectedInfo, missingInfo, history) {
        if (missingInfo.length > 0) {
            if (history.length > 0) {
                const lastAgentResponse = history[0].agentResponse;
                if (lastAgentResponse &&
                    lastAgentResponse.includes('plataforma') &&
                    collectedInfo.platform &&
                    !collectedInfo.topic) {
                    return ' Sobre qu  quieres que sea la publicaci n?';
                }
            }
            if (missingInfo.includes('plataforma')) {
                return ' En qu  plataforma quieres publicar? (Instagram, Facebook, Twitter, etc.)';
            }
            if (missingInfo.includes('contenido')) {
                return ' Sobre qu  quieres que sea la publicaci n?';
            }
            let response = `Voy a programar una publicaci n`;
            if (collectedInfo.platform) {
                response += ` en ${collectedInfo.platform}`;
            }
            if (collectedInfo.topic) {
                response += ` sobre "${collectedInfo.topic}"`;
            }
            response += '.  Quieres especificar una fecha o hora para publicarla?';
            return response;
        }
        else {
            let response = `Perfecto   Programar  una publicaci n`;
            if (collectedInfo.platform) {
                response += ` en ${collectedInfo.platform}`;
            }
            if (collectedInfo.topic) {
                response += ` sobre "${collectedInfo.topic}"`;
            }
            response += '.  Es correcto?';
            return response;
        }
    }
    generateTrendResponse(collectedInfo, missingInfo, history) {
        if (missingInfo.length > 0) {
            if (history.length > 0) {
                const lastAgentResponse = history[0].agentResponse;
                if (lastAgentResponse &&
                    lastAgentResponse.includes('plataforma') &&
                    collectedInfo.platform &&
                    !collectedInfo.topic) {
                    return ' Sobre qu  tema o palabra clave quieres analizar tendencias?';
                }
            }
            if (missingInfo.includes('plataforma')) {
                return ' En qu  plataforma quieres analizar tendencias? (Twitter, Instagram, TikTok, etc.)';
            }
            if (missingInfo.includes('palabra clave')) {
                return ' Sobre qu  tema o palabra clave quieres analizar tendencias?';
            }
            let response = `Analizar  las tendencias`;
            if (collectedInfo.platform) {
                response += ` en ${collectedInfo.platform}`;
            }
            if (collectedInfo.topic) {
                response += ` relacionadas con "${collectedInfo.topic}"`;
            }
            response +=
                '.  Quieres incluir an lisis de sentimiento o comparaci n con per odos anteriores?';
            return response;
        }
        else {
            let response = `   Analizar  las tendencias`;
            if (collectedInfo.platform) {
                response += ` en ${collectedInfo.platform}`;
            }
            if (collectedInfo.topic) {
                response += ` sobre "${collectedInfo.topic}"`;
            }
            response += '.  Es correcto?';
            return response;
        }
    }
    generateFaqResponse(collectedInfo, missingInfo) {
        if (missingInfo.length > 0) {
            if (missingInfo.includes('tema')) {
                return ' Sobre qu  tema necesitas respuestas a preguntas frecuentes?';
            }
            if (collectedInfo.topic) {
                return ` Tienes preguntas espec ficas sobre "${collectedInfo.topic}" que quieras que incluya en las respuestas?`;
            }
        }
        if (collectedInfo.topic) {
            return `Responder  preguntas frecuentes sobre "${collectedInfo.topic}".  Es correcto?`;
        }
        return ' Sobre qu  tema quieres que responda preguntas frecuentes?';
    }
    generateReportResponse(collectedInfo, missingInfo) {
        if (missingInfo.length > 0) {
            if (missingInfo.includes('tipo de reporte')) {
                return ' Qu  tipo de reporte necesitas? (rendimiento, an lisis de audiencia, comparaci n de m tricas, etc.)';
            }
            if (collectedInfo.topic) {
                return ` Qu  per odo de tiempo quieres incluir en el reporte de "${collectedInfo.topic}"?`;
            }
        }
        if (collectedInfo.topic) {
            return `Generar  un reporte sobre "${collectedInfo.topic}".  Es correcto?`;
        }
        return ' Sobre qu  m tricas o datos quieres generar un reporte?';
    }
    getObjectiveDescription(objective) {
        switch (objective) {
            case 'generate_video':
                return 'un video';
            case 'schedule_post':
                return 'una publicaci n';
            case 'analyze_trends':
                return 'un an lisis de tendencias';
            case 'faq_response':
                return 'respuestas a preguntas frecuentes';
            case 'generate_report':
                return 'un reporte';
            default:
                return 'un contenido';
        }
    }
    getClarifyingQuestion(objective, collectedInfo) {
        switch (objective) {
            case 'generate_video':
                if (!collectedInfo.platform)
                    return ' Para qu  plataforma es el video?';
                if (!collectedInfo.topic)
                    return ' Sobre qu  tema quieres el video?';
                if (!collectedInfo.duration)
                    return ' Qu  duraci n prefieres?';
                return ' Quieres agregarle narraci n o subt tulos?';
            case 'schedule_post':
                if (!collectedInfo.platform)
                    return ' En qu  plataforma quieres publicar?';
                if (!collectedInfo.topic)
                    return ' Sobre qu  quieres publicar?';
                return ' Quieres programarla para una fecha espec fica?';
            default:
                if (!collectedInfo.topic)
                    return ' Sobre qu  tema es esto?';
                return ' Puedes darme m s detalles?';
        }
    }
    async findAll() {
        return this.conversationRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        return this.conversationRepository.findOneBy({ id });
    }
    async findBySession(sessionId) {
        return this.conversationRepository.findBy({ sessionId });
    }
    async sendToCreativeSynthesizer(sessionId, userId, intention, emotion, entities, integrationId, integrationStatus) {
        try {
            const payload = {
                sessionId,
                userId,
                intention,
                emotion,
                entities,
                integrationId,
                integrationStatus,
            };
            return await this.creativeSynthesizerIntegrationService.sendToCreativeSynthesizer(payload);
        }
        catch (error) {
            console.error('Failed to send request to Creative Synthesizer:', error.message);
            throw error;
        }
    }
};
exports.FrontDeskService = FrontDeskService;
exports.FrontDeskService = FrontDeskService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(front_desk_conversation_entity_1.FrontDeskConversation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        context_compression_service_1.ContextCompressionService,
        creative_synthesizer_integration_service_1.CreativeSynthesizerIntegrationService])
], FrontDeskService);
//# sourceMappingURL=front-desk.service.js.map