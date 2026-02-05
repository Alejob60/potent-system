import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
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
export declare class WebSocketGatewayService implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    private connectedClients;
    private sessionMap;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleUserMessage(data: {
        sessionId: string;
        message: string;
        timestamp: string;
    }, client: Socket): Promise<void>;
    handleJoinSession(data: {
        sessionId: string;
    }, client: Socket): void;
    handleLeaveSession(data: {
        sessionId: string;
    }, client: Socket): void;
    emitToSession(sessionId: string, event: string, data: any): void;
    emitAgentUpdate(update: AgentUpdate): void;
    emitChatResponse(sessionId: string, response: any): void;
    emitCampaignUpdate(sessionId: string, campaignData: any): void;
    emitCalendarUpdate(sessionId: string, calendarData: any): void;
    broadcastSystemNotification(notification: any): void;
    getConnectedClientsCount(): number;
    isSessionActive(sessionId: string): boolean;
    sendToUser(userId: string, data: any): void;
}
