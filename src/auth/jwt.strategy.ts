import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret-misy-change-me',
    });
  }

  async validate(payload: any) {
    // Validamos que el payload contenga la estructura esperada de Azure/Principal
    if (!payload.sub || !payload.tenantId) {
      throw new UnauthorizedException('Invalid token payload: missing sub or tenantId');
    }

    return {
      userId: payload.sub,
      tenantId: payload.tenantId,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions || [],
    };
  }
}
