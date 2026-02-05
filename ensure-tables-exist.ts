import { AppDataSource } from './data-source';
import { QueryRunner } from 'typeorm';

async function ensureTablesExist() {
  let queryRunner: QueryRunner | null = null;
  
  try {
    console.log('Inicializando conexión a la base de datos...');
    await AppDataSource.initialize();
    console.log('✅ Conexión a la base de datos inicializada');
    
    queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    
    // Verificar y crear tabla agent_trend_scans si no existe
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
    } else {
      console.log('✅ Tabla agent_trend_scans ya existe');
    }
    
    // Verificar y crear tabla agent_analytics_reporters si no existe
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
    } else {
      console.log('✅ Tabla agent_analytics_reporters ya existe');
    }
    
    // Verificar y crear tabla viral_campaigns si no existe
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
    } else {
      console.log('✅ Tabla viral_campaigns ya existe');
    }
    
    // Listar todas las tablas
    console.log('\n📋 Listando todas las tablas en la base de datos...');
    const allTables = await queryRunner.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('Tablas encontradas:');
    allTables.forEach((table: any) => {
      console.log(`  - ${table.table_name}`);
    });
    
    console.log('\n✅ Verificación y creación de tablas completada');
    
  } catch (error) {
    console.error('❌ Error al verificar/crear las tablas:', error);
  } finally {
    if (queryRunner) {
      await queryRunner.release();
    }
    await AppDataSource.destroy();
  }
}

ensureTablesExist();