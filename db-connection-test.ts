import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { DataSource } from 'typeorm';

async function testDBConnection() {
  console.log('=== PRUEBA DE CONEXIÓN A BASE DE DATOS ===\n');
  
  // Mostrar configuración
  console.log('Configuración de conexión:');
  console.log('- Host:', process.env.DB_HOST);
  console.log('- Port:', process.env.DB_PORT);
  console.log('- Username:', process.env.DB_USERNAME);
  console.log('- Database:', process.env.DB_NAME);
  console.log('- SSL:', process.env.DB_SSL);
  console.log('- Password presente:', !!process.env.DB_PASSWORD);
  console.log('');

  // Crear DataSource con la misma configuración que en app.module.ts
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'postgres',
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: false
    } : false,
    synchronize: false,
    logging: false,
    entities: []
  });

  try {
    console.log('1. Inicializando conexión...');
    await dataSource.initialize();
    console.log('✅ Conexión exitosa');

    console.log('\n2. Ejecutando consulta de prueba...');
    const result = await dataSource.query('SELECT version()');
    console.log('Versión de PostgreSQL:', result[0].version);

    console.log('\n3. Cerrando conexión...');
    await dataSource.destroy();
    console.log('✅ Conexión cerrada correctamente');

    console.log('\n🎉 ¡PRUEBA COMPLETADA EXITOSAMENTE!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la prueba:');
    console.error('- Mensaje:', error.message);
    console.error('- Código:', error.code);
    
    if (error.message.includes('no pg_hba.conf entry')) {
      console.error('\n💡 Posibles soluciones:');
      console.error('1. Verificar que la IP del cliente esté permitida en Azure PostgreSQL');
      console.error('2. Confirmar que las credenciales sean correctas');
      console.error('3. Validar que SSL esté configurado correctamente');
    }
    
    process.exit(1);
  }
}

testDBConnection();