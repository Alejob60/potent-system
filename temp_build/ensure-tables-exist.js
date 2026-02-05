"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("./data-source");
async function ensureTablesExist() {
    let queryRunner = null;
    try {
        console.log('Inicializando conexión a la base de datos...');
        await data_source_1.AppDataSource.initialize();
        console.log('✅ Conexión a la base de datos inicializada');
        queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        console.log('\n🔍 Verificando tabla agent_trend_scans...');
        const trendTableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'agent_trend_scans' AND table_schema = 'public'
      )
    `);
        if (!trendTableExists[0].exists) {
            console.log('Creando tabla agent_trend_scans...');
            await queryRunner.query(`
        CREATE TABLE "agent_trend_scans" (
          "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
          "topic" character varying NOT NULL,
          "trends" jsonb,
          "platform" character varying,
          "sessionId" character varying,
          "userId" character varying,
          "status" character varying DEFAULT 'pending',
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);
            console.log('✅ Tabla agent_trend_scans creada');
        }
        else {
            console.log('✅ Tabla agent_trend_scans ya existe');
        }
        console.log('\n🔍 Verificando tabla agent_analytics_reporters...');
        const analyticsTableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'agent_analytics_reporters' AND table_schema = 'public'
      )
    `);
        if (!analyticsTableExists[0].exists) {
            console.log('Creando tabla agent_analytics_reporters...');
            await queryRunner.query(`
        CREATE TABLE "agent_analytics_reporters" (
          "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
          "metric" character varying NOT NULL,
          "period" character varying NOT NULL,
          "reportData" jsonb,
          "sessionId" character varying,
          "userId" character varying,
          "status" character varying DEFAULT 'pending',
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);
            console.log('✅ Tabla agent_analytics_reporters creada');
        }
        else {
            console.log('✅ Tabla agent_analytics_reporters ya existe');
        }
        console.log('\n🔍 Verificando tabla viral_campaigns...');
        const campaignTableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'viral_campaigns' AND table_schema = 'public'
      )
    `);
        if (!campaignTableExists[0].exists) {
            console.log('Creando tabla viral_campaigns...');
            await queryRunner.query(`
        CREATE TABLE "viral_campaigns" (
          "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
          "campaignName" character varying NOT NULL,
          "objective" character varying NOT NULL,
          "targetAudience" character varying NOT NULL,
          "budget" integer NOT NULL,
          "durationDays" integer NOT NULL,
          "platforms" jsonb NOT NULL,
          "details" jsonb,
          "sessionId" character varying,
          "userId" character varying,
          "status" character varying DEFAULT 'pending',
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);
            console.log('✅ Tabla viral_campaigns creada');
        }
        else {
            console.log('✅ Tabla viral_campaigns ya existe');
        }
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
        console.log('\n✅ Verificación y creación de tablas completada');
    }
    catch (error) {
        console.error('❌ Error al verificar/crear las tablas:', error);
    }
    finally {
        if (queryRunner) {
            await queryRunner.release();
        }
        await data_source_1.AppDataSource.destroy();
    }
}
ensureTablesExist();
//# sourceMappingURL=ensure-tables-exist.js.map