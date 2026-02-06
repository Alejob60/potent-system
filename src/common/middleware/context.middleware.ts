import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para extraer y decodificar el contexto de usuario desde el header X-Meta-User-Context.
 * El header se espera en formato Base64 conteniendo un JSON con datos del usuario.
 */
@Injectable()
export class ContextMiddleware implements NestMiddleware {
  use(req: any, res: Response, next: NextFunction) {
    const contextHeader = req.headers['x-meta-user-context'];

    if (contextHeader) {
      try {
        // Decodificar Base64
        const decoded = Buffer.from(contextHeader as string, 'base64').toString('utf-8');
        const userContext = JSON.parse(decoded);
        
        // Adjuntar al objeto request para uso en controladores
        req.userContext = userContext;
        
        // Opcional: Log para debugging en desarrollo
        // console.log('User Context detected:', userContext);
      } catch (error) {
        console.error('Error decoding X-Meta-User-Context header:', error.message);
        // Continuamos sin adjuntar el contexto si hay error en la decodificación
      }
    }

    next();
  }
}
