export declare enum AuthEventType {
    LOGIN_ATTEMPT = "login_attempt",
    LOGIN_SUCCESS = "login_success",
    LOGIN_FAILURE = "login_failure",
    LOGOUT = "logout",
    SESSION_EXPIRED = "session_expired",
    TOKEN_REFRESH = "token_refresh",
    UNAUTHORIZED_ACCESS = "unauthorized_access"
}
export declare class AuthLog {
    id: string;
    eventType: AuthEventType;
    userId: string;
    sessionId: string;
    ipAddress: string;
    userAgent: string;
    metadata: Record<string, any>;
    errorMessage: string;
    createdAt: Date;
    countryCode: string;
    city: string;
    success: boolean;
    attemptDuration: number;
}
