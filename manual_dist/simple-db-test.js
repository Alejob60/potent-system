"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_config_1 = require("./typeorm-config");
async function testConnection() {
    try {
        console.log('Intentando conectar a la base de datos...');
        await typeorm_config_1.AppDataSource.initialize();
        console.log('✅ Conexión exitosa a la base de datos');
        const queryRunner = typeorm_config_1.AppDataSource.createQueryRunner();
        const result = await queryRunner.query('SELECT version()');
        console.log('Versión de PostgreSQL:', result[0].version);
        await queryRunner.release();
        await typeorm_config_1.AppDataSource.destroy();
    }
    catch (error) {
        console.error('❌ Error de conexión:', error.message);
        process.exit(1);
    }
}
testConnection();
//# sourceMappingURL=simple-db-test.js.map