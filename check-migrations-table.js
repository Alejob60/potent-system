const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Database connection configuration
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
});

async function checkMigrationsTable() {
  try {
    console.log('=== Migrations Table Structure Check ===');
    
    // Connect to the database
    await client.connect();
    console.log('✅ Connected to PostgreSQL database');
    
    // Get migrations table structure
    console.log('\n🔍 Checking migrations table structure...');
    const tableStructure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'migrations'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Migrations table structure:');
    console.log('Column Name\t\tData Type\t\tNullable\tDefault');
    console.log('-----------\t\t---------\t\t--------\t-------');
    tableStructure.rows.forEach(row => {
      console.log(`${row.column_name}\t\t${row.data_type}\t\t${row.is_nullable}\t\t${row.column_default || ''}`);
    });
    
    // Get the highest ID currently in the table
    console.log('\n🔍 Checking highest ID in migrations table...');
    const maxIdResult = await client.query(`
      SELECT MAX(id) as max_id FROM migrations;
    `);
    
    console.log('📊 Highest ID:', maxIdResult.rows[0].max_id);
    
    await client.end();
    console.log('\n🎉 Table structure check completed successfully!');
    
  } catch (error) {
    console.log('❌ Table structure check failed');
    console.log('Error Details:');
    console.log('- Message:', error.message);
    
    await client.end();
  }
}

// Run the check
checkMigrationsTable();