import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
  synchronize: false, // Volver a false por seguridad
  logging: false,
  entities: [
    'src/entities/**/*.entity.{ts,js}',
    'src/agents/**/entities/*.entity.{ts,js}',
    'src/oauth/entities/*.entity.{ts,js}',
    'dist/entities/**/*.entity.{ts,js}',
    'dist/agents/**/entities/*.entity.{ts,js}',
    'dist/oauth/entities/*.entity.{ts,js}'
  ],
  migrations: [
    'src/migrations/*.ts'
  ],
  subscribers: []
});