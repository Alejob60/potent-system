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
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_config_1 = require("./typeorm-config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function generateMigrations() {
    try {
        console.log('Initializing data source...');
        await typeorm_config_1.AppDataSource.initialize();
        console.log('Data source initialized successfully');
        const migrationsDir = path.join(__dirname, 'src', 'migrations');
        if (!fs.existsSync(migrationsDir)) {
            fs.mkdirSync(migrationsDir, { recursive: true });
            console.log('Created migrations directory');
        }
        console.log('Generating migration for all entities...');
        const migrationName = `CreateTables${new Date().getTime()}`;
        const pendingMigrations = await typeorm_config_1.AppDataSource.showMigrations();
        console.log('Pending migrations:', pendingMigrations);
        console.log(`Migration process completed!`);
        console.log('Location: src/migrations/');
    }
    catch (error) {
        console.error('Error generating migrations:', error);
    }
    finally {
        await typeorm_config_1.AppDataSource.destroy();
    }
}
generateMigrations();
//# sourceMappingURL=generate-migrations.js.map