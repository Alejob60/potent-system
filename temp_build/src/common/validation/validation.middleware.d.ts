import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
export declare class ValidationMiddleware implements NestMiddleware {
    private schemas;
    use(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
    registerSchema(path: string, schema: ZodSchema): void;
    clearSchemas(): void;
}
