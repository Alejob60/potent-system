import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function insertTestData() {
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

    // Insert test data
    console.log('Inserting test data...');
    const query = `
      INSERT INTO campaigns (tenant_id, name, description, status, start_date, end_date, budget, spent, target_audience, channels, created_by, metadata) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT DO NOTHING;
    `;
    
    const values = [
      'tenant-001',
      'Campaña de Prueba',
      'Campaña para verificar el funcionamiento del sistema',
      'active',
      new Date('2025-12-01T00:00:00Z'),
      new Date('2025-12-31T23:59:59Z'),
      5000.00,
      1250.75,
      JSON.stringify({
        age_range: "25-45",
        interests: ["technology", "gadgets"],
        location: "Colombia"
      }),
      JSON.stringify({
        email: true,
        sms: true,
        social_media: ["facebook", "instagram"]
      }),
      'admin-user-001',
      JSON.stringify({
        objective: "increase_sales",
        expected_roi: 3.5
      })
    ];

    await client.query(query, values);
    console.log('Test data inserted successfully!');

    // Verify the data was inserted
    const result = await client.query('SELECT COUNT(*) FROM campaigns WHERE tenant_id = $1', ['tenant-001']);
    console.log(`Total campaigns for tenant-001: ${result.rows[0].count}`);
    
  } catch (err) {
    console.error('Error inserting test data:', err);
  } finally {
    await client.end();
  }
}

insertTestData();