import { Repository } from 'typeorm';
import { AuthLog, AuthEventType } from '../entities/auth-log.entity';
export interface LogAuthEventParams {
    eventType: AuthEventType;
    userId?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
    errorMessage?: string;
    success?: boolean;
    attemptDuration?: number;
    countryCode?: string;
    city?: string;
}
export declare class AuthLogService {
    private readonly authLogRepository;
    private readonly logger;
    constructor(authLogRepository: Repository<AuthLog>);
    logAuthEvent(params: LogAuthEventParams): Promise<AuthLog>;
    getAuthLogs(filters: {
        userId?: string;
        eventType?: AuthEventType;
        ipAddress?: string;
        startDate?: Date;
        endDate?: Date;
        success?: boolean;
    }, limit?: number, offset?: number): Promise<AuthLog[]>;
    getFailedAttemptsByIp(ipAddress: string, timeWindow?: number): Promise<number>;
    getFailedAttemptsByUser(userId: string, timeWindow?: number): Promise<number>;
    deleteOldLogs(olderThan: Date): Promise<number>;
}
