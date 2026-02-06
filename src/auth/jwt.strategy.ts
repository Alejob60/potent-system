import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET') || 
                   '33998ac3de53c1fc4f5ee32b477a3892004f3ba312440e1f2ecf9e4dfb4e920576bf85e76b97e3b0dad31656771e337b9b6f33c9102bb8b01902ccb3564d848c';
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
    
    this.logger.log('JWT Strategy initialized with shared secret inheritance');
  }

  async validate(payload: any) {
    try {
      // Log para debugging de tokens entrantes (solo en desarrollo o debug)
      // console.log('Validating payload:', payload);

      if (!payload.sub && !payload.userId && !payload.id) {
        this.logger.error('Invalid token payload: missing identifier (sub/userId/id)');
        throw new UnauthorizedException('Invalid token payload');
      }

      return {
        userId: payload.sub || payload.userId || payload.id,
        tenantId: payload.tenantId || payload['x-tenant-id'] || '',
        email: payload.email,
        role: payload.role,
      };
    } catch (error) {
      this.logger.error(`Token validation failed: ${error.message}`);
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
