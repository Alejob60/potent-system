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
var WebSocketGatewayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketGatewayService = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let WebSocketGatewayService = WebSocketGatewayService_1 = class WebSocketGatewayService {
    server;
    logger = new common_1.Logger(WebSocketGatewayService_1.name);
    connectedClients = new Map();
    sessionMap = new Map(); // sessionId -> socketId
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
        this.connectedClients.set(client.id, client);
        client.emit('connection_established', {
            clientId: client.id,
            timestamp: new Date().toISOString(),
        });
    }
    handleDisconnect(client) {
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
    async handleUserMessage(data, client) {
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
    handleJoinSession(data, client) {
        const { sessionId } = data;
        this.sessionMap.set(sessionId, client.id);
        client.join(sessionId);
        this.logger.log(`Client ${client.id} joined session ${sessionId}`);
        client.emit('session_joined', {
            sessionId,
            timestamp: new Date().toISOString(),
        });
    }
    handleLeaveSession(data, client) {
        const { sessionId } = data;
        client.leave(sessionId);
        this.sessionMap.delete(sessionId);
        this.logger.log(`Client ${client.id} left session ${sessionId}`);
    }
    // Method to emit messages to specific session
    emitToSession(sessionId, event, data) {
        this.server.to(sessionId).emit(event, {
            ...data,
            timestamp: new Date().toISOString(),
        });
    }
    // Method to emit agent progress updates
    emitAgentUpdate(update) {
        this.emitToSession(update.sessionId, 'agent_update', update);
        this.logger.log(`Agent update sent to session ${update.sessionId}: ${update.type} - ${update.agent}`);
    }
    // Method to emit chat responses
    emitChatResponse(sessionId, response) {
        this.emitToSession(sessionId, 'chat_response', response);
    }
    // Method to emit campaign updates
    emitCampaignUpdate(sessionId, campaignData) {
        this.emitToSession(sessionId, 'campaign_update', campaignData);
    }
    // Method to emit calendar events
    emitCalendarUpdate(sessionId, calendarData) {
        this.emitToSession(sessionId, 'calendar_update', calendarData);
    }
    // Method to broadcast system notifications
    broadcastSystemNotification(notification) {
        this.server.emit('system_notification', {
            ...notification,
            timestamp: new Date().toISOString(),
        });
    }
    // Get connected clients count
    getConnectedClientsCount() {
        return this.connectedClients.size;
    }
    // Check if session is active
    isSessionActive(sessionId) {
        return this.sessionMap.has(sessionId);
    }
    // Add missing sendToUser method
    sendToUser(userId, data) {
        const socketId = this.sessionMap.get(userId);
        if (socketId && this.connectedClients.has(socketId)) {
            const client = this.connectedClients.get(socketId);
            if (client) {
                client.emit('message', data);
            }
        }
    }
};
exports.WebSocketGatewayService = WebSocketGatewayService;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], WebSocketGatewayService.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('user_message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], WebSocketGatewayService.prototype, "handleUserMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_session'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], WebSocketGatewayService.prototype, "handleJoinSession", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_session'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], WebSocketGatewayService.prototype, "handleLeaveSession", null);
exports.WebSocketGatewayService = WebSocketGatewayService = WebSocketGatewayService_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
            methods: ['GET', 'POST'],
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    })
], WebSocketGatewayService);
