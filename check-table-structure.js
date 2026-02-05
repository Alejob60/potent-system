const { Client } = require('pg');
require('dotenv').config();

async function checkTableStructure() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Conexión a la base de datos establecida');

    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'context_bundles'
      ORDER BY ordinal_position
    `);

    console.log('\n📊 Columnas en la tabla context_bundles:');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });

  } catch (error) {
    console.error('❌ Error al verificar la estructura:', error.message);
  } finally {
    await client.end();
  }
}

checkTableStructure();