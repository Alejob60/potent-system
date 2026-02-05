import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CorrelationIdMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Check if correlation ID already exists in headers
    let correlationId = req.headers['x-correlation-id'] as string;
    
    // If not, generate a new one
    if (!correlationId) {
      correlationId = uuidv4();
    }

    // Add correlation ID to request and response
    req['correlationId'] = correlationId;
    res.setHeader('x-correlation-id', correlationId);

    // Log the start of the request
    this.logger.log(`Request started - Correlation ID: ${correlationId}, Method: ${req.method}, URL: ${req.url}`);

    // Track response finish for logging
    res.on('finish', () => {
      this.logger.log(`Request completed - Correlation ID: ${correlationId}, Status: ${res.statusCode}`);
    });

    next();
  }
}