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
var MetaAgentProcessService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaAgentProcessService = void 0;
const common_1 = require("@nestjs/common");
const azure_openai_gpt5_service_1 = require("./azure-openai-gpt5.service");
const session_context_service_1 = require("./session-context.service");
const mongo_vector_service_1 = require("../../../common/mongodb/mongo-vector.service");
const tenant_context_store_1 = require("../../security/tenant-context.store");
const prompt_builder_service_1 = require("./prompt-builder.service");
const action_parser_service_1 = require("./action-parser.service");
const service_bus_publisher_service_1 = require("./service-bus-publisher.service");
const azure_speech_service_1 = require("./azure-speech.service");
let MetaAgentProcessService = MetaAgentProcessService_1 = class MetaAgentProcessService {
    constructor(gpt5Service, sessionContextService, vectorService, tenantContextStore, promptBuilder, actionParser, serviceBusPublisher, speechService) {
        this.gpt5Service = gpt5Service;
        this.sessionContextService = sessionContextService;
        this.vectorService = vectorService;
        this.tenantContextStore = tenantContextStore;
        this.promptBuilder = promptBuilder;
        this.actionParser = actionParser;
        this.serviceBusPublisher = serviceBusPublisher;
        this.speechService = speechService;
        this.logger = new common_1.Logger(MetaAgentProcessService_1.name);
    }
    async process(request) {
        const startTime = Date.now();
        this.logger.log(`Processing request for tenant: ${request.tenantId}, session: ${request.sessionId}, correlation: ${request.correlationId}`);
        try {
            const sessionContext = await this.sessionContextService.getOrCreateContext(request.sessionId, request.tenantId, request.channel, request.userId);
            this.logger.debug(`Session context retrieved. State: ${sessionContext.shortContext.conversationState}`);
            const tenantContext = await this.tenantContextStore.getTenantContext(request.tenantId);
            let userMessage;
            if (request.input.type === 'text') {
                userMessage = request.input.text || '';
            }
            else if (request.input.type === 'speech') {
                userMessage = await this.convertSpeechToText(request.input.speechUrl || '');
            }
            else {
                userMessage = JSON.stringify(request.input.metadata);
            }
            this.logger.debug(`User message: "${userMessage.substring(0, 100)}..."`);
            const userEmbedding = await this.gpt5Service.generateEmbedding(userMessage, request.tenantId);
            const vectorSearchStart = Date.now();
            const relevantDocs = await this.vectorService.semanticSearch(userEmbedding, request.tenantId, 10, 0.75);
            const vectorSearchTime = Date.now() - vectorSearchStart;
            const retrievedDocs = relevantDocs.map(doc => ({
                text: doc.document.text,
                score: doc.score || 0.85,
                metadata: {
                    source: doc.document.metadata?.source,
                    category: doc.document.metadata?.category,
                    lang: doc.document.metadata?.lang
                }
            }));
            this.logger.debug(`Vector search returned ${retrievedDocs.length} relevant documents in ${vectorSearchTime}ms`);
            const tenantADN = {
                businessProfile: {
                    name: tenantContext?.businessProfile?.name || 'Platform',
                    description: tenantContext?.businessProfile?.description || '',
                    industry: tenantContext?.businessProfile?.industry || 'General',
                    tone: 'friendly'
                },
                brandingConfig: {
                    values: [],
                    communicationStyle: 'professional'
                },
                policies: {
                    safetyGuidelines: [],
                    prohibitedTopics: [],
                    escalationRules: []
                }
            };
            const messages = this.promptBuilder.buildPrompt(tenantADN, sessionContext, retrievedDocs, userMessage);
            const llmStart = Date.now();
            const llmResponse = await this.gpt5Service.chatCompletion({
                messages,
                temperature: 0.7,
                max_tokens: 1000,
                top_p: 0.95
            }, request.tenantId);
            const llmTime = Date.now() - llmStart;
            const fullResponseText = llmResponse.choices[0].message.content;
            const responseText = this.actionParser.extractCleanResponse(fullResponseText);
            this.logger.debug(`LLM response in ${llmTime}ms: "${responseText.substring(0, 100)}..."`);
            const actions = this.actionParser.parseActions(fullResponseText);
            this.logger.debug(`Parsed ${actions.length} actions from LLM response`);
            await this.sessionContextService.addConversationTurn(request.sessionId, request.tenantId, request.correlationId, 'user', userMessage, undefined, {
                channel: request.channel,
                inputType: request.input.type
            });
            await this.sessionContextService.addConversationTurn(request.sessionId, request.tenantId, request.correlationId, 'agent', responseText, actions, {
                channel: request.channel,
                tokensUsed: llmResponse.usage.total_tokens,
                embeddingsRetrieved: relevantDocs.length,
                model: llmResponse.model
            });
            if (actions.length > 0) {
                try {
                    const actionMessages = actions.map(action => ({
                        type: action.type,
                        params: action.params,
                        target: action.target,
                        correlationId: request.correlationId,
                        tenantId: request.tenantId,
                        sessionId: request.sessionId,
                        userId: request.userId,
                        metadata: {
                            channel: request.channel,
                            timestamp: new Date().toISOString()
                        }
                    }));
                    await this.serviceBusPublisher.publishActions(actionMessages);
                    this.logger.debug(`Published ${actions.length} actions to Service Bus`);
                }
                catch (publishError) {
                    this.logger.error(`Failed to publish actions: ${publishError.message}`);
                }
            }
            const processingTime = Date.now() - startTime;
            const metrics = {
                processingTimeMs: processingTime,
                tokensConsumed: llmResponse.usage.total_tokens,
                embeddingsUsed: retrievedDocs.length,
                cacheStatus: 'miss',
                additional: {
                    vectorSearchTime,
                    llmCallTime: llmTime,
                    actionsCount: actions.length
                }
            };
            const response = {
                correlationId: request.correlationId,
                sessionId: request.sessionId,
                responseText,
                actions: actions.length > 0 ? actions : undefined,
                metrics,
                timestamp: new Date().toISOString()
            };
            this.logger.log(`Request processed successfully in ${processingTime}ms. Tokens: ${llmResponse.usage.total_tokens}, Actions: ${actions.length}`);
            return response;
        }
        catch (error) {
            this.logger.error(`Error processing request for session ${request.sessionId}: ${error.message}`, error.stack);
            return this.buildFallbackResponse(request, error);
        }
    }
    async convertSpeechToText(speechUrl) {
        if (!speechUrl) {
            this.logger.warn('Empty speech URL provided');
            return '[Speech input received]';
        }
        try {
            this.logger.debug(`Converting speech to text from: ${speechUrl}`);
            const result = await this.speechService.speechToText(speechUrl);
            this.logger.log(`STT completed: "${result.text}" (confidence: ${result.confidence})`);
            return result.text || '[No speech recognized]';
        }
        catch (error) {
            this.logger.error(`Speech-to-text conversion failed: ${error.message}`);
            return '[Speech conversion error]';
        }
    }
    buildFallbackResponse(request, error) {
        this.logger.warn(`Building fallback response for session: ${request.sessionId}`);
        return {
            correlationId: request.correlationId,
            sessionId: request.sessionId,
            responseText: 'Lo siento, estoy experimentando dificultades técnicas. ¿Podrías intentar de nuevo en un momento?',
            metrics: {
                processingTimeMs: 0,
                tokensConsumed: 0,
                embeddingsUsed: 0,
                cacheStatus: 'miss',
                additional: {
                    error: error.message,
                    fallback: true
                }
            },
            timestamp: new Date().toISOString(),
            metadata: {
                degradedMode: true,
                errorType: error.constructor.name
            }
        };
    }
};
exports.MetaAgentProcessService = MetaAgentProcessService;
exports.MetaAgentProcessService = MetaAgentProcessService = MetaAgentProcessService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [azure_openai_gpt5_service_1.AzureOpenAIGPT5Service,
        session_context_service_1.SessionContextService,
        mongo_vector_service_1.MongoVectorService,
        tenant_context_store_1.TenantContextStore,
        prompt_builder_service_1.PromptBuilderService,
        action_parser_service_1.ActionParserService,
        service_bus_publisher_service_1.ServiceBusPublisherService,
        azure_speech_service_1.AzureSpeechService])
], MetaAgentProcessService);
//# sourceMappingURL=meta-agent-process.service.js.map