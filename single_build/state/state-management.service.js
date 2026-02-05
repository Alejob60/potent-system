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
var StateManagementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateManagementService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let StateManagementService = StateManagementService_1 = class StateManagementService {
    logger = new common_1.Logger(StateManagementService_1.name);
    sessions = new Map();
    SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    constructor() {
        // Clean up expired sessions every 5 minutes
        setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000);
    }
    // Session Management
    createSession(sessionId, userId) {
        // If session already exists, return it
        const existingSession = this.sessions.get(sessionId);
        if (existingSession) {
            return existingSession;
        }
        const session = {
            sessionId,
            userId,
            createdAt: new Date(),
            lastActivity: new Date(),
            context: {},
            conversationHistory: [],
            activeAgents: [],
            preferences: {},
        };
        this.sessions.set(sessionId, session);
        this.logger.log(`Created new session: ${sessionId}`);
        return session;
    }
    getSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.lastActivity = new Date();
            return session;
        }
        return null;
    }
    updateSession(sessionId, updates) {
        const session = this.sessions.get(sessionId);
        if (session) {
            Object.assign(session, updates, { lastActivity: new Date() });
            this.sessions.set(sessionId, session);
            return session;
        }
        return null;
    }
    deleteSession(sessionId) {
        const deleted = this.sessions.delete(sessionId);
        if (deleted) {
            this.logger.log(`Deleted session: ${sessionId}`);
        }
        return deleted;
    }
    // Context Management
    updateContext(sessionId, contextUpdates) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.context = { ...session.context, ...contextUpdates };
            session.lastActivity = new Date();
            this.logger.log(`Updated context for session ${sessionId}`);
            return session.context;
        }
        return null;
    }
    getContext(sessionId) {
        const session = this.sessions.get(sessionId);
        return session?.context || null;
    }
    // Conversation History
    addConversationEntry(sessionId, entry) {
        const session = this.sessions.get(sessionId);
        if (session) {
            const conversationEntry = {
                ...entry,
                id: (0, uuid_1.v4)(),
                timestamp: new Date(),
            };
            session.conversationHistory.push(conversationEntry);
            session.lastActivity = new Date();
            // Keep only last 100 entries
            if (session.conversationHistory.length > 100) {
                session.conversationHistory = session.conversationHistory.slice(-100);
            }
            this.logger.log(`Added conversation entry to session ${sessionId}`);
            return conversationEntry;
        }
        return null;
    }
    getConversationHistory(sessionId, limit = 20) {
        const session = this.sessions.get(sessionId);
        if (session) {
            return session.conversationHistory.slice(-limit);
        }
        return [];
    }
    // Agent Management
    addActiveAgent(sessionId, agentName) {
        const session = this.sessions.get(sessionId);
        if (session && !session.activeAgents.includes(agentName)) {
            session.activeAgents.push(agentName);
            session.lastActivity = new Date();
            this.logger.log(`Added active agent ${agentName} to session ${sessionId}`);
            return true;
        }
        return false;
    }
    removeActiveAgent(sessionId, agentName) {
        const session = this.sessions.get(sessionId);
        if (session) {
            const index = session.activeAgents.indexOf(agentName);
            if (index > -1) {
                session.activeAgents.splice(index, 1);
                session.lastActivity = new Date();
                this.logger.log(`Removed active agent ${agentName} from session ${sessionId}`);
                return true;
            }
        }
        return false;
    }
    getActiveAgents(sessionId) {
        const session = this.sessions.get(sessionId);
        return session?.activeAgents || [];
    }
    // Task Management
    addTask(sessionId, task) {
        const session = this.sessions.get(sessionId);
        if (session) {
            const newTask = {
                ...task,
                id: (0, uuid_1.v4)(),
                createdAt: new Date(),
            };
            if (!session.context.pendingTasks) {
                session.context.pendingTasks = [];
            }
            session.context.pendingTasks.push(newTask);
            session.lastActivity = new Date();
            this.logger.log(`Added task ${newTask.id} to session ${sessionId}`);
            return newTask;
        }
        return null;
    }
    updateTask(sessionId, taskId, updates) {
        const session = this.sessions.get(sessionId);
        if (session?.context.pendingTasks) {
            const task = session.context.pendingTasks.find((t) => t.id === taskId);
            if (task) {
                Object.assign(task, updates);
                if (updates.status === 'completed' || updates.status === 'failed') {
                    task.completedAt = new Date();
                }
                session.lastActivity = new Date();
                this.logger.log(`Updated task ${taskId} in session ${sessionId}`);
                return task;
            }
        }
        return null;
    }
    getTasks(sessionId, status) {
        const session = this.sessions.get(sessionId);
        if (session?.context.pendingTasks) {
            return status
                ? session.context.pendingTasks.filter((t) => t.status === status)
                : session.context.pendingTasks;
        }
        return [];
    }
    // User Preferences
    updatePreferences(sessionId, preferences) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.preferences = { ...session.preferences, ...preferences };
            session.lastActivity = new Date();
            this.logger.log(`Updated preferences for session ${sessionId}`);
            return session.preferences;
        }
        return null;
    }
    // Cleanup
    cleanupExpiredSessions() {
        const now = new Date();
        let cleaned = 0;
        for (const [sessionId, session] of this.sessions.entries()) {
            const timeSinceLastActivity = now.getTime() - session.lastActivity.getTime();
            if (timeSinceLastActivity > this.SESSION_TIMEOUT) {
                this.sessions.delete(sessionId);
                cleaned++;
            }
        }
        if (cleaned > 0) {
            this.logger.log(`Cleaned up ${cleaned} expired sessions`);
        }
    }
    // Statistics
    getSessionsCount() {
        return this.sessions.size;
    }
    getActiveSessionsCount() {
        const now = new Date();
        let activeCount = 0;
        for (const session of this.sessions.values()) {
            const timeSinceLastActivity = now.getTime() - session.lastActivity.getTime();
            if (timeSinceLastActivity <= 5 * 60 * 1000) {
                // Active in last 5 minutes
                activeCount++;
            }
        }
        return activeCount;
    }
};
exports.StateManagementService = StateManagementService;
exports.StateManagementService = StateManagementService = StateManagementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], StateManagementService);
