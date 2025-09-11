import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';

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

  app.setGlobalPrefix('api');

  // 🛡️ Seguridad
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
    }),
  );

  // 🌐 CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(','),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // ✅ Validación global
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // 📁 Archivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // 🧮 Verificación de conexión a BD
  const dataSource = app.get(DataSource);
  if (dataSource.isInitialized) {
    console.log('✅ Conexión a PostgreSQL establecida.');
  } else {
    console.error('❌ Fallo en la conexión a PostgreSQL.');
  }

  // 📍 Mostrar rutas disponibles
  const httpAdapter = app.getHttpAdapter();
  const server = httpAdapter.getInstance() as ExpressServer;
  const availableRoutes: { path: string; methods: string[] }[] = [];

  // Verificar si el servidor tiene el router de Express
  if (server?._router?.stack && Array.isArray(server._router.stack)) {
    server._router.stack.forEach((layer) => {
      if (layer.route?.path && layer.route.methods) {
        availableRoutes.push({
          path: layer.route.path,
          methods: Object.keys(layer.route.methods),
        });
      }
    });
    console.log('📌 Endpoints disponibles:', availableRoutes);
  } else {
    console.log('📌 No se pudieron obtener las rutas del servidor');
  }

  // 🚀 Arranque
  const port = process.env.PORT ? Number(process.env.PORT) : 3007;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Backend corriendo en http://localhost:${port}`);
}
void bootstrap();
