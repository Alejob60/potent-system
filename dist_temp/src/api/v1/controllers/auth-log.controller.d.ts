import { AuthLogService } from '../../../services/auth-log.service';
import { AuthEventType } from '../../../entities/auth-log.entity';
export declare class AuthLogController {
    private readonly authLogService;
    constructor(authLogService: AuthLogService);
    getAuthLogs(userId?: string, eventType?: AuthEventType, ipAddress?: string, startDate?: string, endDate?: string, success?: boolean, limit?: number, offset?: number): Promise<import("../../../entities/auth-log.entity").AuthLog[]>;
    getUserAuthLogs(userId: string, limit?: number, offset?: number): Promise<import("../../../entities/auth-log.entity").AuthLog[]>;
    getIpAuthLogs(ipAddress: string, limit?: number, offset?: number): Promise<import("../../../entities/auth-log.entity").AuthLog[]>;
    getFailedAttemptsByIp(ipAddress: string, timeWindow?: number): Promise<{
        count: number;
        ipAddress: string;
        timeWindow: number;
    }>;
    getFailedAttemptsByUser(userId: string, timeWindow?: number): Promise<{
        count: number;
        userId: string;
        timeWindow: number;
    }>;
}
