"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CorrelationIdMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorrelationIdMiddleware = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let CorrelationIdMiddleware = CorrelationIdMiddleware_1 = class CorrelationIdMiddleware {
    logger = new common_1.Logger(CorrelationIdMiddleware_1.name);
    use(req, res, next) {
        // Check if correlation ID already exists in headers
        let correlationId = req.headers['x-correlation-id'];
        // If not, generate a new one
        if (!correlationId) {
            correlationId = (0, uuid_1.v4)();
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
};
exports.CorrelationIdMiddleware = CorrelationIdMiddleware;
exports.CorrelationIdMiddleware = CorrelationIdMiddleware = CorrelationIdMiddleware_1 = __decorate([
    (0, common_1.Injectable)()
], CorrelationIdMiddleware);
