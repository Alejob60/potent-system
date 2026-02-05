import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface TokenInfo {
  token: string;
  expiresAt: Date;
  type: 'bearer' | 'api_key';
}

export interface MediaGenerationRequest {
  type: 'video' | 'audio' | 'image';
  content: string;
  parameters?: any;
  sessionId: string;
}

@Injectable()
export class TokenManagementService {
  private readonly logger = new Logger(TokenManagementService.name);
  private tokenCache = new Map<string, TokenInfo>();

  constructor(private readonly httpService: HttpService) {}

  async getToken(serviceName: string): Promise<string> {
    const cached = this.tokenCache.get(serviceName);
    if (cached && cached.expiresAt > new Date()) {
      return cached.token;
    }
    return this.requestNewToken(serviceName);
  }

  private async requestNewToken(serviceName: string): Promise<string> {
    const baseUrl = process.env[`${serviceName.toUpperCase()}_URL`];
    const clientId = process.env[`${serviceName.toUpperCase()}_CLIENT_ID`];
    const clientSecret =
      process.env[`${serviceName.toUpperCase()}_CLIENT_SECRET`];

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${baseUrl}/auth/token`, {
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'client_credentials',
        }),
      );

      const tokenInfo: TokenInfo = {
        token: response.data.access_token,
        expiresAt: new Date(Date.now() + response.data.expires_in * 1000),
        type: 'bearer',
      };

      this.tokenCache.set(serviceName, tokenInfo);
      return tokenInfo.token;
    } catch (error) {
      this.logger.error(`Token request failed for ${serviceName}`, error);
      throw error;
    }
  }

  async makeAuthenticatedRequest(
    serviceName: string,
    method: 'GET' | 'POST',
    endpoint: string,
    data?: any,
  ): Promise<any> {
    const token = await this.getToken(serviceName);
    const baseUrl = process.env[`${serviceName.toUpperCase()}_URL`];

    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    try {
      const response =
        method === 'GET'
          ? await firstValueFrom(
              this.httpService.get(`${baseUrl}${endpoint}`, config),
            )
          : await firstValueFrom(
              this.httpService.post(`${baseUrl}${endpoint}`, data, config),
            );

      return response.data;
    } catch (error) {
      this.logger.error(`Request failed for ${serviceName}${endpoint}`, error);
      throw error;
    }
  }

  async generateMedia(request: MediaGenerationRequest): Promise<any> {
    return this.makeAuthenticatedRequest(
      'media_backend',
      'POST',
      `/generate/${request.type}`,
      request,
    );
  }
}
