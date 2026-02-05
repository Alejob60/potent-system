import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

export interface ChatMessage {
  message: string;
  context?: any;
  sessionId: string;
  timestamp: string;
}

export interface AgentUpdate {
  type: 'agent_started' | 'agent_progress' | 'agent_completed' | 'agent_error';
  agent: string;
  sessionId: string;
  data?: any;
  error?: string;
  timestamp: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class WebSocketGatewayService
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGatewayService.name);
  private connectedClients = new Map<string, Socket>();
  private sessionMap = new Map<string, string>(); // sessionId -> socketId

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);

    client.emit('connection_established', {
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);

    // Clean up session mapping
    this.sessionMap.forEach((socketId, sessionId) => {
      if (socketId === client.id) {
        this.sessionMap.delete(sessionId);
        return;
      }
    });
  }

  @SubscribeMessage('user_message')
  async handleUserMessage(
    @MessageBody() data: { sessionId: string; message: string; timestamp: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { sessionId, message, timestamp } = data;
    this.logger.log(`Received user message for session ${sessionId}: ${message}`);
    
    // Emit the message to the room for real-time updates
    this.server.to(sessionId).emit('user_message_received', {
      sessionId,
      message,
      timestamp,
    });

    // Here you would typically process the message and send it to your chat service
    // For now, we'll just acknowledge receipt
    client.emit('message_acknowledged', {
      sessionId,
      messageId: `msg_${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('join_session')
  handleJoinSession(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { sessionId } = data;
    this.sessionMap.set(sessionId, client.id);
    client.join(sessionId);

    this.logger.log(`Client ${client.id} joined session ${sessionId}`);

    client.emit('session_joined', {
      sessionId,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('leave_session')
  handleLeaveSession(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { sessionId } = data;
    client.leave(sessionId);
    this.sessionMap.delete(sessionId);

    this.logger.log(`Client ${client.id} left session ${sessionId}`);
  }

  // Method to emit messages to specific session
  emitToSession(sessionId: string, event: string, data: any) {
    this.server.to(sessionId).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Method to emit agent progress updates
  emitAgentUpdate(update: AgentUpdate) {
    this.emitToSession(update.sessionId, 'agent_update', update);
    this.logger.log(
      `Agent update sent to session ${update.sessionId}: ${update.type} - ${update.agent}`,
    );
  }

  // Method to emit chat responses
  emitChatResponse(sessionId: string, response: any) {
    this.emitToSession(sessionId, 'chat_response', response);
  }

  // Method to emit campaign updates
  emitCampaignUpdate(sessionId: string, campaignData: any) {
    this.emitToSession(sessionId, 'campaign_update', campaignData);
  }

  // Method to emit calendar events
  emitCalendarUpdate(sessionId: string, calendarData: any) {
    this.emitToSession(sessionId, 'calendar_update', calendarData);
  }

  // Method to broadcast system notifications
  broadcastSystemNotification(notification: any) {
    this.server.emit('system_notification', {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  }

  // Get connected clients count
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  // Check if session is active
  isSessionActive(sessionId: string): boolean {
    return this.sessionMap.has(sessionId);
  }

  // Add missing sendToUser method
  sendToUser(userId: string, data: any) {
    const socketId = this.sessionMap.get(userId);
    if (socketId && this.connectedClients.has(socketId)) {
      const client = this.connectedClients.get(socketId);
      if (client) {
        client.emit('message', data);
      }
    }
  }
}
