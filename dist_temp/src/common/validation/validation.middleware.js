"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationMiddleware = void 0;
const common_1 = require("@nestjs/common");
let ValidationMiddleware = class ValidationMiddleware {
    constructor() {
        this.schemas = new Map();
    }
    use(req, res, next) {
        const schema = this.schemas.get(req.path);
        if (schema) {
            try {
                if (req.body && Object.keys(req.body).length > 0) {
                    req.body = schema.parse(req.body);
                }
                next();
            }
            catch (error) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: error.errors,
                });
            }
        }
        else {
            next();
        }
    }
    registerSchema(path, schema) {
        this.schemas.set(path, schema);
    }
    clearSchemas() {
        this.schemas.clear();
    }
};
exports.ValidationMiddleware = ValidationMiddleware;
exports.ValidationMiddleware = ValidationMiddleware = __decorate([
    (0, common_1.Injectable)()
], ValidationMiddleware);
//# sourceMappingURL=validation.middleware.js.map