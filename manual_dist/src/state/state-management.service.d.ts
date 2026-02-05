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
    campaignType?: 'single_post' | 'campaign' | 'media_generation' | 'analysis' | 'planning' | 'sales_inquiry' | 'product_info' | 'service_info' | 'website_analysis';
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
export declare class StateManagementService {
    private readonly logger;
    private sessions;
    private readonly SESSION_TIMEOUT;
    constructor();
    createSession(sessionId: string, userId?: string): UserSession;
    getSession(sessionId: string): UserSession | null;
    updateSession(sessionId: string, updates: Partial<UserSession>): UserSession | null;
    deleteSession(sessionId: string): boolean;
    updateContext(sessionId: string, contextUpdates: Partial<SessionContext>): SessionContext | null;
    getContext(sessionId: string): SessionContext | null;
    addConversationEntry(sessionId: string, entry: Omit<ConversationEntry, 'id' | 'timestamp'>): ConversationEntry | null;
    getConversationHistory(sessionId: string, limit?: number): ConversationEntry[];
    addActiveAgent(sessionId: string, agentName: string): boolean;
    removeActiveAgent(sessionId: string, agentName: string): boolean;
    getActiveAgents(sessionId: string): string[];
    addTask(sessionId: string, task: Omit<Task, 'id' | 'createdAt'>): Task | null;
    updateTask(sessionId: string, taskId: string, updates: Partial<Task>): Task | null;
    getTasks(sessionId: string, status?: Task['status']): Task[];
    updatePreferences(sessionId: string, preferences: Partial<UserPreferences>): UserPreferences | null;
    private cleanupExpiredSessions;
    getSessionsCount(): number;
    getActiveSessionsCount(): number;
}
