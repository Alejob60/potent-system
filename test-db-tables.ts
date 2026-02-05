import { AppDataSource } from './typeorm-config';
import { Campaign } from './src/agents/campaign/entities/campaign.entity';
import { AgentAnalyticsReporter } from './src/agents/agent-analytics-reporter/entities/agent-analytics-reporter.entity';
import { AgentTrendScanner } from './src/agents/agent-trend-scanner/entities/agent-trend-scanner.entity';

async function testTables() {
  try {
    // Initialize data source
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    // Get query runner
    const queryRunner = AppDataSource.createQueryRunner();
    
    // Check if tables exist
    const tables = await queryRunner.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📋 Existing tables:');
    tables.forEach((table: any) => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Check specifically for our agent tables
    const agentTables = [
      'viral_campaigns',
      'agent_analytics_reports',
      'agent_trend_scans'
    ];
    
    console.log('\n🔍 Checking agent tables:');
    for (const tableName of agentTables) {
      const exists = tables.some((table: any) => table.table_name === tableName);
      console.log(`  ${exists ? '✅' : '❌'} ${tableName}: ${exists ? 'Exists' : 'Missing'}`);
    }
    
    // Test entity repositories
    console.log('\n🧪 Testing entity repositories:');
    
    const campaignRepo = AppDataSource.getRepository(Campaign);
    const analyticsRepo = AppDataSource.getRepository(AgentAnalyticsReporter);
    const trendRepo = AppDataSource.getRepository(AgentTrendScanner);
    
    console.log('  ✅ Campaign repository initialized');
    console.log('  ✅ Analytics reporter repository initialized');
    console.log('  ✅ Trend scanner repository initialized');
    
    // Try to count records in each table
    try {
      const campaignCount = await campaignRepo.count();
      console.log(`  📊 Campaigns table record count: ${campaignCount}`);
    } catch (error) {
      console.log(`  ❌ Error counting campaigns: ${error.message}`);
    }
    
    try {
      const analyticsCount = await analyticsRepo.count();
      console.log(`  📊 Analytics reports table record count: ${analyticsCount}`);
    } catch (error) {
      console.log(`  ❌ Error counting analytics reports: ${error.message}`);
    }
    
    try {
      const trendCount = await trendRepo.count();
      console.log(`  📊 Trend scans table record count: ${trendCount}`);
    } catch (error) {
      console.log(`  ❌ Error counting trend scans: ${error.message}`);
    }
    
    await queryRunner.release();
    await AppDataSource.destroy();
    console.log('\n✅ Database test completed successfully');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

testTables();