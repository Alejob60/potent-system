import { Injectable } from '@nestjs/common';
import { TenantBaseAgent } from '../../../common/agents/tenant-base.agent';
import { AgentResult } from '../../../common/agents/agent-base';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
import { AIDecisionEngine, DecisionInput } from '../../../ai/ai-decision-engine.service';
import { FrontDeskConversation } from '../entities/front-desk-conversation.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { PurchaseIntentDetectorService, PurchaseIntentResult } from '../../../services/purchase-intent-detector.service';
import { TenantContextStore } from '../../../meta-agent/security/tenant-context.store';

export interface FrontDeskPayload {
  message: string;
  context?: {
    sessionId?: string;
    language?: string;
    origin?: string; // Origin information
    siteType?: string; // Site type information (e.g., 'colombiatic')
    products?: string[]; // Available products/services on the site
    services?: string[]; // Available services on the site
    websiteUrl?: string; // Website URL for analysis
    [key: string]: any;
  };
  tenantContext?: {
    tenantId: string;
    siteId: string;
    origin: string;
    permissions: string[];
    channel?: string;
    sessionId?: string;
    siteType?: string; // Site type information
    products?: string[]; // Available products/services for this tenant
    services?: string[]; // Available services for this tenant
    websiteUrl?: string; // Website URL for analysis
    [key: string]: any;
  };
}

export interface FrontDeskResult {
  response: string;
  routingDecision: string;
  contextSummary: string;
  nextSteps: string[];
  emotion?: string;
  urgency?: number;
  complexity?: number;
  purchaseIntent?: PurchaseIntentResult; // Added purchase intent result
}

@Injectable()
export class FrontDeskV2Service extends TenantBaseAgent {
  constructor(
    redisService: RedisService,
    stateManager: StateManagementService,
    websocketGateway: WebSocketGatewayService,
    private readonly aiDecisionEngine: AIDecisionEngine,
    private readonly purchaseIntentDetector: PurchaseIntentDetectorService,
    private readonly tenantContextStore: TenantContextStore,
    @InjectRepository(FrontDeskConversation)
    private readonly conversationRepository: Repository<FrontDeskConversation>,
  ) {
    super(
      'front-desk-v2',
      'Intelligent Gateway for Multi-tenant request orchestration',
      ['message_processing', 'agent_routing', 'context_enrichment', 'security_validation'],
      redisService,
      stateManager,
      websocketGateway,
    );
  }

  /**
   * Main Gateway Execution
   */
  async execute(payload: FrontDeskPayload): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      // 1. Validate mandatory tenant context
      const tenantId = await this.validateTenant(payload);
      
      // 2. Ensure we have a proper session ID
      let sessionId = payload.context?.sessionId || payload.tenantContext?.sessionId;
      if (!sessionId) {
        sessionId = `session-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      }

      this.logger.log(`Processing front desk request for tenant ${tenantId}, session ${sessionId}`);

      // 3. Enrich with DB Tenant Context
      const tenantContext = await this.tenantContextStore.getTenantContext(tenantId);
      
      // 4. Merge context for AI
      const enrichedPayload = {
        ...payload,
        tenantId,
        sessionId,
        businessData: tenantContext
      };

      // 5. Notify via WebSocket
      if (this.websocketGateway) {
        this.websocketGateway.broadcastSystemNotification({
          type: 'agent_processing',
          agent: this.config.name,
          sessionId: sessionId,
          message: 'Processing user message',
          timestamp: new Date().toISOString(),
        });
      }

      // 6. Process message with AI logic
      const result = await this.processMessageWithAI(enrichedPayload, sessionId);
      
      // 7. Calculate metrics
      const processingTime = Date.now() - startTime;
      this.updateMetrics({ avgResponseTime: processingTime });

      // 8. Format response
      const responseData = {
        response: result.response,
        routingDecision: result.routingDecision,
        contextSummary: result.contextSummary,
        nextSteps: result.nextSteps,
        emotion: result.emotion,
        urgency: result.urgency,
        complexity: result.complexity,
      };

      const formattedResponse = this.formatResponse(responseData);

      // 9. Notify completion
      if (this.websocketGateway) {
        this.websocketGateway.broadcastSystemNotification({
          type: 'agent_response',
          agent: this.config.name,
          sessionId: sessionId,
          message: 'Processing complete',
          data: formattedResponse.data,
          timestamp: new Date().toISOString(),
        });
      }

      return formattedResponse;
    } catch (error) {
      this.logger.error(`Error in execute method: ${error.message}`, error.stack);
      return this.handleError(error, 'execute');
    }
  }

  /**
   * Validate front desk payload
   */
  async validate(payload: FrontDeskPayload): Promise<boolean> {
    if (!payload) return false;
    if (!payload.message) return false;
    return true;
  }

  /**
   * Process user message with AI decision engine and enhanced emotion analysis
   */
  private async processMessageWithAI(
    payload: any,
    sessionId: string,
  ): Promise<FrontDeskResult> {
    const tenantId = payload.tenantId;
    
    // Get session context and conversation history
    let sessionContext: any = {};
    let conversationHistory: any[] = [];
    
    if (this.stateManager) {
      let session = this.stateManager.getSession(sessionId);
      if (!session) {
        session = this.stateManager.createSession(sessionId);
      }
      if (session) {
        sessionContext = session.context || {};
        conversationHistory = session.conversationHistory || [];
      }
    }
    
    // Merge Contexts
    sessionContext = {
      ...sessionContext,
      tenantId,
      ...payload.tenantContext,
      ...payload.context,
      businessData: payload.businessData
    };

    // Add current user message
    if (this.stateManager) {
      this.stateManager.addConversationEntry(sessionId, {
        type: 'user_message',
        content: payload.message,
      });
      conversationHistory = this.stateManager.getConversationHistory(sessionId, 10);
    }
    
    // Detect purchase intent
    const purchaseIntent = this.purchaseIntentDetector.detectPurchaseIntent(payload.message, sessionContext);
    
    // Detect emotion
    const emotionAnalysis = await this.detectEmotionWithAI(payload.message, conversationHistory);
    
    // Prepare decision input
    const decisionInput: DecisionInput = {
      message: payload.message,
      context: sessionContext,
      conversationHistory: conversationHistory.map((entry: any) => ({
        content: entry.content || '',
        type: entry.type || 'user_message',
        agent: entry.agent || ''
      })),
      userPreferences: {}
    };
    
    const aiDecision = await this.aiDecisionEngine.makeDecision(decisionInput);
    
    // Persistence
    if (this.conversationRepository) {
      try {
        const conversation = this.conversationRepository.create({
          sessionId: sessionId,
          userMessage: payload.message,
          agentResponse: aiDecision.reasoning,
          objective: aiDecision.taskType,
          targetAgent: aiDecision.primaryAgent,
          collectedInfo: decisionInput.context,
          missingInfo: [],
          language: payload.context?.language || 'en',
          confidence: aiDecision.confidence,
          emotion: emotionAnalysis.emotion,
          entities: {},
          context: sessionContext,
          integrationId: '',
          integrationStatus: 'pending'
        });
        await this.conversationRepository.save(conversation);
      } catch (error) {
        this.logger.error('Failed to save conversation', error.stack);
      }
    }
    
    // Update State
    if (this.stateManager) {
      this.stateManager.updateContext(sessionId, {
        currentObjective: aiDecision.taskType,
        ...sessionContext
      });
      this.stateManager.addConversationEntry(sessionId, {
        type: 'agent_response',
        content: aiDecision.reasoning,
        agent: this.config.name,
        metadata: {
          routingDecision: aiDecision.primaryAgent,
          confidence: aiDecision.confidence,
          emotion: emotionAnalysis.emotion,
          purchaseIntent
        }
      });
    }
    
    const response = await this.generateEmotionalResponse(
      aiDecision, 
      emotionAnalysis, 
      payload.message,
      sessionContext,
      purchaseIntent
    );
    
    return {
      response,
      routingDecision: aiDecision.primaryAgent,
      contextSummary: aiDecision.reasoning,
      nextSteps: [ `Routing to ${aiDecision.primaryAgent}` ],
      emotion: emotionAnalysis.emotion,
      urgency: emotionAnalysis.urgency,
      complexity: emotionAnalysis.complexity,
      purchaseIntent
    };
  }

  private async detectEmotionWithAI(message: string, history: any[]): Promise<{ emotion: string; urgency: number; complexity: number }> {
    // Legacy logic preserved or rules-based fallback
    return { emotion: 'neutral', urgency: 5, complexity: 5 };
  }

  private async generateEmotionalResponse(aiDecision: any, emotionAnalysis: any, userMessage: string, sessionContext: any, purchaseIntent: any): Promise<string> {
    return `MisyBot Enterprise: He analizado tu solicitud sobre ${aiDecision.taskType}. Te derivaré con el especialista de ${aiDecision.primaryAgent}.`;
  }
}
