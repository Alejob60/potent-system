"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("./data-source");
async function checkDatabaseTables() {
    let queryRunner = null;
    try {
        console.log('Inicializando conexión a la base de datos...');
        await data_source_1.AppDataSource.initialize();
        console.log('✅ Conexión a la base de datos inicializada');
        queryRunner = data_source_1.AppDataSource.createQueryRunner();
        console.log('\n🔍 Verificando tabla agent_trend_scans...');
        const trendTableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'agent_trend_scans'
      )
    `);
        console.log('Tabla agent_trend_scans existe:', trendTableExists[0].exists);
        console.log('\n🔍 Verificando tabla agent_analytics_reporters...');
        const analyticsTableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'agent_analytics_reporters'
      )
    `);
        console.log('Tabla agent_analytics_reporters existe:', analyticsTableExists[0].exists);
        console.log('\n🔍 Verificando tabla viral_campaigns...');
        const campaignTableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'viral_campaigns'
      )
    `);
        console.log('Tabla viral_campaigns existe:', campaignTableExists[0].exists);
        console.log('\n📋 Listando todas las tablas en la base de datos...');
        const allTables = await queryRunner.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
        console.log('Tablas encontradas:');
        allTables.forEach((table) => {
            console.log(`  - ${table.table_name}`);
        });
    }
    catch (error) {
        console.error('❌ Error al verificar las tablas:', error);
    }
    finally {
        if (queryRunner) {
            await queryRunner.release();
        }
        await data_source_1.AppDataSource.destroy();
    }
}
checkDatabaseTables();
//# sourceMappingURL=check-db-tables.js.map