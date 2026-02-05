import { Injectable, Logger } from '@nestjs/common';
import { ProcessRequestDto } from '../dtos/process-request.dto';
import { ProcessResponseDto, ActionDto, MetricsDto } from '../dtos/process-response.dto';
import { AzureOpenAIGPT5Service, ChatMessage } from './azure-openai-gpt5.service';
import { SessionContextService } from './session-context.service';
import { MongoVectorService } from '../../../common/mongodb/mongo-vector.service';
import { TenantContextStore } from '../../security/tenant-context.store';
import { PromptBuilderService, TenantADN, RetrievedDocument } from './prompt-builder.service';
import { ActionParserService } from './action-parser.service';
import { ServiceBusPublisherService } from './service-bus-publisher.service';
import { AzureSpeechService } from './azure-speech.service';

@Injectable()
export class MetaAgentProcessService {
  private readonly logger = new Logger(MetaAgentProcessService.name);

  constructor(
    private readonly gpt5Service: AzureOpenAIGPT5Service,
    private readonly sessionContextService: SessionContextService,
    private readonly vectorService: MongoVectorService,
    private readonly tenantContextStore: TenantContextStore,
    private readonly promptBuilder: PromptBuilderService,
    private readonly actionParser: ActionParserService,
    private readonly serviceBusPublisher: ServiceBusPublisherService,
    private readonly speechService: AzureSpeechService,
  ) {}

  /**
   * Process incoming request from user
   * @param request Process request
   * @returns Process response
   */
  async process(request: ProcessRequestDto): Promise<ProcessResponseDto> {
    const startTime = Date.now();
    
    this.logger.log(
      `Processing request for tenant: ${request.tenantId}, session: ${request.sessionId}, correlation: ${request.correlationId}`
    );

    try {
      // 1. Get or create session context
      const sessionContext = await this.sessionContextService.getOrCreateContext(
        request.sessionId,
        request.tenantId,
        request.channel,
        request.userId
      );

      this.logger.debug(`Session context retrieved. State: ${sessionContext.shortContext.conversationState}`);

      // 2. Get tenant context (ADN, policies, etc.)
      const tenantContext = await this.tenantContextStore.getTenantContext(request.tenantId);
      
      // 3. Extract user message text
      let userMessage: string;
      if (request.input.type === 'text') {
        userMessage = request.input.text || '';
      } else if (request.input.type === 'speech') {
        // Convert speech to text using Azure Speech Service
        userMessage = await this.convertSpeechToText(request.input.speechUrl || '');
      } else {
        userMessage = JSON.stringify(request.input.metadata);
      }

      this.logger.debug(`User message: "${userMessage.substring(0, 100)}..."`);

      // 4. Generate embedding for semantic search
      const userEmbedding = await this.gpt5Service.generateEmbedding(userMessage, request.tenantId);

      // 5. Perform vector search (tenant-scoped)
      const vectorSearchStart = Date.now();
      const relevantDocs = await this.vectorService.semanticSearch(
        userEmbedding,
        request.tenantId,
        10, // limit
        0.75 // threshold
      );
      const vectorSearchTime = Date.now() - vectorSearchStart;

      const retrievedDocs: RetrievedDocument[] = relevantDocs.map(doc => ({
        text: doc.document.text,
        score: doc.score || 0.85,
        metadata: {
          source: (doc.document.metadata as any)?.source,
          category: (doc.document.metadata as any)?.category,
          lang: (doc.document.metadata as any)?.lang
        }
      }));

      this.logger.debug(`Vector search returned ${retrievedDocs.length} relevant documents in ${vectorSearchTime}ms`);

      // 6. Build prompt with PromptBuilder
      const tenantADN: TenantADN = {
        businessProfile: {
          name: (tenantContext?.businessProfile as any)?.name || 'Platform',
          description: (tenantContext?.businessProfile as any)?.description || '',
          industry: (tenantContext?.businessProfile as any)?.industry || 'General',
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

      const messages = this.promptBuilder.buildPrompt(
        tenantADN,
        sessionContext,
        retrievedDocs,
        userMessage
      );

      // 7. Call GPT-5
      const llmStart = Date.now();
      const llmResponse = await this.gpt5Service.chatCompletion(
        {
          messages,
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 0.95
        },
        request.tenantId
      );
      const llmTime = Date.now() - llmStart;

      const fullResponseText = llmResponse.choices[0].message.content;
      
      // Extract clean response (without action markers)
      const responseText = this.actionParser.extractCleanResponse(fullResponseText);
      
      this.logger.debug(`LLM response in ${llmTime}ms: "${responseText.substring(0, 100)}..."`);

      // 8. Parse actions from response
      const actions = this.actionParser.parseActions(fullResponseText);
      
      this.logger.debug(`Parsed ${actions.length} actions from LLM response`);

      // 9. Persist conversation turns
      await this.sessionContextService.addConversationTurn(
        request.sessionId,
        request.tenantId,
        request.correlationId,
        'user',
        userMessage,
        undefined,
        {
          channel: request.channel,
          inputType: request.input.type
        }
      );

      await this.sessionContextService.addConversationTurn(
        request.sessionId,
        request.tenantId,
        request.correlationId,
        'agent',
        responseText,
        actions,
        {
          channel: request.channel,
          tokensUsed: llmResponse.usage.total_tokens,
          embeddingsRetrieved: relevantDocs.length,
          model: llmResponse.model
        }
      );

      // 10. Publish actions to Service Bus
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
        } catch (publishError) {
          this.logger.error(`Failed to publish actions: ${publishError.message}`);
          // Don't fail the entire request if publishing fails
        }
      }

      // 11. Build response
      const processingTime = Date.now() - startTime;
      
      const metrics: MetricsDto = {
        processingTimeMs: processingTime,
        tokensConsumed: llmResponse.usage.total_tokens,
        embeddingsUsed: retrievedDocs.length,
        cacheStatus: 'miss', // TODO: Implement cache logic
        additional: {
          vectorSearchTime,
          llmCallTime: llmTime,
          actionsCount: actions.length
        }
      };

      const response: ProcessResponseDto = {
        correlationId: request.correlationId,
        sessionId: request.sessionId,
        responseText,
        actions: actions.length > 0 ? actions : undefined,
        metrics,
        timestamp: new Date().toISOString()
      };

      this.logger.log(
        `Request processed successfully in ${processingTime}ms. Tokens: ${llmResponse.usage.total_tokens}, Actions: ${actions.length}`
      );

      return response;

    } catch (error) {
      this.logger.error(
        `Error processing request for session ${request.sessionId}: ${error.message}`,
        error.stack
      );
      
      // Return fallback response
      return this.buildFallbackResponse(request, error);
    }
  }

  /**
   * Convert speech to text using Azure Speech Service
   * @param speechUrl URL to audio file in blob storage
   * @returns Transcribed text
   */
  private async convertSpeechToText(speechUrl: string): Promise<string> {
    if (!speechUrl) {
      this.logger.warn('Empty speech URL provided');
      return '[Speech input received]';
    }

    try {
      this.logger.debug(`Converting speech to text from: ${speechUrl}`);
      
      const result = await this.speechService.speechToText(speechUrl);
      
      this.logger.log(`STT completed: "${result.text}" (confidence: ${result.confidence})`);
      
      return result.text || '[No speech recognized]';
    } catch (error) {
      this.logger.error(`Speech-to-text conversion failed: ${error.message}`);
      return '[Speech conversion error]';
    }
  }

  /**
   * Build fallback response when processing fails
   */
  private buildFallbackResponse(request: ProcessRequestDto, error: Error): ProcessResponseDto {
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
}
