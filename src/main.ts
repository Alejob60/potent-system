import 'reflect-metadata';
import * as dotenv from 'dotenv';
// Load environment variables from multiple sources
const envFiles = ['.env.local', '.env', '.env.combined'];
for (const file of envFiles) {
  try {
    dotenv.config({ path: file });
  } catch (error) {
    console.log(`Environment file ${file} not found, continuing...`);
  }
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
// Swagger imports
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// Cookie parser for secure authentication
import cookieParser from 'cookie-parser';

// Tipo para el router de Express
interface ExpressServer {
  _router?: {
    stack?: Array<{
      route?: {
        path: string;
        methods: Record<string, boolean>;
      };
    }>;
  };
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Set global prefix for versioned API
  app.setGlobalPrefix('api');

  // Security
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
    }),
  );

  // Cookie parser for secure authentication
  app.use(cookieParser());

  // CORS Configuration
  const origins = process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'];

  app.enableCors({
    origin: origins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With', 
      'Accept',
      'x-tenant-id',
      'X-Meta-User-Context'
    ],
    exposedHeaders: ['X-Meta-User-Context'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Global validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Static assets
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Misy Agent API')
    .setDescription(
      'API documentation for the Misy Agent system - Orchestrating AI agents for content creation and campaign management',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag(
      'oauth',
      'OAuth authentication endpoints for social media and email platforms',
    )
    .addTag(
      'integrations',
      'Integration endpoints for email, calendar, and social media',
    )
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
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Database connection verification
  try {
    const dataSource = app.get(DataSource);
    if (dataSource.isInitialized) {
      console.log('Database connection established.');
    } else {
      console.log('Database connection not yet initialized.');
    }
  } catch (error) {
    console.log('Database connection verification skipped:', error.message);
  }

  // Show available routes
  const httpAdapter = app.getHttpAdapter();
  const server = httpAdapter.getInstance() as ExpressServer;
  const availableRoutes: { path: string; methods: string[] }[] = [];

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
  } else {
    console.log('Could not get routes from server');
  }

  // Startup
  const port = process.env.PORT ? Number(process.env.PORT) : 3007; // Changed back to 3007
  await app.listen(port, '0.0.0.0');
  console.log(`Backend running on http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
}
void bootstrap();