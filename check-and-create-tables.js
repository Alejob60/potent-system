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

async function checkAndCreateTables() {
  try {
    console.log('=== Checking and Creating Required Tables ===');
    
    // Connect to the database
    await client.connect();
    console.log('✅ Connected to PostgreSQL database');
    
    // Check existing tables
    console.log('\n🔍 Checking existing tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    const existingTables = tablesResult.rows.map(row => row.table_name);
    console.log('📋 Existing tables:', existingTables);
    
    // Check if oauth_accounts table exists
    const oauthAccountsExists = existingTables.includes('oauth_accounts');
    console.log(`\n🔐 OAuth Accounts Table: ${oauthAccountsExists ? '✅ Exists' : '❌ Missing'}`);
    
    // Create oauth_accounts table if it doesn't exist
    if (!oauthAccountsExists) {
      console.log('\n🔧 Creating oauth_accounts table...');
      await client.query(`
        CREATE TABLE oauth_accounts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id VARCHAR(255) NOT NULL,
          platform VARCHAR(50) NOT NULL,
          access_token TEXT NOT NULL,
          refresh_token TEXT,
          expires_at TIMESTAMP WITH TIME ZONE,
          user_info JSONB,
          scopes TEXT[],
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          last_used_at TIMESTAMP WITH TIME ZONE,
          token_hash VARCHAR(255)
        );
      `);
      
      // Create indexes
      await client.query(`
        CREATE INDEX idx_oauth_accounts_session_id ON oauth_accounts(session_id);
        CREATE INDEX idx_oauth_accounts_platform ON oauth_accounts(platform);
        CREATE UNIQUE INDEX idx_oauth_accounts_session_platform ON oauth_accounts(session_id, platform);
      `);
      
      console.log('✅ oauth_accounts table created successfully');
    } else {
      console.log('✅ oauth_accounts table already exists');
    }
    
    // Check if oauth_refresh_logs table exists
    const oauthRefreshLogsExists = existingTables.includes('oauth_refresh_logs');
    console.log(`\n🔄 OAuth Refresh Logs Table: ${oauthRefreshLogsExists ? '✅ Exists' : '❌ Missing'}`);
    
    // Create oauth_refresh_logs table if it doesn't exist
    if (!oauthRefreshLogsExists) {
      console.log('\n🔧 Creating oauth_refresh_logs table...');
      await client.query(`
        CREATE TABLE oauth_refresh_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          account_id UUID NOT NULL,
          platform VARCHAR(50) NOT NULL,
          refresh_reason VARCHAR(20) NOT NULL,
          status VARCHAR(10) DEFAULT 'success',
          error_message TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          old_expires_at TIMESTAMP WITH TIME ZONE,
          new_expires_at TIMESTAMP WITH TIME ZONE
        );
      `);
      
      // Create indexes
      await client.query(`
        CREATE INDEX idx_oauth_refresh_logs_account_id ON oauth_refresh_logs(account_id);
        CREATE INDEX idx_oauth_refresh_logs_platform ON oauth_refresh_logs(platform);
      `);
      
      console.log('✅ oauth_refresh_logs table created successfully');
    } else {
      console.log('✅ oauth_refresh_logs table already exists');
    }
    
    // Check if integration_activity_logs table exists
    const integrationActivityLogsExists = existingTables.includes('integration_activity_logs');
    console.log(`\n📈 Integration Activity Logs Table: ${integrationActivityLogsExists ? '✅ Exists' : '❌ Missing'}`);
    
    // Create integration_activity_logs table if it doesn't exist
    if (!integrationActivityLogsExists) {
      console.log('\n🔧 Creating integration_activity_logs table...');
      await client.query(`
        CREATE TABLE integration_activity_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          account_id UUID NOT NULL,
          session_id VARCHAR(255) NOT NULL,
          platform VARCHAR(50) NOT NULL,
          action VARCHAR(100) NOT NULL,
          result VARCHAR(10) DEFAULT 'success',
          metadata JSONB,
          error_details JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          execution_time_ms INTEGER,
          api_response_code INTEGER
        );
      `);
      
      // Create indexes
      await client.query(`
        CREATE INDEX idx_integration_activity_logs_account_id ON integration_activity_logs(account_id);
        CREATE INDEX idx_integration_activity_logs_session_id ON integration_activity_logs(session_id);
        CREATE INDEX idx_integration_activity_logs_platform ON integration_activity_logs(platform);
      `);
      
      console.log('✅ integration_activity_logs table created successfully');
    } else {
      console.log('✅ integration_activity_logs table already exists');
    }
    
    // Verify all tables now exist
    console.log('\n🔍 Verifying all tables exist...');
    const finalTablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    const finalTables = finalTablesResult.rows.map(row => row.table_name);
    console.log('📋 Final tables list:', finalTables);
    
    console.log('\n🎉 Table creation process completed!');
    console.log('✅ Required tables for OAuth functionality are now available');
    
  } catch (error) {
    console.error('❌ Error checking/creating tables:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await client.end();
  }
}

// Run the function
checkAndCreateTables();