import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface UserSession {
  sessionId: string;
  userId?: string;
  createdAt: Date;
  lastActivity: Date;
  context: SessionContext;
  conversationHistory: ConversationEntry[];
  activeAgents: string[];
  preferences: UserPreferences;
}

export interface SessionContext {
  currentObjective?: string;
  targetChannels?: string[];
  campaignType?:
    | 'single_post'
    | 'campaign'
    | 'media_generation'
    | 'analysis'
    | 'planning'
    | 'sales_inquiry'
    | 'product_info'
    | 'service_info'
    | 'website_analysis';
  businessInfo?: {
    name?: string;
    industry?: string;
    location?: string;
  };
  activeStrategy?: string;
  pendingTasks?: Task[];
  connectedAccounts?: Array<{
    id: string;
    platform: string;
    name: string;
    email: string;
    accountType: string;
  }>;
}

export interface ConversationEntry {
  id: string;
  timestamp: Date;
  type: 'user_message' | 'agent_response' | 'system_event';
  content: string;
  agent?: string;
  metadata?: any;
}

export interface UserPreferences {
  contentTypes?: string[];
  tone?: string;
  frequency?: string;
  language?: string;
  timezone?: string;
}

export interface Task {
  id: string;
  type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  agentAssigned?: string;
  createdAt: Date;
  completedAt?: Date;
  data?: any;
  result?: any;
  error?: string;
}

@Injectable()
export class StateManagementService {
  private readonly logger = new Logger(StateManagementService.name);
  private sessions = new Map<string, UserSession>();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  constructor() {
    // Clean up expired sessions every 5 minutes
    setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000);
  }

  // Session Management
  createSession(sessionId: string, userId?: string): UserSession {
    // If session already exists, return it
    const existingSession = this.sessions.get(sessionId);
    if (existingSession) {
      return existingSession;
    }
    
    const session: UserSession = {
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

  getSession(sessionId: string): UserSession | null {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
      return session;
    }
    return null;
  }

  updateSession(
    sessionId: string,
    updates: Partial<UserSession>,
  ): UserSession | null {
    const session = this.sessions.get(sessionId);
    if (session) {
      Object.assign(session, updates, { lastActivity: new Date() });
      this.sessions.set(sessionId, session);
      return session;
    }
    return null;
  }

  deleteSession(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      this.logger.log(`Deleted session: ${sessionId}`);
    }
    return deleted;
  }

  // Context Management
  updateContext(
    sessionId: string,
    contextUpdates: Partial<SessionContext>,
  ): SessionContext | null {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.context = { ...session.context, ...contextUpdates };
      session.lastActivity = new Date();
      this.logger.log(`Updated context for session ${sessionId}`);
      return session.context;
    }
    return null;
  }

  getContext(sessionId: string): SessionContext | null {
    const session = this.sessions.get(sessionId);
    return session?.context || null;
  }

  // Conversation History
  addConversationEntry(
    sessionId: string,
    entry: Omit<ConversationEntry, 'id' | 'timestamp'>,
  ): ConversationEntry | null {
    const session = this.sessions.get(sessionId);
    if (session) {
      const conversationEntry: ConversationEntry = {
        ...entry,
        id: uuidv4(),
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

  getConversationHistory(sessionId: string, limit = 20): ConversationEntry[] {
    const session = this.sessions.get(sessionId);
    if (session) {
      return session.conversationHistory.slice(-limit);
    }
    return [];
  }

  // Agent Management
  addActiveAgent(sessionId: string, agentName: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session && !session.activeAgents.includes(agentName)) {
      session.activeAgents.push(agentName);
      session.lastActivity = new Date();
      this.logger.log(
        `Added active agent ${agentName} to session ${sessionId}`,
      );
      return true;
    }
    return false;
  }

  removeActiveAgent(sessionId: string, agentName: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      const index = session.activeAgents.indexOf(agentName);
      if (index > -1) {
        session.activeAgents.splice(index, 1);
        session.lastActivity = new Date();
        this.logger.log(
          `Removed active agent ${agentName} from session ${sessionId}`,
        );
        return true;
      }
    }
    return false;
  }

  getActiveAgents(sessionId: string): string[] {
    const session = this.sessions.get(sessionId);
    return session?.activeAgents || [];
  }

  // Task Management
  addTask(
    sessionId: string,
    task: Omit<Task, 'id' | 'createdAt'>,
  ): Task | null {
    const session = this.sessions.get(sessionId);
    if (session) {
      const newTask: Task = {
        ...task,
        id: uuidv4(),
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

  updateTask(
    sessionId: string,
    taskId: string,
    updates: Partial<Task>,
  ): Task | null {
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

  getTasks(sessionId: string, status?: Task['status']): Task[] {
    const session = this.sessions.get(sessionId);
    if (session?.context.pendingTasks) {
      return status
        ? session.context.pendingTasks.filter((t) => t.status === status)
        : session.context.pendingTasks;
    }
    return [];
  }

  // User Preferences
  updatePreferences(
    sessionId: string,
    preferences: Partial<UserPreferences>,
  ): UserPreferences | null {
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
  private cleanupExpiredSessions(): void {
    const now = new Date();
    let cleaned = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      const timeSinceLastActivity =
        now.getTime() - session.lastActivity.getTime();
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
  getSessionsCount(): number {
    return this.sessions.size;
  }

  getActiveSessionsCount(): number {
    const now = new Date();
    let activeCount = 0;

    for (const session of this.sessions.values()) {
      const timeSinceLastActivity =
        now.getTime() - session.lastActivity.getTime();
      if (timeSinceLastActivity <= 5 * 60 * 1000) {
        // Active in last 5 minutes
        activeCount++;
      }
    }

    return activeCount;
  }
}
