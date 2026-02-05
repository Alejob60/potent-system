import { RedisService } from '../redis/redis.service';
export interface SessionData {
    id: string;
    userId: string;
    createdAt: number;
    lastAccessed: number;
    ipAddress?: string;
    userAgent?: string;
    roles: string[];
    expiresAt: number;
}
export declare class SessionService {
    private readonly redisService;
    private readonly logger;
    private readonly SESSION_PREFIX;
    private readonly DEFAULT_SESSION_TTL;
    constructor(redisService: RedisService);
    createSession(userId: string, roles?: string[], ipAddress?: string, userAgent?: string, ttl?: number): Promise<string>;
    getSession(sessionId: string): Promise<SessionData | null>;
    updateSession(sessionId: string, updates: Partial<SessionData>): Promise<boolean>;
    destroySession(sessionId: string): Promise<boolean>;
    getUserSessions(userId: string): Promise<SessionData[]>;
    destroyUserSessions(userId: string): Promise<number>;
    cleanupExpiredSessions(): Promise<number>;
}
