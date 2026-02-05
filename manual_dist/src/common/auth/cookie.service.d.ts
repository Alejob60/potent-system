import { Response, Request } from 'express';
export interface AuthTokenPayload {
    userId: string;
    sessionId: string;
    expiresAt: number;
    roles?: string[];
}
export declare class CookieService {
    private readonly TOKEN_COOKIE_NAME;
    private readonly REFRESH_COOKIE_NAME;
    private readonly COOKIE_OPTIONS;
    setAuthToken(res: Response, payload: AuthTokenPayload, expiresIn: number): void;
    setRefreshToken(res: Response, token: string, expiresIn: number): void;
    getAuthToken(req: Request): AuthTokenPayload | null;
    getRefreshToken(req: Request): string | null;
    clearAuthCookies(res: Response): void;
    isAuthenticated(req: Request): boolean;
}
