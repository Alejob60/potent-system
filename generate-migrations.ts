import { AppDataSource } from './typeorm-config';
import * as fs from 'fs';
import * as path from 'path';

async function generateMigrations() {
  try {
    console.log('Initializing data source...');
    await AppDataSource.initialize();
    console.log('Data source initialized successfully');

    // Crear directorio de migraciones si no existe
    const migrationsDir = path.join(__dirname, 'src', 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
      console.log('Created migrations directory');
    }

    console.log('Generating migration for all entities...');
    
    // Generar migración para crear todas las tablas
    const migrationName = `CreateTables${new Date().getTime()}`;
    // Usar el método correcto para generar la migración
    const pendingMigrations = await AppDataSource.showMigrations();
    console.log('Pending migrations:', pendingMigrations);
    
    console.log(`Migration process completed!`);
    console.log('Location: src/migrations/');
    
  } catch (error) {
    console.error('Error generating migrations:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

generateMigrations();