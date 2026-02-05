import { Injectable } from '@nestjs/common';
import { Response, Request } from 'express';

export interface AuthTokenPayload {
  userId: string;
  sessionId: string;
  expiresAt: number;
  roles?: string[];
}

@Injectable()
export class CookieService {
  private readonly TOKEN_COOKIE_NAME = 'auth-token';
  private readonly REFRESH_COOKIE_NAME = 'refresh-token';
  private readonly COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true, // Set to true in production with HTTPS
    sameSite: 'strict' as const,
    path: '/',
  };

  /**
   * Set authentication token in secure cookie
   * @param res Express response object
   * @param payload Token payload
   * @param expiresIn Expiration time in seconds
   */
  setAuthToken(res: Response, payload: AuthTokenPayload, expiresIn: number): void {
    const expires = new Date();
    expires.setSeconds(expires.getSeconds() + expiresIn);
    
    res.cookie(this.TOKEN_COOKIE_NAME, JSON.stringify(payload), {
      ...this.COOKIE_OPTIONS,
      expires,
    });
  }

  /**
   * Set refresh token in secure cookie
   * @param res Express response object
   * @param token Refresh token
   * @param expiresIn Expiration time in seconds
   */
  setRefreshToken(res: Response, token: string, expiresIn: number): void {
    const expires = new Date();
    expires.setSeconds(expires.getSeconds() + expiresIn);
    
    res.cookie(this.REFRESH_COOKIE_NAME, token, {
      ...this.COOKIE_OPTIONS,
      expires,
    });
  }

  /**
   * Get authentication token from cookie
   * @param req Express request object
   * @returns Token payload or null
   */
  getAuthToken(req: Request): AuthTokenPayload | null {
    try {
      const token = req.cookies[this.TOKEN_COOKIE_NAME];
      if (!token) return null;
      
      const payload: AuthTokenPayload = JSON.parse(token);
      
      // Check if token is expired
      if (payload.expiresAt < Date.now()) {
        return null;
      }
      
      return payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get refresh token from cookie
   * @param req Express request object
   * @returns Refresh token or null
   */
  getRefreshToken(req: Request): string | null {
    return req.cookies[this.REFRESH_COOKIE_NAME] || null;
  }

  /**
   * Clear authentication cookies
   * @param res Express response object
   */
  clearAuthCookies(res: Response): void {
    res.clearCookie(this.TOKEN_COOKIE_NAME, this.COOKIE_OPTIONS);
    res.clearCookie(this.REFRESH_COOKIE_NAME, this.COOKIE_OPTIONS);
  }

  /**
   * Check if request is authenticated
   * @param req Express request object
   * @returns Boolean indicating if request is authenticated
   */
  isAuthenticated(req: Request): boolean {
    return this.getAuthToken(req) !== null;
  }
}