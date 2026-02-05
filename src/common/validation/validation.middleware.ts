import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

@Injectable()
export class ValidationMiddleware implements NestMiddleware {
  private schemas: Map<string, ZodSchema> = new Map();

  use(req: Request, res: Response, next: NextFunction) {
    const schema = this.schemas.get(req.path);
    
    if (schema) {
      try {
        // Validate request body
        if (req.body && Object.keys(req.body).length > 0) {
          req.body = schema.parse(req.body);
        }
        
        next();
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors,
        });
      }
    } else {
      next();
    }
  }

  /**
   * Register a schema for a specific path
   * @param path Request path
   * @param schema Zod schema for validation
   */
  registerSchema(path: string, schema: ZodSchema): void {
    this.schemas.set(path, schema);
  }

  /**
   * Clear all registered schemas
   */
  clearSchemas(): void {
    this.schemas.clear();
  }
}