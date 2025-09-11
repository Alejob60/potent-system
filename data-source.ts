import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [
    'dist/**/*.entity.js',
    'src/**/*.entity.ts',
  ],
  migrations: [
    'dist/migrations/*.js',
    'src/migrations/*.ts',
  ],
  synchronize: false,
});