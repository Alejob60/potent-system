import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testConnection() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'postgres',
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: false
    } : false,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    // Check if campaigns table exists
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'campaigns'
      );
    `);
    
    console.log('Campaigns table exists:', result.rows[0].exists);

    // If table doesn't exist, create it
    if (!result.rows[0].exists) {
      console.log('Creating campaigns table...');
      await client.query(`
        CREATE TABLE campaigns (
          id SERIAL PRIMARY KEY,
          tenant_id VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(50) DEFAULT 'draft',
          start_date TIMESTAMP WITH TIME ZONE,
          end_date TIMESTAMP WITH TIME ZONE,
          budget DECIMAL(12, 2),
          spent DECIMAL(12, 2) DEFAULT 0.00,
          target_audience JSONB,
          channels JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          created_by VARCHAR(255),
          updated_by VARCHAR(255),
          is_active BOOLEAN DEFAULT true,
          metadata JSONB
        );
      `);
      
      console.log('Campaigns table created successfully!');
      
      // Create indexes
      await client.query(`
        CREATE INDEX idx_campaigns_tenant_id ON campaigns(tenant_id);
        CREATE INDEX idx_campaigns_status ON campaigns(status);
        CREATE INDEX idx_campaigns_start_date ON campaigns(start_date);
        CREATE INDEX idx_campaigns_end_date ON campaigns(end_date);
        CREATE INDEX idx_campaigns_is_active ON campaigns(is_active);
      `);
      
      console.log('Indexes created successfully!');
    } else {
      console.log('Campaigns table already exists.');
    }
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await client.end();
  }
}

testConnection();