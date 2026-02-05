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

async function checkMigrations() {
  try {
    console.log('=== Migration Status Check ===');
    
    // Connect to the database
    await client.connect();
    console.log('✅ Connected to PostgreSQL database');
    
    // Check if migrations table exists
    console.log('\n🔍 Checking if migrations table exists...');
    const migrationsTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'migrations'
      );
    `);
    
    if (!migrationsTableExists.rows[0].exists) {
      console.log('⚠️  Migrations table does not exist');
      return;
    }
    
    console.log('✅ Migrations table exists');
    
    // Get all migrations
    console.log('\n📋 Listing all migrations...');
    const migrationsResult = await client.query(`
      SELECT id, name, timestamp FROM migrations ORDER BY id;
    `);
    
    if (migrationsResult.rows.length === 0) {
      console.log('ℹ️  No migrations found in migrations table');
    } else {
      console.log(`📊 Found ${migrationsResult.rows.length} migrations:`);
      migrationsResult.rows.forEach(row => {
        console.log(`  - ID: ${row.id}, Name: ${row.name}, Timestamp: ${new Date(parseInt(row.timestamp)).toISOString()}`);
      });
    }
    
    // Check specifically for front desk conversation migration
    console.log('\n🔍 Checking for FrontDeskConversation migration...');
    const frontDeskMigration = await client.query(`
      SELECT id, name, timestamp FROM migrations 
      WHERE name LIKE '%FrontDeskConversation%';
    `);
    
    if (frontDeskMigration.rows.length === 0) {
      console.log('⚠️  FrontDeskConversation migration not found in migrations table');
    } else {
      console.log('✅ FrontDeskConversation migration found:');
      frontDeskMigration.rows.forEach(row => {
        console.log(`  - ID: ${row.id}, Name: ${row.name}, Timestamp: ${new Date(parseInt(row.timestamp)).toISOString()}`);
      });
    }
    
    await client.end();
    console.log('\n🎉 Migration check completed successfully!');
    
  } catch (error) {
    console.log('❌ Migration check failed');
    console.log('Error Details:');
    console.log('- Message:', error.message);
    
    await client.end();
  }
}

// Run the check
checkMigrations();