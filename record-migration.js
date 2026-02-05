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

async function recordMigration() {
  try {
    console.log('=== Recording FrontDeskConversation Migration ===');
    
    // Connect to the database
    await client.connect();
    console.log('✅ Connected to PostgreSQL database');
    
    // Check if the migration is already recorded
    console.log('\n🔍 Checking if migration is already recorded...');
    const existingMigration = await client.query(`
      SELECT id FROM migrations 
      WHERE name = 'CreateFrontDeskConversationTable1700000000001';
    `);
    
    if (existingMigration.rows.length > 0) {
      console.log('⚠️  Migration already recorded');
      await client.end();
      return;
    }
    
    // Get the next available ID
    console.log('\n🔢 Getting next available ID...');
    const maxIdResult = await client.query(`
      SELECT MAX(id) as max_id FROM migrations;
    `);
    
    const nextId = (maxIdResult.rows[0].max_id || 0) + 1;
    console.log('🆕 Next ID:', nextId);
    
    // Record the migration
    console.log('\n📝 Recording migration...');
    const timestamp = Date.now();
    const insertResult = await client.query(`
      INSERT INTO migrations (id, name, timestamp) 
      VALUES ($1, $2, $3) 
      RETURNING id;
    `, [nextId, 'CreateFrontDeskConversationTable1700000000001', timestamp]);
    
    console.log('✅ Migration recorded successfully with ID:', insertResult.rows[0].id);
    
    await client.end();
    console.log('\n🎉 Migration recording completed successfully!');
    
  } catch (error) {
    console.log('❌ Migration recording failed');
    console.log('Error Details:');
    console.log('- Message:', error.message);
    
    await client.end();
  }
}

// Run the recording
recordMigration();