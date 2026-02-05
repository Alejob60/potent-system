import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContextStoreService, GlobalContext } from '../services/context-store/context-store.service';
import { EventBusService, AgentEvent } from '../services/event-bus/event-bus.service';
import { TenantGuard, TenantRequest } from '../common/guards/tenant.guard';

@ApiTags('Sprint 1 - Context Infrastructure')
@Controller('sprint1')
@UseGuards(TenantGuard)
export class Sprint1Controller {
  constructor(
    private readonly contextStore: ContextStoreService,
    private readonly eventBus: EventBusService,
  ) {}

  @Post('context')
  @ApiOperation({ summary: 'Create or update global context' })
  @ApiResponse({ status: 201, description: 'Context created/updated successfully' })
  async createContext(
    @Req() request: TenantRequest,
    @Body() contextData: Partial<GlobalContext>
  ): Promise<any> {
    const tenantId = request.tenantId!;
    const sessionId = request.sessionId!;

    let context = await this.contextStore.getContext(tenantId, sessionId);
    
    if (!context) {
      context = await this.contextStore.createContext(
        tenantId, 
        sessionId, 
        request.userId
      );
    }

    // Actualizar con datos proporcionados
    Object.assign(context, contextData);
    await this.contextStore.saveContext(context);

    return {
      success: true,
      message: 'Context managed successfully',
      context: {
        tenantId: context.tenantId,
        sessionId: context.sessionId,
        version: context.version,
        historyLength: context.conversationHistory.length
      }
    };
  }

  @Get('context/:sessionId')
  @ApiOperation({ summary: 'Get context by session ID' })
  @ApiResponse({ status: 200, description: 'Context retrieved successfully' })
  async getContext(
    @Req() request: TenantRequest,
    @Param('sessionId') sessionId: string
  ): Promise<any> {
    const context = await this.contextStore.getContext(request.tenantId!, sessionId);
    
    if (!context) {
      return {
        success: false,
        message: 'Context not found'
      };
    }

    return {
      success: true,
      context: {
        tenantId: context.tenantId,
        sessionId: context.sessionId,
        userId: context.userId,
        version: context.version,
        conversationHistory: context.conversationHistory,
        agentStates: context.agentStates,
        metadata: context.metadata
      }
    };
  }

  @Post('event')
  @ApiOperation({ summary: 'Publish event to EventBus' })
  @ApiResponse({ status: 201, description: 'Event published successfully' })
  async publishEvent(
    @Req() request: TenantRequest,
    @Body() eventData: Omit<AgentEvent, 'id' | 'timestamp' | 'tenantId' | 'sessionId'>
  ): Promise<any> {
    const eventId = await this.eventBus.publish({
      ...eventData,
      tenantId: request.tenantId!,
      sessionId: request.sessionId!
    });

    return {
      success: true,
      eventId,
      message: 'Event published to EventBus'
    };
  }

  @Post('conversation/message')
  @ApiOperation({ summary: 'Add message to conversation history' })
  @ApiResponse({ status: 200, description: 'Message added successfully' })
  async addMessage(
    @Req() request: TenantRequest,
    @Body() messageData: { role: 'user' | 'assistant' | 'system'; content: string; metadata?: any }
  ): Promise<any> {
    await this.contextStore.addConversationMessage(
      request.tenantId!,
      request.sessionId!,
      messageData.role,
      messageData.content,
      messageData.metadata
    );

    return {
      success: true,
      message: 'Conversation message added'
    };
  }

  @Post('agent/state')
  @ApiOperation({ summary: 'Update agent state' })
  @ApiResponse({ status: 200, description: 'Agent state updated successfully' })
  async updateAgentState(
    @Req() request: TenantRequest,
    @Body() stateData: { agentName: string; status: 'idle' | 'processing' | 'completed' | 'failed'; data?: any }
  ): Promise<any> {
    await this.contextStore.updateAgentState(
      request.tenantId!,
      request.sessionId!,
      stateData.agentName,
      stateData.status,
      stateData.data
    );

    return {
      success: true,
      message: `Agent ${stateData.agentName} state updated to ${stateData.status}`
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get infrastructure statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(): Promise<any> {
    const eventStats = await this.eventBus.getStats();
    
    return {
      success: true,
      stats: {
        eventBus: eventStats,
        timestamp: new Date().toISOString()
      }
    };
  }
}