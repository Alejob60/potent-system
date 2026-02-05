import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

export interface TenantRequest extends Request {
  tenantId?: string;
  userId?: string;
  sessionId?: string;
}

@Injectable()
export class TenantGuard implements CanActivate {
  private readonly logger = new Logger(TenantGuard.name);

  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<TenantRequest>();
    
    // Extraer tenantId del JWT o headers
    const tenantId = this.extractTenantId(request);
    
    if (!tenantId) {
      this.logger.warn('Missing tenantId in request');
      throw new UnauthorizedException('Tenant identification required');
    }

    // Validar formato de tenantId
    if (!this.isValidTenantId(tenantId)) {
      this.logger.warn(`Invalid tenantId format: ${tenantId}`);
      throw new UnauthorizedException('Invalid tenant identifier');
    }

    // Adjuntar tenantId al request para uso posterior
    request.tenantId = tenantId;
    
    // Extraer otros contextos
    request.userId = this.extractUserId(request);
    request.sessionId = this.extractSessionId(request);

    this.logger.debug(`Tenant context validated: ${tenantId}`);
    return true;
  }

  private extractTenantId(request: TenantRequest): string | undefined {
    // Prioridad: JWT → Header → Query Parameter
    return (
      this.extractFromJWT(request, 'tenantId') ||
      request.headers['x-tenant-id'] as string ||
      request.query?.tenantId as string
    );
  }

  private extractUserId(request: TenantRequest): string | undefined {
    return (
      this.extractFromJWT(request, 'sub') ||
      request.headers['x-user-id'] as string ||
      request.query?.userId as string
    );
  }

  private extractSessionId(request: TenantRequest): string | undefined {
    return (
      request.headers['x-session-id'] as string ||
      request.query?.sessionId as string ||
      this.generateSessionId()
    );
  }

  private extractFromJWT(request: TenantRequest, claim: string): string | undefined {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) return undefined;

      const token = authHeader.substring(7);
      // En producción, usar biblioteca JWT para decodificar realmente
      // Esto es solo para demostración
      const payload = this.decodeJWT(token);
      return payload[claim];
    } catch (error) {
      this.logger.debug('Failed to extract from JWT:', error.message);
      return undefined;
    }
  }

  private decodeJWT(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(Buffer.from(payload, 'base64').toString());
    } catch {
      return {};
    }
  }

  private isValidTenantId(tenantId: string): boolean {
    // Validar formato UUID o patrón específico de tenant
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(tenantId) || tenantId.length <= 50; // Longitud máxima
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}