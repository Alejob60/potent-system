"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("./data-source");
async function simpleDbCheck() {
    try {
        console.log('Inicializando conexión a la base de datos...');
        await data_source_1.AppDataSource.initialize();
        console.log('✅ Conexión a la base de datos inicializada');
        const result = await data_source_1.AppDataSource.query('SELECT version()');
        console.log('Versión de PostgreSQL:', result[0].version);
        const tables = await data_source_1.AppDataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
        console.log('\nTablas en la base de datos:');
        tables.forEach((table) => {
            console.log(`  - ${table.table_name}`);
        });
        await data_source_1.AppDataSource.destroy();
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
}
simpleDbCheck();
//# sourceMappingURL=simple-db-check.js.map