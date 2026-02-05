import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

// Configuración de TypeORM con patrones de entidad corregidos
export const typeormConfig: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
  entities: [
    'dist/src/entities/*.entity.js',
    'dist/src/agents/*/*/entities/*.entity.js',
    'dist/src/oauth/entities/*.entity.js'
  ],
  migrations: ['dist/migrations/*{.ts,.js}', 'src/migrations/*.ts'],
  synchronize: false, // never true in prod, only for migrations
};

// DataSource principal
export const AppDataSource = new DataSource(typeormConfig);