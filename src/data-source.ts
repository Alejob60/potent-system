import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5544'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'postgres',
  entities: [
    'dist/**/*.entity.js', // producción/transpilado
    'src/**/*.entity.ts', // desarrollo/CLI
  ],
  migrations: ['dist/migrations/*.js', 'src/migrations/*.ts'],
  synchronize: false, // nunca true en prod, solo para migraciones
});
