"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_config_1 = require("./typeorm-config");
async function runMigrations() {
    try {
        console.log('Initializing data source...');
        await typeorm_config_1.AppDataSource.initialize();
        console.log('Data source initialized successfully');
        console.log('Running pending migrations...');
        const pendingMigrations = await typeorm_config_1.AppDataSource.showMigrations();
        console.log('Pending migrations:', pendingMigrations);
        await typeorm_config_1.AppDataSource.runMigrations();
        console.log('All migrations completed successfully!');
    }
    catch (error) {
        console.error('Error running migrations:', error);
    }
    finally {
        await typeorm_config_1.AppDataSource.destroy();
    }
}
runMigrations();
//# sourceMappingURL=run-migrations.js.map