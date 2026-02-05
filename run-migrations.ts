import { AppDataSource } from './typeorm-config';

async function runMigrations() {
  try {
    console.log('Initializing data source...');
    await AppDataSource.initialize();
    console.log('Data source initialized successfully');

    console.log('Running pending migrations...');
    const pendingMigrations = await AppDataSource.showMigrations();
    console.log('Pending migrations:', pendingMigrations);

    // Run all pending migrations
    await AppDataSource.runMigrations();
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

runMigrations();