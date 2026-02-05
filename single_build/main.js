"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: '.env.local' });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const helmet_1 = __importDefault(require("helmet"));
const path_1 = require("path");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
// Swagger imports
const swagger_1 = require("@nestjs/swagger");
// Cookie parser for secure authentication
const cookie_parser_1 = __importDefault(require("cookie-parser"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Set global prefix for versioned API
    // app.setGlobalPrefix('api/v1'); // Comentado para permitir rutas personalizadas
    // Security
    app.use((0, helmet_1.default)({
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: false,
    }));
    // Cookie parser for secure authentication
    app.use((0, cookie_parser_1.default)());
    // CORS
    app.enableCors({
        origin: process.env.CORS_ORIGINS?.split(','),
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept',
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });
    // Global validation
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    // Static assets
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'));
    // Swagger Configuration
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Misy Agent API')
        .setDescription('API documentation for the Misy Agent system - Orchestrating AI agents for content creation and campaign management')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('oauth', 'OAuth authentication endpoints for social media and email platforms')
        .addTag('integrations', 'Integration endpoints for email, calendar, and social media')
        .addTag('social', 'Social media management endpoints')
        .addTag('agents', 'AI agent orchestration endpoints')
        .addTag('admin', 'Admin and campaign management endpoints')
        .addTag('chat', 'Chat interaction endpoints')
        .addTag('calendar', 'Calendar management endpoints')
        .addTag('health', 'Health check endpoints')
        .addTag('colombiatic', 'ColombiaTIC AI Agent endpoints')
        .addTag('webhooks', 'Webhook processing endpoints')
        .addTag('ia-orchestrator', 'IA Orchestrator endpoints')
        .addTag('colombiatic-orchestrator', 'ColombiaTIC Orchestrator endpoints')
        .addTag('colombiatic-dashboard', 'ColombiaTIC Dashboard and Analytics endpoints')
        .addTag('data-governance', 'Data Governance and Privacy endpoints')
        .addTag('security', 'Security and authentication endpoints')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api-docs', app, document);
    // Database connection verification
    try {
        const dataSource = app.get(typeorm_1.DataSource);
        if (dataSource.isInitialized) {
            console.log('Database connection established.');
        }
        else {
            console.log('Database connection not yet initialized.');
        }
    }
    catch (error) {
        console.log('Database connection verification skipped:', error.message);
    }
    // Show available routes
    const httpAdapter = app.getHttpAdapter();
    const server = httpAdapter.getInstance();
    const availableRoutes = [];
    // Check if server has Express router
    if (server?._router?.stack && Array.isArray(server._router.stack)) {
        server._router.stack.forEach((layer) => {
            if (layer.route?.path && layer.route.methods) {
                availableRoutes.push({
                    path: layer.route.path,
                    methods: Object.keys(layer.route.methods),
                });
            }
        });
        console.log('Available endpoints:', availableRoutes);
    }
    else {
        console.log('Could not get routes from server');
    }
    // Startup
    const port = process.env.PORT ? Number(process.env.PORT) : 3007; // Changed back to 3007
    await app.listen(port, '0.0.0.0');
    console.log(`Backend running on http://localhost:${port}`);
    console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
}
void bootstrap();
